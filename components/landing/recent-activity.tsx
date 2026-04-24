"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import { Marquee } from "@/components/ui/marquee"

const recentPledges = [
  {
    election: "제22대 국회의원",
    candidate: "김민수",
    party: "국민의힘",
    summary: "지역 필수의료 체계 구축을 최우선 과제로",
    time: "3시간 전",
  },
  {
    election: "제22대 국회의원",
    candidate: "이수진",
    party: "더불어민주당",
    summary: "중소기업 R&D 투자 확대 및 세제 혜택 강화",
    time: "5시간 전",
  },
  {
    election: "제9회 지방선거",
    candidate: "박지영",
    party: "무소속",
    summary: "대중교통 요금 동결 및 노선 확충 추진",
    time: "8시간 전",
  },
  {
    election: "제22대 국회의원",
    candidate: "정현우",
    party: "개혁신당",
    summary: "청년 주거 안정 위한 임대주택 공급 확대",
    time: "12시간 전",
  },
  {
    election: "제9회 지방선거",
    candidate: "최영호",
    party: "국민의힘",
    summary: "지역 문화시설 확충 및 예술인 지원 강화",
    time: "1일 전",
  },
  {
    election: "제22대 국회의원",
    candidate: "한소희",
    party: "더불어민주당",
    summary: "어린이집·유치원 무상 급식 전면 확대",
    time: "1일 전",
  },
  {
    election: "제9회 지방선거",
    candidate: "윤재호",
    party: "진보당",
    summary: "공공의료 인프라 확충 및 의료 공공성 강화",
    time: "2일 전",
  },
  {
    election: "제22대 국회의원",
    candidate: "강미래",
    party: "녹색정의당",
    summary: "탄소중립 이행 로드맵 수립 및 재생에너지 전환",
    time: "2일 전",
  },
]

function PledgeCard({ pledge }: { pledge: typeof recentPledges[0] }) {
  return (
    <a 
      href="#"
      className="flex flex-col gap-2 p-4 border border-border rounded-sm w-[280px] hover:border-foreground/50 transition-colors duration-300 bg-background group"
      aria-label={`${pledge.candidate} 후보의 공약: ${pledge.summary}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-muted-foreground">
          {pledge.election}
        </span>
        <span className="font-sans text-xs text-muted-foreground">
          {pledge.time}
        </span>
      </div>
      
      {/* Candidate info */}
      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-medium text-foreground">
          {pledge.candidate}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 border border-border rounded-sm font-mono text-xs text-muted-foreground">
          {pledge.party}
        </span>
      </div>
      
      {/* Summary */}
      <p className="font-serif text-sm text-foreground line-clamp-2 group-hover:underline underline-offset-2">
        {pledge.summary}
      </p>
    </a>
  )
}

export function RecentActivity() {
  return (
    <section 
      className="py-16 md:py-24"
      aria-labelledby="recent-activity-heading"
    >
      <div className="max-w-[1100px] mx-auto px-6 mb-8">
        <BlurFade delay={0.2} inView>
          <h2 
            id="recent-activity-heading"
            className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-foreground"
          >
            최근 추가된 공약
          </h2>
        </BlurFade>
      </div>

      {/* Marquee for pledges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <Marquee pauseOnHover className="[--duration:60s]">
          {recentPledges.map((pledge, index) => (
            <PledgeCard key={`${pledge.candidate}-${index}`} pledge={pledge} />
          ))}
        </Marquee>
        
        <Marquee pauseOnHover reverse className="[--duration:60s] mt-4">
          {[...recentPledges].reverse().map((pledge, index) => (
            <PledgeCard key={`${pledge.candidate}-reverse-${index}`} pledge={pledge} />
          ))}
        </Marquee>
      </div>

      {/* Traditional list view */}
      <div className="max-w-[1100px] mx-auto px-6 mt-12">
        <BlurFade delay={0.3} inView>
          <ul className="divide-y divide-border border-t border-b border-border">
            {recentPledges.slice(0, 4).map((pledge, index) => (
              <li 
                key={`list-${pledge.candidate}-${index}`}
                className="py-4 hover:bg-secondary/50 transition-colors"
              >
                <a 
                  href="#"
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
                  aria-label={`${pledge.candidate} 후보의 공약: ${pledge.summary}`}
                >
                  <span className="font-sans text-xs text-muted-foreground shrink-0">
                    {pledge.election}
                  </span>
                  <span className="font-sans text-sm font-medium text-foreground shrink-0">
                    {pledge.candidate}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 border border-border rounded-sm font-mono text-xs text-muted-foreground shrink-0">
                    {pledge.party}
                  </span>
                  <span className="font-serif text-sm text-foreground flex-1 group-hover:underline underline-offset-2 line-clamp-1">
                    {pledge.summary}
                  </span>
                  <span className="font-sans text-xs text-muted-foreground shrink-0">
                    {pledge.time}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </BlurFade>
      </div>
    </section>
  )
}
