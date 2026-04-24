"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"

export function LandingHeader() {
  const { locale, t } = useI18n()

  return (
    <header className="border-b border-border" role="banner">
      <div className="max-w-[1100px] mx-auto px-6 py-4">
        <nav
          className="flex items-center justify-between gap-4"
          aria-label={t("nav.home")}
        >
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
            aria-label={`${t("meta.site_name")} — ${t("nav.home")}`}
          >
            {t("meta.site_name")}
          </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden md:flex items-center gap-6">
              <li>
                <Link
                  href="/elections"
                  className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.elections")}
                </Link>
              </li>
              <li>
                <Link
                  href="/candidates"
                  className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.candidates")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("nav.terms")}
                </Link>
              </li>
            </ul>

            <LanguageSwitcher
              current={locale}
              ariaLabel={t("language_switcher.aria_label")}
            />
          </div>
        </nav>
      </div>
    </header>
  )
}
