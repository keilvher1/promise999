"use client"

import { ChevronRight } from "lucide-react"
import { PartyLabel } from "./party-label"
import { StatusBadge } from "./status-badge"

export type CandidateStatus = "elected" | "defeated" | "undecided"

export interface Candidate {
  id: string
  name: string
  party: string
  region: string
  status: CandidateStatus
  birthYear: number
  occupation: string
  pledges: string[]
}

interface CandidateCardProps {
  candidate: Candidate
  onSelect?: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSelect?.(candidate)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(candidate)}
      onKeyDown={handleKeyDown}
      aria-label={`${candidate.name} 후보자 정보 보기`}
      className="group border border-border bg-card p-6 transition-all hover:border-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer rounded-sm"
    >
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={candidate.status} />
          <div>
            <h3 className="font-sans text-xl font-semibold tracking-tight text-foreground">
              {candidate.name}
            </h3>
            <p className="font-serif text-sm text-muted-foreground leading-relaxed">
              {candidate.region}
            </p>
          </div>
        </div>
        <PartyLabel party={candidate.party} />
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 font-serif text-sm">
        <div>
          <dt className="text-muted-foreground">출생연도</dt>
          <dd className="text-foreground">{candidate.birthYear}년</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">직업</dt>
          <dd className="text-foreground">{candidate.occupation}</dd>
        </div>
      </dl>

      <section aria-labelledby={`pledges-${candidate.id}`}>
        <h4 
          id={`pledges-${candidate.id}`} 
          className="font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2"
        >
          주요 공약
        </h4>
        <ul className="space-y-1">
          {candidate.pledges.slice(0, 3).map((pledge, index) => (
            <li 
              key={index}
              className="font-serif text-sm text-foreground leading-relaxed pl-3 relative before:content-['—'] before:absolute before:left-0 before:text-muted-foreground"
            >
              {pledge}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-4 pt-4 border-t border-border flex items-center justify-end">
        <span className="font-sans text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
          상세 정보 보기
          <ChevronRight className="w-4 h-4" strokeWidth={1} aria-hidden="true" />
        </span>
      </footer>
    </article>
  )
}
