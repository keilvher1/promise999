import type { CandidateStatus } from "./candidate-card"

interface StatusBadgeProps {
  status: CandidateStatus
  size?: "sm" | "md"
}

const statusLabels: Record<CandidateStatus, string> = {
  elected: "당선",
  defeated: "낙선",
  undecided: "미정",
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "w-3 h-3" : "w-4 h-4"
  
  return (
    <div 
      className="flex items-center gap-2"
      role="status"
      aria-label={`당선 상태: ${statusLabels[status]}`}
    >
      <span
        className={`${sizeClasses} rounded-full flex-shrink-0 ${
          status === "elected"
            ? "bg-foreground" // Filled black circle
            : status === "defeated"
            ? "border border-foreground bg-transparent" // Outlined circle
            : "border border-dashed border-foreground bg-transparent" // Dashed outline
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">{statusLabels[status]}</span>
    </div>
  )
}

export function StatusLegend() {
  return (
    <div 
      className="flex flex-wrap items-center gap-6 text-sm font-serif text-muted-foreground"
      role="group"
      aria-label="범례"
    >
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-foreground" aria-hidden="true" />
        <span>당선</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full border border-foreground bg-transparent" aria-hidden="true" />
        <span>낙선</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full border border-dashed border-foreground bg-transparent" aria-hidden="true" />
        <span>미정</span>
      </div>
    </div>
  )
}
