"use client"

import { ExternalLink, Share2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CandidateDetail } from "@/lib/candidate-data"

interface ProfileBlockProps {
  candidate: CandidateDetail
}

function StatusBadgeExtended({ 
  status, 
  withdrawDate 
}: { 
  status: CandidateDetail["status"]
  withdrawDate?: string 
}) {
  const statusConfig = {
    running: { 
      label: "출마중", 
      className: "border border-dashed border-foreground bg-transparent" 
    },
    elected: { 
      label: "당선", 
      className: "bg-foreground text-background" 
    },
    defeated: { 
      label: "낙선", 
      className: "border border-foreground bg-transparent" 
    },
    withdrew: { 
      label: "사퇴", 
      className: "border border-foreground bg-transparent line-through" 
    },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <span 
        className={`px-2 py-0.5 text-sm font-sans ${config.className}`}
        aria-label={`후보자 상태: ${config.label}`}
      >
        {config.label}
      </span>
      {status === "withdrew" && withdrawDate && (
        <span className="text-sm text-muted-foreground font-serif">
          사퇴 {withdrawDate}
        </span>
      )}
    </div>
  )
}

export function ProfileBlock({ candidate }: ProfileBlockProps) {
  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: candidate.name, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert("URL이 복사되었습니다.")
    }
  }

  return (
    <section 
      className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-border"
      aria-labelledby="profile-heading"
    >
      {/* Photo placeholder */}
      <div 
        className="w-[100px] h-[120px] border border-foreground bg-secondary flex-shrink-0 flex items-center justify-center"
        aria-label="후보자 사진"
        style={{ filter: "grayscale(100%)" }}
      >
        <span className="text-xs text-muted-foreground font-mono">사진</span>
      </div>

      {/* Info section */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Name */}
        <h1 
          id="profile-heading"
          className="text-3xl font-serif tracking-tight"
        >
          {candidate.name}
        </h1>

        {/* Sub-line: election, position, number */}
        <p className="text-sm text-muted-foreground font-serif leading-relaxed">
          {candidate.electionName} · {candidate.position} · 기호 {candidate.number}번
        </p>

        {/* Party in mono brackets */}
        <p className="font-mono text-sm text-muted-foreground">
          [{candidate.party}]
        </p>

        {/* Status badge */}
        <StatusBadgeExtended 
          status={candidate.status} 
          withdrawDate={candidate.withdrawDate} 
        />

        {/* Meta grid */}
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 mt-2 text-sm">
          <div>
            <dt className="text-muted-foreground font-sans text-xs uppercase tracking-wide">
              생년월일
            </dt>
            <dd className="font-serif mt-0.5">{candidate.birthDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-sans text-xs uppercase tracking-wide">
              학력
            </dt>
            <dd className="font-serif mt-0.5">{candidate.education}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-sans text-xs uppercase tracking-wide">
              직업
            </dt>
            <dd className="font-serif mt-0.5">{candidate.occupation}</dd>
          </div>
        </dl>

        {/* Action row */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none border-foreground text-foreground hover:bg-secondary"
            asChild
          >
            <a 
              href={candidate.pdfUrl || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="공약서 PDF 원본 보기"
            >
              <FileText className="w-4 h-4 mr-1.5" strokeWidth={1} />
              공약서 PDF 원본
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none border-foreground text-foreground hover:bg-secondary"
            asChild
          >
            <a 
              href={candidate.necUrl || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="선관위 원본 링크로 이동"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" strokeWidth={1} />
              선관위 원본 링크
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none border-foreground text-foreground hover:bg-secondary"
            onClick={handleShare}
            aria-label="URL 공유하기"
          >
            <Share2 className="w-4 h-4 mr-1.5" strokeWidth={1} />
            URL 공유
          </Button>
        </div>
      </div>
    </section>
  )
}
