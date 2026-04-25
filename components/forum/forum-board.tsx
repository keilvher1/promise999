"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ForumTargetKind, ForumThread } from "@/lib/forum"

interface Props {
  targetKind: ForumTargetKind
  targetId?: number | null
  /** 페이지에서 받은 라벨(번역됨) — 함수 콜백 금지(Server→Client 전달 불가) */
  labels: {
    title: string
    subtitle: string
    new_post: string
    new_post_title_ph: string
    new_post_body_ph: string
    submit: string
    no_threads: string
    replies: string
    /** "{n}분 전" 형식 — {n} 토큰을 숫자로 치환 */
    minutes_ago: string
    hours_ago: string
    days_ago: string
    just_now: string
  }
}

export function ForumBoard({ targetKind, targetId = null, labels }: Props) {
  const [threads, setThreads] = useState<ForumThread[] | null>(null)
  const [total, setTotal] = useState(0)
  const [showCompose, setShowCompose] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function load() {
    const params = new URLSearchParams({ target_kind: targetKind, limit: "30" })
    if (targetId !== null) params.set("target_id", String(targetId))
    const res = await fetch(`/api/forum/threads?${params.toString()}`, { cache: "no-store" })
    const data = await res.json()
    setThreads(data.threads ?? [])
    setTotal(data.total ?? 0)
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [targetKind, targetId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (title.trim().length < 2 || body.trim().length < 2) {
      setError("제목과 본문을 입력해주세요.")
      return
    }
    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_kind: targetKind, target_id: targetId, title, body }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "오류가 발생했습니다.")
      return
    }
    setTitle("")
    setBody("")
    setShowCompose(false)
    startTransition(() => { load() })
  }

  return (
    <section className="space-y-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">{labels.title}</h2>
          <p className="font-sans text-sm text-muted-foreground mt-1">{labels.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCompose(s => !s)}
          className="font-sans text-sm border border-border px-3 py-1.5 hover:bg-muted transition-colors"
        >
          {showCompose ? "✕" : labels.new_post}
        </button>
      </header>

      {showCompose && (
        <form onSubmit={submit} className="border border-border p-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={labels.new_post_title_ph}
            maxLength={200}
            className="w-full bg-transparent border-b border-border py-1.5 font-sans text-base outline-none focus:border-foreground"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={labels.new_post_body_ph}
            maxLength={8000}
            rows={6}
            className="w-full bg-transparent border-b border-border py-1.5 font-sans text-sm outline-none focus:border-foreground resize-y"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={pending}
              className="font-sans text-sm border border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
            >
              {labels.submit}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            익명입니다. 작성 시 닉네임은 IP+브라우저 정보 기반으로 자동 생성됩니다.
            욕설·도배·허위정보는 자동 필터링되며, 5건 이상 신고된 글은 자동 숨김 처리됩니다.
          </p>
        </form>
      )}

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-mono">
          {threads === null ? "로딩 중…" : `${total}개의 글`}
        </p>
        <ul className="border-t border-border">
          {threads === null && (
            <li className="py-6 text-center text-sm text-muted-foreground">…</li>
          )}
          {threads !== null && threads.length === 0 && (
            <li className="py-12 text-center text-sm text-muted-foreground">
              {labels.no_threads}
            </li>
          )}
          {threads?.map(t => (
            <li key={t.id} className="border-b border-border py-3 px-1 hover:bg-muted/30 transition-colors">
              <Link href={`/forum/${t.id}`} className="block">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-sans text-base text-foreground line-clamp-1">{t.title}</h3>
                  <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {timeAgo(t.created_at, labels)}
                  </span>
                </div>
                <p className="font-sans text-sm text-muted-foreground line-clamp-2 mt-1">{t.body}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                  <span>{t.author_nick}</span>
                  <span>·</span>
                  <span>{labels.replies}: {t.reply_count}</span>
                  <span>·</span>
                  <span>▲ {t.upvotes}</span>
                  <span>▼ {t.downvotes}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function timeAgo(iso: string, labels: Props["labels"]): string {
  const t = new Date(iso).getTime()
  const diff = Date.now() - t
  if (diff < 60_000) return labels.just_now
  const min = Math.floor(diff / 60_000)
  if (min < 60) return labels.minutes_ago.replace("{n}", String(min))
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return labels.hours_ago.replace("{n}", String(hrs))
  return labels.days_ago.replace("{n}", String(Math.floor(hrs / 24)))
}
