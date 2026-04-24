"use client"

import { NumberTicker } from "@/components/ui/number-ticker"
import { BlurFade } from "@/components/ui/blur-fade"
import { useI18n } from "@/lib/i18n/context"

interface Props {
  counts: {
    elections: number
    candidacies: number
    pledges: number
    pledge_items: number
  }
}

export function TrustBar({ counts }: Props) {
  const { t } = useI18n()
  const stats = [
    { label: t("landing.stat_elections"), value: counts.elections },
    { label: t("landing.stat_candidates"), value: counts.candidacies },
    { label: t("landing.stat_pledges"), value: counts.pledges },
    { label: t("landing.stat_pledge_items"), value: counts.pledge_items },
  ]

  return (
    <section className="border-t border-b border-border py-8" aria-label={t("landing.stats_aria")}>
      <div className="max-w-[1100px] mx-auto px-6">
        <ul className="flex flex-wrap justify-center lg:justify-between gap-6 lg:gap-4">
          {stats.map((stat, index) => (
            <BlurFade key={stat.label} delay={0.1 * index} inView>
              <li className="flex items-center gap-4">
                <div className="text-center lg:text-left">
                  <span className="font-sans text-sm text-muted-foreground">{stat.label}</span>
                  <span className="ml-2 font-sans text-lg font-semibold text-foreground">
                    <NumberTicker
                      value={stat.value}
                      delay={0.2 + index * 0.1}
                      className="tabular-nums"
                    />
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
