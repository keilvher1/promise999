import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { clientFromHeaders, makeAuthorHash } from "@/lib/forum"

export const runtime = "nodejs"

const REASONS = ["spam","abuse","offtopic","illegal","disinfo","other"] as const

/** POST /api/forum/report  body: { thread_id?|reply_id?, reason, detail? } */
export async function POST(req: Request) {
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { thread_id, reply_id, reason, detail } = payload ?? {}
  if (!REASONS.includes(reason)) {
    return NextResponse.json({ error: "invalid reason" }, { status: 400 })
  }
  const onThread = Number.isInteger(thread_id) && thread_id > 0
  const onReply = Number.isInteger(reply_id) && reply_id > 0
  if (onThread === onReply) {
    return NextResponse.json({ error: "exactly one of thread_id|reply_id" }, { status: 400 })
  }
  if (detail && typeof detail === "string" && detail.length > 500) {
    return NextResponse.json({ error: "detail too long" }, { status: 400 })
  }

  const { ip, ua } = clientFromHeaders(req.headers)
  const reporter_hash = makeAuthorHash(ip, ua)

  try {
    if (onThread) {
      await sql`
        INSERT INTO forum_reports(thread_id, reporter_hash, reason, detail)
        VALUES (${thread_id}, ${reporter_hash}, ${reason}, ${detail ?? null})
      `
      // 신고 누적 → 자동 숨김 임계치
      await sql`UPDATE forum_threads SET report_count = report_count + 1 WHERE id = ${thread_id}`
      await sql`
        UPDATE forum_threads SET is_hidden = 1, hide_reason = 'auto: report threshold'
        WHERE id = ${thread_id} AND report_count >= 5 AND is_hidden = 0
      `
    } else {
      await sql`
        INSERT INTO forum_reports(reply_id, reporter_hash, reason, detail)
        VALUES (${reply_id}, ${reporter_hash}, ${reason}, ${detail ?? null})
      `
      await sql`UPDATE forum_replies SET report_count = report_count + 1 WHERE id = ${reply_id}`
      await sql`
        UPDATE forum_replies SET is_hidden = 1, hide_reason = 'auto: report threshold'
        WHERE id = ${reply_id} AND report_count >= 5 AND is_hidden = 0
      `
    }
  } catch (e: any) {
    // unique constraint(같은 사람 중복 신고) → 친절히
    if (String(e?.message ?? "").includes("forum_report")) {
      return NextResponse.json({ error: "이미 신고하셨습니다." }, { status: 409 })
    }
    return NextResponse.json({ error: "신고 처리 실패" }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
