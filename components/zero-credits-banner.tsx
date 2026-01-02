"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ZeroCreditsBannerProps {
  credits: number | null
}

export function ZeroCreditsBanner({ credits }: ZeroCreditsBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false)

  useEffect(() => {
    // Check if auto-recharge is already enabled
    const checkAutoRecharge = async () => {
      try {
        const response = await fetch('/api/user/auto-recharge')
        if (response.ok) {
          const data = await response.json()
          setAutoRechargeEnabled(data.enabled)
        }
      } catch (error) {
        console.error('Error checking auto-recharge:', error)
      }
    }

    checkAutoRecharge()
  }, [])

  // Reset dismissed state when credits change
  useEffect(() => {
    if (credits !== null && credits > 0) {
      setDismissed(false)
    }
  }, [credits])

  // Don't show if:
  // - Credits are null (loading)
  // - Credits are greater than 0
  // - User dismissed the banner
  // - Auto-recharge is already enabled
  if (credits === null || credits > 0 || dismissed || autoRechargeEnabled) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-r from-[#8B7355] to-[#6B5B47] border-b border-[#6B5B47] animate-in slide-in-from-top duration-500">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.5} fill="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-light text-sm sm:text-base tracking-wide">
                Out of credits?
              </p>
              <p className="text-white/80 font-light text-xs sm:text-sm mt-0.5">
                Enable auto-recharge to never run out
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={() => router.push('/settings/credits')}
              className="h-9 sm:h-10 px-4 sm:px-6 bg-white text-[#8B7355] hover:bg-white/90 text-xs sm:text-sm font-light tracking-wide transition-all duration-300 active:scale-95"
            >
              Enable Now
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
