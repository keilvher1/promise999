"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileBlock } from "@/components/candidate/profile-block"
import { PledgesTab } from "@/components/candidate/pledges-tab"
import { HistoryTab } from "@/components/candidate/history-tab"
import { PdfTab } from "@/components/candidate/pdf-tab"
import { CompareTab } from "@/components/candidate/compare-tab"
import { sampleCandidate } from "@/lib/candidate-data"

export default function CandidatePage() {
  const params = useParams()
  const candidacyId = params.candidacy_id as string
  
  // In real app, would fetch candidate data based on candidacyId
  const candidate = sampleCandidate

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
              href="/elections/local-2026"
              className="text-sm font-serif text-muted-foreground hover:text-foreground"
            >
              제9회 전국동시지방선거
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/elections/local-2026"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          선거 페이지로 돌아가기
        </Link>

        {/* Profile block */}
        <ProfileBlock candidate={candidate} />

        {/* Tabs */}
        <Tabs defaultValue="pledges" className="mt-8">
          <TabsList 
            className="bg-transparent rounded-none p-0 h-auto border-b border-border w-full justify-start gap-0"
            aria-label="후보자 정보 탭"
          >
            <TabsTrigger
              value="pledges"
              className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-sans text-sm"
            >
              공약
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-sans text-sm"
            >
              이력
            </TabsTrigger>
            <TabsTrigger
              value="pdf"
              className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-sans text-sm"
            >
              공보 PDF
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-sans text-sm"
            >
              비교
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pledges" className="mt-8">
            <PledgesTab candidate={candidate} />
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <HistoryTab candidate={candidate} />
          </TabsContent>

          <TabsContent value="pdf" className="mt-8">
            <PdfTab candidate={candidate} />
          </TabsContent>

          <TabsContent value="compare" className="mt-8">
            <CompareTab candidate={candidate} />
          </TabsContent>
        </Tabs>
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
