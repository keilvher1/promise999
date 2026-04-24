import Link from "next/link"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { listElections } from "@/lib/queries"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

export const revalidate = 600

export async function generateMetadata() {
  const { dict } = await getLocaleAndDict()
  return {
    title: `${translate(dict, "nav.elections")} — ${translate(dict, "meta.site_name")}`,
  }
}

export default async function ElectionsListPage() {
  const { dict } = await getLocaleAndDict()
  const t = (k: string, v?: any) => translate(dict, k, v)

  let elections: Awaited<ReturnType<typeof listElections>> = []
  try {
    elections = await listElections()
  } catch (err) {
    console.error("[elections list] Neon 조회 실패:", err)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1 max-w-[1100px] mx-auto px-6 py-12 w-full">
        <header className="mb-10">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground">
            {t("nav.elections")}
          </h1>
          <p className="mt-2 font-serif text-base text-muted-foreground">
            {elections.length > 0
              ? t("elections_list.subtitle", { count: elections.length })
              : t("elections_list.empty")}
          </p>
        </header>

        {elections.length === 0 ? (
          <div className="border border-border p-8 text-center">
            <p className="font-serif text-sm text-muted-foreground">
              {t("common.no_data")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-b border-border">
            {elections.map((e) => (
              <li key={e.sg_id} className="py-5">
                <Link
                  href={`/elections/${e.sg_id}`}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 group"
                >
                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-24">
                    {e.election_date}
                  </span>
                  <span className="font-sans text-lg font-medium text-foreground flex-1 group-hover:underline underline-offset-2">
                    {e.name}
                  </span>
                  <span className="font-sans text-xs text-muted-foreground shrink-0 font-mono">
                    {e.sub_count > 0
                      ? t("elections_list.sub_count", { count: e.sub_count })
                      : "—"}
                  </span>
                  <span className="font-sans text-xs text-muted-foreground shrink-0 font-mono">
                    {e.candidate_count > 0
                      ? t("elections_list.candidate_count", { count: e.candidate_count })
                      : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 border border-border bg-secondary/40 p-4 text-xs font-serif text-muted-foreground leading-relaxed">
          {t("common.footer_source")}
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
