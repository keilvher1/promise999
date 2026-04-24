"use client"

import { useRouter, usePathname } from "next/navigation"
import { locales, localeNames, type Locale } from "@/lib/i18n/config"
import { Globe } from "lucide-react"

interface Props {
  /** 현재 라우트의 locale 세그먼트 */
  current: Locale
  /** aria-label — 사전에서 주입 */
  ariaLabel: string
}

export function LanguageSwitcher({ current, ariaLabel }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(next: Locale) {
    if (next === current) return

    // 현재 경로가 /ko/..., /en/... 형태면 첫 세그먼트 교체
    const parts = pathname.split("/")
    if (parts[1] && (locales as readonly string[]).includes(parts[1])) {
      parts[1] = next
    } else {
      parts.splice(1, 0, next)
    }
    const nextPath = parts.join("/") || "/"

    // 쿠키에도 저장 (middleware가 사용)
    document.cookie = `promise999_locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`
    router.push(nextPath)
  }

  return (
    <div className="inline-flex items-center gap-1.5 border border-border px-2 py-1">
      <Globe className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1} aria-hidden />
      <label className="sr-only" htmlFor="language-switcher">
        {ariaLabel}
      </label>
      <select
        id="language-switcher"
        aria-label={ariaLabel}
        value={current}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="bg-transparent text-xs font-mono outline-none cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  )
}
