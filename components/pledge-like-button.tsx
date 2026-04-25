"use client"

import { useEffect, useState, useTransition } from "react"
import { Heart } from "lucide-react"

interface Props {
  /** pledge_id 또는 pledge_item_id 중 하나만 */
  pledgeId?: number
  pledgeItemId?: number
  /** 서버에서 미리 받아온 초기 카운트 — 1차 페인트 빠르게 */
  initialCount?: number
  /** 클래스 커스터마이즈 */
  className?: string
  /** 라벨(접근성) */
  ariaLabel?: string
}

export function PledgeLikeButton({
  pledgeId,
  pledgeItemId,
  initialCount = 0,
  className = "",
  ariaLabel = "좋아요",
}: Props) {
  const [liked, setLiked] = useState<boolean>(false)
  const [count, setCount] = useState<number>(initialCount)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if ((pledgeId == null) === (pledgeItemId == null)) {
    return null
  }

  const targetParam = pledgeId
    ? `pledge_id=${pledgeId}`
    : `pledge_item_id=${pledgeItemId}`
  const targetBody = pledgeId
    ? { pledge_id: pledgeId }
    : { pledge_item_id: pledgeItemId }

  // 마운트 시 현재 좋아요 상태 조회
  useEffect(() => {
    let cancel = false
    fetch(`/api/pledges/like?${targetParam}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (cancel) return
        if (typeof data.likes_count === "number") setCount(data.likes_count)
        if (typeof data.liked === "boolean") setLiked(data.liked)
      })
      .catch(() => {})
    return () => { cancel = true }
  }, [targetParam])

  async function toggle() {
    setError(null)
    // 낙관적 업데이트
    const optimistic = !liked
    setLiked(optimistic)
    setCount(c => Math.max(0, c + (optimistic ? 1 : -1)))

    const res = await fetch("/api/pledges/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(targetBody),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      // 롤백
      setLiked(!optimistic)
      setCount(c => Math.max(0, c + (optimistic ? -1 : 1)))
      setError(data.error ?? "오류")
      return
    }
    if (typeof data.likes_count === "number") setCount(data.likes_count)
    if (typeof data.liked === "boolean") setLiked(data.liked)
  }

  return (
    <button
      type="button"
      onClick={() => startTransition(toggle)}
      disabled={pending}
      aria-pressed={liked}
      aria-label={ariaLabel}
      title={error ?? (liked ? "좋아요 취소" : "좋아요 (IP당 1회)")}
      className={
        "inline-flex items-center gap-1.5 text-xs font-mono " +
        "border border-border px-2 py-1 transition-colors " +
        "hover:bg-muted disabled:opacity-50 " +
        (liked ? "text-foreground bg-muted" : "text-muted-foreground") +
        " " + className
      }
    >
      <Heart
        className="w-3.5 h-3.5"
        strokeWidth={1.5}
        fill={liked ? "currentColor" : "none"}
        aria-hidden
      />
      <span>{count}</span>
    </button>
  )
}
