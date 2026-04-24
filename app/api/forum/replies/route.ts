import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  clientFromHeaders, generateNick, looksAbusive, makeAuthorHash,
} from "@/lib/forum"

export const runtime = "edge"

/** POST /api/forum/replies  body: { thread_id, parent_id?, body } */
export async function POST(req: Request) {
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { thread_id, parent_id, body } = payload ?? {}
  if (!Number.isInteger(thread_id) || thread_id <= 0) {
    return NextResponse.json({ error: "thread_id required" }, { status: 400 })
  }
  if (typeof body !== "string" || body.trim().length < 2 || body.length > 4000) {
    return NextResponse.json({ error: "body length 2-4000" }, { status: 400 })
  }
  const abuse = looksAbusive(body)
  if (abuse) return NextResponse.json({ error: abuse }, { status: 400 })

  // 글이 존재하고 숨겨지지 않았는지
  const tcheck = (await sql`
    SELECT id, is_hidden FROM forum_threads WHERE id = ${thread_id}
  `) as { id: number; is_hidden: number }[]
  if (!tcheck.length) {
    return NextResponse.json({ error: "thread not found" }, { status: 404 })
  }
  if (tcheck[0].is_hidden === 1) {
    return NextResponse.json({ error: "thread hidden" }, { status: 410 })
  }

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

  const pid = Number.isInteger(parent_id) && parent_id > 0 ? parent_id : null
  const inserted = (await sql`
    INSERT INTO forum_replies(thread_id, parent_id, body, author_nick, author_hash)
    VALUES (${thread_id}, ${pid}, ${body.trim()}, ${author_nick}, ${author_hash})
    RETURNING id, created_at::text
  `) as { id: number; created_at: string }[]

  await sql`
    UPDATE forum_threads SET reply_count = reply_count + 1, updated_at = NOW()
    WHERE id = ${thread_id}
  `

  return NextResponse.json({ ok: true, id: inserted[0]?.id, author_nick }, { status: 201 })
}
