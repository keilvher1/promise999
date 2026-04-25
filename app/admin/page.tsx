import Link from "next/link"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/admin"
import { LogoutButton } from "./logout-button"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "admin · dashboard — promise999",
  robots: "noindex,nofollow",
}

interface Stat {
  label: string
  value: number | string
  href?: string
}

export default async function AdminDashboardPage() {
  if (!(await isAdmin())) redirect("/admin/login")

  // KPI들 — 빠른 COUNT()
  const [coreCounts, forum, likes, search, jobs] = await Promise.all([
    sql`
      SELECT
        (SELECT COUNT(*) FROM elections)::int        AS elections,
        (SELECT COUNT(*) FROM sub_elections)::int    AS sub_elections,
        (SELECT COUNT(*) FROM candidacies)::int      AS candidacies,
        (SELECT COUNT(*) FROM pledges)::int          AS pledges,
        (SELECT COUNT(*) FROM pledge_items)::int     AS pledge_items,
        (SELECT COUNT(*) FROM persons)::int          AS persons,
        (SELECT COUNT(*) FROM parties)::int          AS parties
    ` as Promise<any[]>,
    sql`
      SELECT
        (SELECT COUNT(*) FROM forum_threads)::int                                    AS total_threads,
        (SELECT COUNT(*) FROM forum_threads WHERE is_hidden=1)::int                  AS hidden_threads,
        (SELECT COUNT(*) FROM forum_replies)::int                                    AS total_replies,
        (SELECT COUNT(*) FROM forum_reports WHERE resolved=0)::int                   AS pending_reports,
        (SELECT COUNT(*) FROM forum_threads
            WHERE created_at > NOW() - INTERVAL '24 hours')::int                     AS threads_24h
    ` as Promise<any[]>,
    sql`SELECT COUNT(*)::int AS total FROM pledge_likes` as Promise<any[]>,
    sql`
      SELECT COUNT(*)::int AS total,
             (SELECT COUNT(*) FROM search_log
              WHERE created_at > NOW() - INTERVAL '24 hours')::int AS last_24h
        FROM search_log
    ` as Promise<any[]>,
    sql`
      SELECT id, source, endpoint, status,
             items_fetched, started_at::text AS started, finished_at::text AS finished
        FROM crawl_jobs
       ORDER BY id DESC
       LIMIT 8
    ` as Promise<any[]>,
  ])

  const c = coreCounts[0] ?? {}
  const f = forum[0] ?? {}
  const s = search[0] ?? {}

  const stats: Stat[] = [
    { label: "선거", value: c.elections ?? 0 },
    { label: "후보", value: c.candidacies ?? 0 },
    { label: "공약 묶음", value: c.pledges ?? 0 },
    { label: "공약 항목", value: c.pledge_items ?? 0 },
    { label: "정당", value: c.parties ?? 0 },
    { label: "인물", value: c.persons ?? 0 },
    { label: "토론 글 (전체)", value: f.total_threads ?? 0, href: "/admin/forum" },
    { label: "토론 글 (24h)", value: f.threads_24h ?? 0 },
    { label: "댓글", value: f.total_replies ?? 0 },
    { label: "신고 미처리", value: f.pending_reports ?? 0, href: "/admin/forum?filter=reports" },
    { label: "숨김 글", value: f.hidden_threads ?? 0, href: "/admin/forum?filter=hidden" },
    { label: "공약 좋아요", value: likes[0]?.total ?? 0 },
    { label: "검색 (전체)", value: s.total ?? 0 },
    { label: "검색 (24h)", value: s.last_24h ?? 0 },
  ]

  // 최근 검색어 TOP 10
  const trending = (await sql`
    WITH r AS (
      SELECT query_norm, query, created_at FROM search_log
       WHERE created_at > NOW() - INTERVAL '7 days'
         AND char_length(query_norm) >= 2
    ),
    cnt AS (SELECT query_norm, COUNT(*)::int AS hits FROM r GROUP BY query_norm),
    lbl AS (SELECT DISTINCT ON (query_norm) query_norm, query AS display
              FROM r ORDER BY query_norm, created_at DESC)
    SELECT cnt.query_norm AS norm, lbl.display AS label, cnt.hits
      FROM cnt JOIN lbl USING (query_norm)
     ORDER BY cnt.hits DESC, lbl.display
     LIMIT 10
  `) as { norm: string; label: string; hits: number }[]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-lg font-semibold">admin · dashboard</h1>
            <p className="font-mono text-xs text-muted-foreground">promise999</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-mono">
            <Link href="/admin/forum" className="text-muted-foreground hover:text-foreground">forum</Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">site →</Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-8 space-y-10">
        <section>
          <h2 className="font-sans text-base font-semibold mb-4">현황</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {stats.map(s => (
              <li
                key={s.label}
                className="border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                {s.href ? (
                  <Link href={s.href} className="block">
                    <div className="font-mono text-2xl tabular-nums">{s.value}</div>
                    <div className="font-sans text-xs text-muted-foreground mt-1">{s.label}</div>
                  </Link>
                ) : (
                  <>
                    <div className="font-mono text-2xl tabular-nums">{s.value}</div>
                    <div className="font-sans text-xs text-muted-foreground mt-1">{s.label}</div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-sans text-base font-semibold mb-3">실시간 검색어 (7일)</h2>
            {trending.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono">데이터 없음</p>
            ) : (
              <ol className="border-t border-border">
                {trending.map((t, i) => (
                  <li key={t.norm} className="border-b border-border py-2 px-1 flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground w-6 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-sm flex-1">{t.label}</span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">{t.hits}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div>
            <h2 className="font-sans text-base font-semibold mb-3">크롤 jobs (최근 8건)</h2>
            {jobs.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono">데이터 없음</p>
            ) : (
              <ul className="border-t border-border">
                {jobs.map((j: any) => (
                  <li key={j.id} className="border-b border-border py-2 px-1 flex items-center gap-3 text-xs font-mono">
                    <span className="text-muted-foreground w-12 tabular-nums">#{j.id}</span>
                    <span
                      className={
                        "px-2 py-0.5 border " +
                        (j.status === "success" ? "border-foreground" :
                         j.status === "running" ? "border-foreground animate-pulse" :
                         j.status === "error"   ? "border-destructive text-destructive" :
                         "border-border text-muted-foreground")
                      }
                    >
                      {j.status}
                    </span>
                    <span className="flex-1 truncate">{j.endpoint}</span>
                    <span className="text-muted-foreground tabular-nums">{j.items_fetched ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
