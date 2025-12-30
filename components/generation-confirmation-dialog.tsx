"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"

interface GenerationConfirmationDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  credits: number | null
}

export function GenerationConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  credits
}: GenerationConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E8E8E8] relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8B7355] to-[#A0826D] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
                Confirm Generation
              </h3>
            </div>
          </div>
          <p className="text-sm text-[#6B6B6B] font-light tracking-wide">
            This will use 1 credit to generate your design
          </p>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6">
          <div className="bg-[#F8F7F5] border border-[#E8E8E8] p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs tracking-[0.2em] uppercase text-[#8B7355] font-light">
                Your Credits
              </span>
              <span className="text-2xl font-serif font-light text-[#1A1A1A]">
                {credits !== null ? credits : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-light">
              <span>After generation</span>
              <span className="font-medium text-[#1A1A1A]">
                {credits !== null ? credits - 1 : '—'} credits
              </span>
            </div>
          </div>

          <p className="text-sm text-[#6B6B6B] font-light leading-relaxed text-center">
            Click confirm to proceed with AI generation
          </p>
        </div>
        
        {/* Actions */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-12 sm:h-14 border-[#E8E8E8] hover:border-[#1A1A1A] text-[#1A1A1A] text-xs sm:text-sm tracking-[0.2em] uppercase rounded-none font-light transition-all duration-300 active:scale-95"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-12 sm:h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] text-xs sm:text-sm tracking-[0.2em] uppercase rounded-none font-light transition-all duration-500 active:scale-95 hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}
