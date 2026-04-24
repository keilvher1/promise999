import { Search } from "lucide-react"

interface SiteHeaderProps {
  onSearchChange?: (query: string) => void
  searchQuery?: string
}

export function SiteHeader({ onSearchChange, searchQuery = "" }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-[1100px] mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              선거 공약 아카이브
            </h1>
            <p className="font-serif text-sm text-muted-foreground mt-1 leading-relaxed">
              대한민국 선거 후보자 및 공약 정보
            </p>
          </div>
          
          {onSearchChange && (
            <div className="relative w-full sm:w-72">
              <label htmlFor="search-candidates" className="sr-only">
                후보자 검색
              </label>
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                strokeWidth={1}
                aria-hidden="true"
              />
              <input
                id="search-candidates"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="후보자 이름, 지역, 정당 검색"
                className="w-full pl-10 pr-4 py-2.5 border border-border bg-background text-foreground font-serif text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent rounded-sm"
                aria-label="후보자 검색"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
