import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { seoulElection } from "@/lib/election-data"
import { getElectionBySgId } from "@/lib/queries"
import { BallotCard } from "@/components/election/ballot-card"
import { ElectionHeader } from "@/components/election/election-header"
import { SidePanel } from "@/components/election/side-panel"
import { PledgeStrip } from "@/components/election/pledge-strip"

interface ElectionPageProps {
  params: Promise<{
    sg_id: string
  }>
}

// ISR: 선거 정보는 자주 바뀌지 않음 (10분)
export const revalidate = 600

async function loadElection(sgId: string) {
  try {
    const e = await getElectionBySgId(sgId)
    if (e) return { data: e, source: "neon" as const }
  } catch (err) {
    console.error("[elections] Neon 조회 실패, sample로 폴백:", err)
  }
  return { data: seoulElection, source: "sample" as const }
}

export async function generateMetadata({ params }: ElectionPageProps) {
  const { sg_id } = await params
  const { data } = await loadElection(sg_id)
  return {
    title: `${data.title} — promise999`,
    description: `${data.date} 실시. 후보자 ${data.candidateCount}. 공약을 비교해 보세요.`,
  }
}

export default async function ElectionPage({ params }: ElectionPageProps) {
  const { sg_id } = await params
  const { data: election, source } = await loadElection(sg_id)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-[1100px] mx-auto px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition-colors font-sans"
            aria-label="선거 목록으로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            선거 목록
          </Link>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-grow min-w-0">
            <ElectionHeader election={election} />

            {source === "sample" && (
              <div className="mb-6 border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-serif text-gray-600 leading-relaxed">
                이 페이지는 샘플 데이터로 표시되고 있습니다. 실제 Neon DB에 적재된 선거는{" "}
                <Link href="/elections/0020220601" className="underline">
                  /elections/0020220601
                </Link>{" "}
                (제8회 전국동시지방선거)에서 확인하실 수 있습니다.
              </div>
            )}

            {/* Ballot grid */}
            <section aria-label="투표용지 목록">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {election.ballots.map((ballot, i) => (
                  <BallotCard
                    key={ballot.id}
                    ballot={ballot}
                    electionId={sg_id}
                    index={i}
                  />
                ))}
              </div>
            </section>

            {/* Pledge highlight strip */}
            <PledgeStrip />
          </div>

          {/* Side panel - desktop only */}
          <SidePanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-[1100px] mx-auto px-4 py-6">
          <p className="font-serif text-xs text-gray-500 leading-relaxed">
            모든 공약 원문은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 및 공공데이터포털(data.go.kr) 기준입니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
