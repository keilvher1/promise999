/**
 * 번역 사전 로더.
 *
 * Phase 1에서는 JSON 파일을 직접 import한다 (Next.js 번들에 정적 포함).
 * Phase 2에서 공약 번역이 들어오면 서버 쪽에서 동적으로 확장된다.
 */
import type { Locale } from "./config"
import ko from "./dictionaries/ko.json"
import en from "./dictionaries/en.json"
import ja from "./dictionaries/ja.json"
import zh from "./dictionaries/zh.json"

export type Dictionary = typeof ko

const dictionaries: Record<Locale, Dictionary> = {
  ko,
  en: en as Dictionary,
  ja: ja as Dictionary,
  zh: zh as Dictionary,
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.ko
}

/**
 * 점(.) 경로로 중첩 키를 읽는다. 예: t("landing.hero_title_1")
 * 간단한 `{{name}}` 치환 지원.
 */
export function translate(
  dict: Dictionary,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split(".")
  let cur: any = dict
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p]
    } else {
      // 키 누락 시 키 자체를 반환 — 개발 중 누락 발견 쉬움
      return key
    }
  }
  if (typeof cur !== "string") return key
  if (!vars) return cur
  return cur.replace(/{{\s*(\w+)\s*}}/g, (_, v) => String(vars[v] ?? `{{${v}}}`))
}
