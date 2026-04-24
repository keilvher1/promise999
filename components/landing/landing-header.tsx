import Link from "next/link"

export function LandingHeader() {
  return (
    <header 
      className="border-b border-border"
      role="banner"
    >
      <div className="max-w-[1100px] mx-auto px-6 py-4">
        <nav 
          className="flex items-center justify-between"
          aria-label="주요 내비게이션"
        >
          <Link 
            href="/" 
            className="font-sans text-lg font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
            aria-label="promise999 홈페이지로 이동"
          >
            promise999
          </Link>

          <ul className="flex items-center gap-6">
            <li>
              <Link
                href="/elections"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
              >
                선거 목록
              </Link>
            </li>
            <li>
              <Link
                href="/candidates"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
              >
                후보자 검색
              </Link>
            </li>
            <li>
              <Link
                href="/glossary"
                className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
              >
                용어 사전
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
