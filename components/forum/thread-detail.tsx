"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import type { ForumThread, ForumReply } from "@/lib/forum"

interface Props {
  threadId: number
}

export function ThreadDetail({ threadId }: Props) {
  const [thread, setThread] = useState<ForumThread | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function load() {
    const res = await fetch(`/api/forum/threads/${threadId}`, { cache: "no-store" })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "오류")
      return
    }
    setThread(data.thread)
    setReplies(data.replies ?? [])
  }
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [threadId])

  async function submitReply(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (body.trim().length < 2) {
      setError("내용을 입력해주세요.")
      return
    }
    const res = await fetch("/api/forum/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: threadId, body }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "오류")
      return
    }
    setBody("")
    startTransition(() => { load() })
  }

  async function vote(target: "thread" | "reply", id: number, v: 1 | -1) {
    const payload: any = { vote: v }
    if (target === "thread") payload.thread_id = id
    else payload.reply_id = id
    const res = await fetch("/api/forum/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) startTransition(() => { load() })
  }

  async function report(target: "thread" | "reply", id: number) {
    const reason = prompt(
      "신고 사유를 선택하세요:\n  spam / abuse / offtopic / illegal / disinfo / other",
      "abuse",
    )
    if (!reason) return
    const payload: any = { reason }
    if (target === "thread") payload.thread_id = id
    else payload.reply_id = id
    const res = await fetch("/api/forum/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) setInfo("신고 접수됨. 감사합니다.")
    else setError(data.error ?? "신고 실패")
  }

  if (error && !thread) {
    return <p className="text-sm text-destructive">{error}</p>
  }
  if (!thread) {
    return <p className="text-sm text-muted-foreground">로딩 중…</p>
  }

  return (
    <article className="space-y-6">
      <Link href="/forum" className="text-xs font-mono text-muted-foreground hover:text-foreground">
        ← 목록으로
      </Link>

      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="font-serif text-3xl text-foreground">{thread.title}</h1>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>{thread.author_nick}</span>
          <span>·</span>
          <span>{new Date(thread.created_at).toLocaleString("ko-KR")}</span>
        </div>
      </header>

      <div className="font-sans text-base whitespace-pre-wrap leading-relaxed">{thread.body}</div>

      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => vote("thread", thread.id, 1)} className="border border-border px-2 py-1 font-mono hover:bg-muted">▲ {thread.upvotes}</button>
        <button onClick={() => vote("thread", thread.id, -1)} className="border border-border px-2 py-1 font-mono hover:bg-muted">▼ {thread.downvotes}</button>
        <button onClick={() => report("thread", thread.id)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">🚩 신고</button>
      </div>

      <section className="space-y-4 pt-6 border-t border-border">
        <h2 className="font-sans text-sm font-semibold">댓글 {replies.length}</h2>

        <form onSubmit={submitReply} className="space-y-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="익명 댓글을 입력하세요…"
            maxLength={4000}
            rows={3}
            className="w-full bg-transparent border-b border-border py-1.5 font-sans text-sm outline-none focus:border-foreground resize-y"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-foreground">{info}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={pending}
                    className="font-sans text-sm border border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background disabled:opacity-50">
              댓글 작성
            </button>
          </div>
        </form>

        <ul className="space-y-3">
          {replies.length === 0 && (
            <li className="text-sm text-muted-foreground py-4 text-center">아직 댓글이 없습니다.</li>
          )}
          {replies.map(r => (
            <li key={r.id} className="border-b border-border pb-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span>{r.author_nick}</span>
                <span>·</span>
                <span>{new Date(r.created_at).toLocaleString("ko-KR")}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap font-sans text-sm">{r.body}</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <button onClick={() => vote("reply", r.id, 1)} className="border border-border px-2 py-0.5 font-mono hover:bg-muted">▲ {r.upvotes}</button>
                <button onClick={() => vote("reply", r.id, -1)} className="border border-border px-2 py-0.5 font-mono hover:bg-muted">▼ {r.downvotes}</button>
                <button onClick={() => report("reply", r.id)} className="ml-auto text-muted-foreground hover:text-foreground">🚩</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
