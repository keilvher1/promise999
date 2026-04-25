/**
 * 공약 좋아요(likes) — IP 기반 1인 1표.
 *
 * 보안/프라이버시:
 *  - 원본 IP는 절대 저장하지 않음. SHA-256(IP + SALT)만 저장.
 *  - SALT는 환경변수 LIKES_SALT (없으면 fallback). DB 유출되어도 IP 역추적 어려움.
 *  - 같은 IP는 영구 1표 (UA/날짜 unmix). DB에 (voter_hash, target) UNIQUE.
 */
import { createHash } from "node:crypto"

export function makeVoterHash(ip: string, salt = process.env.LIKES_SALT ?? "promise999-likes"): string {
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 32)
}

export function ipFromHeaders(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "0.0.0.0"
  )
}
