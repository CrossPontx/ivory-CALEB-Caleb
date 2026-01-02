"use client"

import { useState, useEffect } from "react"

const ONBOARDING_KEY = "ivory_capture_onboarding_completed"

export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY)
    
    if (!hasCompletedOnboarding) {
      setShouldShowOnboarding(true)
    }
    
    setIsLoading(false)
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setShouldShowOnboarding(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY)
    setShouldShowOnboarding(true)
  }

  return {
    shouldShowOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding
  }
}
