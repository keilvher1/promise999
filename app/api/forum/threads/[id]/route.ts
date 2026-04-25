import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

/** GET /api/forum/threads/[id] — 단일 글 + 댓글 트리 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tid = Number(id)
  if (!Number.isInteger(tid) || tid <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }

  const t = (await sql`
    SELECT id, target_kind, target_id, title, body,
           author_nick, is_hidden, hide_reason, reply_count,
           upvotes, downvotes, created_at::text, updated_at::text
      FROM forum_threads WHERE id = ${tid}
  `) as any[]
  if (!t.length) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  if (t[0].is_hidden === 1) {
    return NextResponse.json({ error: "hidden", reason: t[0].hide_reason }, { status: 410 })
  }

  const replies = (await sql`
    SELECT id, thread_id, parent_id, body,
           author_nick, is_hidden, upvotes, downvotes, created_at::text
      FROM forum_replies
     WHERE thread_id = ${tid} AND is_hidden = 0
     ORDER BY created_at ASC
  `) as any[]

  return NextResponse.json({ thread: t[0], replies })
}
