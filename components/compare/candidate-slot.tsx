"use client"

import { Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ComparableCandidate } from "@/lib/compare-data"

interface CandidateSlotProps {
  candidate?: ComparableCandidate
  onAdd: () => void
  onRemove: () => void
  index: number
}

export function CandidateSlot({ candidate, onAdd, onRemove, index }: CandidateSlotProps) {
  if (!candidate) {
    return (
      <motion.button
        onClick={onAdd}
        whileHover={{ scale: 1.02, borderColor: "#525252" }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col items-center justify-center w-full aspect-square border border-dashed border-[#A3A3A3] bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#000000] focus:ring-offset-2"
        aria-label={`후보자 ${index + 1} 추가`}
      >
        <motion.div
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6 text-[#A3A3A3]" strokeWidth={1} />
        </motion.div>
        <span className="mt-2 text-xs text-[#A3A3A3] font-sans">추가</span>
      </motion.button>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={candidate.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
        className="relative w-full border border-[#D4D4D4] bg-[#FFFFFF] group"
      >
        <motion.button
          onClick={onRemove}
          whileHover={{ scale: 1.1, backgroundColor: "#E5E5E5" }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 p-1 z-10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#000000]"
          aria-label={`${candidate.name} 제거`}
        >
          <X className="w-4 h-4 text-[#525252]" strokeWidth={1} />
        </motion.button>
        
        <div className="p-4">
          {/* Photo placeholder with number */}
          <motion.div 
            className="w-full aspect-square bg-[#E5E5E5] mb-3 flex items-center justify-center overflow-hidden"
            whileHover={{ backgroundColor: "#D4D4D4" }}
            transition={{ duration: 0.2 }}
          >
            <motion.span 
              className="text-3xl font-serif text-[#525252]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {candidate.number}
            </motion.span>
          </motion.div>
          
          {/* Name */}
          <motion.h3 
            className="font-serif text-lg text-[#000000] text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {candidate.name}
          </motion.h3>
          
          {/* Party */}
          <motion.div 
            className="flex justify-center mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <span className="font-mono text-xs text-[#525252] border border-[#D4D4D4] px-2 py-0.5 group-hover:border-[#A3A3A3] transition-colors">
              [{candidate.party}]
            </span>
          </motion.div>
          
          {/* Position */}
          <motion.p 
            className="text-xs text-[#A3A3A3] text-center mt-2 font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {candidate.position}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
