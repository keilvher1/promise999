import { headers } from "next/headers"
import Link from "next/link"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { listCandidacies } from "@/lib/queries"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"
import { sql } from "@/lib/db"
import { ipFromHeaders, makeVoterHash } from "@/lib/likes"

// 검색 결과는 q 파라미터에 의존하므로 캐시하지 않음
export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { dict } = await getLocaleAndDict()
  const { q } = await searchParams
  return {
    title: q
      ? `"${q}" — ${translate(dict, "nav.candidates")}`
      : `${translate(dict, "nav.candidates")} — ${translate(dict, "meta.site_name")}`,
  }
}

export default async function CandidatesListPage({ searchParams }: PageProps) {
  const { dict } = await getLocaleAndDict()
  const t = (k: string, v?: any) => translate(dict, k, v)
  const { q = "" } = await searchParams

  let rows: Awaited<ReturnType<typeof listCandidacies>> = []
  try {
    rows = await listCandidacies({ q, limit: 50 })
  } catch (err) {
    console.error("[candidates list] Neon 조회 실패:", err)
  }

  // 검색어 로그 기록 (실시간/연관 검색어 집계용). 실패해도 페이지는 정상.
  const trimmed = q.trim()
  if (trimmed.length >= 1 && trimmed.length <= 200) {
    try {
      const h = await headers()
      const ip = ipFromHeaders(h)
      const voter = makeVoterHash(ip)
      const norm = trimmed.toLowerCase()
      await sql`
        INSERT INTO search_log(query, query_norm, voter_hash, result_count)
        VALUES (${trimmed}, ${norm}, ${voter}, ${rows.length})
      `
    } catch (err) {
      console.error("[search_log] insert 실패:", err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1 max-w-[1100px] mx-auto px-6 py-12 w-full">
        <header className="mb-8">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground">
            {t("nav.candidates")}
          </h1>
          <p className="mt-2 font-serif text-base text-muted-foreground">
            {t("candidates_list.subtitle")}
          </p>
        </header>

        <form method="GET" className="mb-8 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t("landing.search_placeholder")}
            className="flex-1 border border-border px-4 py-2 font-sans text-sm bg-background focus:outline-none focus:border-foreground"
            aria-label={t("landing.search_placeholder")}
          />
          <button
            type="submit"
            className="border border-foreground bg-foreground text-background px-4 py-2 font-sans text-sm"
          >
            {t("candidates_list.search_button")}
          </button>
        </form>

        {rows.length === 0 ? (
          <div className="border border-border p-8 text-center">
            <p className="font-serif text-sm text-muted-foreground">
              {q
                ? t("candidates_list.no_results", { q })
                : t("common.no_data")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-b border-border">
            {rows.map((r) => (
              <li key={r.id} className="py-4 hover:bg-secondary/50 transition-colors">
                <Link
                  href={`/candidates/${r.id}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group"
                >
                  <span
                    aria-label={r.is_elected === 1 ? t("election.elected") : undefined}
                    className={
                      "w-3 h-3 shrink-0 border border-foreground " +
                      (r.is_elected === 1 ? "bg-foreground" : "bg-transparent")
                    }
                  />
                  <span className="font-sans text-base font-medium text-foreground w-24 shrink-0 group-hover:underline underline-offset-2">
                    {r.name}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 border border-border rounded-sm font-mono text-xs text-muted-foreground shrink-0">
                    {r.party}
                  </span>
                  <span className="font-serif text-sm text-muted-foreground flex-1">
                    {r.election_name} · {r.sub_type_name}
                  </span>
                  {r.vote_pct != null && (
                    <span className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
                      {r.vote_pct}%
                    </span>
                  )}
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {r.pledge_count > 0
                      ? t("candidates_list.has_pledges", { n: r.pledge_count })
                      : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <LandingFooter />
    </div>
  )
}
