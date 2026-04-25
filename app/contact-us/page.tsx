import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { CorrectionForm } from "@/components/correction-form"

export const metadata = {
  title: "정정요청 / 문의 — promise999",
  description: "잘못된 정보 제보, 새 기능 제안, 일반 문의를 보낼 수 있습니다.",
}

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[820px] w-full mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <h1 className="font-serif text-3xl">정정요청 / 문의</h1>
          <p className="font-sans text-base text-muted-foreground leading-relaxed">
            promise999은 중앙선거관리위원회 공식 자료에 기반하지만,
            오류가 발견될 수 있습니다. 발견하신 오류·오타·번역 문제·기능 제안을 알려주세요.
          </p>
        </header>

        <section className="border border-border p-5 space-y-4">
          <h2 className="font-sans text-lg font-medium">유형별 가이드</h2>
          <ul className="space-y-3 font-sans text-sm">
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground w-20 shrink-0 mt-0.5">사실 오류</span>
              <span className="text-muted-foreground">
                후보자 이름·정당·소속·생년월일·학력·경력 또는 공약 항목 오류. 가능하면 공식 출처(선관위·언론사)도 함께 첨부.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground w-20 shrink-0 mt-0.5">번역 오류</span>
              <span className="text-muted-foreground">
                EN/JA/ZH 번역 부정확. 원문과 어떻게 달라야 하는지 함께 알려주세요.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground w-20 shrink-0 mt-0.5">기능 제안</span>
              <span className="text-muted-foreground">
                새 데이터 추가, UI 개선, 비교 기능 등.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground w-20 shrink-0 mt-0.5">기타</span>
              <span className="text-muted-foreground">
                위에 해당하지 않는 일반 문의·피드백.
              </span>
            </li>
          </ul>
        </section>

        <section className="flex flex-col items-start gap-4">
          <CorrectionForm
            targetKind="general"
            triggerLabel="문의하기"
            contextLabel="promise999 일반 문의"
            triggerClassName="text-sm py-2 px-3 border-foreground bg-foreground text-background"
          />
          <p className="text-xs font-serif text-muted-foreground leading-relaxed">
            특정 후보·공약·선거 페이지에서도 페이지 하단에 "정정요청" 버튼이 있습니다.
            컨텍스트가 자동으로 포함되어 더 빠르게 처리됩니다.
          </p>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
