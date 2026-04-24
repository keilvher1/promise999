import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { sampleCandidate } from "@/lib/candidate-data"
import { getCandidateById } from "@/lib/queries"
import { ProfileBlock } from "@/components/candidate/profile-block"
import { CandidateDetailTabs } from "@/components/candidate/detail-tabs"

interface CandidatePageProps {
  params: Promise<{
    candidacy_id: string
  }>
}

export const revalidate = 600

async function loadCandidate(candidacyId: string) {
  try {
    const c = await getCandidateById(candidacyId)
    if (c) return { data: c, source: "neon" as const }
  } catch (err) {
    console.error("[candidates] Neon 조회 실패, sample로 폴백:", err)
  }
  return { data: sampleCandidate, source: "sample" as const }
}

export async function generateMetadata({ params }: CandidatePageProps) {
  const { candidacy_id } = await params
  const { data } = await loadCandidate(candidacy_id)
  return {
    title: `${data.name} 후보 — ${data.position} · ${data.electionName}`,
    description: `${data.electionName} ${data.position} 후보 ${data.name}의 공약과 이력을 확인하세요.`,
  }
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { candidacy_id } = await params
  const { data: candidate, source } = await loadCandidate(candidacy_id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-[1100px] mx-auto px-4 py-4">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="font-sans font-semibold tracking-tight text-lg hover:opacity-80"
              aria-label="홈으로 이동"
            >
              promise999
            </Link>
            <span className="text-border">/</span>
            <Link
              href="/elections/0020220601"
              className="text-sm font-serif text-muted-foreground hover:text-foreground"
            >
              {candidate.electionName}
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/elections/0020220601"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          선거 페이지로 돌아가기
        </Link>

        {source === "sample" && (
          <div className="mb-6 border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-serif text-gray-600 leading-relaxed">
            이 페이지는 샘플 데이터로 표시되고 있습니다. 실제 Neon DB에 있는 후보자는 candidacies.id로 접근할 수 있습니다.
          </div>
        )}

        {/* Profile block */}
        <ProfileBlock candidate={candidate} />

        {/* Tabs */}
        <CandidateDetailTabs candidate={candidate} />
      </main>

      {/* Sticky footer note */}
      <footer className="border-t border-border sticky bottom-0 bg-background">
        <div className="max-w-[1100px] mx-auto px-4 py-3">
          <p className="text-xs font-serif text-muted-foreground text-center">
            모든 공약 원문은 중앙선거관리위원회 공식 자료입니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
