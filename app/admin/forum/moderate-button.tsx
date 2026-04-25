"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface Props {
  id: number
  kind: "thread" | "reply"
  hidden: boolean
}

export function ModerateButton({ id, kind, hidden }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  async function toggle() {
    setErr(null)
    const action = hidden ? "unhide" : "hide"
    let reason: string | null = null
    if (action === "hide") {
      reason = window.prompt("숨김 사유 (선택):", "admin: hidden")
      if (reason === null) return
    }
    const res = await fetch("/api/admin/forum", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, action, reason }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setErr(d.error ?? "오류")
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          "border px-2 py-0.5 text-xs font-mono transition-colors " +
          (hidden
            ? "border-foreground hover:bg-muted"
            : "border-destructive text-destructive hover:bg-destructive/10")
        }
      >
        {hidden ? "복원" : "숨김"}
      </button>
      {err && <span className="text-xs text-destructive">{err}</span>}
    </>
  )
}
