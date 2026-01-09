"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Capacitor } from "@capacitor/core"
import { Browser } from "@capacitor/browser"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import { isNativeIOS } from "@/lib/native-bridge"
// import { signInWithAppleNative } from "@/lib/native-apple-auth" // Temporarily disabled - waiting for Capacitor 8 compatible version

// Keyframes for elegant animations
const styles = `
  @keyframes float-gentle {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(1deg); }
  }
  
  @keyframes shimmer-subtle {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.05; transform: scale(1); }
    50% { opacity: 0.08; transform: scale(1.05); }
  }
  
  @keyframes slide-up-fade {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-down-fade {
    0% { opacity: 0; transform: translateY(-20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scale-in {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes border-dance {
    0%, 100% { border-color: rgba(232, 232, 232, 1); }
    50% { border-color: rgba(139, 115, 85, 0.3); }
  }
  
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .animate-float-gentle {
    animation: float-gentle 6s ease-in-out infinite;
  }
  
  .animate-shimmer-subtle {
    background: linear-gradient(90deg, transparent, rgba(139, 115, 85, 0.03), transparent);
    background-size: 200% 100%;
    animation: shimmer-subtle 8s ease-in-out infinite;
  }
  
  .animate-glow-pulse {
    animation: glow-pulse 4s ease-in-out infinite;
  }
  
  .animate-slide-up-fade {
    animation: slide-up-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .animate-slide-down-fade {
    animation: slide-down-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .animate-scale-in {
    animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .animate-border-dance {
    animation: border-dance 3s ease-in-out infinite;
  }
  
  .animate-gradient-shift {
    background-size: 200% 200%;
    animation: gradient-shift 8s ease infinite;
  }
  
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  .delay-500 { animation-delay: 0.5s; }
  
  .input-focus-glow {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .input-focus-glow:focus {
    box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1), 0 8px 16px rgba(139, 115, 85, 0.08);
  }
  
  .button-hover-lift {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .button-hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  
  .button-hover-lift:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Check for existing session and referral code on mount
  useEffect(() => {
    // Get referral code from URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      setIsSignUp(true) // Auto-switch to signup mode if there's a referral code
      // Store referral code in cookie for OAuth flow (expires in 10 minutes)
      document.cookie = `pendingReferralCode=${refCode}; path=/; max-age=600; SameSite=Lax`
    }

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data.user) {
          // User is already logged in, redirect them
          localStorage.setItem("ivoryUser", JSON.stringify(data.user))
          
          // Check if there's a return URL stored
          const returnUrl = localStorage.getItem('returnUrl')
          if (returnUrl) {
            localStorage.removeItem('returnUrl')
            router.push(returnUrl)
            return
          }
          
          if (data.user.userType === 'tech') {
            router.push('/tech/dashboard')
          } else if (data.user.userType === 'client') {
            router.push('/capture')
          } else {
            router.push('/user-type')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsChecking(false)
      }
    }
    
    checkSession()

    // Listen for OAuth completion from in-app browser
    const isNative = Capacitor.isNativePlatform();
    if (isNative) {
      // Poll for session after OAuth flow
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          
          if (data.user) {
            clearInterval(pollInterval)
            localStorage.setItem("ivoryUser", JSON.stringify(data.user))
            
            if (data.user.userType === 'tech') {
              router.push('/tech/dashboard')
            } else if (data.user.userType === 'client') {
              router.push('/capture')
            } else {
              router.push('/user-type')
            }
          }
        } catch (error) {
          // Continue polling
        }
      }, 1000)

      // Clean up polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000)

      return () => clearInterval(pollInterval)
    }
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isSignUp) {
        // Sign up - create new user
        if (!email) {
          alert('Email is required for sign up')
          return
        }
        
        if (!acceptedTerms) {
          alert('You must accept the Terms of Service and Privacy Policy to create an account')
          return
        }
        
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username, 
            email, 
            password, 
            authProvider: 'email',
            referralCode: referralCode || undefined 
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Failed to sign up')
          return
        }
        
        const user = await response.json()
        localStorage.setItem("ivoryUser", JSON.stringify(user))
        
        // Check if there's a return URL stored
        const returnUrl = localStorage.getItem('returnUrl')
        if (returnUrl) {
          localStorage.removeItem('returnUrl')
          router.push(returnUrl)
          return
        }
        
        router.push("/user-type")
      } else {
        // Log in - find existing user
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Failed to log in')
          return
        }
        
        const user = await response.json()
        localStorage.setItem("ivoryUser", JSON.stringify(user))
        
        // Check if there's a return URL stored
        const returnUrl = localStorage.getItem('returnUrl')
        if (returnUrl) {
          localStorage.removeItem('returnUrl')
          router.push(returnUrl)
          return
        }
        
        // If user already has a type, go to capture/dashboard, otherwise select type
        if (user.userType) {
          router.push(user.userType === 'tech' ? '/tech/dashboard' : '/capture')
        } else {
          router.push("/user-type")
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleSocialAuth = async (provider: string) => {
    // Haptic feedback on button press
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {
        // Haptics not available, continue
      }
    }

    // Store referral code in cookie before OAuth redirect
    if (referralCode) {
      document.cookie = `pendingReferralCode=${referralCode}; path=/; max-age=600; SameSite=Lax`
    }
    
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;
    const isNative = Capacitor.isNativePlatform();
    const isIOS = Capacitor.getPlatform() === 'ios';
    
    if (provider === 'google') {
      // Build Google OAuth URL
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '');
      googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('scope', 'profile email');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      
      if (isNative) {
        // Use in-app browser (Safari View Controller on iOS)
        await Browser.open({ 
          url: googleAuthUrl.toString(),
          presentationStyle: 'popover' // Uses Safari View Controller on iOS
        });
      } else {
        // Web: redirect in same window
        window.location.href = googleAuthUrl.toString();
      }
    }
    else if (provider === 'apple') {
      // Build Apple OAuth URL for web
      const appleAuthUrl = new URL('https://appleid.apple.com/auth/authorize');
      appleAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '');
      appleAuthUrl.searchParams.set('redirect_uri', redirectUri);
      appleAuthUrl.searchParams.set('response_type', 'code id_token');
      appleAuthUrl.searchParams.set('response_mode', 'form_post');
      appleAuthUrl.searchParams.set('scope', 'name email');
      
      if (isNative) {
        // Use in-app browser (Safari View Controller on iOS)
        await Browser.open({ 
          url: appleAuthUrl.toString(),
          presentationStyle: 'popover' // Uses Safari View Controller on iOS
        });
      } else {
        // Web: redirect in same window
        window.location.href = appleAuthUrl.toString();
      }
    }
  }

  // Show loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#1A1A1A] text-xs tracking-widest uppercase font-light">Loading...</div>
      </div>
    )
  }

  const isNative = Capacitor.isNativePlatform() || isNativeIOS();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FAFAF8] to-[#F5F5F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden animate-gradient-shift">
      {/* Elegant Background Pattern with subtle animation */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none animate-shimmer-subtle">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1A1A1A 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating orbs for depth */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#8B7355] rounded-full opacity-[0.03] blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#8B7355] rounded-full opacity-[0.04] blur-3xl animate-glow-pulse delay-200" />

      {/* Back to Home Link - Only show on web, not in native iOS app */}
      {!isNative && (
        <button 
          onClick={() => router.push('/')}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-[#1A1A1A] hover:text-[#8B7355] transition-all duration-500 z-50 touch-manipulation group animate-slide-down-fade"
        >
          <div className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8E8E8] group-hover:border-[#8B7355] group-hover:shadow-lg transition-all duration-500 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </div>
          <span className="text-xs tracking-wider uppercase font-light hidden sm:inline bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E8E8E8] group-hover:border-[#8B7355] transition-all duration-500 shadow-sm group-hover:shadow-md">
            Home
          </span>
        </button>
      )}

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Main Card with Enhanced Shadow */}
        <div className="bg-white border border-[#E8E8E8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-700 p-6 sm:p-8 md:p-10 relative overflow-hidden rounded-2xl">
          {/* Subtle Top Accent with shimmer */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B7355] to-transparent opacity-60 animate-shimmer-subtle" />
          
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex justify-center items-center gap-3 mb-5 animate-slide-up-fade">
              <div className="relative animate-float-gentle">
                <div className="absolute inset-0 bg-[#8B7355] opacity-10 blur-xl rounded-full animate-glow-pulse" />
                <Image 
                  src="/Web_logo.png" 
                  alt="Ivory's Choice" 
                  width={64}
                  height={64}
                  className="h-14 sm:h-16 w-auto relative z-10"
                  priority
                />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                IVORY'S CHOICE
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm tracking-widest uppercase text-[#6B6B6B] font-light mb-5 animate-slide-up-fade delay-100">
              {referralCode ? "✨ Exclusive Invitation" : isSignUp ? "Begin Your Journey" : "Welcome Back"}
            </p>
            
            {/* Enhanced Account Toggle */}
            <div className="inline-flex items-center gap-2 px-5 py-3 border border-[#E8E8E8] bg-gradient-to-br from-[#FAFAF8] to-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-500 animate-slide-up-fade delay-200 hover:scale-[1.02]">
              <span className="text-xs tracking-wide text-[#6B6B6B] font-light">
                {isSignUp ? "Already have an account?" : "New to Ivory's Choice?"}
              </span>
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-sm font-medium text-[#8B7355] hover:text-[#1A1A1A] transition-all duration-300 underline decoration-[#8B7355] decoration-2 underline-offset-4 touch-manipulation hover:decoration-[#1A1A1A]"
              >
                {isSignUp ? "Sign in" : "Create account"}
              </button>
            </div>
            
            {referralCode && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8B7355]/10 to-[#8B7355]/5 border border-[#8B7355]/20 rounded-lg animate-slide-up-fade delay-300 hover:scale-[1.02] transition-transform duration-300">
                <svg className="w-4 h-4 text-[#8B7355] animate-float-gentle" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <p className="text-xs text-[#8B7355] font-medium">5 complimentary credits included</p>
              </div>
            )}
          </div>

          {/* Form Section */}
          <form onSubmit={handleAuth} className="space-y-5 sm:space-y-6">
            <div className="space-y-2 animate-slide-up-fade delay-300">
              <label className="block text-[11px] tracking-widest uppercase text-[#6B6B6B] mb-2.5 font-medium">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-12 sm:h-14 text-base border-[#E8E8E8] rounded-lg focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/20 font-light touch-manipulation bg-white hover:border-[#8B7355]/50 placeholder:text-[#CCCCCC] input-focus-glow hover:shadow-md"
                required
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-2 animate-slide-up-fade delay-400">
                <label className="block text-[11px] tracking-widest uppercase text-[#6B6B6B] mb-2.5 font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 sm:h-14 text-base border-[#E8E8E8] rounded-lg focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/20 font-light touch-manipulation bg-white hover:border-[#8B7355]/50 placeholder:text-[#CCCCCC] input-focus-glow hover:shadow-md"
                  required
                />
              </div>
            )}
            
            <div className="relative space-y-2 animate-slide-up-fade delay-500">
              <label className="block text-[11px] tracking-widest uppercase text-[#6B6B6B] mb-2.5 font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 sm:h-14 text-base border-[#E8E8E8] rounded-lg focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/20 pr-12 font-light touch-manipulation bg-white hover:border-[#8B7355]/50 placeholder:text-[#CCCCCC] input-focus-glow hover:shadow-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#6B6B6B] hover:text-[#8B7355] transition-all duration-300 touch-manipulation rounded-lg hover:bg-[#FAFAF8] hover:scale-110"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="border border-[#E8E8E8] bg-gradient-to-br from-[#FAFAF8] to-white p-5 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-500 animate-slide-up-fade delay-500">
                <label 
                  htmlFor="terms-checkbox" 
                  className="flex items-start gap-4 cursor-pointer group"
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-[#E8E8E8] bg-white transition-all duration-500 checked:border-[#8B7355] checked:bg-[#8B7355] hover:border-[#8B7355] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/30 focus:ring-offset-2 touch-manipulation"
                      required
                    />
                    <svg 
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-all duration-300 peer-checked:scale-110" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-[13px] text-[#1A1A1A] font-light leading-relaxed">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push('/terms')
                        }}
                        className="text-[#8B7355] hover:text-[#1A1A1A] underline decoration-1 underline-offset-2 transition-all duration-300 touch-manipulation font-medium hover:decoration-2"
                      >
                        Terms of Service
                      </button>
                      {" "}and{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push('/privacy-policy')
                        }}
                        className="text-[#8B7355] hover:text-[#1A1A1A] underline decoration-1 underline-offset-2 transition-all duration-300 touch-manipulation font-medium hover:decoration-2"
                      >
                        Privacy Policy
                      </button>
                    </p>
                    <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mt-2.5 tracking-wide">
                      Including our zero-tolerance policy for objectionable content and abusive behavior.
                    </p>
                  </div>
                </label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white hover:from-[#8B7355] hover:to-[#9B8365] text-xs tracking-widest uppercase rounded-lg font-medium mt-7 touch-manipulation shadow-lg button-hover-lift animate-slide-up-fade delay-500"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {!isSignUp && (
            <div className="mt-6 text-center animate-slide-up-fade delay-500">
              <button 
                type="button" 
                onClick={() => router.push('/forgot-password')} 
                className="text-sm text-[#6B6B6B] hover:text-[#8B7355] transition-all duration-300 font-light touch-manipulation underline decoration-1 underline-offset-4 hover:decoration-2 hover:scale-105 inline-block"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-[#E8E8E8] text-center animate-slide-up-fade delay-500">
            <div className="flex items-center justify-center gap-4 text-xs tracking-wider text-[#6B6B6B] font-light">
              <button 
                type="button"
                onClick={() => router.push('/privacy-policy')}
                className="hover:text-[#8B7355] transition-all duration-300 touch-manipulation underline decoration-1 underline-offset-4 hover:decoration-2 hover:scale-105"
              >
                Privacy
              </button>
              <span className="text-[#E8E8E8]">•</span>
              <button 
                type="button"
                onClick={() => router.push('/terms')}
                className="hover:text-[#8B7355] transition-all duration-300 touch-manipulation underline decoration-1 underline-offset-4 hover:decoration-2 hover:scale-105"
              >
                Terms
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Glow with animation */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-[#8B7355] opacity-5 blur-3xl rounded-full pointer-events-none animate-glow-pulse" />
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-white via-[#FAFAF8] to-[#F5F5F3] flex items-center justify-center">
          <div className="text-[#1A1A1A] text-xs tracking-widest uppercase font-light animate-pulse">Loading...</div>
        </div>
      }>
        <AuthPageContent />
      </Suspense>
    </>
  )
}
