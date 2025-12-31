"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function OnboardingSettingsPage() {
  const [isReset, setIsReset] = useState(false)
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    // Check onboarding status on client side only
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('ivory_capture_onboarding_completed') === 'true'
      setHasCompleted(completed)
    }
  }, [])

  const handleResetOnboarding = () => {
    localStorage.removeItem('ivory_capture_onboarding_completed')
    setHasCompleted(false)
    setIsReset(true)
    toast.success('Onboarding reset!', {
      description: 'Visit the capture page to see the onboarding tour again',
    })
    
    setTimeout(() => setIsReset(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7F5] to-white p-6">
      <div className="max-w-2xl mx-auto pt-20">
        <h1 className="font-serif text-3xl font-light text-[#1A1A1A] mb-2">
          Onboarding Settings
        </h1>
        <p className="text-gray-600 mb-8">
          Manage your onboarding experience
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasCompleted === null ? (
                <>
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  Loading...
                </>
              ) : hasCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Onboarding Completed
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 text-[#8B7355]" />
                  Onboarding Not Completed
                </>
              )}
            </CardTitle>
            <CardDescription>
              {hasCompleted === null 
                ? "Checking onboarding status..."
                : hasCompleted 
                  ? "You've completed the capture page onboarding tour"
                  : "You haven't completed the onboarding tour yet"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">What is the onboarding tour?</h3>
              <p className="text-sm text-gray-600">
                The onboarding tour is a quick 4-step guide that helps new users create their first nail design. 
                It appears automatically on your first visit to the capture page and guides you through:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Taking or uploading a photo of your hand</li>
                <li>Customizing your nail design</li>
                <li>Generating your first design</li>
              </ul>
            </div>

            <Button
              onClick={handleResetOnboarding}
              className="w-full bg-[#8B7355] hover:bg-[#6B5845] text-white"
              disabled={isReset}
            >
              {isReset ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reset Complete!
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Onboarding Tour
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              After resetting, visit the capture page to see the onboarding tour again
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-sm text-blue-900 mb-2">💡 For Testing</h3>
          <p className="text-sm text-blue-800">
            Use this page to reset the onboarding tour for testing purposes. 
            You can also open the browser console and run:
          </p>
          <code className="block mt-2 p-2 bg-blue-100 rounded text-xs font-mono">
            localStorage.removeItem('ivory_capture_onboarding_completed')
          </code>
        </div>
      </div>
    </div>
  )
}
