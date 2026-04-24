"""제8회 지선(2022.6.1) 당선인 공약 일괄 크롤 → Neon 적재.

파이프라인:
  1) 당선인 정보 API로 (sgId=20220601, sgTypecode ∈ {3, 4, 11}) 당선인 목록 수집
  2) 각 당선인의 cnddtId로 선거공약 API 호출
  3) persons / candidacies / pledges / pledge_items 업서트

sgTypecode=5(기초의원)/6(지역구)은 공약서 제출 의무 대상이 아님 (가이드 p.4 참조).

실행:
    python3 crawler/scripts/crawl_2022_winners_pledges.py
"""
from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime
from typing import Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect, upsert_returning_id
from crawler.sources.data_go_kr import DataGoKrClient

# 2022-06-01 제8회 지선 중 공약 API 대상 선거 유형
# (대선은 sgId 다름, 이번 파일럿은 지선만)
TARGETS = [
    # sg_typecode, sub_sg_id(우리 DB), label
    (3,  "0320220601", "시·도지사선거"),
    (4,  "0520220601", "기초단체장선거 (구·시·군의장)"),
    (11, "1020220601", "교육감선거"),
]

SG_ID_8TH_LOCAL = "20220601"
ELECTION_SG_ID_FULL = "0020220601"  # 우리 DB의 elections.sg_id


def parse_date_kr(s: str | None) -> str | None:
    """'1961-01-04' 또는 '19610104' → 'YYYY-MM-DD'."""
    if not s:
        return None
    s = s.strip()
    if len(s) == 8 and s.isdigit():
        return f"{s[:4]}-{s[4:6]}-{s[6:8]}"
    return s


def upsert_person(con, name: str, birth_date: str | None, gender: str | None) -> int:
    with con.cursor() as cur:
        cur.execute("SELECT id FROM persons WHERE name=%s AND birth_date IS NOT DISTINCT FROM %s",
                    (name, birth_date))
        row = cur.fetchone()
        if row:
            return row["id"]
        cur.execute(
            "INSERT INTO persons(name, birth_date, gender) VALUES(%s,%s,%s) RETURNING id",
            (name, birth_date, gender),
        )
        return cur.fetchone()["id"]


def upsert_party(con, name: str) -> int:
    return upsert_returning_id(
        con, "parties",
        {"name": name, "name_original": name},
        conflict_cols=["nec_code", "name_original"],
        update_cols=["name"],
    )


def main():
    print(f"=== crawl_2022_winners_pledges 시작: {datetime.now().isoformat()} ===\n")
    client = DataGoKrClient()

    stats = {"winners_fetched": 0, "pledges_fetched": 0, "items_fetched": 0, "errors": 0}

    with connect() as con:
        # sub_elections id lookup
        sub_id = {}
        with con.cursor() as cur:
            cur.execute("SELECT id, sub_sg_id FROM sub_elections")
            for r in cur.fetchall():
                sub_id[r["sub_sg_id"]] = r["id"]
        for _, s, _ in TARGETS:
            if s not in sub_id:
                raise RuntimeError(f"sub_elections에 {s} 없음 — seed_pilot_2022를 먼저 실행하세요.")

        # crawl_jobs 기록
        job_params = {"sg_id": SG_ID_8TH_LOCAL, "targets": [t[0] for t in TARGETS]}
        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('data.go.kr',
                           'ElecPrmsInfoInqireService+WinnerInfoInqireService',
                           %s::jsonb, 'running', NOW())
                   RETURNING id""",
                (json.dumps(job_params),),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        try:
            for typecode, sub_sg_id, label in TARGETS:
                print(f"\n--- [{typecode}] {label} ---")
                se_id = sub_id[sub_sg_id]

                for w in client.iter_winners(sg_id=SG_ID_8TH_LOCAL, sg_typecode=typecode):
                    stats["winners_fetched"] += 1
                    name = w.get("krName") or w.get("name") or ""
                    cnddt_id = str(w.get("cnddtId") or w.get("huboid") or "")
                    party_name = w.get("jdName") or w.get("partyName") or "무소속"
                    birth = parse_date_kr(w.get("birthday") or w.get("birthDay"))
                    gender_raw = w.get("gender") or ""
                    gender = {"남": "M", "여": "F"}.get(gender_raw[:1], "?") if gender_raw else None
                    region_name = " ".join(filter(None, [w.get("sidoName"), w.get("wiwName")])) or None

                    if not cnddt_id:
                        print(f"  WARN: cnddtId 없음 — {name}")
                        stats["errors"] += 1
                        continue

                    person_id = upsert_person(con, name, birth, gender)
                    party_id = upsert_party(con, party_name)

                    # candidacy
                    with con.cursor() as cur:
                        cur.execute(
                            """INSERT INTO candidacies(
                                 person_id, sub_election_id, party_id, nec_candidate_id,
                                 name_as_registered, is_elected, source_url
                               ) VALUES(%s,%s,%s,%s,%s,1,%s)
                               ON CONFLICT (sub_election_id, nec_candidate_id) DO UPDATE SET
                                 person_id=EXCLUDED.person_id,
                                 party_id=EXCLUDED.party_id,
                                 is_elected=EXCLUDED.is_elected
                               RETURNING id""",
                            (person_id, se_id, party_id, cnddt_id, name,
                             f"https://www.data.go.kr/data/15000864/openapi.do#{cnddt_id}"),
                        )
                        candidacy_id = cur.fetchone()["id"]

                    # pledge
                    try:
                        pledge = client.get_pledge(sg_id=SG_ID_8TH_LOCAL,
                                                   sg_typecode=typecode,
                                                   cnddt_id=cnddt_id)
                    except Exception as e:
                        print(f"  ERR pledge {name}({cnddt_id}): {e}")
                        stats["errors"] += 1
                        continue
                    if not pledge or not pledge.items:
                        print(f"  · {name}({party_name}) — 공약 미제출")
                        continue

                    stats["pledges_fetched"] += 1
                    with con.cursor() as cur:
                        cur.execute(
                            """INSERT INTO pledges(
                                 candidacy_id, source_type, source_file_type,
                                 title, summary, source_url, fetched_at, is_submitted
                               ) VALUES(%s,'winner','선거공약서',%s,%s,%s,NOW(),1)
                               RETURNING id""",
                            (candidacy_id,
                             f"{name} — {pledge.prms_cnt}개 공약",
                             f"{region_name or ''} {label} 당선인 공약" ,
                             "http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire"),
                        )
                        pid = cur.fetchone()["id"]

                        for it in pledge.items:
                            cur.execute(
                                """INSERT INTO pledge_items(
                                     pledge_id, order_index, title, description, category
                                   ) VALUES(%s,%s,%s,%s,%s)""",
                                (pid, it["order"], it["title"], it.get("content"), it.get("realm")),
                            )
                            stats["items_fetched"] += 1
                    con.commit()
                    print(f"  ✓ {name}({party_name}) — {pledge.prms_cnt}개 공약 적재")

            # 작업 성공 마킹
            with con.cursor() as cur:
                cur.execute(
                    """UPDATE crawl_jobs SET status='success',
                         items_fetched=%s, finished_at=NOW() WHERE id=%s""",
                    (stats["pledges_fetched"], job_id),
                )
            con.commit()
        except Exception as e:
            with con.cursor() as cur:
                cur.execute(
                    "UPDATE crawl_jobs SET status='error', error_message=%s, finished_at=NOW() WHERE id=%s",
                    (str(e), job_id),
                )
            con.commit()
            raise

    print("\n=== 완료 ===")
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
