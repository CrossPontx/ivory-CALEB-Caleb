// Temporary test button for onboarding video
// Add this to your home page to test the onboarding video

import { Button } from "@/components/ui/button"

export function TestOnboardingButton() {
  const testOnboarding = async () => {
    try {
      // Check if we're on native iOS
      if (typeof window !== 'undefined' && (window as any).NativeBridge) {
        console.log('🎬 Testing onboarding video...')
        
        // Reset onboarding state
        await (window as any).NativeBridge.resetOnboarding()
        console.log('✅ Onboarding reset')
        
        // Show alert to restart app
        alert('Onboarding reset! Please close and reopen the app to see the video.')
      } else {
        alert('This test only works on the native iOS app')
      }
    } catch (error) {
      console.error('Error testing onboarding:', error)
      alert('Error: ' + error)
    }
  }

  const checkOnboardingStatus = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).NativeBridge) {
        // Check if we can access the onboarding status
        console.log('🔍 Checking onboarding status...')
        console.log('NativeBridge available:', !!(window as any).NativeBridge)
        console.log('Available methods:', Object.keys((window as any).NativeBridge || {}))
      } else {
        console.log('❌ NativeBridge not available (not on native iOS)')
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2">
      <Button
        onClick={testOnboarding}
        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded"
      >
        🎬 Test Onboarding
      </Button>
      <Button
        onClick={checkOnboardingStatus}
        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded block w-full"
      >
        🔍 Check Status
      </Button>
    </div>
  )
}