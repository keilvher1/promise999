import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { seoulElection } from "@/lib/election-data"
import { BallotCard } from "@/components/election/ballot-card"
import { ElectionHeader } from "@/components/election/election-header"
import { SidePanel } from "@/components/election/side-panel"
import { PledgeStrip } from "@/components/election/pledge-strip"

interface ElectionPageProps {
  params: Promise<{
    sg_id: string
  }>
}

export async function generateMetadata({ params }: ElectionPageProps) {
  const { sg_id } = await params
  return {
    title: `${seoulElection.title} — promise999`,
    description: `${seoulElection.date} 실시. 후보자 ${seoulElection.candidateCount}. 공약을 비교해 보세요.`,
  }
}

export default async function ElectionPage({ params }: ElectionPageProps) {
  const { sg_id } = await params
  // In production, fetch election data based on sg_id
  const election = seoulElection

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

            {/* Ballot grid */}
            <section aria-label="투표용지 목록">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {election.ballots.map((ballot) => (
                  <BallotCard
                    key={ballot.id}
                    ballot={ballot}
                    electionId={sg_id}
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
            모든 공약 원문은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 기준입니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
