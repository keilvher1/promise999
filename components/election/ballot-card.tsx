"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { BallotType, Candidate } from "@/lib/election-data"

interface BallotCardProps {
  ballot: BallotType
  electionId: string
  index?: number
}

function CandidateRow({ 
  candidate, 
  electionId,
  index 
}: { 
  candidate: Candidate
  electionId: string
  index: number
}) {
  const isWithdrew = candidate.status === "withdrew"
  const isElected = candidate.status === "elected"

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`
        flex items-center gap-3 py-2 px-3 border-b border-gray-200 last:border-b-0
        ${isWithdrew ? "bg-gray-100" : "bg-white"}
        hover:bg-gray-50 transition-colors duration-200
      `}
    >
      {/* 기호 번호 */}
      <motion.span
        whileHover={{ scale: 1.05 }}
        className={`
          w-7 h-7 flex items-center justify-center
          border border-black text-sm font-sans font-semibold
          flex-shrink-0 transition-all duration-200
          ${isWithdrew ? "border-gray-400 text-gray-400" : "hover:bg-black hover:text-white"}
        `}
        aria-label={`기호 ${candidate.number}번`}
      >
        {candidate.number}
      </motion.span>

      {/* 이름 */}
      <span
        className={`
          font-serif text-sm flex-grow
          ${isWithdrew ? "line-through text-gray-400" : "text-black"}
        `}
      >
        {candidate.name}
      </span>

      {/* 정당 */}
      <span
        className={`
          font-mono text-[10px] text-gray-500 flex-shrink-0
          ${isWithdrew ? "text-gray-300" : ""}
        `}
      >
        [{candidate.party}]
      </span>

      {/* 공약 보기 링크 */}
      {!isWithdrew && (
        <Link
          href={`/elections/${electionId}/candidates/${candidate.id}`}
          className="text-[10px] text-gray-500 underline underline-offset-2 hover:text-black transition-colors flex-shrink-0"
          aria-label={`${candidate.name} 후보 공약 보기`}
        >
          공약 보기
        </Link>
      )}

      {/* 당선 표시 */}
      {isElected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className="w-2 h-2 rounded-full bg-black flex-shrink-0"
          aria-label="당선"
        />
      )}

      {/* 사퇴 표시 */}
      {isWithdrew && (
        <span className="text-[10px] text-gray-400 flex-shrink-0">
          사퇴
        </span>
      )}
    </motion.div>
  )
}

export function BallotCard({ ballot, electionId, index = 0 }: BallotCardProps) {
  const runningCount = ballot.candidates.filter(c => c.status !== "withdrew").length

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="border border-black bg-white flex flex-col group"
      aria-label={`${ballot.label} 투표용지`}
    >
      {/* Header strip */}
      <motion.header 
        className="bg-black text-white px-3 py-2 flex items-center gap-2 relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        <span className="font-sans font-semibold text-sm relative z-10">
          {ballot.number}
        </span>
        <span className="font-sans text-sm tracking-tight relative z-10">
          {ballot.label}
        </span>
      </motion.header>

      {/* Candidate list */}
      <div className="flex-grow">
        {ballot.candidates.map((candidate, idx) => (
          <CandidateRow
            key={candidate.id}
            candidate={candidate}
            electionId={electionId}
            index={idx}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="px-3 py-2 border-t border-gray-300 bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200">
        <span className="text-xs text-gray-500 font-sans">
          총 {runningCount}명 출마
        </span>
      </footer>
    </motion.article>
  )
}
