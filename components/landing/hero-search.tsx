"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp, Flame } from "lucide-react"
import { Input } from "@/components/ui/input"

type SuggestItem = {
  type: "candidate" | "party" | "election"
  label: string
  sub: string
  href: string
}

type TrendingItem = { norm: string; label: string; hits: number }

interface Props {
  placeholder: string
  ariaLabel: string
  trendingTitle: string
  searchButton: string
}

export function HeroSearch({ placeholder, ariaLabel, trendingTitle, searchButton }: Props) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [items, setItems] = useState<SuggestItem[]>([])
  const [trending, setTrending] = useState<TrendingItem[]>([])
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number | null>(null)

  // trending 1회 로딩
  useEffect(() => {
    let cancel = false
    fetch("/api/search/trending?window=7d&limit=8", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!cancel) setTrending(d.items ?? [])
      })
      .catch(() => {})
    return () => { cancel = true }
  }, [])

  // q 변화 → 디바운스 후 suggest fetch
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    const trimmed = q.trim()
    if (trimmed.length === 0) {
      setItems([])
      return
    }
    setLoading(true)
    debounceRef.current = window.setTimeout(() => {
      fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}&limit=8`, { cache: "no-store" })
        .then(r => r.json())
        .then(d => setItems(d.items ?? []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    }, 180)
  }, [q])

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  function submit(query: string) {
    const v = query.trim()
    if (!v) return
    router.push(`/candidates?q=${encodeURIComponent(v)}`)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const totalRows = items.length || (q.trim() === "" ? trending.length : 0)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight(h => Math.min(h + 1, totalRows - 1))
      setOpen(true)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight(h => Math.max(h - 1, -1))
    } else if (e.key === "Enter") {
      if (highlight >= 0) {
        if (items.length > 0 && highlight < items.length) {
          e.preventDefault()
          router.push(items[highlight].href)
          return
        }
        if (items.length === 0 && q.trim() === "" && highlight < trending.length) {
          e.preventDefault()
          submit(trending[highlight].label)
          return
        }
      }
      e.preventDefault()
      submit(q)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const showSuggest = open && q.trim().length > 0
  const showTrending = open && q.trim().length === 0 && trending.length > 0

  return (
    <div ref={wrapRef} className="relative">
      <form
        action="/candidates"
        method="GET"
        role="search"
        onSubmit={e => {
          if (q.trim()) {
            // /candidates?q=…로 이미 라우팅 되지만 client navigation 사용
            e.preventDefault()
            submit(q)
          }
        }}
        className="relative group"
      >
        <label htmlFor="hero-search" className="sr-only">{ariaLabel}</label>
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-foreground"
          strokeWidth={1}
          aria-hidden="true"
        />
        <Input
          id="hero-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); setHighlight(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          enterKeyHint="search"
          aria-label={ariaLabel}
          aria-expanded={showSuggest || showTrending}
          aria-controls="hero-search-listbox"
          className="pl-12 pr-4 py-6 text-base bg-secondary border border-border rounded-sm focus:ring-1 focus:ring-foreground focus:border-foreground transition-all duration-300 hover:border-foreground/50"
        />
        <button type="submit" className="sr-only">{searchButton}</button>
      </form>

      {(showSuggest || showTrending) && (
        <div
          id="hero-search-listbox"
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 border border-border bg-background shadow-md max-h-[420px] overflow-auto"
        >
          {showSuggest && (
            <>
              {loading && items.length === 0 && (
                <div className="px-4 py-3 text-xs text-muted-foreground font-mono">검색 중…</div>
              )}
              {!loading && items.length === 0 && (
                <div className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  결과 없음 · Enter로 전체 검색
                </div>
              )}
              {items.map((it, i) => (
                <button
                  key={`${it.type}-${it.href}`}
                  role="option"
                  aria-selected={highlight === i}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => { router.push(it.href); setOpen(false) }}
                  className={
                    "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors " +
                    (highlight === i ? "bg-muted" : "hover:bg-muted/50")
                  }
                >
                  <span className="text-[10px] font-mono uppercase text-muted-foreground border border-border px-1.5 py-0.5 shrink-0">
                    {it.type === "candidate" ? "후보" : it.type === "party" ? "정당" : "선거"}
                  </span>
                  <span className="font-sans text-sm text-foreground flex-1 line-clamp-1">{it.label}</span>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 line-clamp-1">{it.sub}</span>
                </button>
              ))}
            </>
          )}

          {showTrending && (
            <>
              <div className="px-4 py-2 flex items-center gap-1.5 border-b border-border">
                <Flame className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                <span className="text-xs font-mono text-muted-foreground">{trendingTitle}</span>
              </div>
              {trending.map((t, i) => (
                <button
                  key={t.norm}
                  role="option"
                  aria-selected={highlight === i}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => submit(t.label)}
                  className={
                    "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors " +
                    (highlight === i ? "bg-muted" : "hover:bg-muted/50")
                  }
                >
                  <span className="text-xs font-mono text-muted-foreground w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-sm flex-1 line-clamp-1">{t.label}</span>
                  <TrendingUp className="w-3 h-3 text-muted-foreground shrink-0" strokeWidth={1.5} aria-hidden />
                  <span className="font-mono text-xs text-muted-foreground shrink-0">{t.hits}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
