/**
 * 익명 토론장 (forum) — 서버 사이드 헬퍼.
 *
 * - 닉네임 자동 생성 (한국어/영어 혼합 형용사+명사)
 * - 작성자 식별 해시 (IP + UA + 일자별 SALT) — 영구 식별 불가능 + 동일인 레이트리밋 가능
 * - 단순 욕설/스팸 필터 (확장 여지)
 */
import { createHash } from "node:crypto"

const NICK_ADJ = [
  "조용한", "다정한", "성난", "냉정한", "꼼꼼한", "느긋한", "용감한",
  "예리한", "수줍은", "단호한", "성실한", "유쾌한", "차분한", "엉뚱한",
  "솔직한", "공정한", "신중한", "분주한",
]
const NICK_NOUN = [
  "유권자", "시민", "관찰자", "분석가", "평론가", "리포터", "방랑자",
  "토론자", "독자", "행인", "산책자", "기록자", "참여자", "방문객",
  "탐구자", "회의론자", "낙관론자", "현실주의자",
]

export function generateNick(seed?: string): string {
  // seed(=author_hash 일부)로 안정적이게: 같은 작성자는 같은 글 안에서 같은 닉네임
  const h = seed ? hashString(seed) : Math.floor(Math.random() * 0xffffffff)
  const a = NICK_ADJ[h % NICK_ADJ.length]
  const n = NICK_NOUN[(h >>> 8) % NICK_NOUN.length]
  const num = (h >>> 16) % 1000
  return `${a} ${n}#${num.toString().padStart(3, "0")}`
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

/**
 * 작성자 해시. IP + UA + 날짜별 SALT 로 sha256.
 * - 같은 사람이라도 날짜가 바뀌면 해시가 바뀌어 **영구 추적 불가**.
 * - 같은 날 안에서는 동일 사람으로 인식되어 레이트리밋·중복신고 차단 가능.
 */
export function makeAuthorHash(ip: string, ua: string, salt = process.env.FORUM_SALT ?? "promise999"): string {
  const day = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return createHash("sha256")
    .update(`${ip}|${ua}|${day}|${salt}`)
    .digest("hex")
    .slice(0, 32)
}

export function clientFromHeaders(h: Headers): { ip: string; ua: string } {
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "0.0.0.0"
  const ua = h.get("user-agent") ?? "unknown"
  return { ip, ua }
}

// --- 간단 필터 ----------------------------------------------------------
const BANNED_PATTERNS: RegExp[] = [
  /\b(?:fuck|shit|bitch|nigger)\b/i,
  /씨발|병신|좆같|개새끼|꺼져/u,
  // 도배(같은 글자 20+회 반복)
  /(.)\1{19,}/u,
]

export function looksAbusive(s: string): string | null {
  if (!s || !s.trim()) return "내용이 비어있습니다."
  for (const p of BANNED_PATTERNS) {
    if (p.test(s)) return "부적절한 표현이 포함되어 있습니다."
  }
  return null
}

// --- 타입 ----------------------------------------------------------------
export type ForumTargetKind =
  | "election"
  | "sub_election"
  | "candidacy"
  | "pledge"
  | "pledge_item"
  | "global"

export const FORUM_TARGETS: ForumTargetKind[] = [
  "election", "sub_election", "candidacy", "pledge", "pledge_item", "global",
]

export interface ForumThread {
  id: number
  target_kind: ForumTargetKind
  target_id: number | null
  title: string
  body: string
  author_nick: string
  is_hidden: number
  reply_count: number
  upvotes: number
  downvotes: number
  created_at: string
}

export interface ForumReply {
  id: number
  thread_id: number
  parent_id: number | null
  body: string
  author_nick: string
  is_hidden: number
  upvotes: number
  downvotes: number
  created_at: string
}
