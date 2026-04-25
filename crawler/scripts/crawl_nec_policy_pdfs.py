"""policy.nec.go.kr 선거공보 PDF 크롤 + 텍스트 추출 + DB 적재.

각 후보(candidacies 행)에 대해:
  1. NecPolicyClient 로 fileinfo 조회 (공개된 PDF 목록)
  2. 우선순위로 다운로드: 선거공약서 > 책자형선거공보 > 10대공약 > 5대공약 > 전단형선거공보
  3. pdfplumber 텍스트 추출
  4. pledge_pdf_texts 에 저장 (중복 방지: UNIQUE candidacy_id+pdf_kind)
  5. pledges 행에 pdf_url/pdf_pages/pdf_kind 메타 업데이트 — 같은 후보에 row가
     없으면 새로 INSERT (source_type='nec_pdf').

실행 예:
    # 모든 후보 (--limit 으로 테스트)
    python3 crawler/scripts/crawl_nec_policy_pdfs.py --limit 5

    # 특정 sg_id만
    python3 crawler/scripts/crawl_nec_policy_pdfs.py --sg-id 20250603
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from crawler.store.db import connect
from crawler.sources.nec_policy import NecPolicyClient, extract_pdf_text

# 우선순위 — 텍스트 풍부한 PDF 우선
PRIORITY_KINDS = ["선거공약서", "책자형선거공보", "10대공약", "5대공약", "전단형선거공보"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sg-id", help="elections.sg_id (예: 0020250603) 또는 8자리. 미지정 시 전체.")
    ap.add_argument("--typecode", type=int, default=None,
                    help="sub_elections.sg_typecode (예: 1=대통령). 미지정 시 전체.")
    ap.add_argument("--limit", type=int, default=0, help="처리할 후보 수 (0=무제한)")
    ap.add_argument("--skip-existing", action="store_true",
                    help="이미 pledge_pdf_texts에 있는 후보는 스킵")
    ap.add_argument("--rate-limit", type=float, default=0.3, help="API 호출 간격 (초)")
    args = ap.parse_args()

    print(f"=== NEC PDF 크롤 시작: {datetime.now().isoformat()} ===")
    client = NecPolicyClient(rate_limit_s=args.rate_limit)

    with connect() as con:
        with con.cursor() as cur:
            sg_filter = ""
            params = []
            if args.sg_id:
                sg_full = args.sg_id if args.sg_id.startswith("00") else f"00{args.sg_id}"
                sg_filter += " AND e.sg_id = %s"
                params.append(sg_full)
            if args.typecode is not None:
                sg_filter += " AND se.sg_typecode = %s"
                params.append(args.typecode)
            existing = ""
            if args.skip_existing:
                existing = """ AND NOT EXISTS (
                    SELECT 1 FROM pledge_pdf_texts pt WHERE pt.candidacy_id = c.id
                )"""
            cur.execute(f"""
                SELECT c.id, c.nec_candidate_id, p.name, e.sg_id, se.sg_typecode
                  FROM candidacies c
                  JOIN persons p ON p.id = c.person_id
                  JOIN sub_elections se ON se.id = c.sub_election_id
                  JOIN elections e ON e.id = se.parent_election_id
                 WHERE 1=1 {sg_filter} {existing}
                 ORDER BY e.election_date DESC, p.name
                 {"LIMIT " + str(args.limit) if args.limit else ""}
            """, params)
            rows = cur.fetchall()

        print(f"  대상 후보 {len(rows)}명")

        with con.cursor() as cur:
            cur.execute(
                """INSERT INTO crawl_jobs(source, endpoint, params, status, started_at)
                   VALUES ('policy.nec.go.kr', 'nec_pdf_crawl', %s::jsonb, 'running', NOW())
                   RETURNING id""",
                (f'{{"limit":{args.limit},"sg_id":"{args.sg_id or ""}","typecode":{args.typecode}}}',),
            )
            job_id = cur.fetchone()["id"]
        con.commit()

        stats = {"checked": 0, "no_pdf": 0, "downloaded": 0, "extracted": 0,
                 "stored": 0, "errors": 0, "total_chars": 0}

        try:
            for r in rows:
                cid = r["id"]
                huboid = r["nec_candidate_id"]
                name = r["name"]
                sg_id_full = r["sg_id"]
                sg_id_8 = sg_id_full[2:] if sg_id_full.startswith("00") else sg_id_full
                typecode = r["sg_typecode"]

                stats["checked"] += 1
                try:
                    pdfs = client.list_pdfs(sg_id_8, typecode, huboid)
                except Exception as e:
                    print(f"    ERR list_pdfs {name}({huboid}): {e}")
                    stats["errors"] += 1
                    continue

                if not pdfs:
                    stats["no_pdf"] += 1
                    print(f"    · {name} — PDF 없음")
                    continue

                # 우선순위 정렬
                pdfs_sorted = sorted(
                    pdfs,
                    key=lambda p: PRIORITY_KINDS.index(p.kind) if p.kind in PRIORITY_KINDS else 99
                )

                stored_kinds = set()
                for pdf in pdfs_sorted[:2]:  # 최대 2종 저장 (선거공약서 + 책자형 등)
                    try:
                        body = client.download_pdf(pdf.pdf_url)
                    except Exception as e:
                        print(f"    ERR download {name} {pdf.kind}: {e}")
                        stats["errors"] += 1
                        continue
                    if not body:
                        continue
                    stats["downloaded"] += 1

                    try:
                        text, pages = extract_pdf_text(body)
                    except Exception as e:
                        print(f"    ERR extract {name} {pdf.kind}: {e}")
                        stats["errors"] += 1
                        continue

                    if len(text.strip()) < 100:
                        # 이미지 PDF (텍스트 없음)
                        continue
                    stats["extracted"] += 1
                    stats["total_chars"] += len(text)

                    with con.cursor() as cur:
                        cur.execute(
                            """INSERT INTO pledge_pdf_texts
                                 (candidacy_id, pdf_kind, pdf_url, full_text, pages, bytes)
                               VALUES (%s,%s,%s,%s,%s,%s)
                               ON CONFLICT (candidacy_id, pdf_kind) DO UPDATE SET
                                 pdf_url=EXCLUDED.pdf_url,
                                 full_text=EXCLUDED.full_text,
                                 pages=EXCLUDED.pages,
                                 bytes=EXCLUDED.bytes,
                                 fetched_at=NOW()""",
                            (cid, pdf.kind, pdf.pdf_url, text, pages, len(body)),
                        )
                        stats["stored"] += 1
                        stored_kinds.add(pdf.kind)

                if stored_kinds:
                    con.commit()
                    print(f"    ✓ {name} — {','.join(stored_kinds)} ({stats['total_chars']:,} chars total so far)")

            with con.cursor() as cur:
                cur.execute("""UPDATE crawl_jobs SET status='success',
                    items_fetched=%s, finished_at=NOW() WHERE id=%s""",
                    (stats["stored"], job_id))
            con.commit()
        except Exception as e:
            with con.cursor() as cur:
                cur.execute("""UPDATE crawl_jobs SET status='error',
                    error_message=%s, finished_at=NOW() WHERE id=%s""",
                    (str(e)[:500], job_id))
            con.commit()
            raise

    print(f"\n완료 ({datetime.now().isoformat()}): {stats}")


if __name__ == "__main__":
    main()
