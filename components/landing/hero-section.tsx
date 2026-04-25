"use client"

import Link from "next/link"
import { TextAnimate } from "@/components/ui/text-animate"
import { BlurFade } from "@/components/ui/blur-fade"
import { WordRotate } from "@/components/ui/word-rotate"
import { useI18n } from "@/lib/i18n/context"
import { HeroSearch } from "@/components/landing/hero-search"

export function HeroSection() {
  const { t, locale } = useI18n()

  // 회전 키워드는 언어별로 다른 세트
  const rotatingWords: Record<string, string[]> = {
    ko: ["서울시장 후보", "교육 공약", "복지 정책", "주거 안정", "청년 지원"],
    en: ["Seoul mayor", "Education", "Welfare", "Housing", "Youth"],
    ja: ["ソウル市長候補", "教育公約", "福祉政策", "住宅安定", "青年支援"],
    zh: ["首尔市长候选人", "教育公约", "福利政策", "住房稳定", "青年支持"],
  }
  const words = rotatingWords[locale] ?? rotatingWords.ko

  return (
    <section className="py-20 md:py-32" aria-labelledby="hero-heading">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-16">
          {/* Left: Heading and subcopy */}
          <div className="flex-1 max-w-xl">
            <h1
              id="hero-heading"
              className="font-sans text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground"
            >
              <TextAnimate animation="blurInUp" by="word" once>
                {`${t("landing.hero_title_1")} ${t("landing.hero_title_2")}`}
              </TextAnimate>
            </h1>
            <BlurFade delay={0.3} inView>
              <p className="mt-6 font-serif text-lg md:text-xl leading-relaxed text-muted-foreground">
                {t("landing.hero_sub")}
              </p>
            </BlurFade>

            {/* Rotating keywords */}
            <BlurFade delay={0.5} inView>
              <div className="mt-6 flex items-center gap-2 font-sans text-sm text-muted-foreground">
                <span>{t("nav.compare")}:</span>
                <WordRotate
                  words={words}
                  duration={2500}
                  className="font-medium text-foreground"
                />
              </div>
            </BlurFade>
          </div>

          {/* Right: Search with autocomplete + trending */}
          <BlurFade delay={0.4} inView direction="right" className="flex-1 max-w-md w-full">
            <HeroSearch
              placeholder={t("landing.search_placeholder")}
              ariaLabel={t("landing.search_placeholder")}
              trendingTitle={t("landing.trending_searches") || "실시간 검색어"}
              searchButton={t("candidates_list.search_button")}
            />
            <Link
              href="/find-district"
              className="inline-block mt-3 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              {t("landing.find_my_district")}
            </Link>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
