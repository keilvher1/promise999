"use client"

import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CandidateDetail } from "@/lib/candidate-data"

interface PdfTabProps {
  candidate: CandidateDetail
}

export function PdfTab({ candidate }: PdfTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-none border-foreground text-foreground hover:bg-secondary"
          asChild
        >
          <a 
            href={candidate.pdfUrl || "#"} 
            download
            aria-label="공보 PDF 원본 다운로드"
          >
            <Download className="w-4 h-4 mr-1.5" strokeWidth={1} />
            원본 다운로드
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
            aria-label="선관위에서 보기"
          >
            <ExternalLink className="w-4 h-4 mr-1.5" strokeWidth={1} />
            선관위에서 보기
          </a>
        </Button>
      </div>

      {/* PDF viewer placeholder */}
      <div 
        className="border border-border bg-secondary aspect-[3/4] max-h-[800px] flex items-center justify-center"
        role="document"
        aria-label="공보 PDF 뷰어"
      >
        {candidate.pdfUrl ? (
          <iframe
            src={candidate.pdfUrl}
            title={`${candidate.name} 공보 PDF`}
            className="w-full h-full"
            style={{ filter: "grayscale(100%)" }}
          />
        ) : (
          <div className="text-center p-8">
            <p className="font-mono text-sm text-muted-foreground mb-2">
              PDF 뷰어
            </p>
            <p className="font-serif text-sm text-muted-foreground">
              공보 PDF가 로드되면 이곳에 표시됩니다.
            </p>
          </div>
        )}
      </div>

      {/* Note */}
      <p className="text-xs font-serif text-muted-foreground">
        공보 원본은 중앙선거관리위원회에서 제공하는 자료입니다.
      </p>
    </div>
  )
}
