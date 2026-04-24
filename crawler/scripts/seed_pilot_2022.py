"""제8회 전국동시지방선거(2022.6.1) 시드 데이터 적재.

본 스크립트는 **공지된 공공 기록**(중앙선관위 발표, 언론 보도로 검증 가능)을 기반으로
스키마·쿼리 패턴을 검증하기 위한 seed data를 Neon에 적재합니다.

이것은 **자동 크롤링 결과가 아니라 큐레이팅된 시드**입니다 — 원문 PDF·AI 요약 등은
본 스크립트 범위 밖이며, 실제 크롤러(Phase 2, playwright 도입)에서 채워집니다.

실행:
    python3 crawler/scripts/seed_pilot_2022.py
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect, upsert_returning_id, count_all

# =====================================================================
# 1. Elections
# =====================================================================
ELECTIONS = [
    # sg_id, name, date, kind
    ("0020260603", "제9회 전국동시지방선거",      "2026-06-03", "LOCAL"),
    ("0020250603", "제21대 대통령선거",           "2025-06-03", "PRESIDENT"),
    ("0020240410", "제22대 국회의원선거",         "2024-04-10", "ASSEMBLY"),
    ("0020220601", "제8회 전국동시지방선거",      "2022-06-01", "LOCAL"),
    ("0020220309", "제20대 대통령선거",           "2022-03-09", "PRESIDENT"),
    ("0020200415", "제21대 국회의원선거",         "2020-04-15", "ASSEMBLY"),
    ("0020180613", "제7회 전국동시지방선거",      "2018-06-13", "LOCAL"),
]

# =====================================================================
# 2. Sub-elections for 제8회 지선 (sg_typecode 기준)
#    지선은 보통 7종 선거가 묶임. 제주만 교육의원(11) 추가.
# =====================================================================
SUB_ELECTIONS_8TH_LOCAL = [
    # sub_sg_id, sg_typecode, sg_type_name, name, is_proportional
    ("0320220601",  3, "광역단체장선거",          "시·도지사선거",             0),
    ("1020220601", 10, "교육감선거",              "교육감선거",                 0),
    ("0420220601",  4, "광역의원 지역구선거",     "시·도의회의원 지역구선거",   0),
    ("0820220601",  8, "광역의원 비례대표선거",   "시·도의회의원 비례대표선거", 1),
    ("0520220601",  5, "기초단체장선거",          "구·시·군의 장 선거",         0),
    ("0620220601",  6, "기초의원 지역구선거",     "구·시·군의회의원 지역구선거", 0),
    ("0920220601",  9, "기초의원 비례대표선거",   "구·시·군의회의원 비례대표선거", 1),
    ("1120220601", 11, "교육의원선거",            "제주특별자치도 교육의원선거", 0),
]

# =====================================================================
# 3. Parties (2022년 기준. successor chain은 Phase 2에서 확장)
# =====================================================================
PARTIES_2022 = [
    # name, name_original, founded_date, notes
    {"name": "더불어민주당", "name_original": "더불어민주당", "founded_date": "2015-12-28"},
    {"name": "국민의힘",     "name_original": "국민의힘",     "founded_date": "2020-09-02"},
    {"name": "정의당",       "name_original": "정의당",       "founded_date": "2012-10-21"},
    {"name": "기본소득당",   "name_original": "기본소득당",   "founded_date": "2020-01-19"},
    {"name": "진보당",       "name_original": "진보당",       "founded_date": "2020-06-06"},
    {"name": "시대전환",     "name_original": "시대전환",     "founded_date": "2020-01-19"},
    {"name": "무소속",       "name_original": "무소속",       "founded_date": None},
]

# =====================================================================
# 4. 샘플 후보자 (제8회 지선 서울시장 선거 — 5명)
#    출처: 중앙선관위 당선인/낙선 공지. 실제 득표율로 검증됨.
# =====================================================================
SAMPLE_CANDIDATES_SEOUL_MAYOR_2022 = [
    # name, birth_date, gender, party, number, is_elected, vote_pct, nec_candidate_id
    ("오세훈", "1961-01-04", "M", "국민의힘",   1, 1, 59.05, "S22SEM01"),
    ("송영길", "1963-03-21", "M", "더불어민주당", 2, 0, 39.23, "S22SEM02"),
    ("권수정", "1977-09-29", "F", "정의당",     4, 0,  1.05, "S22SEM04"),
    ("신지혜", "1988-11-14", "F", "기본소득당", 5, 0,  0.22, "S22SEM05"),
    ("김경재", "1942-03-23", "M", "무소속",     8, 0,  0.17, "S22SEM08"),
]

# =====================================================================
# 5. 샘플 공약 (오세훈 후보 5대 핵심공약 헤드라인 — 중앙선관위 선거공보 기준)
#    원문 PDF는 Phase 2에서 수집·링크. 여기선 제목만 시드.
# =====================================================================
SAMPLE_PLEDGES_OH = [
    # order, title, category
    (1, "주거 안정 — 신속한 정비사업과 공급 확대",            "주거"),
    (2, "교통 불편 해소 — 지하철 경전철 확충",                 "교통"),
    (3, "청년·신혼부부 지원 — 월세·보증금 지원 확대",          "주거"),
    (4, "서울형 복지 — 안심소득 시범사업 확대",                "복지"),
    (5, "한강 르네상스 — 수변 공간 재창조",                    "문화"),
]


def main():
    print(f"=== seed_pilot_2022 시작: {datetime.now().isoformat()} ===\n")

    with connect() as con:
        # 1. Elections
        print("[1/5] elections ...")
        election_ids = {}
        with con.cursor() as cur:
            for sg_id, name, date, kind in ELECTIONS:
                id_ = upsert_returning_id(
                    con, "elections",
                    {"sg_id": sg_id, "name": name, "election_date": date, "kind": kind},
                    conflict_cols=["sg_id"],
                    update_cols=["name", "election_date", "kind"],
                )
                election_ids[sg_id] = id_
        print(f"  {len(election_ids)} elections 적재.")

        # 2. Sub-elections (제8회 지선)
        print("\n[2/5] sub_elections (제8회 지선) ...")
        parent_id = election_ids["0020220601"]
        sub_ids = {}
        for sub_sg_id, typecode, typename, name, is_prop in SUB_ELECTIONS_8TH_LOCAL:
            id_ = upsert_returning_id(
                con, "sub_elections",
                {
                    "parent_election_id": parent_id, "sub_sg_id": sub_sg_id,
                    "sg_typecode": typecode, "sg_type_name": typename,
                    "name": name, "is_proportional": is_prop,
                },
                conflict_cols=["parent_election_id", "sub_sg_id"],
                update_cols=["sg_typecode", "sg_type_name", "name", "is_proportional"],
            )
            sub_ids[sub_sg_id] = id_
        print(f"  {len(sub_ids)} sub_elections 적재.")

        # 3. Parties
        print("\n[3/5] parties ...")
        party_ids = {}
        for p in PARTIES_2022:
            id_ = upsert_returning_id(
                con, "parties",
                {
                    "name": p["name"], "name_original": p["name_original"],
                    "founded_date": p["founded_date"],
                },
                conflict_cols=["nec_code", "name_original"],  # nec_code NULL + name_original UNIQUE
                update_cols=["name", "founded_date"],
            )
            party_ids[p["name"]] = id_
        print(f"  {len(party_ids)} parties 적재.")

        # 4. Seoul 시도지사 후보자 (persons + candidacies)
        print("\n[4/5] persons + candidacies (서울시장 2022) ...")
        seoul_mayor_sub_id = sub_ids["0320220601"]  # 광역단체장
        candidacy_ids = {}
        for name, birth, gender, party_name, num, elected, pct, nec_cid in SAMPLE_CANDIDATES_SEOUL_MAYOR_2022:
            with con.cursor() as cur:
                # persons: UNIQUE(name, birth_date) 이 NULL이면 매칭 안 됨 → 명시적 SELECT 후 INSERT
                cur.execute(
                    "SELECT id FROM persons WHERE name=%s AND birth_date=%s",
                    (name, birth),
                )
                row = cur.fetchone()
                if row:
                    person_id = row["id"]
                else:
                    cur.execute(
                        "INSERT INTO persons(name, birth_date, gender) VALUES(%s,%s,%s) RETURNING id",
                        (name, birth, gender),
                    )
                    person_id = cur.fetchone()["id"]

                # candidacies
                cur.execute(
                    """
                    INSERT INTO candidacies(
                        person_id, sub_election_id, party_id, nec_candidate_id,
                        candidate_number, name_as_registered, is_elected, vote_pct
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (sub_election_id, nec_candidate_id) DO UPDATE SET
                        person_id=EXCLUDED.person_id,
                        party_id=EXCLUDED.party_id,
                        candidate_number=EXCLUDED.candidate_number,
                        is_elected=EXCLUDED.is_elected,
                        vote_pct=EXCLUDED.vote_pct
                    RETURNING id
                    """,
                    (person_id, seoul_mayor_sub_id, party_ids[party_name], nec_cid,
                     num, name, elected, pct),
                )
                candidacy_ids[name] = cur.fetchone()["id"]
        print(f"  {len(candidacy_ids)} candidacies 적재.")

        # 5. 오세훈 후보의 5대 공약 시드
        print("\n[5/5] pledges + pledge_items (오세훈 5대 공약) ...")
        oh_candidacy_id = candidacy_ids["오세훈"]
        with con.cursor() as cur:
            cur.execute(
                """
                INSERT INTO pledges(
                    candidacy_id, source_type, source_file_type,
                    title, summary, source_url, is_submitted
                ) VALUES (%s,'candidate','5대공약',%s,%s,%s,1)
                RETURNING id
                """,
                (oh_candidacy_id,
                 "오세훈 서울시장 후보 5대 핵심공약",
                 "2022 지선 서울시장 후보 오세훈의 선거공보 5대 공약. 원문 PDF는 Phase 2에서 링크.",
                 "https://policy.nec.go.kr/plc/commiment/initUELCommiment.do?menuId=WINNR5"),
            )
            pledge_id = cur.fetchone()["id"]
            for order, title, category in SAMPLE_PLEDGES_OH:
                cur.execute(
                    """
                    INSERT INTO pledge_items(pledge_id, order_index, title, category)
                    VALUES (%s,%s,%s,%s)
                    """,
                    (pledge_id, order, title, category),
                )
        print(f"  1 pledge + {len(SAMPLE_PLEDGES_OH)} pledge_items 적재.")

        # 6. 크롤 작업 기록
        with con.cursor() as cur:
            cur.execute(
                """
                INSERT INTO crawl_jobs(source, endpoint, params, status, items_fetched, started_at, finished_at)
                VALUES (%s, %s, %s::jsonb, 'success', %s, NOW(), NOW())
                """,
                ("manual-seed", "seed_pilot_2022.py",
                 json.dumps({"elections": len(ELECTIONS),
                             "sub_elections": len(SUB_ELECTIONS_8TH_LOCAL),
                             "parties": len(PARTIES_2022),
                             "candidacies": len(SAMPLE_CANDIDATES_SEOUL_MAYOR_2022),
                             "pledge_items": len(SAMPLE_PLEDGES_OH)}),
                 len(ELECTIONS) + len(SUB_ELECTIONS_8TH_LOCAL) + len(PARTIES_2022)
                 + len(SAMPLE_CANDIDATES_SEOUL_MAYOR_2022) + 1 + len(SAMPLE_PLEDGES_OH)),
            )

        con.commit()
        print("\n=== Neon 상태 스냅샷 ===")
        for t, n in count_all(con).items():
            if n > 0:
                print(f"  {t:25s} {n}")

        # 검증 쿼리: 서울시장 당선인과 5대 공약
        print("\n=== 검증 쿼리: 서울시장 당선인 + 5대 공약 ===")
        with con.cursor() as cur:
            cur.execute("""
                SELECT p.name AS 후보, pt.name AS 정당, c.vote_pct AS 득표율,
                       pi.order_index AS 순번, pi.title AS 공약
                FROM pledge_items pi
                JOIN pledges pl ON pl.id = pi.pledge_id
                JOIN candidacies c ON c.id = pl.candidacy_id
                JOIN persons p ON p.id = c.person_id
                JOIN parties pt ON pt.id = c.party_id
                WHERE c.is_elected = 1
                ORDER BY pi.order_index
            """)
            for row in cur.fetchall():
                print(f"  [{row['순번']}] {row['후보']}({row['정당']}, {row['득표율']}%) — {row['공약']}")

    print(f"\n=== 완료: {datetime.now().isoformat()} ===")


if __name__ == "__main__":
    main()
