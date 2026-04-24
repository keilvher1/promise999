"""당선인 정보 API로 기존 candidacies 레코드의 당선·득표 정보 보강.

현재 Neon에는 후보자 정보 API로 5명이 들어가 있으나, 누가 당선되었는지(is_elected)와
득표수·득표율(vote_count/vote_pct)은 비어 있습니다. 당선인 API로 이 필드들을 채웁니다.

매칭 기준: (sub_election_id, nec_candidate_id=huboid).
당선인 API에 없는 후보는 자동으로 is_elected=0 처리.

실행:
    python3 crawler/scripts/update_winners_2022.py
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect
from crawler.sources.data_go_kr import DataGoKrClient

# 2022 지선 파일럿 타겟 — 현재 Neon에 데이터 있는 서울시장만
TARGETS = [
    # sub_sg_id, sg_typecode, sd_name, sgg_name, label
    ("0320220601", 3, "서울특별시", "서울특별시", "서울특별시장"),
]
SG_ID = "20220601"


def main():
    print(f"=== update_winners_2022 시작: {datetime.now().isoformat()} ===\n")
    client = DataGoKrClient()

    with connect() as con:
        # crawl_jobs 기록
        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('data.go.kr','WinnerInfoInqireService2/getWinnerInfoInqire',
                           %s::jsonb, 'running', NOW())
                   RETURNING id""",
                (json.dumps({"sg_id": SG_ID, "targets": [t[0] for t in TARGETS]}),),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        stats = {"winners_fetched": 0, "updated_elected": 0, "updated_lost": 0}

        try:
            for sub_sg_id, typecode, sd_name, sgg_name, label in TARGETS:
                print(f"\n--- {label} (sub_sg_id={sub_sg_id}) ---")
                with con.cursor() as cur:
                    cur.execute("SELECT id FROM sub_elections WHERE sub_sg_id=%s", (sub_sg_id,))
                    row = cur.fetchone()
                    if not row:
                        print(f"  SKIP: sub_elections에 {sub_sg_id} 없음")
                        continue
                    sub_id = row["id"]

                # 당선인 조회
                winners = list(client.iter_winners(
                    sg_id=SG_ID, sg_typecode=typecode,
                    sgg_name=sgg_name, sd_name=sd_name,
                ))
                stats["winners_fetched"] += len(winners)
                winner_huboids = set(w.huboid for w in winners)

                for w in winners:
                    with con.cursor() as cur:
                        cur.execute(
                            """UPDATE candidacies
                                 SET is_elected=1, vote_count=%s, vote_pct=%s,
                                     candidate_number=COALESCE(candidate_number, %s)
                               WHERE sub_election_id=%s AND nec_candidate_id=%s
                               RETURNING id""",
                            (w.vote_count, w.vote_pct, w.giho, sub_id, w.huboid),
                        )
                        updated = cur.fetchone()
                    if updated:
                        stats["updated_elected"] += 1
                        print(f"  ★ 당선  {w.name}({w.party_name}) — {w.vote_count:,}표, {w.vote_pct}%")
                    else:
                        print(f"  ⚠ {w.name}({w.party_name}) huboid={w.huboid} — candidacies에 매칭 레코드 없음")

                # 같은 sub_election 내에 당선인이 아닌 모든 후보는 is_elected=0
                with con.cursor() as cur:
                    if winner_huboids:
                        ph = ",".join(["%s"] * len(winner_huboids))
                        cur.execute(
                            f"""UPDATE candidacies
                                  SET is_elected=0
                                WHERE sub_election_id=%s
                                  AND nec_candidate_id NOT IN ({ph})
                                  AND is_elected IS DISTINCT FROM 0
                                RETURNING id""",
                            (sub_id, *winner_huboids),
                        )
                        lost = cur.fetchall()
                        stats["updated_lost"] += len(lost)
                con.commit()

            with con.cursor() as cur:
                cur.execute(
                    """UPDATE crawl_jobs SET status='success',
                         items_fetched=%s, finished_at=NOW() WHERE id=%s""",
                    (stats["winners_fetched"], job_id),
                )
            con.commit()
        except Exception as e:
            with con.cursor() as cur:
                cur.execute(
                    """UPDATE crawl_jobs SET status='error',
                         error_message=%s, finished_at=NOW() WHERE id=%s""",
                    (str(e), job_id),
                )
            con.commit()
            raise

    print("\n=== 결과 ===")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    print(f"\n=== 완료: {datetime.now().isoformat()} ===")


if __name__ == "__main__":
    main()
