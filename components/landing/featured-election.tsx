"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { useI18n } from "@/lib/i18n/context"

interface Props {
  /** 실제 Neon에 있는 선거 한 건 (랜딩 CTA 타겟) */
  featured: {
    sgId: string
    title: string
    dateText: string
    candidateCount: number
  }
}

export function FeaturedElection({ featured }: Props) {
  const { t } = useI18n()

  return (
    <section
      className="py-16 md:py-24"
      aria-labelledby="featured-election-heading"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <BlurFade delay={0.2} inView>
          <div className="relative border border-border p-6 md:p-10 rounded-sm overflow-hidden">
            <BorderBeam size={100} duration={12} colorFrom="#525252" colorTo="#A3A3A3" />

            <header className="mb-8">
              <p className="font-sans text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {t("landing.featured_election_label")}
              </p>
              <h2
                id="featured-election-heading"
                className="font-sans text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
              >
                {featured.title}
              </h2>
              <p className="mt-2 font-serif text-lg text-muted-foreground">
                {featured.dateText} ·{" "}
                <span className="font-sans font-medium text-foreground">
                  {t("landing.candidates_count", { count: featured.candidateCount })}
                </span>
              </p>
            </header>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-foreground text-background hover:bg-gray-600 rounded-none px-6 py-5 text-base font-sans font-medium transition-all duration-300 hover:shadow-lg"
              >
                <Link href={`/elections/${featured.sgId}`}>
                  {t("landing.featured_cta")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-none px-6 py-5 text-base font-sans"
              >
                <Link href="/elections">
                  {t("nav.elections")} →
                </Link>
              </Button>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
