"use client"

import { NumberTicker } from "@/components/ui/number-ticker"
import { BlurFade } from "@/components/ui/blur-fade"

const stats = [
  { label: "수록 선거", value: 23, suffix: "회" },
  { label: "후보자 공약", value: 41280, suffix: "건" },
  { label: "정당 정책", value: 158, suffix: "건" },
  { label: "용어 풀이", value: 1200, suffix: "+개" },
]

export function TrustBar() {
  return (
    <section 
      className="border-t border-b border-border py-8"
      aria-label="아카이브 통계"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <ul className="flex flex-wrap justify-center lg:justify-between gap-6 lg:gap-4">
          {stats.map((stat, index) => (
            <BlurFade key={stat.label} delay={0.1 * index} inView>
              <li className="flex items-center gap-4">
                <div className="text-center lg:text-left">
                  <span className="font-sans text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="ml-2 font-sans text-lg font-semibold text-foreground">
                    <NumberTicker 
                      value={stat.value} 
                      delay={0.2 + index * 0.1}
                      className="tabular-nums"
                    />
                    {stat.suffix}
                  </span>
                </div>
                {index < stats.length - 1 && (
                  <div 
                    className="hidden lg:block w-px h-6 bg-border ml-4" 
                    aria-hidden="true"
                  />
                )}
              </li>
            </BlurFade>
          ))}
        </ul>
      </div>
    </section>
  )
}
