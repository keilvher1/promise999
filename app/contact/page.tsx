import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { getLocaleAndDict } from "@/lib/i18n/server"
import { translate } from "@/lib/i18n/dictionaries"

export const revalidate = 3600

export async function generateMetadata() {
  const { dict } = await getLocaleAndDict()
  return { title: `${translate(dict, "footer.contact")} — ${translate(dict, "meta.site_name")}` }
}

export default async function ContactPage() {
  const { locale, dict } = await getLocaleAndDict()
  const t = (k: string) => translate(dict, k)

  const copy = {
    ko: {
      intro: "promise999은 한 명의 개발자가 공익 목적으로 운영하는 오픈소스 프로젝트입니다. 아래 경로로 연락해 주세요.",
      issues_title: "버그 · 기능 제안",
      issues_body: "GitHub Issues에서 제보하시는 것이 가장 빠릅니다.",
      contribute_title: "기여",
      contribute_body: "Pull Request 환영. 기여 가이드는 레포 README를 참고하세요.",
      press_title: "언론·제휴 문의",
      press_body: "GitHub Issues에 'press' 라벨로 남겨 주세요.",
    },
    en: {
      intro: "promise999 is an open-source public-interest project run by a single developer. Please reach out through the channels below.",
      issues_title: "Bug reports & feature requests",
      issues_body: "GitHub Issues is the fastest channel.",
      contribute_title: "Contribute",
      contribute_body: "Pull requests welcome. See the repo README for contribution guidelines.",
      press_title: "Press / partnership inquiries",
      press_body: "Open a GitHub Issue with the 'press' label.",
    },
    ja: {
      intro: "promise999 は一人の開発者が公益目的で運営するオープンソースプロジェクトです。以下の経路でご連絡ください。",
      issues_title: "バグ・機能提案",
      issues_body: "GitHub Issues での報告が最速です。",
      contribute_title: "コントリビュート",
      contribute_body: "Pull Request 歓迎。コントリビュートガイドはリポジトリの README をご覧ください。",
      press_title: "報道・提携のお問い合わせ",
      press_body: "GitHub Issue に 'press' ラベルでお願いします。",
    },
    zh: {
      intro: "promise999 是由一位开发者出于公益目的运营的开源项目。请通过以下渠道联系。",
      issues_title: "缺陷 · 功能建议",
      issues_body: "GitHub Issues 是最快的反馈渠道。",
      contribute_title: "贡献",
      contribute_body: "欢迎 Pull Request。贡献指南请参阅仓库 README。",
      press_title: "媒体 · 合作咨询",
      press_body: "请在 GitHub Issue 打上 'press' 标签。",
    },
  }[locale] ?? undefined
  const c = copy ?? {
    intro: "promise999 은 오픈소스 프로젝트입니다.",
    issues_title: "연락 경로",
    issues_body: "GitHub Issues",
    contribute_title: "",
    contribute_body: "",
    press_title: "",
    press_body: "",
  }

  const sections = [
    { title: c.issues_title, body: c.issues_body, link: "https://github.com/keilvher1/promise999/issues", linkLabel: "GitHub Issues →" },
    { title: c.contribute_title, body: c.contribute_body, link: "https://github.com/keilvher1/promise999", linkLabel: "Repository →" },
    { title: c.press_title, body: c.press_body, link: "https://github.com/keilvher1/promise999/issues/new?labels=press", linkLabel: "New Issue →" },
  ].filter((s) => s.title)

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[900px] mx-auto px-6 py-16 w-full">
        <h1 className="font-sans text-4xl font-semibold tracking-tight mb-6">
          {t("footer.contact")}
        </h1>
        <p className="font-serif text-lg leading-relaxed text-muted-foreground mb-12">
          {c.intro}
        </p>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i} className="border-l-2 border-border pl-6">
              <h2 className="font-sans text-xl font-semibold mb-2">{s.title}</h2>
              <p className="font-serif text-base leading-relaxed text-muted-foreground mb-3">
                {s.body}
              </p>
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm underline underline-offset-4 hover:no-underline"
              >
                {s.linkLabel}
              </a>
            </section>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
