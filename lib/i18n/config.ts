/**
 * 국제화 설정.
 * 공약 원문 번역은 Phase 2에서 추가될 예정(see docs/i18n.md).
 */

export const locales = ["ko", "en", "ja", "zh"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "ko"

export const localeNames: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "简体中文",
}

/** `<html lang>`에 들어갈 BCP-47 코드 */
export const localeHtmlLang: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
}

/** 날짜·숫자 포맷에 쓰이는 Intl locale */
export const localeIntl: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
  zh: "zh-CN",
}

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v)
}

export function resolveLocale(v: string | undefined | null): Locale {
  if (v && isLocale(v)) return v
  return defaultLocale
}

/** 쿠키에 저장할 사용자 선호 언어 키 */
export const LOCALE_COOKIE = "promise999_locale"
