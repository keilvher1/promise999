'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  label: string
}

const TOC_ITEMS: TOCItem[] = [
  { id: 'definition', label: '정의' },
  { id: 'background', label: '배경' },
  { id: 'related-pledges', label: '관련 공약' },
  { id: 'related-terms', label: '관련 용어' },
]

export function TableOfContents() {
  const [activeId, setActiveId] = useState<string>('definition')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0,
      }
    )

    TOC_ITEMS.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.focus({ preventScroll: true })
    }
  }

  return (
    <nav
      className="sticky top-8 w-32"
      aria-label="목차"
    >
      <div className="border-l border-border pl-3">
        <div className="mb-2">
          <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            목차
          </span>
        </div>
        <ul className="space-y-1">
          {TOC_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                className={`
                  block w-full text-left font-sans text-xs
                  transition-colors
                  hover:text-foreground
                  focus:outline-none focus:underline
                  ${activeId === id 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
                  }
                `}
                aria-current={activeId === id ? 'true' : undefined}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
