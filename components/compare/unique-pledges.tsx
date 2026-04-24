"use client"

import { useMemo } from "react"
import { findUniquePledges, type ComparableCandidate } from "@/lib/compare-data"

interface UniquePledgesProps {
  candidates: ComparableCandidate[]
}

export function UniquePledges({ candidates }: UniquePledgesProps) {
  const uniquePledges = useMemo(() => {
    return findUniquePledges(candidates.map(c => c.id))
  }, [candidates])

  if (candidates.length < 2) {
    return (
      <div className="border border-[#D4D4D4] p-6">
        <h3 className="font-sans text-sm font-medium text-[#000000] tracking-tight mb-4">
          차별 공약
        </h3>
        <p className="font-serif text-sm text-[#A3A3A3] italic">
          2명 이상의 후보자를 선택하면 차별 공약이 표시됩니다
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[#D4D4D4] p-6">
      <h3 className="font-sans text-sm font-medium text-[#000000] tracking-tight mb-4">
        차별 공약
      </h3>
      <p className="font-serif text-xs text-[#A3A3A3] mb-4">
        다른 후보자가 제시하지 않은 해당 후보자만의 공약
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map((candidate) => {
          const pledges = uniquePledges[candidate.id] || []
          return (
            <div
              key={candidate.id}
              className="border border-[#D4D4D4] p-4"
            >
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E5E5E5]">
                <span className="font-serif text-[#000000]">
                  {candidate.name}
                </span>
                <span className="font-mono text-xs text-[#525252] border border-[#D4D4D4] px-2 py-0.5">
                  [{candidate.party}]
                </span>
              </div>
              
              {pledges.length === 0 ? (
                <p className="font-serif text-sm text-[#A3A3A3] italic">
                  차별 공약 없음
                </p>
              ) : (
                <ul className="space-y-2">
                  {pledges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-sans text-xs text-[#A3A3A3] border border-[#E5E5E5] px-1.5 py-0.5 shrink-0 mt-0.5">
                        {item.category}
                      </span>
                      <span className="font-serif text-sm text-[#262626] leading-relaxed">
                        {item.pledge}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
