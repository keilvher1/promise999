"use client"

import { PLEDGE_CATEGORIES, type ComparableCandidate } from "@/lib/compare-data"

interface ComparisonGridProps {
  candidates: ComparableCandidate[]
  categoryFilter?: string
}

export function ComparisonGrid({ candidates, categoryFilter }: ComparisonGridProps) {
  const categories = categoryFilter && categoryFilter !== "전체"
    ? [categoryFilter]
    : PLEDGE_CATEGORIES

  if (candidates.length === 0) {
    return (
      <div className="border border-[#D4D4D4] p-12 text-center">
        <p className="font-serif text-[#A3A3A3] italic">
          비교할 후보자를 추가해 주세요
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[#D4D4D4] overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <th className="text-left p-4 font-sans font-medium text-[#000000] border-b border-r border-[#D4D4D4] w-24">
              분야
            </th>
            {candidates.map((candidate) => (
              <th
                key={candidate.id}
                className="text-left p-4 font-sans font-medium text-[#000000] border-b border-r border-[#D4D4D4] last:border-r-0"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-serif">{candidate.name}</span>
                  <span className="font-mono text-xs font-normal text-[#525252]">
                    [{candidate.party}]
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category} className="hover:bg-[#F5F5F5]/50 transition-colors">
              <td className="p-4 font-sans text-sm text-[#525252] border-b border-r border-[#D4D4D4] align-top bg-[#F5F5F5]">
                {category}
              </td>
              {candidates.map((candidate) => {
                const pledges = candidate.pledgesByCategory[category] || []
                return (
                  <td
                    key={`${candidate.id}-${category}`}
                    className="p-4 border-b border-r border-[#D4D4D4] last:border-r-0 align-top"
                  >
                    {pledges.length === 0 ? (
                      <p className="font-serif text-sm text-[#A3A3A3] italic">
                        해당 분야 공약 없음
                      </p>
                    ) : (
                      <ul className="list-disc list-inside space-y-2">
                        {pledges.slice(0, 3).map((pledge, idx) => (
                          <li
                            key={idx}
                            className="font-serif text-sm text-[#262626] leading-relaxed"
                          >
                            {pledge}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
