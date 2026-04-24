"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PledgesTab } from "@/components/candidate/pledges-tab"
import { HistoryTab } from "@/components/candidate/history-tab"
import { PdfTab } from "@/components/candidate/pdf-tab"
import { CompareTab } from "@/components/candidate/compare-tab"
import type { CandidateDetail } from "@/lib/candidate-data"

interface Props {
  candidate: CandidateDetail
}

export function CandidateDetailTabs({ candidate }: Props) {
  return (
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
  )
}
