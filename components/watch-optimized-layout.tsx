"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect if the app is running on Apple Watch
 */
export function useIsAppleWatch() {
  const [isWatch, setIsWatch] = useState(false)

  useEffect(() => {
    // Check viewport width (Apple Watch max width is ~272px)
    const checkIsWatch = () => {
      const width = window.innerWidth
      setIsWatch(width <= 272)
    }

    checkIsWatch()
    window.addEventListener('resize', checkIsWatch)

    return () => window.removeEventListener('resize', checkIsWatch)
  }, [])

  return isWatch
}

/**
 * Wrapper component that applies Apple Watch optimizations
 */
export function WatchOptimizedLayout({ children }: { children: React.ReactNode }) {
  const isWatch = useIsAppleWatch()

  return (
    <div className={isWatch ? 'watch-optimized' : ''}>
      {children}
    </div>
  )
}

/**
 * Conditional rendering component for Apple Watch
 */
export function WatchOnly({ children }: { children: React.ReactNode }) {
  const isWatch = useIsAppleWatch()
  return isWatch ? <>{children}</> : null
}

/**
 * Hide content on Apple Watch
 */
export function HideOnWatch({ children }: { children: React.ReactNode }) {
  const isWatch = useIsAppleWatch()
  return !isWatch ? <>{children}</> : null
}

/**
 * Simplified button for Apple Watch
 */
export function WatchButton({ 
  children, 
  onClick, 
  className = "",
  variant = "default"
}: { 
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "outline" | "ghost"
}) {
  const isWatch = useIsAppleWatch()
  
  const baseStyles = "transition-all duration-200 active:scale-95 font-light tracking-wider uppercase"
  const variantStyles = {
    default: "bg-[#1A1A1A] text-white hover:bg-[#8B7355]",
    outline: "border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F8F7F5]",
    ghost: "text-[#1A1A1A] hover:bg-[#F8F7F5]"
  }

  return (
    <button
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${isWatch ? 'watch-button' : 'h-12 px-6 text-xs'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

/**
 * Simplified card for Apple Watch
 */
export function WatchCard({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string
}) {
  const isWatch = useIsAppleWatch()

  return (
    <div className={`
      ${isWatch ? 'watch-card watch-no-border' : 'border border-[#E8E8E8] p-6'}
      bg-white
      ${className}
    `}>
      {children}
    </div>
  )
}

/**
 * Simplified grid for Apple Watch
 */
export function WatchGrid({ 
  children, 
  className = "",
  cols = 2
}: { 
  children: React.ReactNode
  className?: string
  cols?: number
}) {
  const isWatch = useIsAppleWatch()

  return (
    <div className={`
      grid
      ${isWatch ? 'watch-grid' : `grid-cols-${cols} sm:grid-cols-3 lg:grid-cols-4 gap-5`}
      ${className}
    `}>
      {children}
    </div>
  )
}
