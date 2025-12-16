"use client"

import { useIsAppleWatch, HideOnWatch, WatchOnly, WatchButton, WatchCard, WatchGrid } from "@/components/watch-optimized-layout"
import { Sparkles, Heart, Share2 } from "lucide-react"

export default function WatchTestPage() {
  const isWatch = useIsAppleWatch()

  return (
    <div className="min-h-screen bg-white p-4">
      <header className={`mb-6 ${isWatch ? 'text-center' : ''}`}>
        <h1 className={`font-serif font-light text-[#1A1A1A] ${isWatch ? 'text-sm' : 'text-3xl'}`}>
          Apple Watch Test
        </h1>
        <p className={`text-[#6B6B6B] mt-2 ${isWatch ? 'text-[10px]' : 'text-base'}`}>
          Current viewport: {isWatch ? 'Apple Watch' : 'Regular Device'}
        </p>
      </header>

      <div className="space-y-6">
        {/* Device Detection */}
        <WatchCard>
          <h2 className={`font-serif mb-2 ${isWatch ? 'text-xs' : 'text-xl'}`}>
            Device Detection
          </h2>
          <p className={`text-[#6B6B6B] ${isWatch ? 'text-[10px]' : 'text-sm'}`}>
            {isWatch ? '⌚ Apple Watch Detected' : '📱 Regular Device Detected'}
          </p>
        </WatchCard>

        {/* Conditional Rendering */}
        <WatchCard>
          <h2 className={`font-serif mb-3 ${isWatch ? 'text-xs' : 'text-xl'}`}>
            Conditional Content
          </h2>
          
          <HideOnWatch>
            <div className="p-4 bg-[#F8F7F5] mb-3">
              <p className="text-sm text-[#6B6B6B]">
                This content is hidden on Apple Watch
              </p>
            </div>
          </HideOnWatch>

          <WatchOnly>
            <div className="p-2 bg-[#F8F7F5] mb-2">
              <p className="text-[10px] text-[#6B6B6B]">
                This content only shows on Apple Watch
              </p>
            </div>
          </WatchOnly>
        </WatchCard>

        {/* Buttons */}
        <WatchCard>
          <h2 className={`font-serif mb-3 ${isWatch ? 'text-xs' : 'text-xl'}`}>
            Watch-Optimized Buttons
          </h2>
          <div className="space-y-2">
            <WatchButton variant="default">
              <Sparkles className="w-4 h-4 mr-2" />
              Primary Action
            </WatchButton>
            <WatchButton variant="outline">
              <Heart className="w-4 h-4 mr-2" />
              Secondary Action
            </WatchButton>
          </div>
        </WatchCard>

        {/* Grid Layout */}
        <div>
          <h2 className={`font-serif mb-3 ${isWatch ? 'text-xs' : 'text-xl'}`}>
            Responsive Grid
          </h2>
          <WatchGrid cols={2}>
            {[1, 2, 3, 4].map((item) => (
              <WatchCard key={item}>
                <div className="aspect-square bg-[#F8F7F5] flex items-center justify-center mb-2">
                  <Sparkles className={`text-[#8B7355] ${isWatch ? 'w-6 h-6' : 'w-8 h-8'}`} />
                </div>
                <p className={`text-center ${isWatch ? 'text-[10px]' : 'text-sm'}`}>
                  Item {item}
                </p>
              </WatchCard>
            ))}
          </WatchGrid>
        </div>

        {/* Typography Scale */}
        <WatchCard>
          <h2 className={`font-serif mb-3 ${isWatch ? 'text-xs' : 'text-xl'}`}>
            Typography Scale
          </h2>
          <div className="space-y-2">
            <h1 className={isWatch ? 'text-sm' : 'text-3xl'}>Heading 1</h1>
            <h2 className={isWatch ? 'text-xs' : 'text-2xl'}>Heading 2</h2>
            <h3 className={isWatch ? 'text-[11px]' : 'text-xl'}>Heading 3</h3>
            <p className={isWatch ? 'text-[10px]' : 'text-base'}>Body text</p>
          </div>
        </WatchCard>

        {/* Viewport Info */}
        <WatchCard>
          <h2 className={`font-serif mb-2 ${isWatch ? 'text-xs' : 'text-xl'}`}>
            Viewport Info
          </h2>
          <div className={`space-y-1 ${isWatch ? 'text-[10px]' : 'text-sm'}`}>
            <p>Width: {typeof window !== 'undefined' ? window.innerWidth : 0}px</p>
            <p>Height: {typeof window !== 'undefined' ? window.innerHeight : 0}px</p>
            <p>Threshold: ≤272px for Apple Watch</p>
          </div>
        </WatchCard>
      </div>
    </div>
  )
}
