import { ExternalLink } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary mt-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="font-serif text-sm text-muted-foreground leading-relaxed max-w-xl">
              모든 공약 원문은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 기준입니다.
            </p>
            <a
              href="https://policy.nec.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-foreground hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              aria-label="중앙선거관리위원회 정책·공약마당 바로가기 (새 창에서 열림)"
            >
              공약마당 바로가기
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1} aria-hidden="true" />
            </a>
          </div>
          
          <hr className="border-border" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground font-serif">
            <p>
              본 사이트는 정치적 중립을 유지하며, 특정 후보자나 정당을 지지하거나 반대하지 않습니다.
            </p>
            <p>
              © {new Date().getFullYear()} 선거 공약 아카이브
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
