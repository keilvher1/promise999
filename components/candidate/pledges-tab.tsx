"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PledgeLikeButton } from "@/components/pledge-like-button"
import type { CandidateDetail, Pledge } from "@/lib/candidate-data"

interface PledgesTabProps {
  candidate: CandidateDetail
}

function hasFullText(p: Pledge) {
  return !!p.fullText && p.fullText.trim().length > (p.summary?.length ?? 0)
}

function PledgeCard({ pledge }: { pledge: Pledge }) {
  const [open, setOpen] = useState(false)
  const expandable = hasFullText(pledge)

  return (
    <article className="border border-border p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm text-muted-foreground">
          {String(pledge.order).padStart(2, "0")}
        </span>
        <span className="px-2 py-0.5 text-xs font-mono border border-border text-muted-foreground bg-secondary">
          {pledge.category}
        </span>
      </div>
      <h4 className="font-sans font-medium tracking-tight text-base">
        {pledge.title}
      </h4>
      {open && expandable ? (
        <pre className="text-sm font-serif text-foreground leading-relaxed whitespace-pre-wrap break-words bg-muted/30 p-3 border border-border">
          {pledge.fullText}
        </pre>
      ) : (
        <p className="text-sm font-serif text-muted-foreground leading-relaxed line-clamp-3">
          {pledge.summary}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 mt-1">
        {expandable ? (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-1 text-sm font-sans text-foreground hover:underline self-start"
            aria-expanded={open}
          >
            {open ? (
              <>접기 <ChevronUp className="w-3 h-3" strokeWidth={1.5} /></>
            ) : (
              <>전체 보기 <ChevronDown className="w-3 h-3" strokeWidth={1.5} /></>
            )}
          </button>
        ) : (
          <Link
            href={`/pledges/${pledge.id}`}
            className="inline-flex items-center gap-1 text-sm font-sans text-foreground hover:underline self-start"
          >
            원문 <ArrowRight className="w-3 h-3" strokeWidth={1} />
          </Link>
        )}
        <PledgeLikeButton
          pledgeItemId={pledge.id}
          ariaLabel={`${pledge.title} 좋아요`}
        />
      </div>
    </article>
  )
}

function DetailedPledgeItem({ pledge }: { pledge: Pledge }) {
  const [open, setOpen] = useState(false)
  const expandable = hasFullText(pledge)
  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h5 className="font-sans font-medium text-sm tracking-tight">
            {pledge.title}
          </h5>
          {open && expandable ? (
            <pre className="text-sm font-serif text-foreground leading-relaxed whitespace-pre-wrap break-words mt-2 bg-muted/30 p-3 border border-border">
              {pledge.fullText}
            </pre>
          ) : (
            <p className="text-sm font-serif text-muted-foreground leading-relaxed mt-1 line-clamp-2">
              {pledge.summary}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <PledgeLikeButton
            pledgeItemId={pledge.id}
            ariaLabel={`${pledge.title} 좋아요`}
          />
          {expandable && (
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border px-2 py-0.5"
              aria-expanded={open}
            >
              {open ? "접기" : "전체"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function PledgesTab({ candidate }: PledgesTabProps) {
  const categories = Object.keys(candidate.detailedPledges)

  return (
    <div className="flex flex-col gap-8">
      {/* Disclaimer box */}
      <div 
        className="bg-secondary border border-border p-4"
        role="note"
        aria-label="공약 요약 안내"
      >
        <p className="text-sm font-serif text-muted-foreground leading-relaxed">
          아래 공약 요약은 원문에서 기계적으로 추출·분류한 결과입니다. 평가·해석을 포함하지 않습니다.
        </p>
      </div>

      {/* 핵심 공약 section */}
      <section aria-labelledby="key-pledges-heading">
        <h3 
          id="key-pledges-heading" 
          className="font-sans font-semibold tracking-tight text-lg mb-4"
        >
          핵심 공약
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidate.keyPledges.slice(0, 5).map((pledge) => (
            <PledgeCard key={pledge.id} pledge={pledge} />
          ))}
        </div>
      </section>

      {/* 상세 공약 accordion */}
      <section aria-labelledby="detailed-pledges-heading">
        <h3 
          id="detailed-pledges-heading" 
          className="font-sans font-semibold tracking-tight text-lg mb-4"
        >
          상세 공약
        </h3>
        <Accordion type="multiple" className="border border-border">
          {categories.map((category) => (
            <AccordionItem key={category} value={category} className="border-border px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <span className="font-sans font-medium tracking-tight">
                    {category}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {candidate.detailedPledges[category].length}개
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pb-2">
                  {candidate.detailedPledges[category].map((pledge) => (
                    <DetailedPledgeItem key={pledge.id} pledge={pledge} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
