"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { locales, localeNames, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config"
import { Globe } from "lucide-react"

interface Props {
  /** 현재 라우트의 locale 세그먼트 */
  current: Locale
  /** aria-label — 사전에서 주입 */
  ariaLabel: string
}

export function LanguageSwitcher({ current, ariaLabel }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(next: Locale) {
    if (next === current) return

    // 쿠키 기반 locale routing — Path는 그대로 두고 쿠키만 갱신 후 새로고침.
    // (app router에 [locale] 세그먼트가 없으므로 path-prefix 이동은 404가 난다.)
    document.cookie =
      `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`

    startTransition(() => {
      // RSC를 다시 렌더해 cookies()에서 새 locale 읽기
      router.refresh()
    })
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
        disabled={isPending}
        className="bg-transparent text-xs font-mono outline-none cursor-pointer disabled:opacity-50"
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
