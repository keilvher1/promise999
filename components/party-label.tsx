interface PartyLabelProps {
  party: string
  size?: "sm" | "md"
}

export function PartyLabel({ party, size = "md" }: PartyLabelProps) {
  const sizeClasses = size === "sm" 
    ? "text-[10px] px-1.5 py-0.5" 
    : "text-xs px-2 py-1"
  
  return (
    <span 
      className={`
        font-mono ${sizeClasses} 
        border border-border 
        text-muted-foreground 
        bg-transparent
        whitespace-nowrap
        tracking-tight
      `}
      aria-label={`소속 정당: ${party}`}
    >
      {party}
    </span>
  )
}
