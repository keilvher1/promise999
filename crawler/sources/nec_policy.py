"""중앙선거관리위원회 정책·공약마당 (policy.nec.go.kr) 크롤러.

후보별 선거공약 PDF (4종) 메타데이터 + 다운로드 URL을 가져온다.

엔드포인트:
  - /plc/popup/initUMAPopup.do?sgId=...&subSgId=...&huboid=...
      → JSESSIONID 토큰 + hidden inputs (sgBireYn, sgTypecode 등)을 담은 HTML
  - /plc/popup/initUMAPopupData.do;jsessionid=...
      → JSON. 핵심 필드: fileinfo (4종 PDF의 path/공개여부)

PDF 실제 다운로드:
  https://cdn.nec.go.kr/policy_pdf/{filePath}

PDF 종류 (subtemp[0]):
  전단형선거공보 / 책자형선거공보 / 선거공약서 / 10대공약 / 5대공약

공개 여부: subtemp[7] == "01" 일 때만 다운로드 가능.
"""
from __future__ import annotations

import io
import re
import time
from dataclasses import dataclass

import requests

POPUP_URL = "https://policy.nec.go.kr/plc/popup/initUMAPopup.do"
POPUP_DATA_URL = "https://policy.nec.go.kr/plc/popup/initUMAPopupData.do"
CDN_BASE = "https://cdn.nec.go.kr/policy_pdf/"

UA = "Mozilla/5.0 (promise999/0.1 Korean election archive)"


@dataclass
class PolicyPdf:
    """후보 1명의 PDF 1종 메타."""
    kind: str        # 전단형선거공보 / 책자형선거공보 / 선거공약서 / 10대공약 등
    file_path: str   # subtemp[1] — CDN 상대 경로
    open_status: str # "01" 등
    pdf_url: str     # 완전한 다운로드 URL


class NecPolicyClient:
    def __init__(self, session: requests.Session | None = None, rate_limit_s: float = 0.3):
        self.session = session or requests.Session()
        self.session.headers.update({"User-Agent": UA})
        self.rate_limit_s = rate_limit_s
        self._last_call = 0.0

    def _sleep(self) -> None:
        elapsed = time.time() - self._last_call
        if elapsed < self.rate_limit_s:
            time.sleep(self.rate_limit_s - elapsed)
        self._last_call = time.time()

    def list_pdfs(self, sg_id: str, sg_typecode: int, huboid: str) -> list[PolicyPdf]:
        """후보 1명의 PDF 목록 (4종까지). 미공개·미제출은 제외.

        주의: NEC 서버는 같은 세션에서 후보를 여러 번 조회하면 캐시·세션 상태가
        간섭해 빈 응답이 반환된다. 후보 단위로 **새 requests.Session** 사용.
        """
        sub_sg_id = f"{sg_typecode}{sg_id}"

        # 후보별 fresh session (기존 self.session은 download_pdf 등에 사용)
        sess = requests.Session()
        sess.headers.update({"User-Agent": UA})

        # 1. 팝업 페이지로 jsessionid + hidden 정보 받기
        self._sleep()
        popup = sess.get(
            POPUP_URL,
            params={"sgId": sg_id, "subSgId": sub_sg_id, "huboid": huboid},
            timeout=15,
        )
        popup.raise_for_status()
        m = re.search(r'jsessionid=([A-Za-z0-9.]+_servlet_engine\d+)', popup.text)
        if not m:
            return []
        jsid = m.group(1)
        # sgBireYn / sgTypecode 정확히 추출 (보통 N / 1)
        sg_bire_yn = "N"
        m_b = re.search(r'name="sgBireYn"\s+id="sgBireYn"\s+value="([NY])"', popup.text)
        if m_b:
            sg_bire_yn = m_b.group(1)

        # 2. AJAX POST로 fileinfo 받기
        self._sleep()
        resp = sess.post(
            f"{POPUP_DATA_URL};jsessionid={jsid}",
            data={
                "sgId": sg_id,
                "subSgId": sub_sg_id,
                "huboid": huboid,
                "sgBireYn": sg_bire_yn,
                "sgTypecode": str(sg_typecode),
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": popup.url,
                "Accept": "application/json, text/javascript, */*; q=0.01",
            },
            timeout=15,
        )
        try:
            d = resp.json()
        except Exception:
            return []
        if not d.get("list"):
            return []
        row = d["list"][0]
        fileinfo = row.get("fileinfo") or ""
        if not fileinfo:
            return []

        results: list[PolicyPdf] = []
        # fileinfo는 "<chunk>,<chunk>,..." 콤마구분, 각 chunk는 "||" 분할
        for chunk in fileinfo.split(","):
            parts = chunk.split("||")
            if len(parts) < 2 or not parts[1]:
                continue
            kind = parts[0]
            file_path = parts[1]
            # 공개 상태: parts[7] (책자형/선거공약서/10대공약은 6~8개 파트)
            #          parts[5] (전단형선거공보는 4~6개 파트)
            open_status = parts[7] if len(parts) > 7 else (parts[5] if len(parts) > 5 else "")
            if open_status != "01":
                continue
            results.append(PolicyPdf(
                kind=kind,
                file_path=file_path,
                open_status=open_status,
                pdf_url=CDN_BASE + file_path,
            ))
        return results

    def download_pdf(self, pdf_url: str) -> bytes | None:
        """CDN에서 PDF 바이트 다운로드. 404 시 None."""
        self._sleep()
        r = self.session.get(pdf_url, timeout=30, stream=True)
        if r.status_code != 200:
            return None
        if not r.headers.get("content-type", "").lower().startswith("application/"):
            return None
        body = r.content
        if not body.startswith(b"%PDF"):
            return None
        return body


def extract_pdf_text(pdf_bytes: bytes) -> tuple[str, int]:
    """pdfplumber로 텍스트 추출. (전체 텍스트, 페이지 수)."""
    import pdfplumber
    out = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        n = len(pdf.pages)
        for p in pdf.pages:
            t = p.extract_text() or ""
            out.append(t)
    return "\n".join(out), n
