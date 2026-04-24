import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { CHOSUNG_INDEX, getAllTermsGroupedByChosung } from '@/lib/glossary-data'

export const metadata = {
  title: '용어 사전 — promise999',
  description: '선거 및 지방자치 관련 용어를 중립적으로 설명합니다.',
}

export default function TermsIndexPage() {
  const groupedTerms = getAllTermsGroupedByChosung()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-foreground"
          >
            promise999
          </Link>
          <nav className="flex items-center gap-6" aria-label="주요 메뉴">
            <Link
              href="/elections"
              className="font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              선거 목록
            </Link>
            <Link
              href="/terms"
              className="font-sans text-sm text-foreground"
              aria-current="page"
            >
              용어 사전
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Page header */}
        <header className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-muted-foreground" strokeWidth={1} aria-hidden="true" />
            <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground">
              용어 사전
            </h1>
          </div>
          <p className="max-w-xl font-serif text-base leading-relaxed text-muted-foreground">
            선거, 지방자치, 재정 관련 용어를 중립적인 관점에서 설명합니다.
            모든 정의와 설명은 평가적 표현을 배제하고 사실에 기반합니다.
          </p>
        </header>

        {/* Chosung navigation */}
        <nav className="mb-12" aria-label="초성 바로가기">
          <ul className="flex flex-wrap gap-1 border border-border p-2">
            {CHOSUNG_INDEX.map((chosung) => {
              const hasTerms = groupedTerms[chosung]?.length > 0
              return (
                <li key={chosung}>
                  {hasTerms ? (
                    <a
                      href={`#${chosung}`}
                      className="
                        inline-flex h-9 w-9 items-center justify-center
                        font-mono text-sm
                        transition-colors
                        hover:bg-secondary
                        focus:outline-none focus:ring-1 focus:ring-ring
                      "
                    >
                      {chosung}
                    </a>
                  ) : (
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center font-mono text-sm text-muted-foreground/40"
                      aria-disabled="true"
                    >
                      {chosung}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Terms list grouped by chosung */}
        <div className="space-y-12">
          {CHOSUNG_INDEX.map((chosung) => {
            const terms = groupedTerms[chosung]
            if (!terms || terms.length === 0) return null

            return (
              <section key={chosung} id={chosung} aria-labelledby={`heading-${chosung}`}>
                <h2
                  id={`heading-${chosung}`}
                  className="mb-4 border-b border-border pb-2 font-mono text-2xl font-medium text-foreground"
                >
                  {chosung}
                </h2>
                <ul className="divide-y divide-border">
                  {terms.map((term) => (
                    <li key={term.slug}>
                      <Link
                        href={`/terms/${term.slug}`}
                        className="
                          group flex items-start gap-4 py-4
                          transition-colors
                          hover:bg-secondary/50
                          focus:outline-none focus:ring-1 focus:ring-ring focus:ring-inset
                        "
                      >
                        <span className="font-sans text-lg font-medium text-foreground">
                          {term.term}
                        </span>
                        <span className="flex-1 pt-1 font-serif text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {term.definition}
                        </span>
                        <ArrowRight
                          className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                          strokeWidth={1}
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <p className="font-serif text-xs leading-relaxed text-muted-foreground">
            모든 공약 원문은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 기준입니다.
          </p>
          <p className="mt-2 font-sans text-xs text-muted-foreground">
            이 사이트는 정치적 중립을 지향하며, 어떤 정당이나 후보를 지지하거나 반대하지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
