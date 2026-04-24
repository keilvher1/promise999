import Link from "next/link"

const footerLinks = [
  { label: "소개", href: "/about" },
  { label: "데이터 출처", href: "/sources" },
  { label: "FAQ", href: "/faq" },
  { label: "API", href: "/api-docs" },
  { label: "개발 문의", href: "/contact" },
]

export function LandingFooter() {
  return (
    <footer 
      className="border-t border-border py-12 md:py-16"
      role="contentinfo"
      aria-label="사이트 정보"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Navigation links */}
        <nav 
          className="mb-8"
          aria-label="푸터 내비게이션"
        >
          <ul className="flex flex-wrap justify-center gap-6 md:gap-8">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Disclaimers */}
        <div className="text-center space-y-3">
          <p className="font-serif text-sm leading-relaxed text-muted-foreground">
            모든 공약 원문은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 기준입니다.
          </p>
          <p className="font-serif text-sm leading-relaxed text-muted-foreground">
            이 서비스는 특정 정당·후보를 지지하거나 반대하지 않습니다.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="font-sans text-xs text-muted-foreground">
            © {new Date().getFullYear()} promise999
          </p>
        </div>
      </div>
    </footer>
  )
}
