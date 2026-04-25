"""대선 전체 후보(낙선자 포함) 후보 정보 + 공약 일괄 적재.

대선은 prmsCnt=10이라 모든 후보가 풍부한 공약을 갖고 있음 (당선·낙선 무관).
대상: 제21대(2025.06.03), 제20대(2022.03.09), 제19대(2017.05.09), 제18대(2012.12.19).

실행:
    python3 crawler/scripts/crawl_presidential_all.py
    python3 crawler/scripts/crawl_presidential_all.py --sg-ids 20250603,20220309
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect, upsert_returning_id
from crawler.sources.data_go_kr import DataGoKrClient

DEFAULT_SG_IDS = ["20250603", "20220309", "20170509", "20121219"]
TYPECODE = 1  # 대통령선거


def upsert_person_by_birth(con, name, birth_date, gender_code, hanja):
    with con.cursor() as cur:
        cur.execute(
            "SELECT id FROM persons WHERE name=%s AND birth_date IS NOT DISTINCT FROM %s",
            (name, birth_date),
        )
        row = cur.fetchone()
        if row:
            if hanja:
                cur.execute("UPDATE persons SET name_hanja=COALESCE(name_hanja,%s) WHERE id=%s",
                            (hanja, row["id"]))
            return row["id"]
        cur.execute(
            """INSERT INTO persons(name, name_hanja, birth_date, gender)
               VALUES(%s,%s,%s,%s) RETURNING id""",
            (name, hanja, birth_date, gender_code),
        )
        return cur.fetchone()["id"]


def upsert_party(con, name):
    return upsert_returning_id(
        con, "parties",
        {"name": name, "name_original": name},
        conflict_cols=["nec_code", "name_original"],
        update_cols=["name"],
    )


def ensure_election(con, sg_id_8):
    full_sg_id = "00" + sg_id_8
    with con.cursor() as cur:
        cur.execute("SELECT id FROM elections WHERE sg_id=%s", (full_sg_id,))
        row = cur.fetchone()
        if row:
            return row["id"]
        name_map = {
            "20250603": "제21대 대통령선거",
            "20220309": "제20대 대통령선거",
            "20170509": "제19대 대통령선거",
            "20121219": "제18대 대통령선거",
        }
        date_str = f"{sg_id_8[:4]}-{sg_id_8[4:6]}-{sg_id_8[6:8]}"
        cur.execute(
            """INSERT INTO elections(sg_id, name, election_date, kind)
               VALUES(%s,%s,%s,'PRESIDENT') RETURNING id""",
            (full_sg_id, name_map.get(sg_id_8, f"대통령선거 {sg_id_8}"), date_str),
        )
        return cur.fetchone()["id"]


def ensure_sub_election(con, parent_id, sg_id_8):
    sub_sg_id = f"01{sg_id_8}"
    with con.cursor() as cur:
        cur.execute(
            "SELECT id FROM sub_elections WHERE parent_election_id=%s AND sub_sg_id=%s",
            (parent_id, sub_sg_id),
        )
        row = cur.fetchone()
        if row:
            return row["id"]
        cur.execute(
            """INSERT INTO sub_elections(parent_election_id, sub_sg_id,
                 sg_typecode, sg_type_name, name, is_proportional)
               VALUES(%s,%s,1,'대통령선거','대통령선거',0) RETURNING id""",
            (parent_id, sub_sg_id),
        )
        return cur.fetchone()["id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sg-ids", default=",".join(DEFAULT_SG_IDS),
                    help=f"대상 sg_id 8자리 (콤마구분). 기본: {','.join(DEFAULT_SG_IDS)}")
    args = ap.parse_args()
    sg_ids = [s.strip() for s in args.sg_ids.split(",") if s.strip()]

    print(f"=== crawl_presidential_all 시작: {datetime.now().isoformat()} ===")
    print(f"   타겟 sg_id: {sg_ids}")

    client = DataGoKrClient(rate_limit_s=0.1)

    with connect() as con:
        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('data.go.kr', 'crawl_presidential_all',
                           %s::jsonb, 'running', NOW()) RETURNING id""",
                (json.dumps({"sg_ids": sg_ids}),),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        stats = {"candidates": 0, "pledges": 0, "items": 0, "no_pledge": 0, "err": 0}

        try:
            for sg_id_8 in sg_ids:
                print(f"\n=== sg_id={sg_id_8} (typecode=1 대선) ===")
                election_id = ensure_election(con, sg_id_8)
                se_id = ensure_sub_election(con, election_id, sg_id_8)
                con.commit()

                # 모든 후보 (전국. sgg_name=대한민국으로 검색해도 OK)
                try:
                    cands = list(client.iter_candidates(
                        sg_id=sg_id_8, sg_typecode=TYPECODE,
                        sgg_name="대한민국", sd_name="",
                    ))
                except Exception as e:
                    # 일부 연도는 sgg_name이 다를 수 있으니 빈값으로 재시도
                    print(f"  iter_candidates 첫 시도 실패 ({e}), sgg_name 빈값으로 재시도")
                    try:
                        cands = list(client.iter_candidates(
                            sg_id=sg_id_8, sg_typecode=TYPECODE,
                            sgg_name="", sd_name="",
                        ))
                    except Exception as e2:
                        print(f"  ERR iter_candidates: {e2}")
                        stats["err"] += 1
                        continue

                print(f"  후보 {len(cands)}명")

                # 당선자 (is_elected=1로 마킹)
                try:
                    winners = list(client.iter_winners(
                        sg_id=sg_id_8, sg_typecode=TYPECODE,
                        sgg_name="대한민국", sd_name="",
                    ))
                except Exception:
                    winners = []
                winner_huboids = {w.huboid for w in winners}
                winner_by_huboid = {w.huboid: w for w in winners}
                print(f"  당선자 {len(winner_huboids)}명")

                for cand in cands:
                    person_id = upsert_person_by_birth(
                        con, cand.name, cand.birth_date,
                        cand.gender_code, cand.hanja_name,
                    )
                    party_id = upsert_party(con, cand.party_name)
                    is_elected = 1 if cand.huboid in winner_huboids else 0
                    w = winner_by_huboid.get(cand.huboid)
                    vote_count = w.vote_count if w else None
                    vote_pct = w.vote_pct if w else None
                    career = "\n".join(filter(None, [cand.career1, cand.career2])) or None

                    with con.cursor() as cur:
                        cur.execute(
                            """INSERT INTO candidacies(
                                 person_id, sub_election_id, party_id,
                                 nec_candidate_id, candidate_number,
                                 name_as_registered, academic_background, career,
                                 is_elected, vote_count, vote_pct, source_url
                               ) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                               ON CONFLICT (sub_election_id, nec_candidate_id) DO UPDATE SET
                                 person_id=EXCLUDED.person_id,
                                 party_id=EXCLUDED.party_id,
                                 candidate_number=COALESCE(EXCLUDED.candidate_number, candidacies.candidate_number),
                                 academic_background=COALESCE(EXCLUDED.academic_background, candidacies.academic_background),
                                 career=COALESCE(EXCLUDED.career, candidacies.career),
                                 is_elected=GREATEST(candidacies.is_elected, EXCLUDED.is_elected),
                                 vote_count=COALESCE(EXCLUDED.vote_count, candidacies.vote_count),
                                 vote_pct=COALESCE(EXCLUDED.vote_pct, candidacies.vote_pct)
                               RETURNING id""",
                            (person_id, se_id, party_id, cand.huboid, cand.giho,
                             cand.name, cand.edu, career,
                             is_elected, vote_count, vote_pct,
                             f"https://www.data.go.kr/data/15000864/openapi.do#huboid={cand.huboid}"),
                        )
                        cid = cur.fetchone()["id"]
                    stats["candidates"] += 1

                    # 공약 적재
                    try:
                        pledge = client.get_pledge(
                            sg_id=sg_id_8, sg_typecode=TYPECODE, cnddt_id=cand.huboid,
                        )
                    except Exception as e:
                        print(f"    ERR pledge {cand.name}: {e}")
                        stats["err"] += 1
                        continue
                    if not pledge or not pledge.items:
                        print(f"    · {cand.name}({cand.party_name}) — 공약 미제출")
                        stats["no_pledge"] += 1
                        con.commit()
                        continue

                    with con.cursor() as cur:
                        cur.execute(
                            "SELECT id FROM pledges WHERE candidacy_id=%s LIMIT 1",
                            (cid,),
                        )
                        if cur.fetchone():
                            con.commit()
                            continue
                        cur.execute(
                            """INSERT INTO pledges(
                                 candidacy_id, source_type, source_file_type,
                                 title, summary, source_url, fetched_at, is_submitted
                               ) VALUES(%s,%s,'선거공약서',%s,%s,%s,NOW(),1)
                               RETURNING id""",
                            (cid,
                             "winner" if is_elected else "candidate",
                             f"{cand.name} — {pledge.prms_cnt}개 공약",
                             "대통령선거 공약",
                             "https://apis.data.go.kr/9760000/ElecPrmsInfoInqireService"),
                        )
                        pid = cur.fetchone()["id"]
                        for it in pledge.items:
                            cur.execute(
                                """INSERT INTO pledge_items(
                                     pledge_id, order_index, title, description, category
                                   ) VALUES(%s,%s,%s,%s,%s)
                                   ON CONFLICT (pledge_id, order_index) DO NOTHING""",
                                (pid, it["order"], it["title"], it["content"], it["realm"]),
                            )
                            stats["items"] += 1
                    stats["pledges"] += 1
                    con.commit()
                    print(f"    ✓ {cand.name}({cand.party_name}) — {len(pledge.items)}개 공약 ({'당선' if is_elected else '낙선'})")

            with con.cursor() as cur:
                cur.execute("""UPDATE crawl_jobs SET status='success', items_fetched=%s,
                    finished_at=NOW() WHERE id=%s""", (stats["pledges"], job_id))
            con.commit()
        except Exception as e:
            with con.cursor() as cur:
                cur.execute("""UPDATE crawl_jobs SET status='error',
                    error_message=%s, finished_at=NOW() WHERE id=%s""", (str(e)[:500], job_id))
            con.commit()
            raise

    print(f"\n완료: {stats}")


if __name__ == "__main__":
    main()
