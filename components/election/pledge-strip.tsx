"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { pledgeHighlights } from "@/lib/election-data"

export function PledgeStrip() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="mt-12 mb-8" aria-label="공약 한줄 스캔">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sans font-semibold text-lg tracking-tight text-black">
          공약 한줄 스캔
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 border border-gray-300 hover:border-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="이전 공약 보기"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 border border-gray-300 hover:border-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="다음 공약 보기"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        role="list"
        aria-label="주요 공약 목록"
      >
        {pledgeHighlights.map((pledge) => (
          <article
            key={pledge.id}
            className="flex-shrink-0 w-64 border border-gray-300 bg-transparent p-4 hover:border-black transition-colors"
            role="listitem"
          >
            <p className="font-serif text-sm text-black leading-relaxed line-clamp-2 mb-3">
              {pledge.text}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs text-gray-600">
                {pledge.candidate}
              </span>
              <span className="font-mono text-[10px] text-gray-400">
                [{pledge.party}]
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
