"""제8회 지방선거(2022.6.1) 전국 당선자 공약 일괄 크롤 → Neon 적재.

대상:
  - 시도지사 (sg_typecode=3): 17명
  - 교육감   (sg_typecode=11): 17명
  - 기초단체장(sg_typecode=4): 약 226명

파이프라인:
  1) 코드정보 API (list_sggs) → 선거구 목록
  2) 각 선거구별 당선인 정보 → huboid, dugsu, dugyul, giho 확보
  3) huboid로 선거공약 API 호출 → 공약 원문 적재

실행:
    python3 crawler/scripts/crawl_2022_nationwide.py [--typecodes 3,11,4]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect, upsert_returning_id
from crawler.sources.data_go_kr import DataGoKrClient, Candidate

SG_ID = "20220601"
ELECTION_SG_ID_FULL = "0020220601"

# sgTypecode → sub_sg_id 매핑 (seed_pilot_2022.py 기준)
SUB_SG_ID_BY_TYPECODE = {
    3:  "0320220601",  # 시도지사
    4:  "0520220601",  # 기초단체장
    11: "1020220601",  # 교육감
}


def parse_date_kr(s: str | None) -> str | None:
    if not s:
        return None
    s = s.strip()
    if len(s) == 8 and s.isdigit():
        return f"{s[:4]}-{s[4:6]}-{s[6:8]}"
    return s


def upsert_person_by_birth(con, name: str, birth_date: str | None,
                            gender_code: str | None, hanja: str | None) -> int:
    with con.cursor() as cur:
        cur.execute(
            "SELECT id FROM persons WHERE name=%s AND birth_date IS NOT DISTINCT FROM %s",
            (name, birth_date),
        )
        row = cur.fetchone()
        if row:
            # 한자명 보강
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


def upsert_party(con, name: str) -> int:
    return upsert_returning_id(
        con, "parties",
        {"name": name, "name_original": name},
        conflict_cols=["nec_code", "name_original"],
        update_cols=["name"],
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--typecodes", default="3,11,4",
                    help="쉼표 구분 sgTypecode (기본: 시도지사+교육감+기초단체장)")
    ap.add_argument("--limit-sggs", type=int, default=0,
                    help="선거구 제한 (테스트용 0=무제한)")
    ap.add_argument("--skip-candidate-details", action="store_true",
                    help="후보자 상세 정보(학력/경력) fetch 생략. 속도 2배")
    args = ap.parse_args()
    typecodes = [int(t) for t in args.typecodes.split(",")]

    print(f"=== crawl_2022_nationwide 시작: {datetime.now().isoformat()} ===")
    print(f"   타겟 sgTypecode: {typecodes}")
    if args.limit_sggs:
        print(f"   선거구 제한: {args.limit_sggs}")
    print()

    client = DataGoKrClient(rate_limit_s=0.05)

    with connect() as con:
        # sub_elections id 맵
        sub_id = {}
        with con.cursor() as cur:
            cur.execute("SELECT id, sub_sg_id FROM sub_elections")
            for r in cur.fetchall():
                sub_id[r["sub_sg_id"]] = r["id"]

        # crawl_jobs 기록
        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('data.go.kr', 'nationwide_pipeline',
                           %s::jsonb, 'running', NOW())
                   RETURNING id""",
                (json.dumps({"sg_id": SG_ID, "typecodes": typecodes,
                             "limit_sggs": args.limit_sggs}),),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        stats = {
            "sggs_processed": 0,
            "winners_fetched": 0,
            "candidates_inserted": 0,
            "pledges_fetched": 0,
            "pledge_items": 0,
            "no_pledge": 0,
            "errors": 0,
        }

        try:
            for typecode in typecodes:
                sub_sg_id = SUB_SG_ID_BY_TYPECODE.get(typecode)
                if not sub_sg_id or sub_sg_id not in sub_id:
                    print(f"⚠ sgTypecode={typecode} — sub_elections에 {sub_sg_id} 없음. 스킵.")
                    continue
                se_id = sub_id[sub_sg_id]

                print(f"\n{'='*60}")
                print(f" sgTypecode={typecode}  (sub_sg_id={sub_sg_id})")
                print(f"{'='*60}")

                # 1) 선거구 목록
                sggs = client.list_sggs(sg_id=SG_ID, sg_typecode=typecode)
                print(f"  선거구 {len(sggs)}개 조회")
                if args.limit_sggs:
                    sggs = sggs[:args.limit_sggs]

                for sgg in sggs:
                    stats["sggs_processed"] += 1
                    sgg_name = sgg.get("sggName") or ""
                    sd_name = sgg.get("sdName") or ""
                    wiw_name = sgg.get("wiwName") or ""
                    label = f"{sd_name} / {sgg_name}" + (f" / {wiw_name}" if wiw_name else "")
                    print(f"\n  — [{stats['sggs_processed']}] {label}")

                    # 2) 당선인 목록 조회
                    try:
                        winners = list(client.iter_winners(
                            sg_id=SG_ID, sg_typecode=typecode,
                            sgg_name=sgg_name, sd_name=sd_name,
                        ))
                    except Exception as e:
                        print(f"    ERR winners: {e}")
                        stats["errors"] += 1
                        continue

                    stats["winners_fetched"] += len(winners)

                    # 선거구 단위 skip: 이 선거구의 당선자 모두 pledge 있으면 skip
                    huboids = [w.huboid for w in winners]
                    if huboids:
                        with con.cursor() as cur:
                            cur.execute(
                                """SELECT COUNT(*) AS n FROM pledges pl
                                   JOIN candidacies c ON c.id = pl.candidacy_id
                                   WHERE c.sub_election_id = %s
                                     AND c.nec_candidate_id = ANY(%s::text[])
                                     AND pl.source_type = 'winner'""",
                                (se_id, huboids),
                            )
                            already = cur.fetchone()["n"]
                        if already >= len(winners):
                            print(f"    · [SKIP 전체] {len(winners)}명 당선자 공약 모두 적재됨")
                            continue

                    # 3) 후보자 세부정보 (--skip-candidate-details 없을 때만)
                    candidates_map = {}
                    if not args.skip_candidate_details:
                        try:
                            for c in client.iter_candidates(
                                sg_id=SG_ID, sg_typecode=typecode,
                                sgg_name=sgg_name, sd_name=sd_name,
                            ):
                                candidates_map[c.huboid] = c
                        except Exception as e:
                            print(f"      WARN candidates fetch: {e}")

                    for w in winners:
                        cand = candidates_map.get(w.huboid)
                        if cand:
                            person_id = upsert_person_by_birth(
                                con, cand.name, cand.birth_date,
                                cand.gender_code, cand.hanja_name,
                            )
                            academic = cand.edu
                            career = "\n".join(filter(None, [cand.career1, cand.career2])) or None
                        else:
                            person_id = upsert_person_by_birth(con, w.name, None, None, None)
                            academic = None
                            career = None

                        party_id = upsert_party(con, w.party_name)

                        # candidacies 업서트 (당선인이므로 is_elected=1)
                        with con.cursor() as cur:
                            cur.execute(
                                """INSERT INTO candidacies(
                                     person_id, sub_election_id, party_id,
                                     nec_candidate_id, candidate_number,
                                     name_as_registered, academic_background, career,
                                     is_elected, vote_count, vote_pct, source_url
                                   ) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,1,%s,%s,%s)
                                   ON CONFLICT (sub_election_id, nec_candidate_id) DO UPDATE SET
                                     person_id=EXCLUDED.person_id,
                                     party_id=EXCLUDED.party_id,
                                     candidate_number=EXCLUDED.candidate_number,
                                     academic_background=COALESCE(EXCLUDED.academic_background, candidacies.academic_background),
                                     career=COALESCE(EXCLUDED.career, candidacies.career),
                                     is_elected=1,
                                     vote_count=EXCLUDED.vote_count,
                                     vote_pct=EXCLUDED.vote_pct
                                   RETURNING id""",
                                (person_id, se_id, party_id, w.huboid, w.giho,
                                 w.name, academic, career,
                                 w.vote_count, w.vote_pct,
                                 f"https://www.data.go.kr/data/15000864/openapi.do#huboid={w.huboid}"),
                            )
                            candidacy_id = cur.fetchone()["id"]
                            stats["candidates_inserted"] += 1

                        # 4) 공약 조회
                        try:
                            pledge = client.get_pledge(
                                sg_id=SG_ID, sg_typecode=typecode, cnddt_id=w.huboid,
                            )
                        except Exception as e:
                            print(f"      ERR pledge {w.name}: {e}")
                            stats["errors"] += 1
                            continue

                        if not pledge or not pledge.items:
                            print(f"    · {w.name}({w.party_name}) — 공약 미제출")
                            stats["no_pledge"] += 1
                            continue

                        # 기존 동일 candidacy의 공약 있는지 확인
                        with con.cursor() as cur:
                            cur.execute(
                                "SELECT id FROM pledges WHERE candidacy_id=%s AND source_type='winner' LIMIT 1",
                                (candidacy_id,),
                            )
                            if cur.fetchone():
                                print(f"    · {w.name}({w.party_name}) — 공약 이미 적재됨, 스킵")
                                continue

                            cur.execute(
                                """INSERT INTO pledges(
                                     candidacy_id, source_type, source_file_type,
                                     title, summary, source_url, fetched_at, is_submitted
                                   ) VALUES(%s,'winner','선거공약서',%s,%s,%s,NOW(),1)
                                   RETURNING id""",
                                (candidacy_id,
                                 f"{w.name} — {pledge.prms_cnt}개 공약",
                                 f"{label} 당선인 공약",
                                 "https://apis.data.go.kr/9760000/ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire"),
                            )
                            pid = cur.fetchone()["id"]

                            for it in pledge.items:
                                cur.execute(
                                    """INSERT INTO pledge_items(
                                         pledge_id, order_index, title, description, category
                                       ) VALUES(%s,%s,%s,%s,%s)""",
                                    (pid, it["order"], it["title"], it["content"], it["realm"]),
                                )
                                stats["pledge_items"] += 1
                        stats["pledges_fetched"] += 1
                        con.commit()
                        print(f"    ✓ {w.name}({w.party_name}) — {len(pledge.items)}개 공약")

            # 완료
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
                    """UPDATE crawl_jobs SET status='error',
                         error_message=%s, finished_at=NOW() WHERE id=%s""",
                    (str(e)[:500], job_id),
                )
            con.commit()
            raise

    print()
    print("=" * 60)
    print(f"결과 ({datetime.now().isoformat()}):")
    for k, v in stats.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
