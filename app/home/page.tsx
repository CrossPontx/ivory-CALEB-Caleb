"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Gift, Share2, X } from "lucide-react"
import Image from "next/image"
import { useCredits } from "@/hooks/use-credits"
import { BottomNav } from "@/components/bottom-nav"
import ContentModerationMenu from "@/components/content-moderation-menu"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
  userId?: number
  username?: string
}

export default function HomePage() {
  const router = useRouter()
  const { credits } = useCredits()
  const [looks, setLooks] = useState<NailLook[]>([])
  const [showReferralBanner, setShowReferralBanner] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    // Load user's looks from database
    const loadLooks = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        setCurrentUserId(user.id)
        
        // Set subscription info
        setSubscriptionTier(user.subscriptionTier || 'free')
        setSubscriptionStatus(user.subscriptionStatus || 'inactive')
        
        // Redirect tech users to their dashboard
        if (user.userType === 'tech') {
          router.push("/tech/dashboard")
          return
        }

        const response = await fetch(`/api/looks?userId=${user.id}&currentUserId=${user.id}`, {
          cache: 'no-store' // Prevent caching to always get fresh data
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded looks:', data)
          setLooks(data)
        }
      } catch (error) {
        console.error('Error loading looks:', error)
      }
    }

    loadLooks()

    // Reload looks when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadLooks()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  const startNewDesign = () => {
    router.push("/capture")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5">
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            IVORY'S CHOICE
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">
        {/* Credits/Subscription Banner */}
        {showReferralBanner && (
          <div className="mb-6 sm:mb-8 relative">
            <div className="border border-[#E8E8E8] p-6 sm:p-8 relative bg-[#F8F7F5]">
              {/* Close button */}
              <button
                onClick={() => setShowReferralBanner(false)}
                className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1} />
              </button>

              <div className="max-w-2xl">
                {subscriptionTier !== 'free' && subscriptionStatus === 'active' ? (
                  // Paid users - show referral program
                  <>
                    <div className="flex items-start gap-4 sm:gap-6 mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
                        <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355]" strokeWidth={1} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                          Referral Program
                        </h3>
                        <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">
                          Refer 3 friends and receive <span className="text-[#1A1A1A] font-normal">1 complimentary credit</span> to create more designs
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/settings/credits')}
                      className="h-11 sm:h-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 px-6 sm:px-8 text-xs tracking-widest uppercase rounded-none font-light"
                    >
                      <Share2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Get Referral Link
                    </Button>
                  </>
                ) : (
                  // Free users - show upgrade prompt
                  <>
                    <div className="flex items-start gap-4 sm:gap-6 mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355]" strokeWidth={1} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                          Upgrade Your Plan
                        </h3>
                        <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">
                          Subscribe to get <span className="text-[#1A1A1A] font-normal">monthly credits</span> and unlock the ability to purchase additional credits anytime
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/billing')}
                      className="h-11 sm:h-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 px-6 sm:px-8 text-xs tracking-widest uppercase rounded-none font-light"
                    >
                      <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      View Plans
                    </Button>
                  </>
                )}

                {credits !== null && (
                  <p className="text-xs tracking-wider text-[#6B6B6B] mt-4 font-light uppercase">
                    Current Balance: <span className="text-[#1A1A1A] font-normal">{credits} Credit{credits !== 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Collection</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">Your Designs</h2>
        </div>

        {/* Gallery Grid */}
        {looks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {looks.map((look) => (
              <div
                key={look.id}
                className="group active:scale-95 transition-all duration-300 border border-[#E8E8E8] hover:border-[#8B7355] bg-white overflow-visible"
              >
                <div 
                  className="aspect-square relative overflow-hidden bg-[#F8F7F5] cursor-pointer"
                  onClick={() => router.push(`/look/${look.id}`)}
                >
                  <Image 
                    src={look.imageUrl || "/placeholder.svg"} 
                    alt={look.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-3 sm:p-4 relative">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 
                      className="font-serif text-sm sm:text-base text-[#1A1A1A] line-clamp-1 font-light cursor-pointer flex-1"
                      onClick={() => router.push(`/look/${look.id}`)}
                    >
                      {look.title}
                    </h3>
                    {currentUserId && look.userId && look.userId !== currentUserId && (
                      <ContentModerationMenu
                        currentUserId={currentUserId}
                        contentType="look"
                        contentId={parseInt(look.id)}
                        contentOwnerId={look.userId}
                        contentOwnerUsername={look.username || `User ${look.userId}`}
                        showBlockOption={true}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] font-light">
                    <Sparkles className="w-3 h-3" strokeWidth={1} />
                    <span>
                      {new Date(look.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 px-4 border border-[#E8E8E8] mb-6">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#E8E8E8] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#8B7355]" strokeWidth={1} />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-3 tracking-tight">No Designs Yet</h3>
              <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">
                Begin your journey by creating your first design
              </p>
            </div>
          </div>
        )}

        {/* Create Button - Large */}
        {looks.length > 0 && (
          <div className="flex justify-center px-4">
            <Button
              className="h-12 sm:h-14 px-8 sm:px-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 w-full sm:w-auto text-xs tracking-widest uppercase rounded-none font-light active:scale-95"
              onClick={startNewDesign}
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Create Design
            </Button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={startNewDesign} centerActionLabel="Create" />
    </div>
  )
}
