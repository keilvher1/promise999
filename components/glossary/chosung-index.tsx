'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CHOSUNG_INDEX, getAllTermsGroupedByChosung } from '@/lib/glossary-data'

export function ChosungIndex() {
  const params = useParams()
  const currentSlug = params.slug as string
  const groupedTerms = getAllTermsGroupedByChosung()

  return (
    <nav
      className="sticky top-8 w-16"
      aria-label="가나다 색인"
    >
      <div className="border border-border">
        <div className="border-b border-border px-2 py-2">
          <span className="font-sans text-xs tracking-tight text-muted-foreground">
            색인
          </span>
        </div>
        <ul className="divide-y divide-border">
          {CHOSUNG_INDEX.map((chosung) => {
            const hasTerms = groupedTerms[chosung]?.length > 0
            const isActive = groupedTerms[chosung]?.some(t => t.slug === currentSlug)

            return (
              <li key={chosung}>
                {hasTerms ? (
                  <Link
                    href={`/terms/${groupedTerms[chosung][0].slug}`}
                    className={`
                      block px-3 py-2 text-center font-mono text-sm
                      transition-colors
                      hover:bg-secondary
                      focus:outline-none focus:ring-1 focus:ring-ring focus:ring-inset
                      ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {chosung}
                  </Link>
                ) : (
                  <span
                    className="block px-3 py-2 text-center font-mono text-sm text-muted-foreground/50"
                    aria-disabled="true"
                  >
                    {chosung}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Terms in current chosung */}
      {currentSlug && (
        <div className="mt-4 border border-border">
          <div className="border-b border-border px-2 py-2">
            <span className="font-sans text-xs tracking-tight text-muted-foreground">
              같은 초성
            </span>
          </div>
          <ul className="divide-y divide-border">
            {Object.entries(groupedTerms).map(([chosung, terms]) =>
              terms
                .filter(t => t.slug === currentSlug || t.chosung === terms.find(tt => tt.slug === currentSlug)?.chosung)
                .map(term => (
                  <li key={term.slug}>
                    <Link
                      href={`/terms/${term.slug}`}
                      className={`
                        block px-2 py-1.5 font-serif text-xs leading-relaxed
                        transition-colors
                        hover:bg-secondary
                        focus:outline-none focus:ring-1 focus:ring-ring focus:ring-inset
                        ${term.slug === currentSlug ? 'bg-secondary font-medium' : ''}
                      `}
                    >
                      {term.term}
                    </Link>
                  </li>
                ))
            )}
          </ul>
        </div>
      )}
    </nav>
  )
}
