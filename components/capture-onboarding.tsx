"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

type OnboardingStep = {
  id: string
  title: string
  description: string
  targetElement: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action: string
  requiresNext?: boolean // For steps that need "Next" button instead of interaction
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'capture',
    title: 'Take a Photo',
    description: 'Capture or upload a photo of your hand in good lighting for best results',
    targetElement: 'capture-button',
    position: 'top',
    action: 'Tap the camera button'
  },
  {
    id: 'open-upload-drawer',
    title: 'Open Upload Drawer',
    description: 'Tap this button to open the design upload drawer',
    targetElement: 'design-images-option',
    position: 'left',
    action: 'Tap to open drawer'
  },
  {
    id: 'upload-design',
    title: 'Upload Design Images',
    description: 'Tap here to select and upload reference images of nail designs you like',
    targetElement: 'upload-design-button',
    position: 'top',
    action: 'Tap to upload images'
  },
  {
    id: 'close-upload-drawer',
    title: 'Close the Drawer',
    description: 'Tap the bar at the top to close the upload drawer',
    targetElement: 'close-upload-drawer',
    position: 'bottom',
    action: 'Tap to close'
  },
  {
    id: 'drawing-canvas',
    title: 'Drawing Canvas',
    description: 'Draw directly on your nails to guide the AI design',
    targetElement: 'drawing-canvas-button',
    position: 'left',
    action: 'Tap to open drawing tool'
  },
  {
    id: 'close-drawing-canvas',
    title: 'Close Drawing Canvas',
    description: 'Tap the X button to close the drawing canvas and continue',
    targetElement: 'close-drawing-canvas',
    position: 'bottom',
    action: 'Tap X to close'
  },
  {
    id: 'nail-shape',
    title: 'Choose Nail Shape',
    description: 'Select your nail shape - oval, square, almond, and more',
    targetElement: 'nail-shape-option',
    position: 'left',
    action: 'Tap to choose shape'
  },
  {
    id: 'select-nail-shape',
    title: 'Select a Shape',
    description: 'Scroll through and tap on any nail shape to select it',
    targetElement: 'nail-shape-slider',
    position: 'top',
    action: 'Tap a shape'
  },
  {
    id: 'close-design-drawer',
    title: 'Close Design Parameters',
    description: 'Tap the gray bar at the top to close the design drawer',
    targetElement: 'close-design-drawer',
    position: 'bottom',
    action: 'Tap to close'
  },
  {
    id: 'replace-image',
    title: 'Replace Hand Photo',
    description: 'Tap here to retake your hand photo if needed',
    targetElement: 'replace-photo-button',
    position: 'left',
    action: 'Tap to open camera'
  },
  {
    id: 'close-camera',
    title: 'Exit Camera',
    description: 'Tap the X button to return to your design after taking a photo',
    targetElement: 'camera-close-button',
    position: 'bottom',
    action: 'Tap X to close'
  },
  {
    id: 'visualize',
    title: 'Generate Your Design',
    description: 'Tap this button to see your custom design on your nails',
    targetElement: 'visualize-button',
    position: 'top',
    action: 'Tap to visualize'
  },
  {
    id: 'confirm',
    title: 'Confirm Generation',
    description: 'Review the cost and confirm to generate your design',
    targetElement: 'confirm-generation-button',
    position: 'top',
    action: 'Tap Confirm to complete',
    requiresNext: false
  }
]

interface CaptureOnboardingProps {
  onComplete: () => void
  currentPhase: 'capture' | 'design' | 'visualize'
  currentStep?: number // Receive step from parent
  onStepChange?: (step: number) => void
}

export function CaptureOnboarding({ onComplete, currentPhase, currentStep: externalStep, onStepChange }: CaptureOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0) // Always start at step 0
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const prevExternalStepRef = useRef<number | undefined>(undefined)
  const isSyncingFromParentRef = useRef(false)

  // Sync with external step changes from parent - continuously update when parent changes
  useEffect(() => {
    if (externalStep !== undefined && externalStep !== prevExternalStepRef.current) {
      console.log('🔄 CaptureOnboarding: Syncing from parent:', externalStep, '(was:', prevExternalStepRef.current, ')')
      isSyncingFromParentRef.current = true // Mark that we're syncing from parent
      setCurrentStep(externalStep)
      prevExternalStepRef.current = externalStep
      // Reset the flag after state update completes
      setTimeout(() => {
        isSyncingFromParentRef.current = false
      }, 0)
    }
  }, [externalStep]) // Remove currentStep from dependencies to prevent infinite loop

  // Notify parent of step changes (but not when syncing FROM parent)
  useEffect(() => {
    if (onStepChange && !isSyncingFromParentRef.current) {
      onStepChange(currentStep)
    }
  }, [currentStep, onStepChange])

  // REMOVED: Auto-advance based on phase - this was causing jumps to step 7
  // The onboarding should always start at step 0 and advance based on user actions only

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  // Position tooltip next to target element and scroll into view
  useEffect(() => {
    const step = ONBOARDING_STEPS[currentStep]
    
    // Retry mechanism to wait for element to be available (especially for drawer content)
    const positionTooltip = (retries = 0) => {
      const targetElement = document.querySelector(`[data-onboarding="${step.targetElement}"]`)
      
      if (!targetElement && retries < 10) {
        // Element not found yet, retry after a short delay
        setTimeout(() => positionTooltip(retries + 1), 100)
        return
      }
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        setTargetRect(rect)
        
        // Scroll target element into view with some padding
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        })
        
        // Wait for scroll to complete before positioning tooltip
        setTimeout(() => {
          const updatedRect = targetElement.getBoundingClientRect()
          setTargetRect(updatedRect)
        
        // Responsive tooltip dimensions
        const isMobile = window.innerWidth < 640
        const tooltipWidth = isMobile ? Math.min(280, window.innerWidth - 32) : 300
        const tooltipHeight = isMobile ? 180 : 200
        const padding = isMobile ? 12 : 16
        const offset = isMobile ? 16 : 20 // Distance from target element
        
        // Calculate tooltip position based on step position
        let top = 0
        let left = 0
        let finalPosition = step.position
        
        // For mobile, prefer top/bottom positioning over left/right
        if (isMobile && (step.position === 'left' || step.position === 'right')) {
          // Check if there's more space above or below
          const spaceAbove = updatedRect.top
          const spaceBelow = window.innerHeight - updatedRect.bottom
          finalPosition = spaceAbove > spaceBelow ? 'top' : 'bottom'
        }
        
        switch (finalPosition) {
          case 'top':
            top = updatedRect.top - tooltipHeight - offset
            left = updatedRect.left + updatedRect.width / 2 - tooltipWidth / 2
            break
          case 'bottom':
            top = updatedRect.bottom + offset
            left = updatedRect.left + updatedRect.width / 2 - tooltipWidth / 2
            break
          case 'left':
            top = updatedRect.top + updatedRect.height / 2 - tooltipHeight / 2
            left = updatedRect.left - tooltipWidth - offset
            break
          case 'right':
            top = updatedRect.top + updatedRect.height / 2 - tooltipHeight / 2
            left = updatedRect.right + offset
            break
        }
        
        // Ensure tooltip stays within viewport bounds
        // Horizontal bounds
        if (left < padding) {
          left = padding
        } else if (left + tooltipWidth > window.innerWidth - padding) {
          left = window.innerWidth - tooltipWidth - padding
        }
        
        // Vertical bounds
        if (top < padding) {
          top = padding
        } else if (top + tooltipHeight > window.innerHeight - padding) {
          top = window.innerHeight - tooltipHeight - padding
        }
        
        setTooltipPosition({ top, left })
      }, 500) // Wait for scroll animation
    }
  }
  
  // Start positioning
  positionTooltip()
  }, [currentStep])

  const handleSkip = () => {
    onComplete()
  }

  const step = ONBOARDING_STEPS[currentStep]

  return (
    <>
      {/* Semi-transparent overlay that allows interaction */}
      <div className="fixed inset-0 z-[200]" style={{ pointerEvents: 'none' }}>
        {/* Spotlight effect - cut out the target element */}
        {targetRect && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {/* For step 1 (capture photo), create a large elegant center cutout for the camera view */}
                {currentStep === 0 ? (
                  <>
                    {/* Large elegant center area for viewing hand - bigger and more mobile-friendly */}
                    <rect
                      x={window.innerWidth * 0.05}
                      y={window.innerHeight * 0.12}
                      width={window.innerWidth * 0.9}
                      height={window.innerHeight * 0.6}
                      rx="32"
                      fill="black"
                    />
                    {/* Capture button area */}
                    <rect
                      x={targetRect.left - 8}
                      y={targetRect.top - 8}
                      width={targetRect.width + 16}
                      height={targetRect.height + 16}
                      rx="16"
                      fill="black"
                    />
                  </>
                ) : (
                  /* Normal spotlight for other steps */
                  <rect
                    x={targetRect.left - 8}
                    y={targetRect.top - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx="16"
                    fill="black"
                  />
                )}
              </mask>
              <filter id="spotlight-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Elegant gradient for the viewing area border */}
              <linearGradient id="elegant-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8B7355', stopOpacity: 0.6 }} />
                <stop offset="50%" style={{ stopColor: '#A0826D', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#8B7355', stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.75)"
              mask="url(#spotlight-mask)"
              style={{ pointerEvents: 'none' }}
            />
          </svg>
        )}
        
        {/* Elegant pulsing ring around target */}
        {targetRect && (
          <>
            {/* For step 1, add an elegant ring around the camera viewing area */}
            {currentStep === 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: window.innerHeight * 0.12,
                  left: window.innerWidth * 0.05,
                  width: window.innerWidth * 0.9,
                  height: window.innerHeight * 0.6,
                  pointerEvents: 'none'
                }}
              >
                {/* Outer glow ring */}
                <div 
                  className="absolute inset-0 rounded-[32px] animate-pulse" 
                  style={{ 
                    border: '3px solid transparent',
                    backgroundImage: 'linear-gradient(135deg, rgba(139, 115, 85, 0.5), rgba(160, 130, 109, 0.4), rgba(139, 115, 85, 0.5))',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'border-box',
                    boxShadow: '0 0 30px rgba(139, 115, 85, 0.3), inset 0 0 20px rgba(139, 115, 85, 0.1)',
                    filter: 'drop-shadow(0 0 12px rgba(139, 115, 85, 0.4))'
                  }} 
                />
                {/* Inner subtle ring */}
                <div 
                  className="absolute rounded-[32px]" 
                  style={{
                    top: '4px',
                    left: '4px',
                    right: '4px',
                    bottom: '4px',
                    border: '2px solid rgba(160, 130, 109, 0.3)',
                    boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>
            )}
            
            {/* Ring around the actual target button */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                pointerEvents: 'none'
              }}
            >
              <div className="absolute inset-0 rounded-2xl border-[3px] border-[#8B7355]/60 animate-pulse shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 115, 85, 0.4))' }} />
              <div className="absolute inset-0 rounded-2xl border-[2px] border-[#A0826D]/40 animate-ping opacity-60" />
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[201] pointer-events-auto transition-all duration-700 ease-out"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="bg-white/98 backdrop-blur-2xl rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-4 sm:p-5 w-[calc(100vw-32px)] sm:w-[300px] max-w-[300px] border border-[#8B7355]/10 relative animate-fade-in-scale">
          {/* Elegant Arrow pointing to target - more subtle */}
          {step.position === 'top' && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/98 drop-shadow-md" />
          )}
          {step.position === 'bottom' && (
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white/98 drop-shadow-md" />
          )}
          {step.position === 'right' && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-white/98 drop-shadow-md" />
          )}
          {step.position === 'left' && (
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-white/98 drop-shadow-md" />
          )}

          {/* Close button - more elegant */}
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-all duration-300 z-10 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100/80 active:scale-90"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Content */}
          <div className="pr-7">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#8B7355] via-[#9B8165] to-[#A0826D] flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-[#8B7355]/20">
                <span className="text-white font-semibold text-xs sm:text-sm">{currentStep + 1}</span>
              </div>
              <h3 className="font-serif text-sm sm:text-base font-semibold text-[#1A1A1A] leading-snug">
                {step.title}
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 font-normal pl-0.5">
              {step.description}
            </p>

            {/* Next button for steps that require it */}
            {step.requiresNext && (
              <button
                onClick={handleNext}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#8B7355] via-[#9B8165] to-[#A0826D] hover:from-[#6B5845] hover:via-[#7B6155] hover:to-[#8B7355] text-white rounded-2xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.97] hover:translate-y-[-1px]"
              >
                Next
              </button>
            )}
          </div>

          {/* Progress indicator - more minimal */}
          <div className="flex gap-1 mt-3.5 pt-3.5 border-t border-gray-100/80">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-700 ${
                  index === currentStep 
                    ? 'bg-gradient-to-r from-[#8B7355] via-[#9B8165] to-[#A0826D] scale-110 shadow-sm' 
                    : index < currentStep
                    ? 'bg-[#8B7355]/30'
                    : 'bg-gray-200/60'
                }`}
              />
            ))}
          </div>

          {/* Skip button - more subtle */}
          <button
            onClick={handleSkip}
            className="w-full mt-2.5 text-[10px] sm:text-xs text-gray-400 hover:text-gray-600 transition-all duration-300 font-normal tracking-wide uppercase opacity-70 hover:opacity-100"
          >
            Skip tutorial
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  )
}
