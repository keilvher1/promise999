import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

export const revalidate = 3600

export async function generateMetadata() {
  const { dict } = await getLocaleAndDict()
  return { title: `API — ${translate(dict, "meta.site_name")}` }
}

export default async function ApiDocsPage() {
  const { locale, dict } = await getLocaleAndDict()
  const t = (k: string) => translate(dict, k)

  const intro = {
    ko: "promise999의 공용 HTTP API는 현재 계획 단계입니다. 당장 데이터가 필요하시면 공공데이터포털의 원본 API를 직접 사용하는 편이 빠릅니다.",
    en: "A public HTTP API for promise999 is planned. For immediate data access, please use Korea's Public Data Portal APIs directly.",
    ja: "promise999 の公開 HTTP API は現在計画中です。すぐにデータが必要な場合は、公共データポータルの元 API を直接ご利用ください。",
    zh: "promise999 的公共 HTTP API 正在规划中。如需立即获取数据,请直接使用韩国公共数据门户的原始 API。",
  }[locale] ?? "promise999의 공용 HTTP API는 현재 계획 단계입니다."

  const plannedTitle = {
    ko: "제공 예정 엔드포인트 (Phase 2)",
    en: "Planned endpoints (Phase 2)",
    ja: "提供予定エンドポイント (Phase 2)",
    zh: "计划提供的端点 (Phase 2)",
  }[locale] ?? "제공 예정"

  const plannedRows = [
    { method: "GET", path: "/api/v1/elections", desc: { ko: "전체 선거 목록", en: "All elections", ja: "全選挙リスト", zh: "所有选举" } },
    { method: "GET", path: "/api/v1/elections/:sg_id", desc: { ko: "선거 상세 + 하위 선거 + 후보자", en: "Election detail + sub-elections + candidates", ja: "選挙詳細 + 下位選挙 + 候補者", zh: "选举详情 + 子选举 + 候选人" } },
    { method: "GET", path: "/api/v1/candidates/:id", desc: { ko: "후보자 프로필 + 공약", en: "Candidate profile + pledges", ja: "候補者プロフィール + 公約", zh: "候选人简介 + 公约" } },
    { method: "GET", path: "/api/v1/candidates/search?q=", desc: { ko: "후보자 이름·정당 검색", en: "Search by name/party", ja: "名前·政党で検索", zh: "按姓名/政党搜索" } },
    { method: "GET", path: "/api/v1/pledges/:id", desc: { ko: "공약 항목 단건", en: "Single pledge item", ja: "公約項目1件", zh: "单条公约" } },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[1000px] mx-auto px-6 py-16 w-full">
        <h1 className="font-sans text-4xl font-semibold tracking-tight mb-6">
          API
        </h1>
        <p className="font-serif text-lg leading-relaxed text-muted-foreground mb-12">
          {intro}
        </p>

        <section className="mb-12">
          <h2 className="font-sans text-2xl font-semibold mb-6">{plannedTitle}</h2>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <tbody>
                {plannedRows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-xs w-14 text-muted-foreground">{r.method}</td>
                    <td className="p-3 font-mono text-xs">{r.path}</td>
                    <td className="p-3 font-serif text-sm text-muted-foreground">
                      {r.desc[locale] ?? r.desc.ko}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-sans text-2xl font-semibold mb-4">Upstream APIs</h2>
          <p className="font-serif text-base leading-relaxed text-muted-foreground mb-4">
            <a
              href="/sources"
              className="underline underline-offset-4 hover:no-underline"
            >
              /sources
            </a>{" "}
            — {locale === "en" ? "See the full list of 6 upstream APIs from data.go.kr we use." : "data.go.kr 에서 사용하는 6개 상위 API 전체 목록."}
          </p>
        </section>

        <div className="border-t border-border pt-6 mt-8">
          <p className="font-serif text-sm text-muted-foreground">
            {t("common.footer_source")}
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
