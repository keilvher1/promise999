import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

/**
 * GET /api/search/trending?window=7d&limit=10
 *
 * 최근 N일 기준 검색어 빈도 상위. 결과 0인 검색은 제외 + 최소 2자 이상.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const win = (url.searchParams.get("window") ?? "7d").toLowerCase()
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "10", 10) || 10, 1),
    50,
  )

  const interval =
    win === "1h" ? "1 hour" :
    win === "24h" ? "24 hours" :
    win === "30d" ? "30 days" :
    "7 days"

  // 표준화된 query_norm으로 집계, 첫 등장 query를 표시명으로
  const rows = (await sql`
    WITH recent AS (
      SELECT query_norm, query, created_at
        FROM search_log
       WHERE created_at > NOW() - (${interval}::interval)
         AND char_length(query_norm) >= 2
    ),
    counted AS (
      SELECT query_norm, COUNT(*)::int AS hits
        FROM recent
       GROUP BY query_norm
    ),
    label AS (
      SELECT DISTINCT ON (query_norm)
             query_norm, query AS display
        FROM recent
       ORDER BY query_norm, created_at DESC
    )
    SELECT c.query_norm AS norm, l.display AS label, c.hits
      FROM counted c
      JOIN label l USING (query_norm)
     ORDER BY c.hits DESC, l.display ASC
     LIMIT ${limit}
  `) as { norm: string; label: string; hits: number }[]

  return NextResponse.json({ window: win, items: rows })
}
