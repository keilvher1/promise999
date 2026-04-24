import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

export const revalidate = 3600

export async function generateMetadata() {
  const { dict } = await getLocaleAndDict()
  return { title: `FAQ — ${translate(dict, "meta.site_name")}` }
}

const FAQ = {
  ko: [
    { q: "공약 원문은 어디서 오나요?", a: "모든 공약은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 및 공공데이터포털(data.go.kr)의 공식 Open API에서 가져옵니다. 해석이나 편집 없이 원문 그대로 표시합니다." },
    { q: "왜 낙선한 후보의 공약이 안 보이나요?", a: "선관위 공약 API는 '선거 종료 후에는 당선인 공약만 제공'하는 정책을 가집니다. 선거 진행 중에는 전 후보의 공약이 표시되지만, 종료된 선거는 당선인만 남습니다. 낙선자의 득표율은 별도 투·개표 API에서 계산해 채웁니다." },
    { q: "AI가 공약을 평가하거나 순위 매기나요?", a: "아니요. AI는 (1) 공약 분야 자동 분류, (2) 어려운 용어 풀이, (3) 동일 후보의 이전·현재 공약 변화 지점 추출에만 사용됩니다. 공약의 효과·타당성·실현 가능성을 판단하지 않습니다." },
    { q: "외국어 번역이 공식인가요?", a: "아닙니다. 공약 원문은 한국어로 선관위에 제출된 것이며, 번역은 참고용입니다. 정확한 해석이 필요한 경우 반드시 원문을 확인해 주세요." },
    { q: "오류나 개선 제안을 어디서 하나요?", a: "GitHub 이슈로 남겨주세요 — github.com/keilvher1/promise999" },
  ],
  en: [
    { q: "Where do pledges come from?", a: "All pledges come from Korea's National Election Commission official sources — policy.nec.go.kr and the Public Data Portal Open APIs. They are shown verbatim without editorial interpretation." },
    { q: "Why don't I see pledges for some candidates?", a: "The NEC pledge API only serves 'elected candidates' data after an election closes. During an active election all candidates are shown, but for past elections only the winner remains. Vote share for losing candidates comes from a separate vote-count API." },
    { q: "Does AI rank or evaluate pledges?", a: "No. AI is used only for (1) automatic topic categorization, (2) glossary definitions, and (3) extracting change points between the same candidate's past and current pledges. It never judges effectiveness or feasibility." },
    { q: "Are the translations official?", a: "No. Original pledges are submitted in Korean. Translations are reference only — always consult the original for exact meaning." },
    { q: "How do I report errors?", a: "Please open an issue at github.com/keilvher1/promise999" },
  ],
  ja: [
    { q: "公約原文はどこから来ますか?", a: "全ての公約は中央選挙管理委員会の政策・公約マダン(policy.nec.go.kr)と公共データポータル(data.go.kr)の公式オープンAPIから取得します。解釈や編集なしに原文のまま表示します。" },
    { q: "なぜ一部候補の公約が見えませんか?", a: "選挙管理委員会の公約APIは選挙終了後は「当選者の公約のみ」提供します。選挙期間中は全候補の公約が表示されますが、終了済み選挙では当選者のみ残ります。落選者の得票率は投開票APIから計算して補充します。" },
    { q: "AIは公約を評価したりランク付けしますか?", a: "いいえ。AIは(1)公約分野の自動分類、(2)用語解説、(3)同一候補の過去・現在の公約変化点抽出のみに使用します。政策の有効性や実現可能性は判断しません。" },
    { q: "翻訳は公式ですか?", a: "いいえ。公約原文は韓国語で提出されたもので、翻訳は参考用です。正確な解釈が必要な場合は必ず原文をご確認ください。" },
    { q: "エラー報告や改善提案は?", a: "GitHubイシューでお願いします — github.com/keilvher1/promise999" },
  ],
  zh: [
    { q: "公约原文来自哪里?", a: "所有公约均来自韩国中央选举管理委员会政策·公约广场(policy.nec.go.kr)与公共数据门户(data.go.kr)的官方开放API。按原文呈现,不做编辑解读。" },
    { q: "为什么看不到部分候选人的公约?", a: "选举管理委员会公约API在选举结束后仅提供当选人数据。选举期间可见全部候选人公约,已结束选举仅保留当选人。落选者得票率由投开票API另行计算补充。" },
    { q: "AI 会评价或排名公约吗?", a: "不会。AI 仅用于:(1)公约分类,(2)术语解释,(3)同一候选人历届公约变化提取。不判断有效性或可行性。" },
    { q: "翻译是官方的吗?", a: "不是。公约原文以韩语提交,译文仅供参考。如需准确理解请务必参阅原文。" },
    { q: "如何反馈错误?", a: "请在 GitHub 提交 issue — github.com/keilvher1/promise999" },
  ],
} as const

export default async function FaqPage() {
  const { locale, dict } = await getLocaleAndDict()
  const t = (k: string) => translate(dict, k)
  const items = FAQ[locale] ?? FAQ.ko

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[900px] mx-auto px-6 py-16 w-full">
        <h1 className="font-sans text-4xl font-semibold tracking-tight mb-12">FAQ</h1>
        <dl className="divide-y divide-border border-t border-b border-border">
          {items.map((item, i) => (
            <div key={i} className="py-6">
              <dt className="font-sans text-lg font-medium mb-3 flex gap-3">
                <span className="font-mono text-sm text-muted-foreground shrink-0 mt-1">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <span>{item.q}</span>
              </dt>
              <dd className="font-serif text-base leading-relaxed text-muted-foreground pl-10">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-12">
          <p className="font-serif text-sm text-muted-foreground">
            {t("common.footer_source")}
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
