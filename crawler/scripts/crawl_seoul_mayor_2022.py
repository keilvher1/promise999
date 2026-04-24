"""제8회 지선(2022) 서울시장 후보 실데이터 크롤 → Neon 적재.

이전 seed_pilot_2022.py의 '큐레이팅 시드'를 공공데이터 API 실응답으로 교체합니다.

파이프라인:
  1) 후보자 정보 API → 서울시장 후보 전원 (이름, 생년월일, 정당, 기호, 학력/경력, huboid)
  2) persons / parties / candidacies upsert (기존 nec_candidate_id 교체)
  3) 각 후보의 huboid로 선거공약 API 호출
  4) pledges / pledge_items 적재 (원문 content 포함)

실행:
    python3 crawler/scripts/crawl_seoul_mayor_2022.py
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect, upsert_returning_id
from crawler.sources.data_go_kr import DataGoKrClient, Candidate

SG_ID = "20220601"
SG_TYPECODE = 3  # 광역단체장(시도지사)
SGG_NAME = "서울특별시"
SD_NAME = "서울특별시"

# 기존 시드 데이터의 sub_election 식별자 (schema: sub_elections.sub_sg_id)
SUB_SG_ID = "0320220601"


def upsert_person(con, cand: Candidate) -> int:
    """persons: (name, birth_date) 복합 키. 기존 시드의 person을 재사용."""
    with con.cursor() as cur:
        cur.execute(
            "SELECT id FROM persons WHERE name=%s AND birth_date IS NOT DISTINCT FROM %s",
            (cand.name, cand.birth_date),
        )
        row = cur.fetchone()
        if row:
            # 한자명 보강
            if cand.hanja_name:
                cur.execute("UPDATE persons SET name_hanja=%s WHERE id=%s",
                            (cand.hanja_name, row["id"]))
            return row["id"]
        cur.execute(
            """INSERT INTO persons(name, name_hanja, birth_date, gender)
               VALUES(%s,%s,%s,%s) RETURNING id""",
            (cand.name, cand.hanja_name, cand.birth_date, cand.gender_code),
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
    print(f"=== crawl_seoul_mayor_2022 시작: {datetime.now().isoformat()} ===\n")
    client = DataGoKrClient()

    with connect() as con:
        # sub_election 존재 확인
        with con.cursor() as cur:
            cur.execute("SELECT id FROM sub_elections WHERE sub_sg_id=%s", (SUB_SG_ID,))
            row = cur.fetchone()
            if not row:
                raise RuntimeError(f"sub_elections에 {SUB_SG_ID} 없음 — seed_pilot_2022 먼저 실행하세요.")
            sub_id = row["id"]

        # 기존 시드(S22SEM*)로 들어간 candidacies + pledges 정리
        with con.cursor() as cur:
            cur.execute(
                """DELETE FROM pledges
                   WHERE candidacy_id IN (
                     SELECT id FROM candidacies
                     WHERE sub_election_id=%s AND nec_candidate_id LIKE 'S22SEM%%'
                   )""",
                (sub_id,),
            )
            cur.execute(
                "DELETE FROM candidacies WHERE sub_election_id=%s AND nec_candidate_id LIKE 'S22SEM%%'",
                (sub_id,),
            )

        # crawl_jobs 시작
        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('data.go.kr',
                           'PofelcddInfoInqireService+ElecPrmsInfoInqireService',
                           %s::jsonb, 'running', NOW())
                   RETURNING id""",
                (json.dumps({"sg_id": SG_ID, "sg_typecode": SG_TYPECODE,
                             "sgg": SGG_NAME, "sd": SD_NAME}),),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        stats = {"candidates": 0, "pledges": 0, "pledge_items": 0, "no_pledge": 0}

        try:
            cands = list(client.iter_candidates(
                sg_id=SG_ID, sg_typecode=SG_TYPECODE,
                sgg_name=SGG_NAME, sd_name=SD_NAME,
            ))
            print(f"후보자 {len(cands)}명 조회됨:")
            for c in cands:
                print(f"  기호 {c.giho}  {c.name}({c.party_name}) huboid={c.huboid}  생년월일={c.birth_date}  상태={c.status}")

            print()
            for c in cands:
                stats["candidates"] += 1
                person_id = upsert_person(con, c)
                party_id = upsert_party(con, c.party_name)

                # 경력 두 줄 합치기
                career = "\n".join(filter(None, [c.career1, c.career2])) or None

                with con.cursor() as cur:
                    cur.execute(
                        """INSERT INTO candidacies(
                             person_id, sub_election_id, party_id, nec_candidate_id,
                             candidate_number, name_as_registered,
                             academic_background, career,
                             source_url
                           ) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT (sub_election_id, nec_candidate_id) DO UPDATE SET
                             person_id=EXCLUDED.person_id,
                             party_id=EXCLUDED.party_id,
                             candidate_number=EXCLUDED.candidate_number,
                             academic_background=EXCLUDED.academic_background,
                             career=EXCLUDED.career
                           RETURNING id""",
                        (person_id, sub_id, party_id, c.huboid,
                         c.giho, c.name, c.edu, career,
                         f"https://www.data.go.kr/data/15000908/openapi.do#huboid={c.huboid}"),
                    )
                    candidacy_id = cur.fetchone()["id"]

                # 공약 조회
                try:
                    pledge = client.get_pledge(
                        sg_id=SG_ID, sg_typecode=SG_TYPECODE, cnddt_id=c.huboid,
                    )
                except Exception as e:
                    print(f"  ERR pledge {c.name}: {e}")
                    continue

                if not pledge or not pledge.items:
                    print(f"  · {c.name}({c.party_name}) — 공약 미제출")
                    stats["no_pledge"] += 1
                    continue

                stats["pledges"] += 1
                with con.cursor() as cur:
                    cur.execute(
                        """INSERT INTO pledges(
                             candidacy_id, source_type, source_file_type,
                             title, summary, source_url, fetched_at, is_submitted
                           ) VALUES(%s,'candidate','선거공약서',%s,%s,%s,NOW(),1)
                           RETURNING id""",
                        (candidacy_id,
                         f"{c.name} — {pledge.prms_cnt}개 공약",
                         f"서울특별시장 후보 {c.name} 선거공약서 (공공데이터포털 API)",
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
                con.commit()
                print(f"  ✓ {c.name}({c.party_name}) — {len(pledge.items)}개 공약 적재")

            with con.cursor() as cur:
                cur.execute(
                    """UPDATE crawl_jobs SET status='success',
                         items_fetched=%s, finished_at=NOW() WHERE id=%s""",
                    (stats["pledges"], job_id),
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

    print("\n=== 적재 결과 ===")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    print(f"\n=== 완료: {datetime.now().isoformat()} ===")


if __name__ == "__main__":
    main()
