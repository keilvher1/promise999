import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/admin"

export const runtime = "nodejs"

/** PATCH /api/admin/forum  body: { kind: "thread"|"reply", id, action: "hide"|"unhide", reason? } */
export async function PATCH(req: Request) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { kind, id, action, reason } = payload ?? {}
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }
  if (action !== "hide" && action !== "unhide") {
    return NextResponse.json({ error: "invalid action" }, { status: 400 })
  }
  const flag = action === "hide" ? 1 : 0
  const r = action === "hide" ? (reason ?? "admin: hidden") : null

  if (kind === "thread") {
    await sql`
      UPDATE forum_threads SET is_hidden = ${flag}, hide_reason = ${r}
      WHERE id = ${id}
    `
  } else if (kind === "reply") {
    await sql`
      UPDATE forum_replies SET is_hidden = ${flag}, hide_reason = ${r}
      WHERE id = ${id}
    `
  } else {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
