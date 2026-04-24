"use client"

import { useMemo } from "react"
import { extractCommonKeywords } from "@/lib/compare-data"

interface KeywordCloudProps {
  candidateIds: string[]
}

export function KeywordCloud({ candidateIds }: KeywordCloudProps) {
  const keywords = useMemo(() => {
    return extractCommonKeywords(candidateIds)
  }, [candidateIds])

  if (candidateIds.length < 2) {
    return (
      <div className="border border-[#D4D4D4] p-6">
        <h3 className="font-sans text-sm font-medium text-[#000000] tracking-tight mb-4">
          공통 키워드
        </h3>
        <p className="font-serif text-sm text-[#A3A3A3] italic">
          2명 이상의 후보자를 선택하면 공통 키워드가 표시됩니다
        </p>
      </div>
    )
  }

  const maxCount = Math.max(...keywords.map(k => k.count))
  const minCount = Math.min(...keywords.map(k => k.count))
  const range = maxCount - minCount || 1

  const getFontSize = (count: number) => {
    const normalized = (count - minCount) / range
    // Font sizes from 12px to 28px
    return 12 + normalized * 16
  }

  return (
    <div className="border border-[#D4D4D4] p-6">
      <h3 className="font-sans text-sm font-medium text-[#000000] tracking-tight mb-4">
        공통 키워드
      </h3>
      
      {keywords.length === 0 ? (
        <p className="font-serif text-sm text-[#A3A3A3] italic">
          공통 키워드가 없습니다
        </p>
      ) : (
        <div 
          className="flex flex-wrap gap-x-4 gap-y-2 items-baseline justify-center py-4"
          role="list"
          aria-label="공통 키워드 목록"
        >
          {keywords.map(({ word, count }) => (
            <span
              key={word}
              className="font-serif text-[#000000] inline-block"
              style={{ fontSize: `${getFontSize(count)}px` }}
              role="listitem"
              aria-label={`${word}, ${count}회 언급`}
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
