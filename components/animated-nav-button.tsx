'use client'

import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/haptics'
import { usePageTransition } from '@/hooks/use-page-transition'

interface AnimatedNavButtonProps {
  icon: LucideIcon
  label?: string
  path: string
  isActive: boolean
  isWatch?: boolean
  onClick?: () => void
  direction?: 'left' | 'right' | 'up' | 'down'
  variant?: 'desktop' | 'mobile'
}

export function AnimatedNavButton({
  icon: Icon,
  label,
  path,
  isActive,
  isWatch = false,
  onClick,
  direction = 'right',
  variant = 'mobile'
}: AnimatedNavButtonProps) {
  const { navigateWithTransition, isTransitioning } = usePageTransition()
  const [isPressed, setIsPressed] = React.useState(false)

  const handleClick = () => {
    if (isTransitioning) return
    
    haptics.light()
    setIsPressed(true)
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 150)
    
    if (onClick) {
      onClick()
    } else {
      navigateWithTransition(path, direction)
    }
  }

  const baseClasses = cn(
    'flex items-center justify-center transition-all duration-300 relative overflow-hidden',
    'active:scale-95 transform-gpu',
    // Add subtle slide animation on press
    isPressed && 'animate-pulse',
    // Disable during transitions
    isTransitioning && 'pointer-events-none opacity-75'
  )

  if (variant === 'desktop') {
    return (
      <button
        onClick={handleClick}
        disabled={isTransitioning}
        className={cn(
          baseClasses,
          'w-12 h-12 rounded-lg',
          isActive
            ? 'text-[#1A1A1A] bg-[#F8F7F5] shadow-sm'
            : 'text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5]/50'
        )}
      >
        <Icon className="w-6 h-6" strokeWidth={isActive ? 1.5 : 1} />
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1A1A1A] rounded-r-full animate-in slide-in-from-left-2 duration-300" />
        )}
        
        {/* Ripple effect on click */}
        {isPressed && (
          <div className="absolute inset-0 bg-[#8B7355]/20 rounded-lg animate-ping" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isTransitioning}
      className={cn(
        baseClasses,
        'flex-col',
        isWatch ? 'w-10 h-10 watch-nav-item' : 'w-12 h-12',
        isActive ? 'text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#8B7355]'
      )}
    >
      <Icon 
        className={isWatch ? "w-4 h-4" : "w-6 h-6"} 
        strokeWidth={isActive ? 1.5 : 1} 
      />
      {isWatch && label && (
        <span className="text-[8px] mt-0.5">{label}</span>
      )}
      
      {isActive && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1A1A1A] rounded-full animate-in zoom-in-50 duration-300" />
      )}
      
      {/* Ripple effect on click */}
      {isPressed && (
        <div className="absolute inset-0 bg-[#8B7355]/20 rounded-full animate-ping" />
      )}
    </button>
  )
}