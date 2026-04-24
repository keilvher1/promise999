"""서울시장 2022 모든 후보의 득표수·득표율을 투·개표 API로 채우기.

당선인 API는 당선자만 제공하므로 낙선자의 득표수·득표율은 비어 있습니다.
투·개표 API(VoteXmntckInfoInqireService2.getXmntckSttusInfoInqire)는 구·시·군 단위로
모든 후보의 득표를 돌려주므로, 25개 자치구 전체를 합산해서 서울시 전체 득표를 구합니다.

매칭 기준: (name, party_name) 쌍. 서울시장 같은 광역 선거에서는 동일인-동일정당 중복
가능성이 사실상 0이라 안전한 키입니다.

실행:
    python3 crawler/scripts/update_votes_seoul_mayor_2022.py
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect
from crawler.sources.data_go_kr import DataGoKrClient

SG_ID = "20220601"
SG_TYPECODE = 3
SD_NAME = "서울특별시"
SGG_NAME = "서울특별시"
SUB_SG_ID = "0320220601"


def main():
    print(f"=== update_votes_seoul_mayor_2022 시작: {datetime.now().isoformat()} ===\n")
    client = DataGoKrClient(rate_limit_s=0.3)

    with connect() as con:
        # 현재 sub_election 확인
        with con.cursor() as cur:
            cur.execute("SELECT id FROM sub_elections WHERE sub_sg_id=%s", (SUB_SG_ID,))
            row = cur.fetchone()
            if not row:
                raise RuntimeError(f"sub_elections에 {SUB_SG_ID} 없음")
            sub_id = row["id"]

        # crawl_jobs 기록
        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('data.go.kr',
                           'VoteXmntckInfoInqireService2/getXmntckSttusInfoInqire',
                           %s::jsonb, 'running', NOW())
                   RETURNING id""",
                (json.dumps({"sg_id": SG_ID, "sg_typecode": SG_TYPECODE,
                             "sd_name": SD_NAME, "method": "aggregate_by_gusigun"}),),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        try:
            # 1) 코드정보 API로 서울 자치구 목록 동적 조회 (하드코딩 제거)
            gusiguns = client.list_gusiguns(sg_id=SG_ID, sd_name=SD_NAME)
            wiw_names = [g["wiwName"] for g in gusiguns if g.get("wiwName")]
            print(f"코드정보 API로 {SD_NAME} 자치구 {len(wiw_names)}개 조회됨")

            # 2) 개표결과 집계
            print(f"개표결과 집계 중 ({len(wiw_names)}회 API 호출) ...")
            totals = client.aggregate_votes(
                sg_id=SG_ID, sg_typecode=SG_TYPECODE,
                sd_name=SD_NAME, sgg_name=SGG_NAME,
                wiw_names=wiw_names,
            )
            total_sum = sum(totals.values())
            print(f"\n집계 완료: {len(totals)}명, 총 유효 득표 {total_sum:,}표")

            # candidacies 업데이트
            print("\n--- Neon candidacies 업데이트 ---")
            with con.cursor() as cur:
                cur.execute("""
                  SELECT c.id, p.name, pt.name AS party
                  FROM candidacies c
                  JOIN persons p ON p.id = c.person_id
                  JOIN parties pt ON pt.id = c.party_id
                  WHERE c.sub_election_id = %s
                """, (sub_id,))
                our_cands = cur.fetchall()

            updated = 0
            for cand in our_cands:
                key = (cand["name"], cand["party"])
                if key in totals:
                    vc = totals[key]
                    pct = round(vc / total_sum * 100, 2) if total_sum else None
                    with con.cursor() as cur:
                        cur.execute(
                            """UPDATE candidacies
                                 SET vote_count=%s, vote_pct=%s
                               WHERE id=%s""",
                            (vc, pct, cand["id"]),
                        )
                    print(f"  ✓ {cand['name']}({cand['party']}) — {vc:,}표, {pct}%")
                    updated += 1
                else:
                    print(f"  ⚠ {cand['name']}({cand['party']}) — 투개표 응답에 매칭 없음")
            con.commit()

            with con.cursor() as cur:
                cur.execute(
                    """UPDATE crawl_jobs SET status='success',
                         items_fetched=%s, finished_at=NOW() WHERE id=%s""",
                    (updated, job_id),
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

    print(f"\n=== 완료: {datetime.now().isoformat()} ===")


if __name__ == "__main__":
    main()
