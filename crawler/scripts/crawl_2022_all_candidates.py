"""제8회 지선(2022) 시도지사+교육감+기초단체장 전체 후보자(낙선자 포함) 적재.

iter_candidates 사용 — 공약 API는 일반적으로 당선인만 응답하므로 학력/경력/기호만 채움.
ON CONFLICT 발생 시 is_elected 칼럼은 절대 덮어쓰지 않음 (winner 행 보존).

실행:
    python3 crawler/scripts/crawl_2022_all_candidates.py
"""
from __future__ import annotations

import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect, upsert_returning_id
from crawler.sources.data_go_kr import DataGoKrClient

SG_ID = "20220601"
PARENT_FULL_SG_ID = "00" + SG_ID  # "0020220601"
TYPECODES = [3, 11, 4]  # 시도지사 / 교육감 / 기초단체장
TYPECODE_LABEL = {3: "시도지사", 11: "교육감", 4: "기초단체장"}


def upsert_person_by_birth(con, name, birth_date, gender_code, hanja):
    with con.cursor() as cur:
        cur.execute(
            "SELECT id FROM persons WHERE name=%s AND birth_date IS NOT DISTINCT FROM %s",
            (name, birth_date),
        )
        row = cur.fetchone()
        if row:
            if hanja:
                cur.execute(
                    "UPDATE persons SET name_hanja=COALESCE(name_hanja,%s) WHERE id=%s",
                    (hanja, row["id"]),
                )
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


def main():
    print(f"=== crawl_2022_all_candidates 시작: {datetime.now().isoformat()} ===")
    client = DataGoKrClient(rate_limit_s=0.05)

    with connect() as con:
        with con.cursor() as cur:
            cur.execute("SELECT id FROM elections WHERE sg_id=%s", (PARENT_FULL_SG_ID,))
            row = cur.fetchone()
            if not row:
                raise RuntimeError(f"elections에 {PARENT_FULL_SG_ID} 없음. seed 먼저.")
            parent_id = row["id"]

        grand = {"sggs": 0, "candidates": 0, "inserted": 0, "kept_winner": 0, "errors": 0}

        for typecode in TYPECODES:
            sub_sg_id = f"{typecode:02d}{SG_ID}"
            with con.cursor() as cur:
                cur.execute(
                    "SELECT id FROM sub_elections WHERE parent_election_id=%s AND sub_sg_id=%s",
                    (parent_id, sub_sg_id),
                )
                row = cur.fetchone()
                if not row:
                    print(f"  SKIP typecode={typecode} (sub_sg_id={sub_sg_id} 없음)")
                    continue
                se_id = row["id"]

            print(f"\n== typecode={typecode} ({TYPECODE_LABEL[typecode]}) se_id={se_id} ==")

            try:
                sggs = client.list_sggs(sg_id=SG_ID, sg_typecode=typecode)
            except Exception as e:
                print(f"  ERR list_sggs: {e}")
                grand["errors"] += 1
                continue
            print(f"  {len(sggs)}개 선거구")

            stats = {"sggs": 0, "candidates": 0, "inserted": 0, "kept_winner": 0}
            for sgg in sggs:
                stats["sggs"] += 1
                grand["sggs"] += 1
                sgg_name = sgg.get("sggName") or ""
                sd_name = sgg.get("sdName") or ""

                try:
                    cands = list(client.iter_candidates(
                        sg_id=SG_ID, sg_typecode=typecode,
                        sgg_name=sgg_name, sd_name=sd_name,
                    ))
                except Exception as e:
                    print(f"    ERR {sd_name}/{sgg_name}: {e}")
                    grand["errors"] += 1
                    continue

                for c in cands:
                    stats["candidates"] += 1
                    grand["candidates"] += 1

                    person_id = upsert_person_by_birth(
                        con, c.name, c.birth_date, c.gender_code, c.hanja_name,
                    )
                    party_id = upsert_party(con, c.party_name)
                    career = "\n".join(filter(None, [c.career1, c.career2])) or None

                    with con.cursor() as cur:
                        cur.execute(
                            """INSERT INTO candidacies(
                                 person_id, sub_election_id, party_id,
                                 nec_candidate_id, candidate_number,
                                 name_as_registered, academic_background, career,
                                 is_elected, source_url
                               ) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,0,%s)
                               ON CONFLICT (sub_election_id, nec_candidate_id) DO UPDATE SET
                                 person_id=EXCLUDED.person_id,
                                 party_id=EXCLUDED.party_id,
                                 candidate_number=COALESCE(candidacies.candidate_number, EXCLUDED.candidate_number),
                                 name_as_registered=EXCLUDED.name_as_registered,
                                 academic_background=COALESCE(candidacies.academic_background, EXCLUDED.academic_background),
                                 career=COALESCE(candidacies.career, EXCLUDED.career)
                               RETURNING (xmax = 0) AS inserted, is_elected""",
                            (person_id, se_id, party_id, c.huboid, c.giho,
                             c.name, c.edu, career,
                             f"https://www.data.go.kr/data/15000908/openapi.do#huboid={c.huboid}"),
                        )
                        r = cur.fetchone()
                        if r["inserted"]:
                            stats["inserted"] += 1
                            grand["inserted"] += 1
                        elif r.get("is_elected") == 1:
                            stats["kept_winner"] += 1
                            grand["kept_winner"] += 1
                    con.commit()

                if stats["sggs"] % 20 == 0:
                    print(f"  ... [{stats['sggs']}/{len(sggs)}] cands={stats['candidates']} "
                          f"new={stats['inserted']} kept_winners={stats['kept_winner']}")

            print(f"  done typecode={typecode}: {stats}")

        print(f"\n=== 완료: {datetime.now().isoformat()} ===")
        print(f"GRAND: {grand}")


if __name__ == "__main__":
    main()
