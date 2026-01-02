'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

export type TransitionDirection = 'left' | 'right' | 'up' | 'down'

interface UsePageTransitionOptions {
  duration?: number
  direction?: TransitionDirection
}

export function usePageTransition(options: UsePageTransitionOptions = {}) {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(
    options.direction || 'right'
  )
  const duration = options.duration || 300

  const navigateWithTransition = useCallback(
    (path: string, direction: TransitionDirection = 'right') => {
      if (isTransitioning) return

      setIsTransitioning(true)
      setTransitionDirection(direction)

      // Add slide-out animation class to body
      document.body.classList.add('page-transitioning')
      document.body.style.setProperty('--transition-direction', direction)

      // Navigate after a brief delay to show the slide-out animation
      setTimeout(() => {
        router.push(path)
        
        // Remove transition class after navigation
        setTimeout(() => {
          setIsTransitioning(false)
          document.body.classList.remove('page-transitioning')
        }, duration)
      }, 50)
    },
    [router, isTransitioning, duration]
  )

  return {
    navigateWithTransition,
    isTransitioning,
    transitionDirection,
  }
}