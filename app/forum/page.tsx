import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { ForumBoard } from "@/components/forum/forum-board"
import { getLocaleAndDict } from "@/lib/i18n/server"

export const metadata = {
  title: "익명 토론장 — promise999",
  description: "선거·후보·공약에 대해 익명으로 토론하세요. 자동 닉네임, 신고 기반 자정.",
}

export default async function ForumPage() {
  const { dict } = await getLocaleAndDict()
  // dict.forum이 아직 없으면 안전한 fallback 라벨 사용
  const fl: any = (dict as any).forum ?? {}

  const labels = {
    title: fl.title ?? "익명 토론장",
    subtitle: fl.subtitle ?? "공약과 후보에 대해 자유롭게 의견을 나누세요. 닉네임은 자동 생성됩니다.",
    new_post: fl.new_post ?? "새 글 작성",
    new_post_title_ph: fl.new_post_title_ph ?? "제목",
    new_post_body_ph: fl.new_post_body_ph ?? "본문 (2~8000자)",
    submit: fl.submit ?? "작성",
    no_threads: fl.no_threads ?? "아직 글이 없습니다. 첫 번째 글을 작성해보세요.",
    replies: fl.replies ?? "댓글",
    just_now: fl.just_now ?? "방금",
    minutes_ago: (n: number) => `${n}분 전`,
    hours_ago: (n: number) => `${n}시간 전`,
    days_ago: (n: number) => `${n}일 전`,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[820px] w-full mx-auto px-6 py-12">
        <ForumBoard targetKind="global" labels={labels} />
      </main>
      <LandingFooter />
    </div>
  )
}
