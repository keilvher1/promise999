import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

/**
 * GET /api/search/suggest?q=…&limit=8
 *
 * 사용자가 검색어를 타이핑하는 동안 후보·정당·선거명에서 prefix/부분일치
 * 결과를 빠르게 돌려준다.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get("q") ?? "").trim()
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "8", 10) || 8, 1),
    20,
  )
  if (!q) {
    return NextResponse.json({ items: [] })
  }
  const like = `%${q}%`
  const prefixLike = `${q}%`

  // 후보자 (당선자 우선)
  const candidates = (await sql`
    SELECT DISTINCT ON (p.name)
           p.name AS label,
           c.id   AS id,
           COALESCE(pt.name, '무소속') AS sub,
           e.name AS context,
           CASE WHEN p.name LIKE ${prefixLike} THEN 0 ELSE 1 END AS rk
      FROM persons p
      JOIN candidacies c ON c.person_id = p.id
      LEFT JOIN parties pt ON pt.id = c.party_id
      JOIN sub_elections se ON se.id = c.sub_election_id
      JOIN elections e ON e.id = se.parent_election_id
     WHERE p.name ILIKE ${like}
     ORDER BY p.name, rk, c.is_elected DESC NULLS LAST, e.election_date DESC
     LIMIT ${limit}
  `) as { label: string; id: number; sub: string; context: string }[]

  // 정당
  const parties = (await sql`
    SELECT DISTINCT pt.name AS label,
           COUNT(c.id)::int AS sub_count
      FROM parties pt
      JOIN candidacies c ON c.party_id = pt.id
     WHERE pt.name ILIKE ${like}
     GROUP BY pt.name
     ORDER BY sub_count DESC
     LIMIT ${limit}
  `) as { label: string; sub_count: number }[]

  // 선거
  const elections = (await sql`
    SELECT e.name AS label, e.sg_id, e.election_date::text AS date
      FROM elections e
     WHERE e.name ILIKE ${like}
     ORDER BY e.election_date DESC
     LIMIT 5
  `) as { label: string; sg_id: string; date: string }[]

  const items = [
    ...candidates.map(c => ({
      type: "candidate" as const,
      label: c.label,
      sub: `${c.sub} · ${c.context}`,
      href: `/candidates/${c.id}`,
    })),
    ...parties.map(p => ({
      type: "party" as const,
      label: p.label,
      sub: `${p.sub_count}명 출마`,
      href: `/candidates?q=${encodeURIComponent(p.label)}`,
    })),
    ...elections.map(e => ({
      type: "election" as const,
      label: e.label,
      sub: e.date,
      href: `/elections/${e.sg_id}`,
    })),
  ]

  return NextResponse.json({ items: items.slice(0, limit) })
}
