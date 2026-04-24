"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import { TextAnimate } from "@/components/ui/text-animate"
import { useI18n } from "@/lib/i18n/context"

export function PrinciplesSection() {
  const { t } = useI18n()
  const principles = [
    {
      title: t("landing.principle_neutral_title"),
      description: t("landing.principle_neutral_body"),
    },
    {
      title: t("landing.principle_history_title"),
      description: t("landing.principle_history_body"),
    },
    {
      title: t("landing.principle_official_title"),
      description: t("landing.principle_official_body"),
    },
  ]

  return (
    <section
      className="py-16 md:py-24 bg-secondary"
      aria-labelledby="principles-heading"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <BlurFade delay={0.1} inView>
          <h2
            id="principles-heading"
            className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-foreground mb-12 text-center"
          >
            <TextAnimate animation="blurInUp" by="word" once>
              {t("landing.principles_title")}
            </TextAnimate>
          </h2>
        </BlurFade>

        <ul className="grid md:grid-cols-3 gap-8 md:gap-12">
          {principles.map((principle, index) => (
            <BlurFade key={principle.title} delay={0.2 + index * 0.15} inView>
              <li className="text-center group">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 border border-border rounded-sm font-sans text-sm text-muted-foreground mb-4 group-hover:border-foreground/50 transition-colors duration-300"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-sans text-lg font-semibold text-foreground mb-3">
                  {principle.title}
                </h3>
                <p className="font-serif text-base leading-relaxed text-muted-foreground">
                  {principle.description}
                </p>
              </li>
            </BlurFade>
          ))}
        </ul>
      </div>
    </section>
  )
}
