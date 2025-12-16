"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Capacitor } from "@capacitor/core"
import LandingPage from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isNativeApp, setIsNativeApp] = useState(false)

  useEffect(() => {
    // Check if running in native Capacitor app
    const isNative = Capacitor.isNativePlatform()
    setIsNativeApp(isNative)

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
        }
        // Removed forced redirect to /auth for native apps
        // Users can now browse the landing page without authentication
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsChecking(false)
      }
    }
    
    checkSession()
  }, [router])

  // Show loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-[#2C2C2C]">Loading...</div>
      </div>
    )
  }

  // Show landing page for all users (web and native)
  return <LandingPage />
}
