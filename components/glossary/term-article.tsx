"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { BlurFade } from '@/components/ui/blur-fade'
import { TextAnimate } from '@/components/ui/text-animate'
import type { GlossaryTerm } from '@/lib/glossary-data'

interface TermArticleProps {
  term: GlossaryTerm
}

export function TermArticle({ term }: TermArticleProps) {
  return (
    <article className="max-w-2xl">
      {/* Title */}
      <header className="mb-8">
        <h1 
          id="definition"
          tabIndex={-1}
          className="font-sans text-4xl font-semibold tracking-tight text-foreground"
        >
          <TextAnimate animation="blurInUp" by="character" once>
            {term.term}
          </TextAnimate>
        </h1>
        <BlurFade delay={0.2} inView>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            /{term.slug}/
          </div>
        </BlurFade>
      </header>

      {/* Definition quote block */}
      <BlurFade delay={0.3} inView>
        <motion.blockquote 
          className="mb-12 border-l-2 border-border bg-secondary/50 py-4 pl-6 pr-4"
          whileHover={{ borderLeftColor: "#525252" }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-serif text-lg leading-relaxed text-muted-foreground">
            {term.definition}
          </p>
        </motion.blockquote>
      </BlurFade>

      {/* Background section */}
      <section id="background" tabIndex={-1} className="mb-12">
        <BlurFade delay={0.4} inView>
          <h2 className="mb-6 font-sans text-xl font-medium tracking-tight text-foreground">
            배경
          </h2>
        </BlurFade>
        <div className="space-y-4">
          {term.background.map((paragraph, index) => (
            <BlurFade key={index} delay={0.5 + index * 0.1} inView>
              <p className="font-serif text-base leading-relaxed text-foreground">
                {paragraph}
              </p>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Related pledges section */}
      <section id="related-pledges" tabIndex={-1} className="mb-12">
        <BlurFade delay={0.6} inView>
          <h2 className="mb-6 font-sans text-xl font-medium tracking-tight text-foreground">
            관련 공약
          </h2>
        </BlurFade>
        {term.relatedPledges.length > 0 ? (
          <ul className="divide-y divide-border border-y border-border">
            {term.relatedPledges.map((pledge, index) => (
              <BlurFade key={pledge.id} delay={0.7 + index * 0.05} inView>
                <li>
                  <Link
                    href={`/pledges/${pledge.id}`}
                    className="
                      group flex items-start gap-3 py-3
                      transition-colors
                      hover:bg-secondary/50
                      focus:outline-none focus:ring-1 focus:ring-ring focus:ring-inset
                    "
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight 
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" 
                        strokeWidth={1}
                        aria-hidden="true"
                      />
                    </motion.div>
                    <span className="font-serif text-sm leading-relaxed">
                      <span className="text-muted-foreground">{pledge.election}</span>
                      <span className="mx-1.5 text-border">·</span>
                      <span className="text-foreground">{pledge.candidate}</span>
                      <span className="mx-1.5 text-border">·</span>
                      <span className="text-foreground">
                        「{pledge.pledgeTitle}」 공약에서 언급
                      </span>
                    </span>
                  </Link>
                </li>
              </BlurFade>
            ))}
          </ul>
        ) : (
          <BlurFade delay={0.7} inView>
            <p className="font-serif text-sm italic text-muted-foreground">
              해당 용어를 언급한 공약이 아직 등록되지 않았습니다.
            </p>
          </BlurFade>
        )}
      </section>

      {/* Related terms section */}
      <section id="related-terms" tabIndex={-1} className="mb-12">
        <BlurFade delay={0.8} inView>
          <h2 className="mb-6 font-sans text-xl font-medium tracking-tight text-foreground">
            관련 용어
          </h2>
        </BlurFade>
        {term.relatedTerms.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {term.relatedTerms.map((related, index) => (
              <BlurFade key={related.slug} delay={0.85 + index * 0.05} inView>
                <li>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={`/terms/${related.slug}`}
                      className="
                        inline-block border border-border px-3 py-1.5
                        font-sans text-sm
                        transition-colors
                        hover:bg-secondary hover:border-foreground/30
                        focus:outline-none focus:ring-1 focus:ring-ring
                      "
                    >
                      {related.term}
                    </Link>
                  </motion.div>
                </li>
              </BlurFade>
            ))}
          </ul>
        ) : (
          <BlurFade delay={0.85} inView>
            <p className="font-serif text-sm italic text-muted-foreground">
              관련 용어가 없습니다.
            </p>
          </BlurFade>
        )}
      </section>

      {/* Footer */}
      <BlurFade delay={0.9} inView>
        <footer className="border-t border-border pt-6">
          <p className="font-sans text-xs text-muted-foreground">
            출처: {term.source}
            <span className="mx-2">·</span>
            마지막 업데이트 {term.lastUpdated}
          </p>
        </footer>
      </BlurFade>
    </article>
  )
}
