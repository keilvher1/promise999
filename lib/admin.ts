/**
 * 관리자 인증 — 환경변수 ADMIN_TOKEN 기반의 단순 Bearer/쿠키 토큰.
 *
 * 운영 단계에서는 OAuth/SSO로 교체 권장. Phase 2에서 보강.
 */
import { cookies } from "next/headers"

export const ADMIN_COOKIE = "p999_admin"

export function adminToken(): string | null {
  const t = process.env.ADMIN_TOKEN
  if (!t || t.length < 4) return null
  return t
}

/** 서버 컴포넌트/라우트에서 호출. 인증 통과 여부만 boolean. */
export async function isAdmin(req?: Request): Promise<boolean> {
  const expected = adminToken()
  if (!expected) return false

  // 1) Authorization: Bearer <token>
  const auth = req?.headers.get("authorization") ?? ""
  if (auth.toLowerCase().startsWith("bearer ")) {
    const v = auth.slice(7).trim()
    if (v && v === expected) return true
  }

  // 2) 쿠키
  try {
    const store = await cookies()
    const v = store.get(ADMIN_COOKIE)?.value
    if (v && v === expected) return true
  } catch {
    // cookies()를 호출할 수 없는 컨텍스트
  }

  return false
}
