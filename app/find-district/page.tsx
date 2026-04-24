import Link from "next/link"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

export const revalidate = 3600

export async function generateMetadata() {
  const { dict } = await getLocaleAndDict()
  return { title: `${translate(dict, "landing.find_my_district")} — ${translate(dict, "meta.site_name")}` }
}

export default async function FindDistrictPage() {
  const { locale, dict } = await getLocaleAndDict()
  const t = (k: string) => translate(dict, k)

  const copy = {
    ko: {
      intro: "주소를 입력하면 내 선거구와 그 선거의 투표용지를 바로 보여주는 기능을 개발 중입니다. 현재는 선거를 직접 선택하여 확인하실 수 있습니다.",
      how_title: "현재 이용 방법",
      how_items: [
        "상단 내비게이션의 '선거' 에서 원하는 선거를 선택합니다.",
        "선거 페이지의 투표용지 카드에서 선거구·유형을 확인합니다.",
        "각 후보의 '공약 보기' 링크로 상세 공약과 이력을 확인합니다.",
      ],
      coming_title: "곧 제공될 기능 (Phase 3)",
      coming_items: [
        "행정동 자동완성으로 주소 입력 → 내 선거구 자동 매칭",
        "내가 투표할 7종 투표용지를 한 화면에 나란히",
        "가장 가까운 사전투표소·선거일투표소 위치",
      ],
      cta: "제8회 지선(2022) 바로 보기",
    },
    en: {
      intro: "An address-based ballot finder is under development. For now, please pick an election manually to see its ballot breakdown.",
      how_title: "How to use it today",
      how_items: [
        "Pick an election from the 'Elections' nav above.",
        "On the election page, check each ballot card for district and type.",
        "Click 'View pledges' on a candidate to see detailed pledges and history.",
      ],
      coming_title: "Coming in Phase 3",
      coming_items: [
        "Address autocomplete → automatic ballot lookup",
        "All 7 ballots you will receive, side-by-side on one screen",
        "Your nearest early-voting and election-day polling stations",
      ],
      cta: "Jump to 2022 Local Election",
    },
    ja: {
      intro: "住所から選挙区と投票用紙を即座に表示する機能を開発中です。現在は選挙を手動で選んでご確認ください。",
      how_title: "現在の使い方",
      how_items: [
        "上部ナビの「選挙」から選挙を選びます。",
        "選挙ページの投票用紙カードで選挙区・種類を確認。",
        "「公約を見る」リンクで詳細公約と履歴を確認。",
      ],
      coming_title: "Phase 3 で提供予定",
      coming_items: [
        "住所オートコンプリート → 選挙区自動マッチング",
        "投票する全7種類の投票用紙を1画面に並べて表示",
        "最寄りの事前投票所・選挙日投票所の位置",
      ],
      cta: "第8回地方選挙(2022)を見る",
    },
    zh: {
      intro: "按地址查找选区和选票的功能正在开发中。目前请手动选择选举查看。",
      how_title: "当前使用方式",
      how_items: [
        "从上方导航的 '选举' 选择一场选举。",
        "在选举页面的选票卡片中查看选区与类型。",
        "点击候选人 '查看公约' 查看详细公约与履历。",
      ],
      coming_title: "Phase 3 将推出",
      coming_items: [
        "地址自动补全 → 自动匹配选区",
        "将收到的 7 种选票并排显示",
        "最近的事前投票所与选举日投票所位置",
      ],
      cta: "跳转到 2022 地方选举",
    },
  }[locale] ?? undefined

  const c = copy ?? {
    intro: "기능 개발 중입니다.",
    how_title: "이용 방법",
    how_items: [] as string[],
    coming_title: "",
    coming_items: [] as string[],
    cta: "선거 보기",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[900px] mx-auto px-6 py-16 w-full">
        <h1 className="font-sans text-4xl font-semibold tracking-tight mb-6">
          {t("landing.find_my_district")}
        </h1>
        <p className="font-serif text-lg leading-relaxed text-muted-foreground mb-12">
          {c.intro}
        </p>

        <section className="mb-10">
          <h2 className="font-sans text-2xl font-semibold mb-4">{c.how_title}</h2>
          <ol className="space-y-3 font-serif text-base leading-relaxed text-muted-foreground list-none">
            {c.how_items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-xs text-foreground shrink-0 mt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>

        {c.coming_title && (
          <section className="mb-10 border border-border bg-secondary/40 p-6">
            <h2 className="font-sans text-xl font-semibold mb-3">{c.coming_title}</h2>
            <ul className="space-y-2 font-serif text-sm leading-relaxed text-muted-foreground">
              {c.coming_items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-foreground">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12">
          <Link
            href="/elections/0020220601"
            className="inline-block border border-foreground bg-foreground text-background px-6 py-3 font-sans text-sm hover:bg-gray-700 transition-colors"
          >
            {c.cta} →
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
