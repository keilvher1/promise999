/**
 * Neon(PostgreSQL) 연결.
 *
 * Vercel/Edge runtime에서도 동작하도록 @neondatabase/serverless 사용.
 * 환경변수 DATABASE_URL 필수 (.env 또는 Vercel Environment Variables에 설정).
 */
import { neon, neonConfig } from "@neondatabase/serverless"

// 연결이 한 번 맺히면 재사용되도록 캐시 활성화
neonConfig.fetchConnectionCache = true

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL 환경변수가 설정되지 않았습니다. " +
        "프로젝트 루트의 .env에 Neon connection string을 넣거나, " +
        "Vercel에서는 Environment Variables를 설정하세요.",
    )
  }
  return url
}

/**
 * Neon HTTP SQL 클라이언트. 단일 쿼리, 파라미터 바인딩 지원.
 *
 * 사용 예:
 *   const rows = await sql`SELECT * FROM elections WHERE sg_id = ${sgId}`
 */
export const sql = neon(getDatabaseUrl())

/** 접속 상태 확인. 실패 시 예외. */
export async function ping(): Promise<{ now: string }> {
  const rows = (await sql`SELECT NOW()::text AS now`) as { now: string }[]
  return rows[0]
}
