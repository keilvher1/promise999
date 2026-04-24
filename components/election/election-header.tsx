"use client"

import { useState } from "react"
import type { Election } from "@/lib/election-data"

interface ElectionHeaderProps {
  election: Election
}

export function ElectionHeader({ election }: ElectionHeaderProps) {
  const [view, setView] = useState<"national" | "local">("national")

  return (
    <header className="border-b border-gray-300 pb-6 mb-8">
      <h1 className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-black mb-3">
        {election.title}
      </h1>

      <p className="font-serif text-gray-500 text-sm md:text-base leading-relaxed mb-4">
        투표일 {election.date} · 선거인 {election.voterCount} · 후보자 {election.candidateCount}
      </p>

      {/* View toggle */}
      <div
        className="inline-flex border border-black"
        role="tablist"
        aria-label="지역 범위 선택"
      >
        <button
          role="tab"
          aria-selected={view === "national"}
          onClick={() => setView("national")}
          className={`
            px-4 py-1.5 text-sm font-sans transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1
            ${view === "national" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}
          `}
        >
          전국
        </button>
        <button
          role="tab"
          aria-selected={view === "local"}
          onClick={() => setView("local")}
          className={`
            px-4 py-1.5 text-sm font-sans border-l border-black transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-1
            ${view === "local" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}
          `}
        >
          내 지역
        </button>
      </div>
    </header>
  )
}
