"""임의 선거(sg_id) + sg_typecode 지정 범용 당선자 공약 크롤러.

sub_elections는 필요 시 자동 upsert.

실행 예:
    # 제21대 대선 (2025.6.3)
    python3 crawler/scripts/crawl_election.py --sg-id 20250603 --typecodes 1 --skip-candidate-details

    # 제8회 지선 기초단체장만 이어서
    python3 crawler/scripts/crawl_election.py --sg-id 20220601 --typecodes 4 --skip-candidate-details

    # 제7회 지선 시도지사+교육감+기초단체장
    python3 crawler/scripts/crawl_election.py --sg-id 20180613 --typecodes 3,11,4 --skip-candidate-details
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

# 가이드 표준 코드 (공약 API 지원 유형만)
TYPECODE_LABEL = {
    1:  "대통령선거",
    3:  "시도지사선거",
    4:  "기초단체장선거",
    11: "교육감선거",
}


def ensure_election(con, sg_id_8: str) -> int:
    """sg_id 8자리 기반 elections 테이블에 upsert. 없으면 추정 값으로 생성."""
    full_sg_id = "00" + sg_id_8
    with con.cursor() as cur:
        cur.execute("SELECT id, name FROM elections WHERE sg_id=%s", (full_sg_id,))
        row = cur.fetchone()
        if row:
            return row["id"]
        # 알려진 선거 이름 매핑
        name_map = {
            "20260603": ("제9회 전국동시지방선거", "LOCAL"),
            "20250603": ("제21대 대통령선거", "PRESIDENT"),
            "20240410": ("제22대 국회의원선거", "ASSEMBLY"),
            "20220601": ("제8회 전국동시지방선거", "LOCAL"),
            "20220309": ("제20대 대통령선거", "PRESIDENT"),
            "20200415": ("제21대 국회의원선거", "ASSEMBLY"),
            "20180613": ("제7회 전국동시지방선거", "LOCAL"),
            "20170509": ("제19대 대통령선거", "PRESIDENT"),
            "20160413": ("제20대 국회의원선거", "ASSEMBLY"),
            "20140604": ("제6회 전국동시지방선거", "LOCAL"),
            "20121219": ("제18대 대통령선거", "PRESIDENT"),
        }
        name, kind = name_map.get(sg_id_8, (f"선거 {sg_id_8}", "OTHER"))
        date_str = f"{sg_id_8[:4]}-{sg_id_8[4:6]}-{sg_id_8[6:8]}"
        cur.execute(
            """INSERT INTO elections(sg_id, name, election_date, kind)
               VALUES(%s,%s,%s,%s) RETURNING id""",
            (full_sg_id, name, date_str, kind),
        )
        return cur.fetchone()["id"]


def ensure_sub_election(con, parent_id: int, sg_id_8: str, typecode: int) -> int:
    sub_sg_id = f"{typecode:02d}{sg_id_8}"
    typename = TYPECODE_LABEL.get(typecode, f"선거유형{typecode}")
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
               VALUES(%s,%s,%s,%s,%s,0) RETURNING id""",
            (parent_id, sub_sg_id, typecode, typename, typename),
        )
        return cur.fetchone()["id"]


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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sg-id", required=True, help="8자리 yyyyMMdd (예: 20250603)")
    ap.add_argument("--typecodes", default="1,3,4,11",
                    help="공약 API 지원: 1,3,4,11 (대통령/시도지사/기초단체장/교육감)")
    ap.add_argument("--skip-candidate-details", action="store_true")
    ap.add_argument("--limit-sggs", type=int, default=0)
    ap.add_argument("--offset", type=int, default=0,
                    help="list_sggs 결과의 N번째부터 시작 (앞쪽 N개는 winners API 호출 자체 skip)")
    args = ap.parse_args()

    sg_id = args.sg_id
    typecodes = [int(t) for t in args.typecodes.split(",")]

    print(f"=== crawl_election sg_id={sg_id}  typecodes={typecodes} ===")
    client = DataGoKrClient(rate_limit_s=0.05)

    with connect() as con:
        election_id = ensure_election(con, sg_id)
        con.commit()
        print(f"election_id={election_id}")

        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('data.go.kr', 'crawl_election',
                           %s::jsonb, 'running', NOW()) RETURNING id""",
                (json.dumps({"sg_id": sg_id, "typecodes": typecodes}),),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        stats = {"sggs": 0, "winners": 0, "pledges": 0, "items": 0, "skip": 0}

        try:
            for typecode in typecodes:
                se_id = ensure_sub_election(con, election_id, sg_id, typecode)
                con.commit()
                print(f"\n== typecode={typecode} ({TYPECODE_LABEL.get(typecode)}) se_id={se_id} ==")

                # 선거구 목록
                sggs = client.list_sggs(sg_id=sg_id, sg_typecode=typecode)
                if args.offset:
                    sggs = sggs[args.offset:]
                if args.limit_sggs:
                    sggs = sggs[:args.limit_sggs]
                print(f"  선거구 {len(sggs)}개 (offset={args.offset})")

                for sgg in sggs:
                    stats["sggs"] += 1
                    sgg_name = sgg.get("sggName") or ""
                    sd_name = sgg.get("sdName") or ""
                    label = f"{sd_name}/{sgg_name}"

                    try:
                        winners = list(client.iter_winners(
                            sg_id=sg_id, sg_typecode=typecode,
                            sgg_name=sgg_name, sd_name=sd_name,
                        ))
                    except Exception as e:
                        print(f"    ERR winners {label}: {e}")
                        continue

                    if not winners:
                        continue

                    # 선거구 skip 체크
                    huboids = [w.huboid for w in winners]
                    with con.cursor() as cur:
                        cur.execute(
                            """SELECT COUNT(*) AS n FROM pledges pl
                               JOIN candidacies c ON c.id=pl.candidacy_id
                               WHERE c.sub_election_id=%s
                                 AND c.nec_candidate_id=ANY(%s::text[])
                                 AND pl.source_type='winner'""",
                            (se_id, huboids),
                        )
                        already = cur.fetchone()["n"]
                    if already >= len(winners):
                        stats["skip"] += 1
                        continue

                    # 후보자 세부정보
                    cmap = {}
                    if not args.skip_candidate_details:
                        try:
                            for c in client.iter_candidates(
                                sg_id=sg_id, sg_typecode=typecode,
                                sgg_name=sgg_name, sd_name=sd_name,
                            ):
                                cmap[c.huboid] = c
                        except Exception:
                            pass

                    for w in winners:
                        stats["winners"] += 1
                        cand = cmap.get(w.huboid)
                        if cand:
                            person_id = upsert_person_by_birth(con, cand.name, cand.birth_date,
                                                                cand.gender_code, cand.hanja_name)
                            academic = cand.edu
                            career = "\n".join(filter(None, [cand.career1, cand.career2])) or None
                        else:
                            person_id = upsert_person_by_birth(con, w.name, None, None, None)
                            academic = None
                            career = None
                        party_id = upsert_party(con, w.party_name)

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
                                 w.name, academic, career, w.vote_count, w.vote_pct,
                                 f"https://www.data.go.kr/data/15000864/openapi.do#huboid={w.huboid}"),
                            )
                            cid = cur.fetchone()["id"]

                        try:
                            pledge = client.get_pledge(sg_id=sg_id, sg_typecode=typecode, cnddt_id=w.huboid)
                        except Exception as e:
                            print(f"    ERR pledge {w.name}: {e}")
                            continue
                        if not pledge or not pledge.items:
                            continue

                        with con.cursor() as cur:
                            cur.execute(
                                "SELECT id FROM pledges WHERE candidacy_id=%s AND source_type='winner' LIMIT 1",
                                (cid,),
                            )
                            if cur.fetchone():
                                continue
                            cur.execute(
                                """INSERT INTO pledges(
                                     candidacy_id, source_type, source_file_type,
                                     title, summary, source_url, fetched_at, is_submitted
                                   ) VALUES(%s,'winner','선거공약서',%s,%s,%s,NOW(),1)
                                   RETURNING id""",
                                (cid, f"{w.name} — {pledge.prms_cnt}개 공약",
                                 f"{label} 당선인 공약",
                                 "https://apis.data.go.kr/9760000/ElecPrmsInfoInqireService"),
                            )
                            pid = cur.fetchone()["id"]
                            for it in pledge.items:
                                cur.execute(
                                    """INSERT INTO pledge_items(
                                         pledge_id, order_index, title, description, category
                                       ) VALUES(%s,%s,%s,%s,%s)""",
                                    (pid, it["order"], it["title"], it["content"], it["realm"]),
                                )
                                stats["items"] += 1
                        stats["pledges"] += 1
                        con.commit()
                        print(f"    ✓ {w.name}({w.party_name}) {len(pledge.items)}개")

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
