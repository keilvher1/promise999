"""policy.nec.go.kr 어댑터 (크롤러 골격).

원칙:
  - 내부 JSON API(`/plc/main/initUMAMainTab.do`, `initUMAMainMenu.do`, `initUMAMainMap.do`)는
    현재 진행중인 선거에 대해서만 응답합니다 — 정찰 결과 확인됨.
  - 과거 선거(종료된 것)의 상세 공약은 `/plc/policy/initUPAPolicy.do?menuId=PARTY*`,
    `/plc/commiment/initUELCommiment.do?menuId=WINNR*` 경로의 iframe 내부에서
    클라이언트 JS가 렌더링 — 헤드리스 브라우저(playwright) 도입이 필요합니다.
  - 따라서 본 모듈은 "현재 진행중 선거"에 대해서만 완전 자동화를 제공하고,
    과거 선거 백필은 Phase 2(playwright 도입 후)로 미룹니다.

TODO (Phase 2):
  - playwright 의존성 추가
  - 과거 선거 정당정책·당선인공약·후보자공약 페이지를 headless 렌더로 긁어 파싱
  - CDN PDF 파일 일괄 다운로드 → pypdf 파싱 → pledges/pledge_items 적재
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

BASE = "https://policy.nec.go.kr"
DEFAULT_UA = "promise999/0.1 (Korean election archive; non-commercial)"


@dataclass
class TabItem:
    """`/plc/main/initUMAMainTab.do` 응답의 tabDtllist 한 항목."""
    jdname: str | None
    file_type_name: str | None       # '선거공약서'/'선거공보'/'5대공약' 등
    file_path_name: str | None       # CDN 상대 경로
    updt_file_name: str | None       # 파일명
    img_cnt: int | None
    pdf_type_code: str | None
    file_disp_yn: str | None

    def pdf_url(self) -> str | None:
        if not (self.file_path_name and self.updt_file_name):
            return None
        return f"https://cdn.nec.go.kr{self.file_path_name}{self.updt_file_name}"


class PolicyNecClient:
    def __init__(self, user_agent: str = DEFAULT_UA):
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": user_agent, "Referer": BASE + "/"})
        # 세션 warm-up (일부 엔드포인트가 세션 쿠키 요구)
        self.s.get(BASE + "/", timeout=15)

    def tab(self, sg_id: str, menu_sg_id: str | None = None, cnddt_yn: str = "N") -> list[TabItem]:
        r = self.s.post(
            f"{BASE}/plc/main/initUMAMainTab.do",
            data={"sgId": sg_id, "menuSgId": menu_sg_id or sg_id, "cnddtYn": cnddt_yn},
            timeout=15,
        )
        r.raise_for_status()
        payload = r.json()
        items = []
        for d in payload.get("tabDtllist") or []:
            items.append(TabItem(
                jdname=d.get("jdname"),
                file_type_name=d.get("fileTypeName"),
                file_path_name=d.get("filePathName"),
                updt_file_name=d.get("updtFileName"),
                img_cnt=int(d["imgCnt"]) if d.get("imgCnt") not in (None, "") else None,
                pdf_type_code=d.get("pdfTypeCode"),
                file_disp_yn=d.get("fileDispYn"),
            ))
        return items

    def menu_for_sub_sg(self, sub_sg_id: str) -> dict[str, Any] | None:
        r = self.s.post(
            f"{BASE}/plc/main/initUMAMainMenu.do",
            data={"subSgId": sub_sg_id},
            timeout=15,
        )
        r.raise_for_status()
        return r.json().get("info")

    def sido_regions(self, sido_id: str, sg_id: str | None = None) -> dict[str, Any]:
        data = {"sidoId": sido_id}
        if sg_id:
            data["sgId"] = sg_id
        r = self.s.post(f"{BASE}/plc/main/initUMAMainMap.do", data=data, timeout=15)
        r.raise_for_status()
        return r.json()

    # TODO(phase-2): playwright-based scrapers for legacy pages
    def legacy_party_list(self, menu_id: str) -> list[dict]:
        """`/plc/policy/initUPAPolicy.do?menuId=PARTY*` 페이지의 정당 목록.

        현재는 headless 렌더 미구현으로 NotImplementedError.
        """
        raise NotImplementedError(
            "과거 선거 정당정책 페이지는 client-side rendered. "
            "Phase 2에서 playwright 도입 후 구현."
        )
