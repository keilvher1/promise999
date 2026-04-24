"use client"

import { useEffect, useRef } from "react"
import { X, ExternalLink } from "lucide-react"
import type { Candidate } from "./candidate-card"
import { StatusBadge } from "./status-badge"
import { PartyLabel } from "./party-label"

interface CandidateModalProps {
  candidate: Candidate | null
  onClose: () => void
}

export function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (candidate) {
      closeButtonRef.current?.focus()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [candidate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (candidate) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [candidate, onClose])

  if (!candidate) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm"
      >
        <header className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={candidate.status} />
            <div>
              <h2 
                id="modal-title"
                className="font-sans text-xl font-semibold tracking-tight text-foreground"
              >
                {candidate.name}
              </h2>
              <p className="font-serif text-sm text-muted-foreground">
                {candidate.region}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PartyLabel party={candidate.party} />
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              aria-label="닫기"
            >
              <X className="w-5 h-5" strokeWidth={1} />
            </button>
          </div>
        </header>

        <div className="px-6 py-6 space-y-8">
          {/* Basic Info */}
          <section aria-labelledby="info-section">
            <h3 
              id="info-section"
              className="font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4"
            >
              기본 정보
            </h3>
            <dl className="grid grid-cols-2 gap-4 font-serif text-sm">
              <div>
                <dt className="text-muted-foreground">출생연도</dt>
                <dd className="text-foreground mt-1">{candidate.birthYear}년</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">직업</dt>
                <dd className="text-foreground mt-1">{candidate.occupation}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">소속 정당</dt>
                <dd className="text-foreground mt-1">{candidate.party}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">선거구</dt>
                <dd className="text-foreground mt-1">{candidate.region}</dd>
              </div>
            </dl>
          </section>

          {/* Pledges */}
          <section aria-labelledby="pledges-section">
            <h3 
              id="pledges-section"
              className="font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4"
            >
              공약 전문
            </h3>
            <ol className="space-y-4 font-serif text-sm leading-relaxed">
              {candidate.pledges.map((pledge, index) => (
                <li 
                  key={index}
                  className="flex gap-3 text-foreground"
                >
                  <span className="font-mono text-xs text-muted-foreground mt-0.5 flex-shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{pledge}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Source */}
          <section 
            className="pt-6 border-t border-border"
            aria-labelledby="source-section"
          >
            <h3 
              id="source-section"
              className="font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3"
            >
              출처
            </h3>
            <p className="font-serif text-sm text-muted-foreground leading-relaxed mb-3">
              본 공약 정보는 중앙선거관리위원회 정책·공약마당에서 제공하는 원문을 기반으로 합니다.
            </p>
            <a
              href="https://policy.nec.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-foreground hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              aria-label="중앙선거관리위원회 정책·공약마당 바로가기 (새 창에서 열림)"
            >
              원문 확인하기
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1} aria-hidden="true" />
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
