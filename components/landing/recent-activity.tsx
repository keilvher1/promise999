"use client"

import Link from "next/link"
import { BlurFade } from "@/components/ui/blur-fade"
import { useI18n } from "@/lib/i18n/context"

export interface RecentPledge {
  id: string
  electionName: string
  candidateName: string
  candidacyId?: string
  party: string
  firstLine: string
  addedAt: string
}

interface Props {
  items: RecentPledge[]
}

function timeAgo(iso: string, locale: string): string {
  const then = new Date(iso).getTime()
  const diffMs = Date.now() - then
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return locale === "ko" ? `${mins}분 전` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return locale === "ko" ? `${hours}시간 전` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return locale === "ko" ? `${days}일 전` : `${days}d ago`
}

export function RecentActivity({ items }: Props) {
  const { t, locale } = useI18n()

  if (items.length === 0) {
    return null
  }

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
            {t("landing.recent_title")}
          </h2>
        </BlurFade>
      </div>

      <div className="max-w-[1100px] mx-auto px-6">
        <BlurFade delay={0.3} inView>
          <ul className="divide-y divide-border border-t border-b border-border">
            {items.map((pledge) => (
              <li
                key={pledge.id}
                className="py-4 hover:bg-secondary/50 transition-colors"
              >
                <Link
                  href={pledge.candidacyId ? `/candidates/${pledge.candidacyId}` : "#"}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 rounded-sm"
                >
                  <span className="font-sans text-xs text-muted-foreground shrink-0">
                    {pledge.electionName}
                  </span>
                  <span className="font-sans text-sm font-medium text-foreground shrink-0">
                    {pledge.candidateName}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 border border-border rounded-sm font-mono text-xs text-muted-foreground shrink-0">
                    {pledge.party}
                  </span>
                  <span className="font-serif text-sm text-foreground flex-1 group-hover:underline underline-offset-2 line-clamp-1">
                    {pledge.firstLine}
                  </span>
                  <span className="font-sans text-xs text-muted-foreground shrink-0">
                    {timeAgo(pledge.addedAt, locale)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </BlurFade>
      </div>
    </section>
  )
}
