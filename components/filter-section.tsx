"use client"

import { ChevronDown } from "lucide-react"
import type { CandidateStatus } from "./candidate-card"

interface FilterSectionProps {
  regions: string[]
  parties: string[]
  selectedRegion: string
  selectedParty: string
  selectedStatus: CandidateStatus | "all"
  onRegionChange: (region: string) => void
  onPartyChange: (party: string) => void
  onStatusChange: (status: CandidateStatus | "all") => void
}

const statusOptions: { value: CandidateStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "elected", label: "당선" },
  { value: "defeated", label: "낙선" },
  { value: "undecided", label: "미정" },
]

export function FilterSection({
  regions,
  parties,
  selectedRegion,
  selectedParty,
  selectedStatus,
  onRegionChange,
  onPartyChange,
  onStatusChange,
}: FilterSectionProps) {
  return (
    <section 
      className="border-b border-border bg-background py-6"
      aria-label="후보자 필터"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label 
              htmlFor="region-filter" 
              className="block font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2"
            >
              선거구
            </label>
            <div className="relative">
              <select
                id="region-filter"
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-10 border border-border bg-background text-foreground font-serif text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer rounded-sm"
                aria-label="선거구 선택"
              >
                <option value="all">전체 선거구</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <ChevronDown 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                strokeWidth={1}
                aria-hidden="true"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label 
              htmlFor="party-filter" 
              className="block font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2"
            >
              정당
            </label>
            <div className="relative">
              <select
                id="party-filter"
                value={selectedParty}
                onChange={(e) => onPartyChange(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-10 border border-border bg-background text-foreground font-serif text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent cursor-pointer rounded-sm"
                aria-label="정당 선택"
              >
                <option value="all">전체 정당</option>
                {parties.map((party) => (
                  <option key={party} value={party}>
                    {party}
                  </option>
                ))}
              </select>
              <ChevronDown 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                strokeWidth={1}
                aria-hidden="true"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <fieldset>
              <legend className="block font-sans text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                당선 상태
              </legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="당선 상태 필터">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selectedStatus === option.value}
                    onClick={() => onStatusChange(option.value)}
                    className={`px-3 py-2 font-sans text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm ${
                      selectedStatus === option.value
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  )
}
