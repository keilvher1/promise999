"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { ComparableCandidate } from "@/lib/compare-data"
import { allCandidates } from "@/lib/compare-data"

interface CandidateSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (candidate: ComparableCandidate) => void
  excludeIds: string[]
}

export function CandidateSearchModal({
  open,
  onOpenChange,
  onSelect,
  excludeIds,
}: CandidateSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCandidates = useMemo(() => {
    return allCandidates
      .filter(c => !excludeIds.includes(c.id))
      .filter(c => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(query) ||
          c.party.toLowerCase().includes(query) ||
          c.position.toLowerCase().includes(query)
        )
      })
  }, [searchQuery, excludeIds])

  const handleSelect = (candidate: ComparableCandidate) => {
    onSelect(candidate)
    setSearchQuery("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none border-[#D4D4D4]">
        <DialogHeader>
          <DialogTitle className="font-sans tracking-tight text-[#000000]">
            후보자 검색
          </DialogTitle>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" strokeWidth={1} />
          <Input
            placeholder="이름, 정당, 선거구로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-none border-[#D4D4D4] font-sans text-sm focus:border-[#000000] focus:ring-[#000000]"
            aria-label="후보자 검색"
          />
        </div>

        <div className="mt-4 max-h-[300px] overflow-y-auto border border-[#E5E5E5]">
          {filteredCandidates.length === 0 ? (
            <p className="p-4 text-center text-sm text-[#A3A3A3] font-serif italic">
              검색 결과가 없습니다
            </p>
          ) : (
            <ul role="listbox" aria-label="후보자 목록">
              {filteredCandidates.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    onClick={() => handleSelect(candidate)}
                    className="w-full text-left px-4 py-3 border-b border-[#E5E5E5] last:border-b-0 hover:bg-[#F5F5F5] focus:bg-[#F5F5F5] focus:outline-none transition-colors"
                    role="option"
                    aria-selected="false"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 border border-[#D4D4D4] flex items-center justify-center text-sm font-mono text-[#525252]">
                        {candidate.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[#000000]">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-[#A3A3A3] font-sans truncate">
                          {candidate.position} · {candidate.electionName}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#525252] border border-[#D4D4D4] px-2 py-0.5 shrink-0">
                        [{candidate.party}]
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
