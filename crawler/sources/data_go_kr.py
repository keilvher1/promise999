"""공공데이터포털(data.go.kr) 선관위 Open API 클라이언트.

지원 API (serviceKey는 하나의 일반 인증키 공용):
  - 선거공약 정보 조회 (15040587) — ElecPrmsInfoInqireService.getCnddtElecPrmsInfoInqire
  - 후보자 정보 조회   (15000908) — PofelcddInfoInqireService (예비후보/후보자)
  - 당선인 정보 조회   (15000864) — WinnerInfoInqireService2.getWinnerInfoInqire
      · 실측: 서비스명 꼬리 "2" 필수 (가이드 v3.11). dugsu(득표수)·dugyul(득표율) 포함.
  - 투·개표 정보 조회  (15000900) — VoteXmntckInfoInqireService2
      · 투표결과: getVoteSttusInfoInqire  (선거인수·투표율 등)
      · 개표결과: getXmntckSttusInfoInqire (후보자별 득표수: hbj01..50, jd01..50, dugsu01..50)
  - 코드정보 조회     (15000897) — CommonCodeService (6개 오퍼레이션: 선거/구시군/선거구/정당/직업/학력)
  - 투표소 정보 조회   (15000836) — PolplcInfoInqireService2
      · 사전투표소:   getPrePolplcOtlnmapTrnsportInfoInqire (evPsName, evOrder)
      · 선거일투표소: getPolplcOtlnmapTrnsportInfoInqire    (psName)

주요 포맷:
  - sgId: 8자리 yyyyMMdd (예: 20220601 = 제8회 지선)
  - sgTypecode: 1(대선), 2(국회의원), 3(시도지사), 4(기초단체장), ..., 11(교육감)
  - 공약서 제출 의무 선거: 1, 3, 4, 11 (국회의원은 선거공보만 별도 소스)

중요 실측 오차 (2026-04-24 확인):
  - 가이드 PDF v2.15에는 공약 내용 필드가 `prmsCont{i}`로 표기되어 있으나,
    실제 JSON 응답 필드명은 **`prmmCont{i}`** (오타 그대로 유지되어 운영 중).
    → fallback 로직으로 양쪽 모두 읽음.
"""
from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any, Iterator

import requests

API_HOST = "https://apis.data.go.kr/9760000"
DEFAULT_UA = "Mozilla/5.0 (promise999/0.1 Korean election archive)"


@dataclass
class Candidate:
    """후보자 정보 한 건."""
    sg_id: str
    sg_typecode: int
    huboid: str
    name: str
    hanja_name: str | None
    gender: str | None     # 'M'/'F'/None
    birth_date: str | None # 'YYYY-MM-DD'
    age: int | None
    addr: str | None
    party_name: str
    giho: int | None
    giho_sangse: str | None
    job: str | None
    edu: str | None
    career1: str | None
    career2: str | None
    sgg_name: str
    sd_name: str
    wiw_name: str | None
    status: str            # '등록'/'사퇴'/'사망'/'등록무효'

    @property
    def gender_code(self) -> str | None:
        return {"남": "M", "여": "F"}.get(self.gender or "")

    @staticmethod
    def _yyyymmdd_to_date(s: str | None) -> str | None:
        if not s or len(s) != 8 or not s.isdigit():
            return None
        return f"{s[:4]}-{s[4:6]}-{s[6:8]}"

    @classmethod
    def from_api(cls, d: dict, sg_typecode: int) -> "Candidate":
        def opt(k):
            v = d.get(k)
            return None if v in (None, "") else v
        return cls(
            sg_id=str(d.get("sgId")),
            sg_typecode=int(d.get("sgTypecode") or sg_typecode),
            huboid=str(d.get("huboid")),
            name=d.get("name") or "",
            hanja_name=opt("hanjaName"),
            gender=opt("gender"),
            birth_date=cls._yyyymmdd_to_date(opt("birthday")),
            age=int(d["age"]) if d.get("age") not in (None, "") else None,
            addr=opt("addr"),
            party_name=d.get("jdName") or "무소속",
            giho=int(d["giho"]) if d.get("giho") not in (None, "") else None,
            giho_sangse=opt("gihoSangse"),
            job=opt("job"),
            edu=opt("edu"),
            career1=opt("career1"),
            career2=opt("career2"),
            sgg_name=d.get("sggName") or "",
            sd_name=d.get("sdName") or "",
            wiw_name=opt("wiwName"),
            status=d.get("status") or "등록",
        )


@dataclass
class PollingPlace:
    """투표소 한 곳. 사전/선거일 공통."""
    sg_id: str
    sd_name: str
    wiw_name: str
    emd_name: str | None
    name: str               # 투표소명 (evPsName 또는 psName)
    place_name: str | None  # 건물명 (청운효자동주민센터)
    addr: str
    floor: str | None
    is_advance: bool        # True = 사전투표소, False = 선거일투표소
    order: int | None       # 사전투표소의 evOrder (선거일투표소는 None)

    @classmethod
    def from_api(cls, d: dict, is_advance: bool) -> "PollingPlace":
        name = d.get("evPsName") if is_advance else d.get("psName")
        order = d.get("evOrder")
        return cls(
            sg_id=str(d.get("sgId")),
            sd_name=d.get("sdName") or "",
            wiw_name=d.get("wiwName") or "",
            emd_name=d.get("emdName") or None,
            name=name or "",
            place_name=d.get("placeName") or None,
            addr=d.get("addr") or "",
            floor=d.get("floor") or None,
            is_advance=is_advance,
            order=int(order) if order not in (None, "") else None,
        )


@dataclass
class CandidateResult:
    """개표결과 중 한 후보자의 집계."""
    name: str
    party_name: str
    vote_count: int
    wiw_name: str | None   # 어느 구·시·군의 집계인지 (구별 반복 호출 시)


@dataclass
class ElectionResult:
    """개표결과 한 행 (시·도 및 구·시·군 단위)."""
    sg_id: str
    sg_typecode: int
    sd_name: str
    wiw_name: str | None
    sgg_name: str
    sunsu: int | None       # 선거인수
    tusu: int | None        # 투표수
    yutusu: int | None      # 유효투표수
    mutusu: int | None      # 무효투표수
    gigwonsu: int | None    # 기권수
    candidates: list[CandidateResult]  # 후보자별 득표

    @classmethod
    def from_api(cls, d: dict, sg_typecode: int) -> "ElectionResult":
        def ivalue(k):
            v = d.get(k)
            try:
                return int(v) if v not in (None, "") else None
            except (TypeError, ValueError):
                return None
        wiw = d.get("wiwName") or None
        cands: list[CandidateResult] = []
        for i in range(1, 51):
            idx = f"{i:02d}"
            hbj = d.get(f"hbj{idx}")
            dugsu = d.get(f"dugsu{idx}")
            if not hbj or dugsu in (None, ""):
                continue
            try:
                vc = int(dugsu)
            except (TypeError, ValueError):
                continue
            cands.append(CandidateResult(
                name=hbj.strip(),
                party_name=(d.get(f"jd{idx}") or "무소속").strip(),
                vote_count=vc,
                wiw_name=wiw,
            ))
        return cls(
            sg_id=str(d.get("sgId")),
            sg_typecode=int(d.get("sgTypecode") or sg_typecode),
            sd_name=d.get("sdName") or "",
            wiw_name=wiw,
            sgg_name=d.get("sggName") or "",
            sunsu=ivalue("sunsu"),
            tusu=ivalue("tusu"),
            yutusu=ivalue("yutusu"),
            mutusu=ivalue("mutusu"),
            gigwonsu=ivalue("gigwonsu"),
            candidates=cands,
        )


@dataclass
class Winner:
    """당선인 정보 한 건."""
    sg_id: str
    sg_typecode: int
    huboid: str
    name: str
    party_name: str
    giho: int | None
    vote_count: int | None    # dugsu
    vote_pct: float | None    # dugyul (%)
    sgg_name: str
    sd_name: str
    wiw_name: str | None

    @classmethod
    def from_api(cls, d: dict, sg_typecode: int) -> "Winner":
        def opt(k):
            v = d.get(k)
            return None if v in (None, "") else v
        return cls(
            sg_id=str(d.get("sgId")),
            sg_typecode=int(d.get("sgTypecode") or sg_typecode),
            huboid=str(d.get("huboid")),
            name=d.get("name") or "",
            party_name=d.get("jdName") or "무소속",
            giho=int(d["giho"]) if d.get("giho") not in (None, "") else None,
            vote_count=int(d["dugsu"]) if d.get("dugsu") not in (None, "") else None,
            vote_pct=float(d["dugyul"]) if d.get("dugyul") not in (None, "") else None,
            sgg_name=d.get("sggName") or "",
            sd_name=d.get("sdName") or "",
            wiw_name=opt("wiwName"),
        )


@dataclass
class Pledge:
    """선거공약 API 응답 한 후보 단위."""
    sg_id: str
    sg_typecode: int
    cnddt_id: str
    kr_name: str
    cn_name: str | None
    party_name: str
    sido_name: str
    wiw_name: str | None
    sgg_name: str
    prms_cnt: int
    items: list[dict]


class DataGoKrClient:
    def __init__(self, service_key: str | None = None, rate_limit_s: float = 0.15):
        key = service_key or os.environ.get("DATA_GO_KR_API_KEY_DECODED")
        if not key:
            raise RuntimeError("DATA_GO_KR_API_KEY_DECODED 미설정")
        self.key = key
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": DEFAULT_UA, "Accept": "application/json"})
        self.rate_limit_s = rate_limit_s

    def _get(self, path: str, params: dict) -> dict:
        q = {"serviceKey": self.key, "resultType": "json", **params}
        r = self.s.get(f"{API_HOST}/{path}", params=q, timeout=30)
        r.raise_for_status()
        ct = r.headers.get("content-type", "")
        if "json" not in ct:
            raise RuntimeError(f"비정상 응답 ({r.status_code} {ct}): {r.text[:300]}")
        j = r.json()
        hdr = j.get("response", {}).get("header", {}) if "response" in j else j.get("header", {})
        code = (hdr or {}).get("resultCode", "")
        msg = (hdr or {}).get("resultMsg", "")
        # INFO-00: 성공, INFO-03: 데이터 없음 (정상 분기)
        if code not in ("", "00", "INFO-00", "INFO-03"):
            raise RuntimeError(f"API 에러 {code}: {msg}")
        time.sleep(self.rate_limit_s)
        return j

    @staticmethod
    def _extract_items(j: dict) -> list[dict]:
        body = j.get("response", {}).get("body", {}) or j.get("body", {})
        items = body.get("items") if body else None
        if not items:
            return []
        if isinstance(items, dict):
            item = items.get("item")
            if item is None:
                return []
            if isinstance(item, dict):
                return [item]
            return item
        if isinstance(items, list):
            return items
        return []

    # ==================================================================
    # 코드정보 (선거 / 구시군 / 선거구 / 정당 / 직업 / 학력)
    # ==================================================================
    def _paged_code(self, path: str, params: dict, num_of_rows: int = 100) -> Iterator[dict]:
        page = 1
        while True:
            j = self._get(path, {**params, "pageNo": page, "numOfRows": num_of_rows})
            body = j.get("response", {}).get("body", {}) or j.get("body", {})
            total = int(body.get("totalCount", 0) or 0)
            for d in self._extract_items(j):
                yield d
            if page * num_of_rows >= total:
                break
            page += 1

    def list_elections(self) -> list[dict]:
        """역대 전체 선거 목록. sgTypecode=0이 대표선거명, 나머지가 세부 유형."""
        return list(self._paged_code("CommonCodeService/getCommonSgCodeList", {}))

    def list_gusiguns(self, *, sg_id: str, sd_name: str) -> list[dict]:
        """특정 시도의 구·시·군 목록 (wiwName, wOrder)."""
        return list(self._paged_code(
            "CommonCodeService/getCommonGusigunCodeList",
            {"sgId": sg_id, "sdName": sd_name},
        ))

    def list_sggs(self, *, sg_id: str, sg_typecode: int) -> list[dict]:
        """특정 선거/유형의 선거구 목록 (sggName, sdName, wiwName, sggJungsu=선출정수)."""
        return list(self._paged_code(
            "CommonCodeService/getCommonSggCodeList",
            {"sgId": sg_id, "sgTypecode": sg_typecode},
        ))

    def list_parties(self, *, sg_id: str) -> list[dict]:
        """특정 선거 참여 정당 목록 (jdName, pOrder). 무소속 포함."""
        return list(self._paged_code(
            "CommonCodeService/getCommonPartyCodeList",
            {"sgId": sg_id},
        ))

    def list_jobs(self, *, sg_id: str) -> list[dict]:
        """특정 선거 기준 직업 코드 (jobId, jobName)."""
        return list(self._paged_code(
            "CommonCodeService/getCommonJobCodeList",
            {"sgId": sg_id},
        ))

    def list_edus(self, *, sg_id: str) -> list[dict]:
        """특정 선거 기준 학력 코드 (eduId, eduName)."""
        return list(self._paged_code(
            "CommonCodeService/getCommonEduBckgrdCodeList",
            {"sgId": sg_id},
        ))

    # ==================================================================
    # 후보자 정보
    # ==================================================================
    def iter_candidates(
        self,
        *,
        sg_id: str,
        sg_typecode: int,
        sgg_name: str,
        sd_name: str,
        num_of_rows: int = 100,
    ) -> Iterator[Candidate]:
        """선거구 단위로 후보자를 전부 페이지네이션."""
        page = 1
        while True:
            j = self._get(
                "PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire",
                {"pageNo": page, "numOfRows": num_of_rows,
                 "sgId": sg_id, "sgTypecode": sg_typecode,
                 "sggName": sgg_name, "sdName": sd_name},
            )
            body = j.get("response", {}).get("body", {}) or j.get("body", {})
            total = int(body.get("totalCount", 0) or 0)
            for d in self._extract_items(j):
                yield Candidate.from_api(d, sg_typecode)
            if page * num_of_rows >= total:
                break
            page += 1

    def iter_pre_candidates(
        self,
        *,
        sg_id: str,
        sg_typecode: int,
        sgg_name: str,
        sd_name: str,
        num_of_rows: int = 100,
    ) -> Iterator[Candidate]:
        """예비후보자. 후보자 등록 개시일 이후에는 조회 불가."""
        page = 1
        while True:
            j = self._get(
                "PofelcddInfoInqireService/getPoelpcddRegistSttusInfoInqire",
                {"pageNo": page, "numOfRows": num_of_rows,
                 "sgId": sg_id, "sgTypecode": sg_typecode,
                 "sggName": sgg_name, "sdName": sd_name},
            )
            body = j.get("response", {}).get("body", {}) or j.get("body", {})
            total = int(body.get("totalCount", 0) or 0)
            for d in self._extract_items(j):
                yield Candidate.from_api(d, sg_typecode)
            if page * num_of_rows >= total:
                break
            page += 1

    # ==================================================================
    # 당선인 정보
    # ==================================================================
    def iter_winners(
        self,
        *,
        sg_id: str,
        sg_typecode: int,
        sgg_name: str,
        sd_name: str,
        num_of_rows: int = 100,
    ) -> Iterator[Winner]:
        """선거구별 당선인 (단체장/비례 모두 대응). 득표수·득표율 포함."""
        page = 1
        while True:
            j = self._get(
                "WinnerInfoInqireService2/getWinnerInfoInqire",
                {"pageNo": page, "numOfRows": num_of_rows,
                 "sgId": sg_id, "sgTypecode": sg_typecode,
                 "sggName": sgg_name, "sdName": sd_name},
            )
            body = j.get("response", {}).get("body", {}) or j.get("body", {})
            total = int(body.get("totalCount", 0) or 0)
            for d in self._extract_items(j):
                yield Winner.from_api(d, sg_typecode)
            if page * num_of_rows >= total:
                break
            page += 1

    # ==================================================================
    # 투·개표 정보 (개표결과: 후보자별 득표)
    # ==================================================================
    def iter_election_results(
        self,
        *,
        sg_id: str,
        sg_typecode: int,
        sd_name: str,
        sgg_name: str,
        wiw_name: str,
        num_of_rows: int = 100,
    ) -> Iterator[ElectionResult]:
        """구·시·군 단위 개표결과. 서울시장처럼 광역 선거는 25개 구 반복 호출 후 합산."""
        page = 1
        while True:
            j = self._get(
                "VoteXmntckInfoInqireService2/getXmntckSttusInfoInqire",
                {"pageNo": page, "numOfRows": num_of_rows,
                 "sgId": sg_id, "sgTypecode": sg_typecode,
                 "sdName": sd_name, "sggName": sgg_name, "wiwName": wiw_name},
            )
            body = j.get("response", {}).get("body", {}) or j.get("body", {})
            total = int(body.get("totalCount", 0) or 0)
            for d in self._extract_items(j):
                yield ElectionResult.from_api(d, sg_typecode)
            if page * num_of_rows >= total:
                break
            page += 1

    def aggregate_votes(
        self,
        *,
        sg_id: str,
        sg_typecode: int,
        sd_name: str,
        sgg_name: str,
        wiw_names: list[str],
    ) -> dict[tuple[str, str], int]:
        """여러 구·시·군의 개표결과를 합산 — 광역선거용.

        반환: {(후보자명, 정당명): 합계 득표수}
        """
        totals: dict[tuple[str, str], int] = {}
        for wiw in wiw_names:
            for result in self.iter_election_results(
                sg_id=sg_id, sg_typecode=sg_typecode,
                sd_name=sd_name, sgg_name=sgg_name, wiw_name=wiw,
            ):
                for c in result.candidates:
                    key = (c.name, c.party_name)
                    totals[key] = totals.get(key, 0) + c.vote_count
        return totals

    # ==================================================================
    # 투표소 정보
    # ==================================================================
    def iter_polling_places(
        self,
        *,
        sg_id: str,
        sd_name: str,
        wiw_name: str,
        is_advance: bool = False,
        num_of_rows: int = 100,
    ) -> Iterator[PollingPlace]:
        """구·시·군 단위 투표소. is_advance=True면 사전투표소, False면 선거일투표소."""
        path = (
            "PolplcInfoInqireService2/getPrePolplcOtlnmapTrnsportInfoInqire"
            if is_advance else
            "PolplcInfoInqireService2/getPolplcOtlnmapTrnsportInfoInqire"
        )
        page = 1
        while True:
            j = self._get(path, {
                "pageNo": page, "numOfRows": num_of_rows,
                "sgId": sg_id, "sdName": sd_name, "wiwName": wiw_name,
            })
            body = j.get("response", {}).get("body", {}) or j.get("body", {})
            total = int(body.get("totalCount", 0) or 0)
            for d in self._extract_items(j):
                yield PollingPlace.from_api(d, is_advance)
            if page * num_of_rows >= total:
                break
            page += 1

    # ==================================================================
    # 선거공약 정보
    # ==================================================================
    def get_pledge(self, *, sg_id: str, sg_typecode: int, cnddt_id: str) -> Pledge | None:
        j = self._get(
            "ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire",
            {"pageNo": 1, "numOfRows": 10,
             "sgId": sg_id, "sgTypecode": sg_typecode, "cnddtId": cnddt_id},
        )
        items = self._extract_items(j)
        if not items:
            return None
        d = items[0]

        prms = []
        for i in range(1, 11):
            title = d.get(f"prmsTitle{i}")
            if not title:
                continue
            # 실측: 실제 응답의 공약 내용 필드는 'prmmCont{i}' (가이드 PDF의 'prmsCont{i}'는 오타)
            content = d.get(f"prmmCont{i}") or d.get(f"prmsCont{i}")
            order = d.get(f"prmsOrd{i}")
            realm = d.get(f"prmsRealmName{i}")
            prms.append({
                "order": int(order) if order not in (None, "") else i,
                "realm": (realm or "").strip() or None,
                "title": title.strip(),
                "content": (content or "").strip() or None,
            })

        return Pledge(
            sg_id=str(d.get("sgId")),
            sg_typecode=int(d.get("sgTypecode") or sg_typecode),
            cnddt_id=str(d.get("cnddtId")),
            kr_name=d.get("krName") or "",
            cn_name=d.get("cnName") or None,
            party_name=d.get("partyName") or "무소속",
            sido_name=d.get("sidoName") or "",
            wiw_name=d.get("wiwName") or None,
            sgg_name=d.get("sggName") or "",
            prms_cnt=int(d.get("prmsCnt")) if d.get("prmsCnt") not in (None, "") else len(prms),
            items=prms,
        )
