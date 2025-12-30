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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] animate-in fade-in duration-300">
      <div 
        className="bg-white w-full sm:max-w-lg sm:mx-4 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-500 sm:rounded-2xl shadow-2xl"
        style={{
          animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Elegant Header with Gradient */}
        <div className="relative bg-gradient-to-br from-[#F8F7F5] to-white px-6 sm:px-8 pt-8 pb-6">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-white/80 rounded-full transition-all duration-300 active:scale-90"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#8B7355] to-[#A0826D] rounded-full flex items-center justify-center mb-4 shadow-lg animate-in zoom-in duration-500 delay-100">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              Ready to Visualize?
            </h3>
            <p className="text-sm sm:text-base text-[#6B6B6B] font-light tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
              Generate your AI-powered nail design
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 sm:px-8 py-6 sm:py-8">
          {/* Credit Display Card */}
          <div className="bg-gradient-to-br from-[#F8F7F5] to-white border-2 border-[#E8E8E8] p-5 sm:p-6 rounded-2xl mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm tracking-[0.2em] uppercase text-[#8B7355] font-medium">
                Your Credits
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-serif font-light text-[#1A1A1A]">
                  {credits !== null ? credits : '—'}
                </span>
                <span className="text-sm text-[#6B6B6B] font-light">credits</span>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#E8E8E8] to-transparent mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#6B6B6B] font-light">After generation</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-serif font-medium text-[#8B7355]">
                  {credits !== null ? credits - 1 : '—'}
                </span>
                <span className="text-xs text-[#6B6B6B] font-light">credits</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-[#6B6B6B] font-light mb-6 animate-in fade-in duration-500 delay-500">
            <div className="w-2 h-2 rounded-full bg-[#8B7355] animate-pulse" />
            <span>1 credit will be used</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom duration-500 delay-600">
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full sm:flex-1 h-14 sm:h-16 border-2 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-[#F8F7F5] text-[#1A1A1A] text-sm tracking-[0.2em] uppercase rounded-xl font-light transition-all duration-300 active:scale-95 touch-manipulation"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:flex-1 h-14 sm:h-16 bg-gradient-to-r from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white hover:from-[#8B7355] hover:via-[#A0826D] hover:to-[#8B7355] text-sm tracking-[0.2em] uppercase rounded-xl font-light transition-all duration-500 active:scale-95 hover:shadow-2xl touch-manipulation animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          >
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" strokeWidth={1.5} />
            Confirm
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(100px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
