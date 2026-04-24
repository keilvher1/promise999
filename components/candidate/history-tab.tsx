"use client"

import type { CandidateDetail, CandidacyHistory, PledgeChange } from "@/lib/candidate-data"

interface HistoryTabProps {
  candidate: CandidateDetail
}

function ResultBadge({ result }: { result: CandidacyHistory["result"] }) {
  const config = {
    elected: { label: "당선", className: "bg-foreground text-background" },
    defeated: { label: "낙선", className: "border border-foreground bg-transparent" },
    withdrew: { label: "사퇴", className: "border border-foreground bg-transparent" },
  }
  const { label, className } = config[result]

  return (
    <span className={`px-2 py-0.5 text-xs font-sans ${className}`}>
      {label}
    </span>
  )
}

function PledgeChangeCard({ change }: { change: PledgeChange }) {
  return (
    <div className="ml-4 border-l-2 border-dashed border-border pl-6 py-4 my-2 bg-secondary/50">
      <h4 className="font-sans font-medium text-sm tracking-tight mb-3">
        공약 변화
      </h4>
      
      {change.continued.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-1">
            유지
          </h5>
          <ul className="space-y-1">
            {change.continued.map((item, idx) => (
              <li key={idx} className="text-sm font-serif text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {change.changed.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-1">
            변경
          </h5>
          <ul className="space-y-2">
            {change.changed.map((item, idx) => (
              <li key={idx} className="text-sm font-serif">
                <span className="text-muted-foreground">{item.before}</span>
                <span className="mx-2 font-mono text-xs">→</span>
                <span className="text-foreground">{item.after}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {change.dropped.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-1">
            제외
          </h5>
          <ul className="space-y-1">
            {change.dropped.map((item, idx) => (
              <li key={idx} className="text-sm font-serif text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {change.added.length > 0 && (
        <div>
          <h5 className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-1">
            추가
          </h5>
          <ul className="space-y-1">
            {change.added.map((item, idx) => (
              <li key={idx} className="text-sm font-serif text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function TimelineEvent({ 
  event, 
  isLast 
}: { 
  event: CandidacyHistory
  isLast: boolean 
}) {
  return (
    <div className="relative pl-8">
      {/* Timeline dot */}
      <div 
        className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
          event.result === "elected" 
            ? "bg-foreground" 
            : "border border-foreground bg-transparent"
        }`}
        aria-hidden="true"
      />
      {/* Timeline line */}
      {!isLast && (
        <div 
          className="absolute left-[5px] top-4 bottom-0 w-[1px] bg-border"
          aria-hidden="true"
        />
      )}
      
      {/* Event content */}
      <div className="pb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className="font-mono text-lg font-medium">{event.year}</span>
          <span className="font-serif text-sm text-muted-foreground">
            {event.electionName}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono text-muted-foreground">
            [{event.party}]
          </span>
          <span className="font-serif">{event.district}</span>
          <ResultBadge result={event.result} />
        </div>
      </div>
    </div>
  )
}

export function HistoryTab({ candidate }: HistoryTabProps) {
  const sortedHistory = [...candidate.history].sort((a, b) => a.year - b.year)

  return (
    <div className="flex flex-col gap-6">
      {/* Intro text */}
      <p className="text-sm font-serif text-muted-foreground leading-relaxed">
        {candidate.name} 후보자의 역대 출마 이력과 공약의 변화를 확인할 수 있습니다.
      </p>

      {/* Timeline */}
      <div 
        className="relative"
        role="list"
        aria-label="출마 이력 타임라인"
      >
        {sortedHistory.map((event, index) => {
          const isLast = index === sortedHistory.length - 1
          const prevEvent = sortedHistory[index - 1]
          const changeKey = prevEvent ? `${prevEvent.id}-${event.id}` : null
          const pledgeChange = changeKey ? candidate.pledgeChanges[changeKey] : null

          return (
            <div key={event.id} role="listitem">
              {/* Show pledge change card between events */}
              {pledgeChange && <PledgeChangeCard change={pledgeChange} />}
              <TimelineEvent event={event} isLast={isLast} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
