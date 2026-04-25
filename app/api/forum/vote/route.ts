import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { clientFromHeaders, makeAuthorHash } from "@/lib/forum"

export const runtime = "nodejs"

/** POST /api/forum/vote  body: { thread_id?|reply_id?, vote: 1|-1 } */
export async function POST(req: Request) {
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { thread_id, reply_id, vote } = payload ?? {}
  if (vote !== 1 && vote !== -1) {
    return NextResponse.json({ error: "vote must be 1 or -1" }, { status: 400 })
  }
  const onThread = Number.isInteger(thread_id) && thread_id > 0
  const onReply = Number.isInteger(reply_id) && reply_id > 0
  if (onThread === onReply) {
    return NextResponse.json({ error: "exactly one of thread_id|reply_id" }, { status: 400 })
  }

  const { ip, ua } = clientFromHeaders(req.headers)
  const voter_hash = makeAuthorHash(ip, ua)

  // 1) 기존 표 확인
  const existing = (onThread
    ? await sql`SELECT id, vote FROM forum_votes WHERE voter_hash = ${voter_hash} AND thread_id = ${thread_id}`
    : await sql`SELECT id, vote FROM forum_votes WHERE voter_hash = ${voter_hash} AND reply_id = ${reply_id}`
  ) as { id: number; vote: number }[]

  let delta = { up: 0, down: 0 }
  if (!existing.length) {
    if (onThread) {
      await sql`INSERT INTO forum_votes(thread_id, voter_hash, vote) VALUES (${thread_id}, ${voter_hash}, ${vote})`
    } else {
      await sql`INSERT INTO forum_votes(reply_id, voter_hash, vote) VALUES (${reply_id}, ${voter_hash}, ${vote})`
    }
    delta = vote === 1 ? { up: 1, down: 0 } : { up: 0, down: 1 }
  } else if (existing[0].vote === vote) {
    // 같은 표 재클릭 → 취소
    await sql`DELETE FROM forum_votes WHERE id = ${existing[0].id}`
    delta = vote === 1 ? { up: -1, down: 0 } : { up: 0, down: -1 }
  } else {
    // 반대 표로 변경
    await sql`UPDATE forum_votes SET vote = ${vote} WHERE id = ${existing[0].id}`
    delta = vote === 1 ? { up: 1, down: -1 } : { up: -1, down: 1 }
  }

  if (onThread) {
    await sql`UPDATE forum_threads
              SET upvotes = upvotes + ${delta.up}, downvotes = downvotes + ${delta.down}
              WHERE id = ${thread_id}`
    const r = (await sql`SELECT upvotes, downvotes FROM forum_threads WHERE id = ${thread_id}`) as any[]
    return NextResponse.json({ ok: true, upvotes: r[0]?.upvotes, downvotes: r[0]?.downvotes })
  } else {
    await sql`UPDATE forum_replies
              SET upvotes = upvotes + ${delta.up}, downvotes = downvotes + ${delta.down}
              WHERE id = ${reply_id}`
    const r = (await sql`SELECT upvotes, downvotes FROM forum_replies WHERE id = ${reply_id}`) as any[]
    return NextResponse.json({ ok: true, upvotes: r[0]?.upvotes, downvotes: r[0]?.downvotes })
  }
}
