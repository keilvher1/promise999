"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { NumberTicker } from "@/components/ui/number-ticker"

const ballotTypes = [
  { name: "시·도지사", count: 17 },
  { name: "교육감", count: 17 },
  { name: "광역의원 지역구", count: 789 },
  { name: "광역의원 비례", count: 17 },
  { name: "시·군·구청장", count: 226 },
  { name: "기초의원 지역구", count: 2927 },
  { name: "기초의원 비례", count: 226 },
]

export function FeaturedElection() {
  return (
    <section 
      className="py-16 md:py-24"
      aria-labelledby="featured-election-heading"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <BlurFade delay={0.2} inView>
          <div className="relative border border-border p-6 md:p-10 rounded-sm overflow-hidden">
            <BorderBeam 
              size={100} 
              duration={12} 
              colorFrom="#525252" 
              colorTo="#A3A3A3"
            />
            
            <header className="mb-8">
              <p className="font-sans text-sm text-muted-foreground uppercase tracking-wide mb-2">
                오는 선거
              </p>
              <h2 
                id="featured-election-heading"
                className="font-sans text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
              >
                제9회 전국동시지방선거
              </h2>
              <p className="mt-2 font-serif text-lg text-muted-foreground">
                2026년 6월 3일{" "}
                <span className="font-sans font-medium text-foreground">
                  (D-<NumberTicker value={40} delay={0.5} />)
                </span>
              </p>
            </header>

            {/* Ballot types grid */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8"
              role="list"
              aria-label="투표 용지 종류"
            >
              {ballotTypes.map((ballot, index) => (
                <BlurFade key={ballot.name} delay={0.3 + index * 0.05} inView>
                  <div
                    role="listitem"
                    className="border border-border p-4 text-center rounded-sm hover:border-foreground/50 transition-colors duration-300"
                  >
                    <p className="font-sans text-xs text-muted-foreground mb-1 break-keep">
                      {ballot.name}
                    </p>
                    <p className="font-sans text-lg font-semibold text-foreground tabular-nums">
                      <NumberTicker value={ballot.count} delay={0.5 + index * 0.05} />
                    </p>
                  </div>
                </BlurFade>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              asChild
              className="bg-foreground text-background hover:bg-gray-600 rounded-none px-6 py-5 text-base font-sans font-medium transition-all duration-300 hover:shadow-lg"
            >
              <Link href="/preview-ballot">
                내 투표용지 미리보기
              </Link>
            </Button>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
