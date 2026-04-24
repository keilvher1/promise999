import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

export const revalidate = 3600

export async function generateMetadata() {
  const { dict } = await getLocaleAndDict()
  return { title: `${translate(dict, "footer.sources")} — ${translate(dict, "meta.site_name")}` }
}

const APIS = [
  {
    id: "15040587",
    ko: "선거공약 정보 조회",
    en: "Election Pledge Information",
    ja: "選挙公約情報照会",
    zh: "选举公约信息查询",
    url: "https://www.data.go.kr/data/15040587/openapi.do",
    svc: "ElecPrmsInfoInqireService",
  },
  {
    id: "15000908",
    ko: "후보자 정보 조회",
    en: "Candidate Information",
    ja: "候補者情報照会",
    zh: "候选人信息查询",
    url: "https://www.data.go.kr/data/15000908/openapi.do",
    svc: "PofelcddInfoInqireService",
  },
  {
    id: "15000864",
    ko: "당선인 정보 조회",
    en: "Elected Candidate Information",
    ja: "当選人情報照会",
    zh: "当选人信息查询",
    url: "https://www.data.go.kr/data/15000864/openapi.do",
    svc: "WinnerInfoInqireService2",
  },
  {
    id: "15000900",
    ko: "투·개표 정보 조회",
    en: "Vote & Count Information",
    ja: "投開票情報照会",
    zh: "投开票信息查询",
    url: "https://www.data.go.kr/data/15000900/openapi.do",
    svc: "VoteXmntckInfoInqireService2",
  },
  {
    id: "15000897",
    ko: "코드 정보 조회",
    en: "Code Information (elections, regions, parties)",
    ja: "コード情報照会",
    zh: "代码信息查询",
    url: "https://www.data.go.kr/data/15000897/openapi.do",
    svc: "CommonCodeService",
  },
  {
    id: "15000836",
    ko: "투표소 정보 조회",
    en: "Polling Station Information",
    ja: "投票所情報照会",
    zh: "投票所信息查询",
    url: "https://www.data.go.kr/data/15000836/openapi.do",
    svc: "PolplcInfoInqireService2",
  },
]

export default async function SourcesPage() {
  const { locale, dict } = await getLocaleAndDict()
  const t = (k: string) => translate(dict, k)
  const pickName = (row: typeof APIS[number]) =>
    (row as any)[locale] ?? row.ko

  const intro = {
    ko: "promise999의 모든 데이터는 중앙선거관리위원회의 공식 소스에서만 가져옵니다. 재배포·2차 가공 시에도 원본 링크를 함께 제공합니다.",
    en: "All data on promise999 comes exclusively from Korea's National Election Commission. Source links are always provided for any derived content.",
    ja: "promise999 の全てのデータは中央選挙管理委員会の公式ソースからのみ取得されます。再配布・二次加工の際も原本リンクを併記します。",
    zh: "promise999 的所有数据仅来自韩国中央选举管理委员会官方来源。再分发或二次加工时均附原始链接。",
  }[locale] ?? "promise999의 모든 데이터는 중앙선거관리위원회의 공식 소스에서만 가져옵니다."

  const contentSection = {
    ko: "공약 원문 PDF",
    en: "Original pledge PDFs",
    ja: "公約原文PDF",
    zh: "公约原文 PDF",
  }[locale] ?? "공약 원문 PDF"

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[1000px] mx-auto px-6 py-16 w-full">
        <h1 className="font-sans text-4xl font-semibold tracking-tight mb-6">
          {t("footer.sources")}
        </h1>
        <p className="font-serif text-lg leading-relaxed text-muted-foreground mb-12">
          {intro}
        </p>

        <section className="mb-14">
          <h2 className="font-sans text-2xl font-semibold mb-6">data.go.kr — Open API</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left font-sans font-medium p-3 border-b border-border w-20">ID</th>
                  <th className="text-left font-sans font-medium p-3 border-b border-border">Service</th>
                  <th className="text-left font-sans font-medium p-3 border-b border-border">Endpoint</th>
                </tr>
              </thead>
              <tbody>
                {APIS.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-mono text-xs">{row.id}</td>
                    <td className="p-3">
                      <a href={row.url} target="_blank" rel="noopener noreferrer" className="hover:underline font-serif">
                        {pickName(row)}
                      </a>
                    </td>
                    <td className="p-3 font-mono text-xs text-muted-foreground break-all">{row.svc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="font-sans text-2xl font-semibold mb-4">{contentSection}</h2>
          <p className="font-serif text-base leading-relaxed text-muted-foreground mb-4">
            <a
              href="https://policy.nec.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:no-underline"
            >
              policy.nec.go.kr
            </a>{" "}
            — 중앙선거관리위원회 정책·공약마당 (당선인·후보자·정당 공약 원문 PDF)
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
