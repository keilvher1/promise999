"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"

export function LandingFooter() {
  const { t } = useI18n()

  const links = [
    { label: t("footer.about"), href: "/about" },
    { label: t("footer.sources"), href: "/sources" },
    { label: "FAQ", href: "/faq" },
    { label: "API", href: "/api-docs" },
    { label: t("footer.contact"), href: "/contact" },
    { label: t("footer.report") || "정정요청", href: "/contact-us" },
  ]

  return (
    <footer
      className="border-t border-border py-12 md:py-16"
      role="contentinfo"
      aria-label={t("meta.site_name")}
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <nav className="mb-8" aria-label="footer">
          <ul className="flex flex-wrap justify-center gap-6 md:gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-center space-y-3">
          <p className="font-serif text-sm leading-relaxed text-muted-foreground">
            {t("common.footer_source")}
          </p>
          <p className="font-serif text-sm leading-relaxed text-muted-foreground">
            {t("common.footer_disclaimer")}
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="font-sans text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t("meta.site_name")}
          </p>
        </div>
      </div>
    </footer>
  )
}
