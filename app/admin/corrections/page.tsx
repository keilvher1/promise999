import Link from "next/link"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/admin"
import { ResolveButton } from "./resolve-button"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "admin · corrections — promise999",
  robots: "noindex,nofollow",
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const STATUS_LABEL: Record<string, string> = {
  open: "접수",
  investigating: "조사 중",
  fixed: "수정완료",
  rejected: "반려",
  duplicate: "중복",
}
const CATEGORY_LABEL: Record<string, string> = {
  factual: "사실오류",
  typo: "오타",
  translation: "번역",
  outdated: "시효지남",
  source: "출처부족",
  feature: "기능제안",
  other: "기타",
}

export default async function AdminCorrectionsPage({ searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/admin/login")
  const { status = "open" } = await searchParams

  const rows = (status === "all"
    ? await sql`
        SELECT id, target_kind, target_id, category, body, source_url, contact_email,
               status, admin_note, resolved_at::text, created_at::text
          FROM corrections
         ORDER BY created_at DESC LIMIT 100
      `
    : await sql`
        SELECT id, target_kind, target_id, category, body, source_url, contact_email,
               status, admin_note, resolved_at::text, created_at::text
          FROM corrections
         WHERE status = ${status}::correction_status
         ORDER BY created_at DESC LIMIT 100
      `) as any[]

  const filters = ["open", "investigating", "fixed", "rejected", "all"]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-lg font-semibold">admin · corrections</h1>
            <p className="font-mono text-xs text-muted-foreground">{rows.length}건 ({status})</p>
          </div>
          <Link href="/admin" className="text-sm font-mono text-muted-foreground hover:text-foreground">
            ← dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-6 space-y-4">
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <Link
              key={f}
              href={`/admin/corrections?status=${f}`}
              className={
                "text-xs font-mono border px-3 py-1 transition-colors " +
                (status === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted")
              }
            >
              {f === "all" ? "전체" : STATUS_LABEL[f] ?? f}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="border border-border p-8 text-center text-sm text-muted-foreground">
            데이터 없음
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r: any) => {
              const targetHref =
                r.target_kind === "candidacy" ? `/candidates/${r.target_id}` :
                r.target_kind === "election"  ? `/elections/${r.target_id}` :
                null
              return (
                <li key={r.id} className="border border-border p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="border border-border px-2 py-0.5 text-muted-foreground">
                      #{r.id}
                    </span>
                    <span className={
                      "px-2 py-0.5 border " +
                      (r.status === "open" ? "border-foreground" :
                       r.status === "investigating" ? "border-foreground animate-pulse" :
                       r.status === "fixed" ? "border-foreground bg-foreground text-background" :
                       r.status === "rejected" ? "border-destructive text-destructive" :
                       "border-border text-muted-foreground")
                    }>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                    <span className="border border-border px-2 py-0.5 text-muted-foreground">
                      {CATEGORY_LABEL[r.category] ?? r.category}
                    </span>
                    <span className="text-muted-foreground">
                      {r.target_kind}{r.target_id ? `#${r.target_id}` : ""}
                    </span>
                    {targetHref && (
                      <Link href={targetHref} className="text-muted-foreground hover:text-foreground underline" target="_blank">
                        대상 보기 ↗
                      </Link>
                    )}
                    <span className="ml-auto text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>

                  <p className="font-sans text-sm whitespace-pre-wrap">{r.body}</p>

                  {(r.source_url || r.contact_email) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                      {r.source_url && (
                        <a href={r.source_url} target="_blank" rel="noopener noreferrer"
                           className="hover:text-foreground underline">
                          출처: {r.source_url.length > 60 ? r.source_url.slice(0, 60) + "…" : r.source_url}
                        </a>
                      )}
                      {r.contact_email && (
                        <a href={`mailto:${r.contact_email}`} className="hover:text-foreground underline">
                          ✉ {r.contact_email}
                        </a>
                      )}
                    </div>
                  )}

                  {r.admin_note && (
                    <p className="font-sans text-xs text-muted-foreground border-l-2 border-border pl-3">
                      관리자 메모: {r.admin_note}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <ResolveButton id={r.id} currentStatus={r.status} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
