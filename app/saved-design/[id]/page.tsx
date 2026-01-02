"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Trash2, Send, ExternalLink, Share2, Sparkles } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"
import { useCredits } from "@/hooks/use-credits"
import { DesignAnalysisDisplay } from "@/components/design-analysis-display"

type SavedDesign = {
  id: number
  imageUrl: string
  title: string
  sourceUrl: string | null
  sourceType: string | null
  createdAt: string
}

export default function SavedDesignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { credits } = useCredits()
  const [design, setDesign] = useState<SavedDesign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadDesign = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/saved-designs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setDesign(data.design)
        }
      } catch (error) {
        console.error('Error loading design:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDesign()
  }, [params.id])

  const handleVisualize = () => {
    if (!design) return
    
    // Store the design image URL and flag for auto-generation
    localStorage.setItem('loadedDesignImage', design.imageUrl)
    localStorage.setItem('autoShowConfirmDialog', 'true')
    localStorage.setItem('loadedDesignMetadata', JSON.stringify({
      source: 'saved-design',
      designId: design.id,
      title: design.title
    }))
    
    // Navigate to capture page
    router.push('/capture')
  }

  const handleSendToTech = () => {
    // TODO: Implement send to tech functionality
    alert('Send to Nail Tech feature coming soon!')
  }

  const handleShare = () => {
    // TODO: Implement share functionality
    alert('Share with Friends feature coming soon!')
  }

  const handleViewSource = () => {
    if (design?.sourceUrl) {
      window.open(design.sourceUrl, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this design?')) return

    try {
      const response = await fetch(`/api/saved-designs/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push("/home")
      } else {
        alert('Failed to delete design')
      }
    } catch (error) {
      console.error('Error deleting design:', error)
      alert('An error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Header with Back Button */}
      <header className={`bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe backdrop-blur-sm bg-white/95 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 group active:scale-95 min-h-[44px] -ml-2 pl-2 pr-4"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-500" strokeWidth={1} />
            <span className="text-[10px] tracking-[0.3em] uppercase font-light">Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-28 sm:pb-32">
        {/* Compact Image with Overlay Actions */}
        <div className={`relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Image Container - Compact Size */}
          <div className="relative w-full max-w-md mx-auto aspect-[4/5] overflow-hidden bg-[#F8F7F5] mt-4 sm:mt-6">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B7355]"></div>
              </div>
            ) : design ? (
              <Image 
                src={design.imageUrl || "/placeholder.svg"} 
                alt={design.title} 
                fill 
                className="object-cover" 
                priority
                sizes="(max-width: 640px) 100vw, 448px"
              />
            ) : null}
            
            {/* Action Buttons Overlay */}
            {!isLoading && design && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  {/* Delete - Left */}
                  <button
                    onClick={handleDelete}
                    className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px] active:scale-95 transition-transform touch-manipulation"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A1A]" strokeWidth={1.5} />
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-white font-light tracking-wider uppercase">Delete</span>
                  </button>

                  {/* Visualize - Center */}
                  <button
                    onClick={handleVisualize}
                    disabled={!credits || credits < 1}
                    className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[90px] active:scale-95 transition-transform touch-manipulation disabled:opacity-50"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#8B7355] flex items-center justify-center hover:bg-[#A0826D] transition-colors shadow-lg">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" strokeWidth={1.5} />
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-white font-light tracking-wider uppercase">Visualize</span>
                  </button>

                  {/* Share - Right */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendToTech}
                      className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px] active:scale-95 transition-transform touch-manipulation"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A1A]" strokeWidth={1.5} />
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-white font-light tracking-wider uppercase">To Tech</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px] active:scale-95 transition-transform touch-manipulation"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A1A]" strokeWidth={1.5} />
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-white font-light tracking-wider uppercase">Friends</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Design Analysis Section */}
        {design && !isLoading && (
          <div className={`mt-6 sm:mt-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <DesignAnalysisDisplay imageUrl={design.imageUrl} savedDesignId={design.id} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
