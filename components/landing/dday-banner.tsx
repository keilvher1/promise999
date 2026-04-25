"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar } from "lucide-react"

interface Props {
  /** 다음 선거 표시 이름 — i18n 번역됨 */
  electionName: string
  /** YYYY-MM-DD */
  electionDate: string
  /** /elections/[sg_id] 라우트로 이동 */
  href: string
  /** 라벨 (번역됨) */
  labels: {
    until: string
    today: string
    days: string
    hours: string
    minutes: string
    seconds: string
    /** "이 선거 보기" 등 CTA */
    cta: string
  }
}

/** KST 자정 기준으로 캘린더 일수 차이를 반환. 한국 D-Day 관례:
 *  - 선거일 = D-DAY = 0, 전날 = D-1, 39일 전 = D-39.
 *  같은 자정 기준으로 round(date diff / 86400000) — 시간대 무관. */
function calendarDaysKst(target: Date): number {
  const tz = "Asia/Seoul"
  const todayKst = new Date(new Date().toLocaleString("en-US", { timeZone: tz }))
  todayKst.setHours(0, 0, 0, 0)
  const targetKst = new Date(target.toLocaleString("en-US", { timeZone: tz }))
  targetKst.setHours(0, 0, 0, 0)
  return Math.round((targetKst.getTime() - todayKst.getTime()) / 86400000)
}

function diff(target: Date) {
  const now = new Date()
  const ms = target.getTime() - now.getTime()
  const sec = Math.max(0, Math.floor(ms / 1000))
  return {
    total: ms,
    days: calendarDaysKst(target), // 캘린더 기준 (시계 시간 무관)
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
    past: ms < 0,
  }
}

export function DDayBanner({ electionName, electionDate, href, labels }: Props) {
  // 한국 표준시 기준 06:00 투표 시작이라 보고, KST 자정으로 잡는다.
  const target = new Date(`${electionDate}T00:00:00+09:00`)
  const [t, setT] = useState(() => diff(target))

  useEffect(() => {
    const id = window.setInterval(() => setT(diff(target)), 1000)
    return () => window.clearInterval(id)
  }, [electionDate])

  const dDayLabel = t.days === 0 ? labels.today : `D-${t.days}`
  const dateLabel = electionDate.replace(/-/g, ".")

  return (
    <Link
      href={href}
      className="block border border-border hover:bg-muted/30 transition-colors"
      aria-label={`${electionName} ${dDayLabel}`}
    >
      <div className="max-w-[1100px] mx-auto px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
            {labels.until}
          </span>
        </div>

        <div className="flex items-baseline gap-3 flex-1 min-w-0">
          <span className="font-sans text-base font-medium text-foreground line-clamp-1">
            {electionName}
          </span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
            {dateLabel}
          </span>
        </div>

        <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
            {dDayLabel}
          </span>
          {!t.past && t.days > 0 && (
            <span className="font-mono text-xs text-muted-foreground hidden md:inline-block ml-3">
              {String(t.hours).padStart(2, "0")}:
              {String(t.minutes).padStart(2, "0")}:
              {String(t.seconds).padStart(2, "0")}
            </span>
          )}
        </div>

        <span className="font-mono text-xs text-muted-foreground shrink-0 hidden md:inline">
          {labels.cta} →
        </span>
      </div>
    </Link>
  )
}
