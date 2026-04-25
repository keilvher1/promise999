"use client"

import { useTransition } from "react"

export function LogoutButton() {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch("/api/admin/login", { method: "DELETE" })
          window.location.href = "/admin/login"
        })
      }
      className="text-muted-foreground hover:text-foreground disabled:opacity-50"
    >
      logout
    </button>
  )
}
