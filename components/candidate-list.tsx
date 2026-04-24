"use client"

import { useState, useMemo } from "react"
import { CandidateCard, type Candidate, type CandidateStatus } from "./candidate-card"
import { CandidateModal } from "./candidate-modal"
import { FilterSection } from "./filter-section"
import { SiteHeader } from "./site-header"
import { StatusLegend } from "./status-badge"
import { EmptyState } from "./empty-state"

interface CandidateListProps {
  candidates: Candidate[]
  regions: string[]
  parties: string[]
}

export function CandidateList({ candidates, regions, parties }: CandidateListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedParty, setSelectedParty] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | "all">("all")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        searchQuery === "" ||
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRegion =
        selectedRegion === "all" || candidate.region === selectedRegion

      const matchesParty =
        selectedParty === "all" || candidate.party === selectedParty

      const matchesStatus =
        selectedStatus === "all" || candidate.status === selectedStatus

      return matchesSearch && matchesRegion && matchesParty && matchesStatus
    })
  }, [candidates, searchQuery, selectedRegion, selectedParty, selectedStatus])

  const groupedByRegion = useMemo(() => {
    const groups: Record<string, Candidate[]> = {}
    filteredCandidates.forEach((candidate) => {
      if (!groups[candidate.region]) {
        groups[candidate.region] = []
      }
      groups[candidate.region].push(candidate)
    })
    return groups
  }, [filteredCandidates])

  const regionOrder = Object.keys(groupedByRegion).sort()

  return (
    <>
      <SiteHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <FilterSection
        regions={regions}
        parties={parties}
        selectedRegion={selectedRegion}
        selectedParty={selectedParty}
        selectedStatus={selectedStatus}
        onRegionChange={setSelectedRegion}
        onPartyChange={setSelectedParty}
        onStatusChange={setSelectedStatus}
      />

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="font-serif text-sm text-muted-foreground">
              총 <span className="font-mono text-foreground">{filteredCandidates.length}</span>명의 후보자
            </p>
          </div>
          <StatusLegend />
        </div>

        {filteredCandidates.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-12">
            {regionOrder.map((region) => (
              <section key={region} aria-labelledby={`region-${region}`}>
                <header className="mb-6 pb-3 border-b border-border">
                  <h2 
                    id={`region-${region}`}
                    className="font-sans text-lg font-semibold tracking-tight text-foreground"
                  >
                    {region}
                  </h2>
                  <p className="font-serif text-sm text-muted-foreground mt-1">
                    {groupedByRegion[region].length}명의 후보자
                  </p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupedByRegion[region].map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onSelect={setSelectedCandidate}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <CandidateModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </>
  )
}
