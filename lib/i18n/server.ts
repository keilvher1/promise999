/**
 * 서버 컴포넌트 전용 locale 헬퍼.
 * 쿠키 → 기본값 순으로 현재 locale을 결정한다.
 */
import { cookies, headers } from "next/headers"
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config"
import { getDictionary } from "./dictionaries"

/**
 * 우선순위:
 *   1. 쿠키 promise999_locale
 *   2. Accept-Language 헤더 첫 언어
 *   3. defaultLocale
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value
  if (fromCookie && isLocale(fromCookie)) return fromCookie

  const hdrs = await headers()
  const accept = hdrs.get("accept-language") ?? ""
  // "en-US,en;q=0.9,ko;q=0.8" → ["en-US", "en", "ko"]
  const first = accept.split(",")[0]?.split("-")[0]?.toLowerCase()
  if (first && isLocale(first)) return first

  return defaultLocale
}

export async function getLocaleAndDict() {
  const locale = await getLocale()
  return { locale, dict: getDictionary(locale) }
}
