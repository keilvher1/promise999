"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CandidateDetail } from "@/lib/candidate-data"
import { sampleCandidate, opponentCandidates } from "@/lib/candidate-data"

interface CompareTabProps {
  candidate: CandidateDetail
}

// Mock data for comparison - in real app, would fetch based on selection
const mockOpponentPledges = {
  g1: [
    { category: "주거", title: "공공임대주택 15만 호 공급", summary: "시세 40% 수준의 공공임대주택 15만 호를 2030년까지 공급" },
    { category: "교통", title: "GTX-A 연장 추진", summary: "GTX-A 노선의 강북 연장 및 환승 체계 개선" },
    { category: "복지", title: "전 시민 기본소득 월 10만원", summary: "서울시민 전원 대상 기본소득 월 10만원 지급" },
    { category: "환경", title: "2030 탄소중립 달성", summary: "2030년까지 서울시 탄소배출 50% 감축" },
    { category: "교육", title: "무상교육 고등학교까지 확대", summary: "고등학교까지 완전 무상교육 실시" },
  ],
  g3: [
    { category: "주거", title: "사회주택 20만 호 공급", summary: "사회적경제 주체와 함께 사회주택 20만 호 공급" },
    { category: "교통", title: "자전거 도시 서울", summary: "자전거 전용도로 1,000km 확충 및 공유자전거 확대" },
    { category: "복지", title: "돌봄 공공화", summary: "모든 돌봄 서비스의 공공 전환 추진" },
    { category: "환경", title: "석탄발전 조기 폐쇄", summary: "서울시 인근 석탄발전소 조기 폐쇄 추진" },
    { category: "교육", title: "혁신학교 전면 확대", summary: "서울시 전 초중고 혁신학교 전환" },
  ],
  g4: [
    { category: "주거", title: "청년 주거비 지원", summary: "청년 1인 가구 월 30만원 주거비 지원" },
    { category: "교통", title: "택시 요금 개편", summary: "심야 택시 요금 인하 및 공유 택시 활성화" },
    { category: "복지", title: "디지털 복지", summary: "고령층 디지털 교육 및 기기 보급 확대" },
    { category: "환경", title: "도시농업 활성화", summary: "옥상 및 유휴부지 활용 도시농업 확대" },
    { category: "교육", title: "대안교육 지원", summary: "대안학교 및 홈스쿨링 제도적 지원" },
  ],
  g6: [
    { category: "주거", title: "1인 가구 맞춤 주택", summary: "1인 가구 특화 소형 주택 5만 호 공급" },
    { category: "교통", title: "광역버스 확충", summary: "수도권 광역버스 노선 50% 확충" },
    { category: "복지", title: "반려동물 복지", summary: "반려동물 의료비 지원 및 공원 확충" },
    { category: "환경", title: "한강 생태 복원", summary: "한강 자연형 호안 복원 사업 추진" },
    { category: "교육", title: "평생교육 바우처", summary: "전 시민 연간 100만원 평생교육 바우처 지급" },
  ],
}

export function CompareTab({ candidate }: CompareTabProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<string>("")
  
  const opponent = opponentCandidates.find(c => c.id === selectedOpponent)
  const opponentPledges = selectedOpponent 
    ? mockOpponentPledges[selectedOpponent as keyof typeof mockOpponentPledges] || []
    : []

  // Get unique categories from both candidates
  const allCategories = [
    ...new Set([
      ...candidate.keyPledges.map(p => p.category),
      ...opponentPledges.map(p => p.category),
    ]),
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Opponent selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-sans text-muted-foreground">
          비교할 후보자:
        </span>
        <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
          <SelectTrigger 
            className="w-[240px] rounded-none border-foreground"
            aria-label="비교할 후보자 선택"
          >
            <SelectValue placeholder="후보자를 선택하세요" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {opponentCandidates.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                기호 {c.number}번 {c.name} [{c.party}]
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comparison table */}
      {selectedOpponent ? (
        <div className="border border-border">
          {/* Header row */}
          <div className="grid grid-cols-2 border-b border-border bg-secondary">
            <div className="p-4 border-r border-border">
              <div className="font-sans font-medium tracking-tight">
                기호 {candidate.number}번 {candidate.name}
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1">
                [{candidate.party}]
              </div>
            </div>
            <div className="p-4">
              <div className="font-sans font-medium tracking-tight">
                기호 {opponent?.number}번 {opponent?.name}
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1">
                [{opponent?.party}]
              </div>
            </div>
          </div>

          {/* Category rows */}
          {allCategories.map((category) => {
            const myPledge = candidate.keyPledges.find(p => p.category === category)
            const theirPledge = opponentPledges.find(p => p.category === category)

            return (
              <div key={category} className="border-b border-border last:border-b-0">
                {/* Category label */}
                <div className="px-4 py-2 bg-secondary/50">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                    {category}
                  </span>
                </div>
                {/* Comparison content */}
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-border">
                    {myPledge ? (
                      <>
                        <h5 className="font-sans font-medium text-sm tracking-tight mb-1">
                          {myPledge.title}
                        </h5>
                        <p className="text-sm font-serif text-muted-foreground leading-relaxed">
                          {myPledge.summary}
                        </p>
                      </>
                    ) : (
                      <span className="text-sm font-serif text-muted-foreground">
                        해당 분야 공약 없음
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {theirPledge ? (
                      <>
                        <h5 className="font-sans font-medium text-sm tracking-tight mb-1">
                          {theirPledge.title}
                        </h5>
                        <p className="text-sm font-serif text-muted-foreground leading-relaxed">
                          {theirPledge.summary}
                        </p>
                      </>
                    ) : (
                      <span className="text-sm font-serif text-muted-foreground">
                        해당 분야 공약 없음
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border p-12 flex items-center justify-center">
          <p className="text-sm font-serif text-muted-foreground">
            비교할 후보자를 선택하면 공약을 나란히 비교할 수 있습니다.
          </p>
        </div>
      )}

      {/* Note */}
      <p className="text-xs font-serif text-muted-foreground">
        공약 비교는 핵심 공약을 기준으로 합니다. 상세 내용은 각 후보자 페이지에서 확인하세요.
      </p>
    </div>
  )
}
