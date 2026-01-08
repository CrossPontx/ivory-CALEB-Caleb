"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Capacitor } from "@capacitor/core"
import LandingPage from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()
  // Check immediately if native (synchronous) - supports both Capacitor and native bridge
  const isNativeApp = Capacitor.isNativePlatform() || (typeof window !== 'undefined' && !!(window as any).NativeBridge)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data.user) {
          // User is already logged in, redirect them
          localStorage.setItem("ivoryUser", JSON.stringify(data.user))
          if (data.user.userType === 'tech') {
            router.push('/tech/dashboard')
          } else if (data.user.userType === 'client') {
            router.push('/home')
          } else {
            router.push('/user-type')
          }
        } else if (isNativeApp) {
          // Native iOS app users skip landing page and go directly to auth
          router.push('/auth')
        } else {
          // Web user without session - show landing page
          setIsChecking(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        if (isNativeApp) {
          // On error in native app, still go to auth
          router.push('/auth')
        } else {
          setIsChecking(false)
        }
      }
    }
    
    checkSession()
  }, [router, isNativeApp])

  // For native app, never show landing page - keep blank screen during redirect
  // For web, show loading until session check completes
  if (isChecking || isNativeApp) {
    return (
      <div className="min-h-screen bg-[#000000]" />
    )
  }

  // Show landing page for web users only
  return <LandingPage />
}
