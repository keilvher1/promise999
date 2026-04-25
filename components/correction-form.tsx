"use client"

import { useState, useTransition } from "react"
import { Flag, X } from "lucide-react"

interface Props {
  /** 정정요청 대상 종류 */
  targetKind: "candidacy" | "pledge" | "pledge_item" | "election" | "sub_election" | "general"
  /** general이면 생략 */
  targetId?: number
  /** 트리거 버튼 라벨. 미지정 시 작은 깃발 아이콘 + "정정요청" */
  triggerLabel?: string
  /** 트리거 클래스 */
  triggerClassName?: string
  /** 모달이 닫혀있을 때 보이는 컨텍스트 라벨 (예: "이재명 후보 프로필") */
  contextLabel?: string
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "factual",    label: "사실 오류 (이름·정당·소속·날짜 등)" },
  { value: "typo",       label: "오타·표기" },
  { value: "translation",label: "번역 오류" },
  { value: "outdated",   label: "오래된/시효 지난 정보" },
  { value: "source",     label: "출처·근거 부족" },
  { value: "feature",    label: "기능 제안" },
  { value: "other",      label: "기타" },
]

export function CorrectionForm({
  targetKind,
  targetId,
  triggerLabel,
  triggerClassName = "",
  contextLabel,
}: Props) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState("factual")
  const [body, setBody] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (body.trim().length < 10) {
      setError("내용을 10자 이상 입력해주세요.")
      return
    }
    const res = await fetch("/api/corrections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_kind: targetKind,
        target_id: targetId,
        category,
        body,
        source_url: sourceUrl || undefined,
        contact_email: email || undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error ?? "오류")
      return
    }
    setDone(true)
    setBody(""); setSourceUrl(""); setEmail("")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setDone(false) }}
        className={
          "inline-flex items-center gap-1.5 text-xs font-mono " +
          "border border-border px-2 py-1 hover:bg-muted transition-colors " +
          "text-muted-foreground hover:text-foreground " + triggerClassName
        }
      >
        <Flag className="w-3 h-3" strokeWidth={1.5} aria-hidden />
        <span>{triggerLabel ?? "정정요청 / 문의"}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="정정요청"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-background border border-border max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-serif text-lg">정정요청 / 문의</h2>
                {contextLabel && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{contextLabel}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {done ? (
              <div className="p-6 space-y-3">
                <p className="font-sans text-sm">
                  접수되었습니다. 검토 후 반영됩니다. 감사합니다.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-sans text-sm border border-border px-3 py-1.5 hover:bg-muted"
                >
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="font-sans text-xs text-muted-foreground">분류</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent border border-border py-1.5 px-2 font-sans text-sm focus:outline-none focus:border-foreground"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs text-muted-foreground">
                    내용 (10–4000자)
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    maxLength={4000}
                    placeholder="무엇이 잘못됐고, 정확한 정보는 무엇인지 구체적으로 알려주세요."
                    className="w-full bg-transparent border border-border py-2 px-2 font-sans text-sm focus:outline-none focus:border-foreground resize-y"
                  />
                  <div className="text-right text-[10px] font-mono text-muted-foreground">
                    {body.length}/4000
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs text-muted-foreground">
                    출처 URL (선택) — 근거가 되는 기사·공식문서 링크
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    maxLength={500}
                    placeholder="https://..."
                    className="w-full bg-transparent border border-border py-1.5 px-2 font-mono text-xs focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs text-muted-foreground">
                    연락 이메일 (선택) — 답신을 받고 싶다면 입력
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={200}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border border-border py-1.5 px-2 font-mono text-xs focus:outline-none focus:border-foreground"
                  />
                </div>

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="font-sans text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="font-sans text-sm border border-foreground bg-foreground text-background px-3 py-1.5 disabled:opacity-50"
                  >
                    제출
                  </button>
                </div>

                <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                  접수된 정정요청은 검토 후 반영되며, 동일 IP는 분당 3건으로 제한됩니다.
                  IP는 SHA-256 해시로 저장되어 영구 식별 불가.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
