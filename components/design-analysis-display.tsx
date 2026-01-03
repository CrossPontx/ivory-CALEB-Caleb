"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

type DesignAnalysis = {
  summary: string
  nailShape: string
  nailLength: string
  baseColor: string
  designElements: string[]
  finish: string
  complexityLevel: string
  wearability: string
}

type Props = {
  imageUrl: string
  lookId?: string | number
  savedDesignId?: string | number
}

export function DesignAnalysisDisplay({ imageUrl, lookId, savedDesignId }: Props) {
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [displayedSummary, setDisplayedSummary] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const analyzeDesign = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/analyze-saved-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageUrl, 
            lookId: lookId?.toString(),
            savedDesignId: savedDesignId?.toString()
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setAnalysis(data.analysis)
          // Only show typing animation for newly generated analysis
          if (!data.cached) {
            setIsTyping(true)
          } else {
            // For cached analysis, show immediately
            setDisplayedSummary(data.analysis.summary)
          }
        } else {
          // Handle error responses
          setError(data.error || 'Unable to analyze this design')
        }
      } catch (error) {
        console.error('Error analyzing design:', error)
        setError('Failed to analyze design. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    analyzeDesign()
  }, [imageUrl, lookId, savedDesignId])

  // Typing animation effect
  useEffect(() => {
    if (!analysis?.summary || !isTyping) return

    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= analysis.summary.length) {
        setDisplayedSummary(analysis.summary.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 30) // 30ms per character for smooth typing

    return () => clearInterval(typingInterval)
  }, [analysis?.summary, isTyping])

  if (isLoading) {
    return (
      <div className="border border-[#E8E8E8] bg-[#FAFAFA] p-6 sm:p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B7355]" />
          <span className="ml-3 text-sm text-[#6B6B6B] font-light">Analyzing design...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-[#E8E8E8] bg-[#FFF9F5] p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F5E6D3] flex items-center justify-center mb-4">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-sm font-light text-[#8B7355] mb-2 tracking-wide">
            Unable to Analyze
          </h3>
          <p className="text-sm text-[#6B6B6B] font-light leading-relaxed max-w-md">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="border border-[#E8E8E8] bg-[#FAFAFA] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] pb-4">
        <h2 className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] font-light">
          Design Summary
        </h2>
      </div>

      {/* Summary with typing animation */}
      <div className="space-y-2">
        <p className="text-sm sm:text-base text-[#1A1A1A] font-light leading-relaxed min-h-[3rem]">
          {displayedSummary}
          {isTyping && (
            <img 
              src="https://64.media.tumblr.com/96702234ff6a92ce2060b206943c3405/1ba90b97996d3468-59/s400x600/f14beb0b2d9633fa39066406945ecec8f89c8833.gifv" 
              alt="Sparkling animation"
              className="inline-block w-5 h-5 object-contain align-middle ml-1"
            />
          )}
        </p>
      </div>

      {/* Design Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
        {/* Nail Shape */}
        <div className="space-y-2">
          <h3 className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Nail Shape
          </h3>
          <p className="text-sm sm:text-base text-[#1A1A1A] font-light">
            {analysis.nailShape}
          </p>
        </div>

        {/* Nail Length */}
        <div className="space-y-2">
          <h3 className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Nail Length
          </h3>
          <p className="text-sm sm:text-base text-[#1A1A1A] font-light">
            {analysis.nailLength}
          </p>
        </div>

        {/* Base Color */}
        <div className="space-y-2 sm:col-span-2">
          <h3 className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Base Color
          </h3>
          <p className="text-sm sm:text-base text-[#1A1A1A] font-light">
            {analysis.baseColor}
          </p>
        </div>

        {/* Design Elements */}
        <div className="space-y-2 sm:col-span-2">
          <h3 className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Design Elements
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.designElements.map((element, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white border border-[#E8E8E8] text-[10px] sm:text-xs text-[#1A1A1A] font-light tracking-wide"
              >
                {element}
              </span>
            ))}
          </div>
        </div>

        {/* Finish */}
        <div className="space-y-2">
          <h3 className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Finish
          </h3>
          <p className="text-sm sm:text-base text-[#1A1A1A] font-light">
            {analysis.finish}
          </p>
        </div>

        {/* Complexity Level */}
        <div className="space-y-2">
          <h3 className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Complexity Level
          </h3>
          <p className="text-sm sm:text-base text-[#1A1A1A] font-light">
            {analysis.complexityLevel}
          </p>
        </div>

        {/* Wearability */}
        <div className="space-y-2">
          <h3 className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">
            Wearability
          </h3>
          <p className="text-sm sm:text-base text-[#1A1A1A] font-light">
            {analysis.wearability}
          </p>
        </div>
      </div>
    </div>
  )
}
