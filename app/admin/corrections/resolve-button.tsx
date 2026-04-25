"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface Props {
  id: number
  currentStatus: string
}

const STATUSES: { value: string; label: string }[] = [
  { value: "open", label: "접수" },
  { value: "investigating", label: "조사 중" },
  { value: "fixed", label: "수정완료" },
  { value: "rejected", label: "반려" },
  { value: "duplicate", label: "중복" },
]

export function ResolveButton({ id, currentStatus }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const [status, setStatus] = useState(currentStatus)

  async function update(next: string) {
    setErr(null)
    let note: string | null = null
    if (next === "fixed" || next === "rejected" || next === "duplicate") {
      note = window.prompt(
        next === "rejected" ? "반려 사유 (선택):"
        : next === "duplicate" ? "중복 사유 (선택):"
        : "처리 메모 (선택):", "")
      // null = cancel
      if (note === null) return
    }
    const res = await fetch("/api/admin/corrections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next, admin_note: note || undefined }),
    })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) {
      setErr(d.error ?? "오류")
      return
    }
    setStatus(next)
    start(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-2">
      {err && <span className="text-xs text-destructive">{err}</span>}
      <select
        value={status}
        disabled={pending}
        onChange={(e) => update(e.target.value)}
        className="border border-border bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:border-foreground"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
