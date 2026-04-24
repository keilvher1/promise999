"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { TextAnimate } from "@/components/ui/text-animate"
import { BlurFade } from "@/components/ui/blur-fade"
import { WordRotate } from "@/components/ui/word-rotate"

export function HeroSection() {
  return (
    <section 
      className="py-20 md:py-32"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-16">
          {/* Left: Heading and subcopy */}
          <div className="flex-1 max-w-xl">
            <h1 
              id="hero-heading"
              className="font-sans text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground"
            >
              <TextAnimate animation="blurInUp" by="word" once>
                모든 선거 공약을, 한곳에서.
              </TextAnimate>
            </h1>
            <BlurFade delay={0.3} inView>
              <p className="mt-6 font-serif text-lg md:text-xl leading-relaxed text-muted-foreground">
                중앙선거관리위원회 원문을 기반으로 한, 전국·역대 선거의 공약을 비교할 수 있는 공공 아카이브.
              </p>
            </BlurFade>
            
            {/* Rotating keywords */}
            <BlurFade delay={0.5} inView>
              <div className="mt-6 flex items-center gap-2 font-sans text-sm text-muted-foreground">
                <span>검색:</span>
                <WordRotate
                  words={["서울시장 후보", "교육 공약", "복지 정책", "주거 안정", "청년 지원"]}
                  duration={2500}
                  className="font-medium text-foreground"
                />
              </div>
            </BlurFade>
          </div>

          {/* Right: Search */}
          <BlurFade delay={0.4} inView direction="right" className="flex-1 max-w-md w-full">
            <div className="relative group">
              <label htmlFor="hero-search" className="sr-only">
                후보자 검색
              </label>
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-foreground" 
                strokeWidth={1}
                aria-hidden="true"
              />
              <Input
                id="hero-search"
                type="search"
                placeholder="후보자 이름, 선거구, 정당으로 검색"
                className="pl-12 pr-4 py-6 text-base bg-secondary border border-border rounded-sm focus:ring-1 focus:ring-foreground focus:border-foreground transition-all duration-300 hover:border-foreground/50"
                aria-label="후보자 이름, 선거구, 정당으로 검색"
              />
            </div>
            <Link 
              href="/find-district"
              className="inline-block mt-3 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
            >
              주소로 내 선거구 찾기
            </Link>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
