import { NextResponse } from "next/server"
import { ADMIN_COOKIE, adminToken } from "@/lib/admin"

export const runtime = "nodejs"

/** POST /api/admin/login  body: { token } — 일치 시 쿠키 세팅 */
export async function POST(req: Request) {
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const expected = adminToken()
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_TOKEN not set" }, { status: 503 })
  }
  if (typeof payload?.token !== "string" || payload.token !== expected) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  // 쿠키 14일 유지, httpOnly + Lax. 프로덕션은 HTTPS만 사용.
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: expected,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 14,
  })
  return res
}

/** DELETE /api/admin/login — 로그아웃 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set({ name: ADMIN_COOKIE, value: "", path: "/", maxAge: 0 })
  return res
}
