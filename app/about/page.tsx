import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

export const revalidate = 3600

export async function generateMetadata() {
  const { dict } = await getLocaleAndDict()
  return { title: `${translate(dict, "footer.about")} — ${translate(dict, "meta.site_name")}` }
}

export default async function AboutPage() {
  const { locale, dict } = await getLocaleAndDict()
  const t = (k: string) => translate(dict, k)

  const body = {
    ko: {
      intro:
        "promise999은 중앙선거관리위원회의 공식 데이터를 바탕으로, 한국의 선거 공약을 한곳에 모아 중립적으로 보여주는 공공 아카이브입니다.",
      why_title: "왜 만들었나",
      why_body:
        "지방선거 후보자의 공약 원문은 선관위에 존재하지만, 시민이 쉽게 찾아보거나 비교하기 어렵게 흩어져 있습니다. promise999은 이 데이터를 하나의 질서 있는 인터페이스로 묶어, 주소를 기준으로 내 투표용지를 보여주고, 같은 후보의 과거 공약까지 함께 확인할 수 있도록 합니다.",
      principles_title: "원칙",
      principles: [
        "공약 원문 그대로. AI는 해석이 아닌 요약·분류·번역 보조만.",
        "후보·정당의 우열을 판단하거나 효과를 평가하지 않습니다.",
        "모든 데이터는 중앙선거관리위원회 및 공공데이터포털의 공식 자료만 사용합니다.",
      ],
      roadmap_title: "로드맵",
      roadmap_items: [
        "Phase 1: 2022 지방선거 파일럿 + 다국어 기반 (현재)",
        "Phase 2: 전국 역대 선거 백필 + AI 분야 분류 + 공약 변화 추출",
        "Phase 3: 2026 제9회 지선 실시간 수집 + 내 투표소 찾기",
      ],
    },
    en: {
      intro:
        "promise999 is a public archive that collects Korean election pledges in one place, based on official data from Korea's National Election Commission (NEC).",
      why_title: "Why this exists",
      why_body:
        "Candidate pledges exist at the NEC, but they're scattered across formats and hard to compare. promise999 assembles them into one consistent interface — find your ballot by address, and trace the same candidate's pledges across multiple elections.",
      principles_title: "Principles",
      principles: [
        "Original pledges, verbatim. AI is used only for summarization, categorization, and translation assistance.",
        "We never rank candidates or parties or evaluate policy effectiveness.",
        "All data is sourced exclusively from the NEC and Korea's Public Data Portal.",
      ],
      roadmap_title: "Roadmap",
      roadmap_items: [
        "Phase 1: 2022 local election pilot + multilingual foundation (current)",
        "Phase 2: Nationwide historical backfill + AI categorization + pledge-change tracking",
        "Phase 3: 2026 9th local election real-time capture + polling station finder",
      ],
    },
    ja: {
      intro:
        "promise999は、中央選挙管理委員会の公式データをもとに、韓国の選挙公約を一か所に集めて中立的に見せる公共アーカイブです。",
      why_title: "なぜ作ったか",
      why_body:
        "候補者の公約原文は中央選挙管理委員会に存在しますが、市民が探して比較するには散らばっています。promise999はこれらを一つの一貫したインタフェースにまとめ、住所から投票用紙を確認し、同じ候補の過去の公約まで追跡できるようにします。",
      principles_title: "原則",
      principles: [
        "公約は原文のまま。AIは解釈ではなく要約・分類・翻訳の補助のみに使用。",
        "候補や政党の優劣を判断したり、政策の効果を評価したりしません。",
        "全てのデータは中央選挙管理委員会と公共データポータルの公式資料のみ使用。",
      ],
      roadmap_title: "ロードマップ",
      roadmap_items: [
        "Phase 1: 2022年地方選挙パイロット + 多言語基盤(現在)",
        "Phase 2: 全国歴代選挙のバックフィル + AI分野分類 + 公約変化の抽出",
        "Phase 3: 2026年第9回地方選挙のリアルタイム収集 + 投票所検索",
      ],
    },
    zh: {
      intro:
        "promise999 是基于韩国中央选举管理委员会官方数据,汇集韩国选举公约的中立公共档案。",
      why_title: "为何制作",
      why_body:
        "候选人公约原文存在于中央选举管理委员会,但分散难以比较。promise999 将其整合为统一界面,按地址查找选票,追踪同一候选人历届公约。",
      principles_title: "原则",
      principles: [
        "公约保持原文。AI 仅用于摘要、分类、翻译辅助,不作解读。",
        "不评判候选人和政党优劣,不评估政策效果。",
        "所有数据仅来自中央选举管理委员会与公共数据门户的官方资料。",
      ],
      roadmap_title: "路线图",
      roadmap_items: [
        "Phase 1: 2022 地方选举试点 + 多语言基础(当前)",
        "Phase 2: 全国历届选举回填 + AI 分类 + 公约变化追踪",
        "Phase 3: 2026 第9届地方选举实时采集 + 投票所查询",
      ],
    },
  } as const
  const c = body[locale] ?? body.ko

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[900px] mx-auto px-6 py-16 w-full">
        <h1 className="font-sans text-4xl font-semibold tracking-tight mb-6">
          {t("footer.about")}
        </h1>
        <p className="font-serif text-lg leading-relaxed text-muted-foreground mb-12">
          {c.intro}
        </p>

        <section className="mb-10">
          <h2 className="font-sans text-2xl font-semibold mb-4">{c.why_title}</h2>
          <p className="font-serif text-base leading-relaxed text-muted-foreground">{c.why_body}</p>
        </section>

        <section className="mb-10">
          <h2 className="font-sans text-2xl font-semibold mb-4">{c.principles_title}</h2>
          <ul className="space-y-3 font-serif text-base leading-relaxed text-muted-foreground">
            {c.principles.map((p, i) => (
              <li key={i} className="pl-4 border-l border-border">
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-sans text-2xl font-semibold mb-4">{c.roadmap_title}</h2>
          <ol className="space-y-3 font-serif text-base leading-relaxed text-muted-foreground list-none">
            {c.roadmap_items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-xs text-foreground shrink-0 mt-1">
                  0{i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="border-t border-border pt-6 mt-12">
          <p className="font-serif text-sm text-muted-foreground">
            {t("common.footer_disclaimer")}
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
