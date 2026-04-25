import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  FORUM_TARGETS,
  type ForumTargetKind,
  clientFromHeaders,
  generateNick,
  looksAbusive,
  makeAuthorHash,
} from "@/lib/forum"

export const runtime = "nodejs"

/** GET /api/forum/threads?target_kind=...&target_id=...&limit=20&offset=0 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const targetKind = (url.searchParams.get("target_kind") ?? "global") as ForumTargetKind
  const targetId = url.searchParams.get("target_id")
  const limit = clampInt(url.searchParams.get("limit") ?? "20", 1, 100, 20)
  const offset = clampInt(url.searchParams.get("offset") ?? "0", 0, 100000, 0)

  if (!FORUM_TARGETS.includes(targetKind)) {
    return NextResponse.json({ error: "invalid target_kind" }, { status: 400 })
  }
  const tid = targetId ? Number(targetId) : null
  if (targetKind !== "global" && (tid === null || Number.isNaN(tid))) {
    return NextResponse.json({ error: "target_id required" }, { status: 400 })
  }

  const rows = (await sql`
    SELECT id, target_kind, target_id, title, body,
           author_nick, is_hidden, reply_count,
           upvotes, downvotes, created_at::text
      FROM forum_threads
     WHERE target_kind = ${targetKind}
       AND (${targetKind === "global"}::boolean OR target_id = ${tid})
       AND is_hidden = 0
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}
  `) as any[]

  const total = (await sql`
    SELECT COUNT(*)::int AS n FROM forum_threads
     WHERE target_kind = ${targetKind}
       AND (${targetKind === "global"}::boolean OR target_id = ${tid})
       AND is_hidden = 0
  `) as { n: number }[]

  return NextResponse.json({ threads: rows, total: total[0]?.n ?? 0 })
}

/** POST /api/forum/threads  body: { target_kind, target_id, title, body } */
export async function POST(req: Request) {
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { target_kind, target_id, title, body } = payload ?? {}

  if (!FORUM_TARGETS.includes(target_kind)) {
    return NextResponse.json({ error: "invalid target_kind" }, { status: 400 })
  }
  if (target_kind !== "global" && (target_id === undefined || target_id === null)) {
    return NextResponse.json({ error: "target_id required" }, { status: 400 })
  }
  if (typeof title !== "string" || title.trim().length < 2 || title.length > 200) {
    return NextResponse.json({ error: "title length 2-200" }, { status: 400 })
  }
  if (typeof body !== "string" || body.trim().length < 2 || body.length > 8000) {
    return NextResponse.json({ error: "body length 2-8000" }, { status: 400 })
  }

  const abuse = looksAbusive(title) ?? looksAbusive(body)
  if (abuse) return NextResponse.json({ error: abuse }, { status: 400 })

  const { ip, ua } = clientFromHeaders(req.headers)
  const author_hash = makeAuthorHash(ip, ua)
  const author_nick = generateNick(author_hash)

  // 분당 5건 레이트리밋
  const rate = (await sql`
    SELECT COUNT(*)::int AS n FROM (
      SELECT created_at FROM forum_threads
       WHERE author_hash = ${author_hash} AND created_at > NOW() - INTERVAL '60 seconds'
      UNION ALL
      SELECT created_at FROM forum_replies
       WHERE author_hash = ${author_hash} AND created_at > NOW() - INTERVAL '60 seconds'
    ) x
  `) as { n: number }[]
  if ((rate[0]?.n ?? 0) >= 5) {
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요 (분당 5건 제한)." }, { status: 429 })
  }

  const tid = target_kind === "global" ? null : Number(target_id)

  const inserted = (await sql`
    INSERT INTO forum_threads(target_kind, target_id, title, body, author_nick, author_hash)
    VALUES (${target_kind}, ${tid}, ${title.trim()}, ${body.trim()}, ${author_nick}, ${author_hash})
    RETURNING id, created_at::text
  `) as { id: number; created_at: string }[]

  return NextResponse.json({ ok: true, id: inserted[0]?.id, author_nick }, { status: 201 })
}

function clampInt(s: string, lo: number, hi: number, fallback: number): number {
  const n = parseInt(s, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(lo, Math.min(hi, n))
}
