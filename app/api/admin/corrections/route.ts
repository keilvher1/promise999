import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/admin"

export const runtime = "nodejs"

const STATUSES = ["open", "investigating", "fixed", "rejected", "duplicate"] as const

/** PATCH /api/admin/corrections  body: { id, status, admin_note? } */
export async function PATCH(req: Request) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { id, status, admin_note } = payload ?? {}
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 })
  }
  if (admin_note != null && (typeof admin_note !== "string" || admin_note.length > 2000)) {
    return NextResponse.json({ error: "admin_note ≤2000 chars" }, { status: 400 })
  }
  const resolved = (status === "fixed" || status === "rejected" || status === "duplicate")

  await sql`
    UPDATE corrections
       SET status = ${status}::correction_status,
           admin_note = ${admin_note ?? null},
           updated_at = NOW()
     WHERE id = ${id}
  `
  if (resolved) {
    await sql`UPDATE corrections SET resolved_at = NOW() WHERE id = ${id} AND resolved_at IS NULL`
  } else {
    await sql`UPDATE corrections SET resolved_at = NULL WHERE id = ${id}`
  }

  return NextResponse.json({ ok: true })
}
