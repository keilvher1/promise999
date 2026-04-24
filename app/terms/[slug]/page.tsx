import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { getTermBySlug, glossaryTerms } from '@/lib/glossary-data'
import { ChosungIndex } from '@/components/glossary/chosung-index'
import { TableOfContents } from '@/components/glossary/table-of-contents'
import { TermArticle } from '@/components/glossary/term-article'

export async function generateStaticParams() {
  return glossaryTerms.map((term) => ({
    slug: term.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const term = getTermBySlug(slug)

  if (!term) {
    return {
      title: '용어를 찾을 수 없습니다 — promise999',
    }
  }

  return {
    title: `${term.term} — 용어 사전 — promise999`,
    description: term.definition,
  }
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const term = getTermBySlug(slug)

  if (!term) {
    notFound()
  }

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

      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <nav aria-label="경로" className="flex items-center gap-2">
            <Link
              href="/terms"
              className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" strokeWidth={1} aria-hidden="true" />
              용어 사전
            </Link>
            <span className="text-border">/</span>
            <span className="font-sans text-xs text-foreground">
              {term.term}
            </span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex gap-12">
          {/* Left rail - Chosung index */}
          <aside className="hidden lg:block">
            <ChosungIndex />
          </aside>

          {/* Center - Article */}
          <div className="min-w-0 flex-1">
            <TermArticle term={term} />
          </div>

          {/* Right rail - TOC */}
          <aside className="hidden xl:block">
            <TableOfContents />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-8">
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
