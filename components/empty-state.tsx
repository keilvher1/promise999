import { Search } from "lucide-react"

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ 
  message = "검색 결과가 없습니다. 다른 조건으로 검색해 보세요." 
}: EmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      role="status"
      aria-label="검색 결과 없음"
    >
      <div className="w-12 h-12 border border-border flex items-center justify-center mb-4 rounded-sm">
        <Search className="w-6 h-6 text-muted-foreground" strokeWidth={1} aria-hidden="true" />
      </div>
      <p className="font-serif text-sm text-muted-foreground leading-relaxed max-w-sm">
        {message}
      </p>
    </div>
  )
}
