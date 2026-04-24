"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, FileDown, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CandidateSlot } from "@/components/compare/candidate-slot"
import { CandidateSearchModal } from "@/components/compare/candidate-search-modal"
import { ComparisonGrid } from "@/components/compare/comparison-grid"
import { KeywordCloud } from "@/components/compare/keyword-cloud"
import { UniquePledges } from "@/components/compare/unique-pledges"
import { BlurFade } from "@/components/ui/blur-fade"
import { TextAnimate } from "@/components/ui/text-animate"
import { Spinner } from "@/components/ui/spinner"
import {
  allCandidates,
  PLEDGE_CATEGORIES,
  ELECTIONS,
  PARTIES,
  type ComparableCandidate,
} from "@/lib/compare-data"

export default function ComparePage() {
  return (
    <Suspense fallback={<ComparePageSkeleton />}>
      <ComparePageContent />
    </Suspense>
  )
}

function ComparePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="w-8 h-8 text-[#525252]" />
        <p className="font-sans text-sm text-[#525252]">로딩 중...</p>
      </div>
    </div>
  )
}

function ComparePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [selectedCandidates, setSelectedCandidates] = useState<ComparableCandidate[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState("전체")
  const [electionFilter, setElectionFilter] = useState("전체")
  const [partyFilter, setPartyFilter] = useState("전체")

  // Parse initial IDs from URL
  useEffect(() => {
    const idsParam = searchParams.get("ids")
    if (idsParam) {
      const ids = idsParam.split(",")
      const candidates = ids
        .map(id => allCandidates.find(c => c.id === id))
        .filter((c): c is ComparableCandidate => c !== undefined)
        .slice(0, 4)
      setSelectedCandidates(candidates)
    }
  }, [searchParams])

  // Update URL when candidates change
  const updateUrl = useCallback((candidates: ComparableCandidate[]) => {
    const ids = candidates.map(c => c.id).join(",")
    if (ids) {
      router.replace(`/pledges/compare?ids=${ids}`, { scroll: false })
    } else {
      router.replace("/pledges/compare", { scroll: false })
    }
  }, [router])

  const handleAddCandidate = (index: number) => {
    setActiveSlotIndex(index)
    setModalOpen(true)
  }

  const handleSelectCandidate = (candidate: ComparableCandidate) => {
    const newCandidates = [...selectedCandidates]
    if (activeSlotIndex !== null && activeSlotIndex < 4) {
      if (activeSlotIndex >= newCandidates.length) {
        newCandidates.push(candidate)
      } else {
        newCandidates[activeSlotIndex] = candidate
      }
      setSelectedCandidates(newCandidates)
      updateUrl(newCandidates)
    }
    setActiveSlotIndex(null)
  }

  const handleRemoveCandidate = (index: number) => {
    const newCandidates = selectedCandidates.filter((_, i) => i !== index)
    setSelectedCandidates(newCandidates)
    updateUrl(newCandidates)
  }

  const handleExportPdf = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <header className="border-b border-[#D4D4D4]">
        <div className="max-w-[1100px] mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-[#525252] hover:text-[#000000] transition-colors font-sans"
              aria-label="홈으로 돌아가기"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1} />
              <span>홈</span>
            </Link>
            <h1 className="font-sans text-xl font-medium text-[#000000] tracking-tight">
              <TextAnimate animation="blurInUp" by="word" once>
                후보 비교
              </TextAnimate>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Candidate Slots */}
        <section aria-label="비교 대상 후보자">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <AnimatePresence mode="popLayout">
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <CandidateSlot
                    index={index}
                    candidate={selectedCandidates[index]}
                    onAdd={() => handleAddCandidate(index)}
                    onRemove={() => handleRemoveCandidate(index)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Filter Row */}
        <BlurFade delay={0.3} inView>
          <section className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-[#E5E5E5]">
            <FilterSelect
              label="분야"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={["전체", ...PLEDGE_CATEGORIES]}
            />
            <FilterSelect
              label="선거"
              value={electionFilter}
              onChange={setElectionFilter}
              options={["전체", ...ELECTIONS.map(e => e.name)]}
            />
            <FilterSelect
              label="정당"
              value={partyFilter}
              onChange={setPartyFilter}
              options={PARTIES}
            />
            
            <div className="ml-auto print:hidden">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportPdf}
                className="flex items-center gap-2 px-4 py-2 border border-[#000000] text-[#000000] font-sans text-sm hover:bg-[#F5F5F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#000000] focus:ring-offset-2"
                aria-label="PDF로 내보내기"
              >
                <FileDown className="w-4 h-4" strokeWidth={1} />
                <span>PDF 내보내기</span>
              </motion.button>
            </div>
          </section>
        </BlurFade>

        {/* Disclaimer */}
        <BlurFade delay={0.4} inView>
          <motion.div 
            className="bg-[#F5F5F5] border border-[#D4D4D4] p-4 mb-6"
            whileHover={{ borderColor: "#A3A3A3" }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-serif text-sm text-[#525252] leading-relaxed">
              이 비교는 원문을 분야별로 나열한 것입니다. 어떤 공약이 더 좋거나 실현 가능한지 판단하지 않습니다.
            </p>
          </motion.div>
        </BlurFade>

        {/* Comparison Grid */}
        <BlurFade delay={0.5} inView>
          <section className="mb-8" aria-label="공약 비교표">
            <ComparisonGrid
              candidates={selectedCandidates}
              categoryFilter={categoryFilter}
            />
          </section>
        </BlurFade>

        {/* Keyword Cloud */}
        <BlurFade delay={0.6} inView>
          <section className="mb-8" aria-label="공통 키워드">
            <KeywordCloud candidateIds={selectedCandidates.map(c => c.id)} />
          </section>
        </BlurFade>

        {/* Unique Pledges */}
        <BlurFade delay={0.7} inView>
          <section aria-label="차별 공약">
            <UniquePledges candidates={selectedCandidates} />
          </section>
        </BlurFade>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D4D4D4] mt-12">
        <div className="max-w-[1100px] mx-auto px-4 py-6">
          <p className="font-serif text-xs text-[#A3A3A3] leading-relaxed">
            모든 공약 원문은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 기준입니다.
          </p>
        </div>
      </footer>

      {/* Search Modal */}
      <CandidateSearchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleSelectCandidate}
        excludeIds={selectedCandidates.map(c => c.id)}
      />
    </div>
  )
}

// Filter Select Component
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div className="relative">
      <label className="sr-only">{label} 필터</label>
      <motion.select
        whileFocus={{ borderColor: "#000000" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#FFFFFF] border border-[#D4D4D4] px-3 py-2 pr-8 font-sans text-sm text-[#000000] focus:outline-none focus:border-[#000000] cursor-pointer transition-colors duration-200 hover:border-[#A3A3A3]"
        aria-label={`${label} 필터`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "전체" ? `${label}` : option}
          </option>
        ))}
      </motion.select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252] pointer-events-none"
        strokeWidth={1}
      />
    </div>
  )
}
