import Link from "next/link"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/admin"
import { ModerateButton } from "./moderate-button"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "admin · forum — promise999",
  robots: "noindex,nofollow",
}

interface PageProps {
  searchParams: Promise<{ filter?: string; limit?: string }>
}

export default async function AdminForumPage({ searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/admin/login")
  const { filter = "all", limit: limitS = "50" } = await searchParams
  const limit = Math.min(Math.max(parseInt(limitS, 10) || 50, 10), 200)

  // 필터별 SQL
  let rows: any[]
  if (filter === "hidden") {
    rows = (await sql`
      SELECT id, target_kind, target_id, title, body, author_nick,
             is_hidden, hide_reason, reply_count, report_count,
             upvotes, downvotes, created_at::text
        FROM forum_threads
       WHERE is_hidden = 1
       ORDER BY created_at DESC LIMIT ${limit}
    `) as any[]
  } else if (filter === "reports") {
    rows = (await sql`
      SELECT t.id, t.target_kind, t.target_id, t.title, t.body, t.author_nick,
             t.is_hidden, t.hide_reason, t.reply_count, t.report_count,
             t.upvotes, t.downvotes, t.created_at::text
        FROM forum_threads t
       WHERE t.report_count > 0
       ORDER BY t.report_count DESC, t.created_at DESC LIMIT ${limit}
    `) as any[]
  } else {
    rows = (await sql`
      SELECT id, target_kind, target_id, title, body, author_nick,
             is_hidden, hide_reason, reply_count, report_count,
             upvotes, downvotes, created_at::text
        FROM forum_threads
       ORDER BY created_at DESC LIMIT ${limit}
    `) as any[]
  }

  const filters: { key: string; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "reports", label: "신고된 글" },
    { key: "hidden", label: "숨김 처리됨" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-lg font-semibold">admin · forum</h1>
            <p className="font-mono text-xs text-muted-foreground">{rows.length}건</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-mono">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">← dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-6 space-y-4">
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <Link
              key={f.key}
              href={`/admin/forum?filter=${f.key}`}
              className={
                "text-xs font-mono border px-3 py-1 transition-colors " +
                (filter === f.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted")
              }
            >
              {f.label}
            </Link>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="border border-border p-8 text-center text-sm text-muted-foreground">
            데이터 없음
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((t) => (
              <li key={t.id} className="border border-border p-4 flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/forum/${t.id}`}
                    className="font-sans text-base text-foreground hover:underline line-clamp-1 flex-1"
                  >
                    {t.title}
                  </Link>
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(t.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="font-sans text-sm text-muted-foreground line-clamp-2">{t.body}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-muted-foreground">{t.author_nick}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{t.target_kind}{t.target_id ? `#${t.target_id}` : ""}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>댓글 {t.reply_count}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>▲ {t.upvotes}</span>
                  <span>▼ {t.downvotes}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className={t.report_count > 0 ? "text-destructive" : "text-muted-foreground"}>
                    🚩 {t.report_count}
                  </span>
                  {t.is_hidden === 1 && (
                    <span className="border border-destructive text-destructive px-2 py-0.5">
                      hidden{t.hide_reason ? ` · ${t.hide_reason}` : ""}
                    </span>
                  )}
                  <span className="ml-auto" />
                  <ModerateButton id={t.id} kind="thread" hidden={t.is_hidden === 1} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
