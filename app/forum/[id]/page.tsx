import { notFound } from "next/navigation"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { ThreadDetail } from "@/components/forum/thread-detail"

export const metadata = {
  title: "토론 글 — promise999",
}

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tid = Number(id)
  if (!Number.isInteger(tid) || tid <= 0) notFound()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      <main className="flex-1 max-w-[820px] w-full mx-auto px-6 py-12">
        <ThreadDetail threadId={tid} />
      </main>
      <LandingFooter />
    </div>
  )
}
