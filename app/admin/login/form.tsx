"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? "로그인 실패")
      return
    }
    startTransition(() => { router.push("/admin"); router.refresh() })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="password"
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder="ADMIN_TOKEN"
        autoComplete="off"
        autoFocus
        className="w-full bg-transparent border-b border-border py-2 px-1 font-mono text-sm outline-none focus:border-foreground"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={pending || token.length < 4}
        className="w-full font-sans text-sm border border-foreground bg-foreground text-background py-2 disabled:opacity-50"
      >
        로그인
      </button>
    </form>
  )
}
