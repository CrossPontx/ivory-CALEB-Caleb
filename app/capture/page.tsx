"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Upload, Loader2, X, ChevronDown, Share2, Trash2, Camera } from "lucide-react"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import { CreditsDisplay } from "@/components/credits-display"
import { useCredits } from "@/hooks/use-credits"
import { toast } from "sonner"
import { BottomNav } from "@/components/bottom-nav"
import { DrawingCanvasKonva as DrawingCanvas } from "@/components/drawing-canvas-konva"
import { Pencil } from "lucide-react"
import { ZeroCreditsBanner } from "@/components/zero-credits-banner"
import { GenerationConfirmationDialog } from "@/components/generation-confirmation-dialog"
import { CaptureOnboarding } from "@/components/capture-onboarding"
import { useOnboarding } from "@/hooks/use-onboarding"
import { isNative, isNativeIOS, takePicture } from "@/lib/native-bridge"

type DesignMode = 'design' | 'ai-design' | null

type DesignSettings = {
  nailLength: string
  nailShape: string
  baseColor: string
  finish: string
  texture: string
  patternType: string
  styleVibe: string
  accentColor: string
}

const baseColors = ["#FF6B9D", "#C44569", "#A8E6CF", "#FFD93D", "#6C5CE7", "#E17055", "#FDCB6E", "#74B9FF"]

type DesignTab = {
  id: string
  name: string
  finalPreviews: string[]
  designSettings: DesignSettings
  selectedDesignImages: string[]
  drawingImageUrl: string | null
  aiPrompt: string
  originalImage: string | null
  isGenerating: boolean
  generationProgress: number
}

export default function CapturePage() {
  const router = useRouter()
  const { credits, hasCredits, refresh: refreshCredits } = useCredits()
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding()
  
  const [onboardingPhase, setOnboardingPhase] = useState<'capture' | 'design' | 'visualize'>('capture')
  const [onboardingStep, setOnboardingStep] = useState(0)
  
  // Check localStorage immediately for loaded design to prevent camera flash
  const getInitialCapturedImage = () => {
    if (typeof window === 'undefined') return null
    
    // First check for loaded design (from edit)
    const loadedImage = localStorage.getItem("currentEditingImage")
    if (loadedImage) {
      console.log('🎯 Found initial captured image in localStorage (loaded design)')
      console.log('🎯 Image length:', loadedImage.length)
      return loadedImage
    }
    
    // Then check for existing session
    const savedTabs = localStorage.getItem("captureSession_designTabs")
    const savedActiveTabId = localStorage.getItem("captureSession_activeTabId")
    
    if (savedTabs) {
      try {
        const tabs = JSON.parse(savedTabs)
        // Find the active tab or first tab
        const activeTab = tabs.find((t: DesignTab) => t.id === savedActiveTabId) || tabs[0]
        
        if (activeTab?.originalImage) {
          console.log('🎯 Found initial captured image in session storage')
          console.log('🎯 Image length:', activeTab.originalImage.length)
          return activeTab.originalImage
        }
      } catch (e) {
        console.error('Error parsing saved tabs:', e)
      }
    }
    
    console.log('❌ No initial captured image found')
    return null
  }
  
  const [capturedImage, setCapturedImage] = useState<string | null>(getInitialCapturedImage())
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isFlipping, setIsFlipping] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showZoomIndicator, setShowZoomIndicator] = useState(false)
  const [handReference, setHandReference] = useState<1 | 2 | 3>(1)
  const [designMode, setDesignMode] = useState<DesignMode>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploadingDesign, setIsUploadingDesign] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedDesigns, setGeneratedDesigns] = useState<string[]>([])
  const [selectedDesignImages, setSelectedDesignImages] = useState<string[]>([])
  
  // Debug: Log capturedImage whenever it changes
  useEffect(() => {
    console.log('📸 capturedImage changed:', capturedImage ? `${capturedImage.substring(0, 50)}... (length: ${capturedImage.length})` : 'NULL')
  }, [capturedImage])
  
  // Debug: Log selectedDesignImages whenever it changes
  useEffect(() => {
    console.log('🎨 selectedDesignImages changed:', selectedDesignImages.length, selectedDesignImages)
  }, [selectedDesignImages])
  const [finalPreview, setFinalPreview] = useState<string | null>(null)
  const [finalPreviews, setFinalPreviews] = useState<string[]>([])
  const [colorLightness, setColorLightness] = useState(65) // 0-100 for lightness (matches initial color)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false) // Bottom drawer toggle state
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false) // Upload drawer toggle state
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null)
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false)
  const [drawingImageUrl, setDrawingImageUrl] = useState<string | null>(null)
  const [compositeImageForEditing, setCompositeImageForEditing] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true) // Track if we're still initializing
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingGenerationSettings, setPendingGenerationSettings] = useState<DesignSettings | null>(null)
  const [savedImageBeforeReplace, setSavedImageBeforeReplace] = useState<string | null>(null) // Store image before replace
  
  // Tabs for multiple designs
  const [designTabs, setDesignTabs] = useState<DesignTab[]>([
    {
      id: 'tab-initial-1',
      name: 'Design 1',
      finalPreviews: [],
      designSettings: {
        nailLength: 'medium',
        nailShape: 'oval',
        baseColor: '#FF6B9D',
        finish: 'cateye',
        texture: 'smooth',
        patternType: 'solid',
        styleVibe: 'elegant',
        accentColor: '#FFFFFF'
      },
      selectedDesignImages: [],
      drawingImageUrl: null,
      aiPrompt: '',
      originalImage: null,
      isGenerating: false,
      generationProgress: 0
    }
  ])
  const [activeTabId, setActiveTabId] = useState('tab-initial-1')
  
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    nailLength: 'medium',
    nailShape: 'oval',
    baseColor: '#FF6B9D',
    finish: 'cateye',
    texture: 'smooth',
    patternType: 'solid',
    styleVibe: 'elegant',
    accentColor: '#FFFFFF'
  })

  // Influence weights for Nail Editor
  // Drawing, designImage, and baseColor should always sum to 100
  const [influenceWeights, setInfluenceWeights] = useState({
    nailEditor_drawing: 0,
    nailEditor_designImage: 0,
    nailEditor_baseColor: 100,
    nailEditor_finish: 100,
    nailEditor_texture: 100
  })

  // Nail Editor influence handlers with three-way balance
  const handleNailEditorDrawingInfluence = (value: number) => {
    const remaining = 100 - value
    // Distribute remaining between designImage and baseColor
    // If design images exist, prioritize them, otherwise use baseColor
    if (selectedDesignImages.length > 0) {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_drawing: value,
        nailEditor_designImage: remaining,
        nailEditor_baseColor: 0
      }))
    } else {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_drawing: value,
        nailEditor_designImage: 0,
        nailEditor_baseColor: remaining
      }))
    }
  }

  const handleNailEditorDesignImageInfluence = (value: number) => {
    const remaining = 100 - value
    // Distribute remaining between drawing and baseColor
    // If drawing exists, prioritize it, otherwise use baseColor
    if (drawingImageUrl) {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_designImage: value,
        nailEditor_drawing: remaining,
        nailEditor_baseColor: 0
      }))
    } else {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_designImage: value,
        nailEditor_drawing: 0,
        nailEditor_baseColor: remaining
      }))
    }
  }

  const handleNailEditorBaseColorInfluence = (value: number) => {
    const remaining = 100 - value
    // Distribute remaining between drawing and designImage
    // Prioritize drawing if it exists, then designImage
    if (drawingImageUrl) {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_baseColor: value,
        nailEditor_drawing: remaining,
        nailEditor_designImage: 0
      }))
    } else if (selectedDesignImages.length > 0) {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_baseColor: value,
        nailEditor_designImage: remaining,
        nailEditor_drawing: 0
      }))
    } else {
      // If nothing else exists, keep baseColor at 100
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_baseColor: 100,
        nailEditor_designImage: 0,
        nailEditor_drawing: 0
      }))
    }
  }
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const designUploadRef = useRef<HTMLInputElement>(null)
  const lastTouchDistanceRef = useRef<number>(0)
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get active tab
  const activeTab = designTabs.find(tab => tab.id === activeTabId) || designTabs[0]
  
  // Sync current state with active tab
  useEffect(() => {
    // Don't sync during initial load - let the initialization logic handle it
    if (isInitializing) return
    
    // Don't sync if we're in auto-visualize mode - let the auto-visualize logic handle it
    if (isAutoVisualizeRef.current) {
      console.log('⏭️ Skipping tab sync - in auto-visualize mode')
      isAutoVisualizeRef.current = false // Reset for next time
      return
    }
    
    if (activeTab) {
      console.log('🔄 Syncing to active tab:', activeTabId)
      console.log('  - originalImage:', activeTab.originalImage ? 'EXISTS' : 'NULL')
      console.log('  - selectedDesignImages:', activeTab.selectedDesignImages?.length || 0)
      console.log('  - drawingImageUrl:', activeTab.drawingImageUrl ? 'EXISTS' : 'NULL')
      
      setFinalPreviews(activeTab.finalPreviews)
      setDesignSettings(activeTab.designSettings)
      setSelectedDesignImages(activeTab.selectedDesignImages)
      setDrawingImageUrl(activeTab.drawingImageUrl)
      setAiPrompt(activeTab.aiPrompt)
      setCapturedImage(activeTab.originalImage)
      setIsGenerating(activeTab.isGenerating)
      setGenerationProgress(activeTab.generationProgress)
      
      // Stop camera when switching to a tab that has content
      if (activeTab.originalImage || activeTab.finalPreviews.length > 0) {
        stopCamera()
      }
    }
  }, [activeTabId, isInitializing])
  
  // Update active tab when state changes
  useEffect(() => {
    setDesignTabs(tabs => tabs.map(tab => 
      tab.id === activeTabId 
        ? {
            ...tab,
            finalPreviews,
            designSettings,
            selectedDesignImages,
            drawingImageUrl,
            aiPrompt,
            originalImage: capturedImage,
            isGenerating,
            generationProgress
          }
        : tab
    ))
  }, [finalPreviews, designSettings, selectedDesignImages, drawingImageUrl, aiPrompt, capturedImage, activeTabId, isGenerating, generationProgress])
  
  // Add new tab
  const addNewTab = () => {
    // Generate unique ID based on timestamp to avoid duplicates
    const newId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tabNumber = designTabs.length + 1
    
    // Use the original image from the first tab (or current active tab) if available
    const originalImageToUse = designTabs[0]?.originalImage || activeTab?.originalImage || capturedImage
    
    const newTab: DesignTab = {
      id: newId,
      name: `Design ${tabNumber}`,
      finalPreviews: [],
      designSettings: {
        nailLength: 'medium',
        nailShape: 'oval',
        baseColor: '#FF6B9D',
        finish: 'cateye',
        texture: 'smooth',
        patternType: 'solid',
        styleVibe: 'elegant',
        accentColor: '#FFFFFF'
      },
      selectedDesignImages: [],
      drawingImageUrl: null,
      aiPrompt: '',
      originalImage: originalImageToUse, // Use the same original image
      isGenerating: false,
      generationProgress: 0
    }
    setDesignTabs([...designTabs, newTab])
    setActiveTabId(newId)
    
    // Set the captured image immediately so camera doesn't start
    if (originalImageToUse) {
      setCapturedImage(originalImageToUse)
      stopCamera() // Ensure camera is stopped
    } else {
      // Only start camera if there's no original image available
      setTimeout(() => {
        startCamera()
      }, 200)
    }
  }
  
  // Remove tab
  const removeTab = (tabId: string) => {
    if (designTabs.length === 1) return // Don't remove last tab
    
    const newTabs = designTabs.filter(tab => tab.id !== tabId)
    setDesignTabs(newTabs)
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id)
    }
  }
  const abortControllerRef = useRef<AbortController | null>(null)
  const hasLoadedDesignRef = useRef(false) // Track if we've loaded a design to prevent double-loading
  const isInitialLoadRef = useRef(true) // Track if we're in initial load to prevent premature saves
  const isAutoVisualizeRef = useRef(false) // Track if we're in auto-visualize mode

  // Check for user session and existing tabs on mount
  useEffect(() => {
    const initializePage = async () => {
      // Ensure user data is in localStorage
      const userStr = localStorage.getItem("ivoryUser")
      if (!userStr) {
        try {
          // Add timeout to session fetch
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
          
          const sessionRes = await fetch('/api/auth/session', {
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (sessionData.user) {
              localStorage.setItem("ivoryUser", JSON.stringify(sessionData.user))
              console.log('User session restored from API')
            } else {
              console.error('No user session found')
              router.push("/")
              return
            }
          } else {
            console.error('Session fetch failed:', sessionRes.status)
            router.push("/")
            return
          }
        } catch (error: any) {
          console.error('Failed to fetch user session:', error)
          // Don't redirect on timeout - user might still be logged in locally
          if (error.name === 'AbortError') {
            console.log('Session fetch timed out, continuing with existing state')
          } else {
            router.push("/")
            return
          }
        }
      }

      // Check for loaded design metadata (from edit)
      console.log('=== CAPTURE PAGE INIT DEBUG ===')
      const loadedMetadata = localStorage.getItem("loadedDesignMetadata")
      const loadedEditingImage = localStorage.getItem("currentEditingImage")
      const loadedDesignImage = localStorage.getItem("loadedDesignImage")
      const autoShowConfirm = localStorage.getItem("autoShowConfirmDialog")
      const loadedPreview = localStorage.getItem("generatedPreview")
      
      console.log('Checking localStorage:')
      console.log('- loadedMetadata:', loadedMetadata ? 'EXISTS' : 'NULL')
      console.log('- loadedEditingImage:', loadedEditingImage ? 'EXISTS' : 'NULL')
      console.log('- loadedDesignImage:', loadedDesignImage ? 'EXISTS' : 'NULL')
      console.log('- autoShowConfirm:', autoShowConfirm)
      console.log('- loadedPreview:', loadedPreview ? 'EXISTS' : 'NULL')
      console.log('- hasLoadedDesignRef:', hasLoadedDesignRef.current)
      
      // Handle auto-visualize from design detail pages
      if (loadedDesignImage && autoShowConfirm === 'true' && !hasLoadedDesignRef.current) {
        try {
          hasLoadedDesignRef.current = true
          isAutoVisualizeRef.current = true // Mark that we're in auto-visualize mode
          
          console.log('✅ Auto-loading design for visualization')
          console.log('✅ Design image URL:', loadedDesignImage)
          console.log('✅ Current activeTabId:', activeTabId)
          
          // Stop camera immediately
          stopCamera()
          
          // First, update the tabs with the design image (only selectedDesignImages, not originalImage)
          setDesignTabs(prevTabs => {
            const updatedTabs = prevTabs.map(tab => 
              tab.id === 'tab-initial-1' 
                ? {
                    ...tab,
                    selectedDesignImages: [loadedDesignImage]
                    // Keep originalImage unchanged - don't overwrite the hand reference photo
                  }
                : tab
            )
            console.log('✅ Updated tabs with design image')
            console.log('✅ Tab 0 selectedDesignImages:', updatedTabs[0].selectedDesignImages)
            console.log('✅ Tab 0 originalImage:', updatedTabs[0].originalImage ? 'EXISTS' : 'NULL')
            return updatedTabs
          })
          
          // Directly set the state as well (only selectedDesignImages, not capturedImage)
          console.log('✅ Setting selectedDesignImages state to:', [loadedDesignImage])
          setSelectedDesignImages([loadedDesignImage])
          // Don't set capturedImage - keep the original hand reference photo
          
          // Set the design image influence to 100% and base color to 0%
          console.log('✅ Setting influence weights: designImage=100, baseColor=0')
          setInfluenceWeights({
            nailEditor_drawing: 0,
            nailEditor_designImage: 100,
            nailEditor_baseColor: 0,
            nailEditor_finish: 100,
            nailEditor_texture: 100
          })
          
          // Clear the flags
          localStorage.removeItem('loadedDesignImage')
          localStorage.removeItem('autoShowConfirmDialog')
          localStorage.removeItem('loadedDesignMetadata')
          
          // Use a longer delay to ensure tab state is fully updated before allowing sync
          setTimeout(() => {
            console.log('✅ Finishing initialization')
            setIsInitializing(false)
            
            // Open the upload drawer to show the design was uploaded
            setIsUploadDrawerOpen(true)
            
            // Close the drawer and show confirmation dialog after user sees it
            setTimeout(() => {
              setIsUploadDrawerOpen(false)
              
              setTimeout(() => {
                console.log('✅ Showing confirmation dialog')
                setPendingGenerationSettings(designSettings)
                setShowConfirmDialog(true)
              }, 300)
            }, 1500) // Show drawer for 1.5 seconds
          }, 300)
          
          return
        } catch (e) {
          console.error('Error loading design for visualization:', e)
          hasLoadedDesignRef.current = false
          isAutoVisualizeRef.current = false
          setIsInitializing(false)
        }
      }
      
      if (loadedMetadata && loadedEditingImage && !hasLoadedDesignRef.current) {
        try {
          hasLoadedDesignRef.current = true // Mark as loaded to prevent double-loading
          
          const metadata = JSON.parse(loadedMetadata)
          console.log('✅ Loading design metadata for editing:', metadata)
          console.log('✅ selectedDesignImages from metadata:', metadata.selectedDesignImages)
          
          // Create a new tab with the loaded design
          const newTab: DesignTab = {
            id: 'tab-edit-loaded',
            name: 'Edit',
            finalPreviews: loadedPreview ? [loadedPreview] : [],
            designSettings: metadata.designSettings || {
              nailLength: 'medium',
              nailShape: 'oval',
              baseColor: '#FF6B9D',
              finish: 'cateye',
              texture: 'smooth',
              patternType: 'solid',
              styleVibe: 'elegant',
              accentColor: '#FFFFFF'
            },
            selectedDesignImages: metadata.selectedDesignImages || [],
            drawingImageUrl: metadata.drawingImageUrl || null,
            aiPrompt: metadata.aiPrompt || '',
            originalImage: loadedEditingImage,
            isGenerating: false,
            generationProgress: 0
          }
          
          // Save to session storage IMMEDIATELY so tab restoration logic sees it
          localStorage.setItem("captureSession_designTabs", JSON.stringify([newTab]))
          localStorage.setItem("captureSession_activeTabId", 'tab-edit-loaded')
          console.log('✅ Saved loaded design to session storage')
          
          setDesignTabs([newTab])
          setActiveTabId('tab-edit-loaded')
          setCapturedImage(loadedEditingImage)
          console.log('✅ Set capturedImage to:', loadedEditingImage?.substring(0, 50) + '...')
          setDesignSettings(metadata.designSettings || designSettings)
          setSelectedDesignImages(metadata.selectedDesignImages || [])
          console.log('✅ Set selectedDesignImages to:', metadata.selectedDesignImages || [])
          setDrawingImageUrl(metadata.drawingImageUrl || null)
          setAiPrompt(metadata.aiPrompt || '')
          setFinalPreviews(loadedPreview ? [loadedPreview] : [])
          
          if (metadata.influenceWeights) {
            setInfluenceWeights(metadata.influenceWeights)
          }
          if (metadata.handReference) {
            setHandReference(metadata.handReference)
          }
          if (metadata.designMode) {
            setDesignMode(metadata.designMode)
          }
          if (metadata.colorLightness !== undefined) {
            setColorLightness(metadata.colorLightness)
          }
          
          // Set initializing to false immediately so UI updates
          setIsInitializing(false)
          
          // Don't clear localStorage immediately - React Strict Mode will remount
          // Clear it after a longer delay to allow for remounts
          setTimeout(() => {
            localStorage.removeItem("loadedDesignMetadata")
            localStorage.removeItem("currentEditingImage")
            localStorage.removeItem("generatedPreview")
            console.log('✅ Cleared localStorage after loading')
          }, 2000) // Increased delay to 2 seconds
          
          toast.success('Design loaded for editing!')
          console.log('✅ Design has content, camera will NOT start')
          
          // Mark initial load as complete after a short delay
          setTimeout(() => {
            isInitialLoadRef.current = false
          }, 200)
          
          return
        } catch (e) {
          console.error('Error loading design metadata:', e)
          hasLoadedDesignRef.current = false // Reset on error
        }
      }
      
      // Check for existing tabs
      const savedTabs = localStorage.getItem("captureSession_designTabs")
      const savedActiveTabId = localStorage.getItem("captureSession_activeTabId")
      
      // Skip session restoration if we're in auto-visualize mode
      if (savedTabs && !hasLoadedDesignRef.current) {
        try {
          const tabs = JSON.parse(savedTabs)
          
          // MIGRATION: Update any tabs with 'glossy' finish to 'cateye'
          const migratedTabs = tabs.map((tab: DesignTab) => {
            if (tab.designSettings.finish === 'glossy') {
              console.log('🔄 Migrating tab', tab.id, 'from glossy to cateye')
              return {
                ...tab,
                designSettings: {
                  ...tab.designSettings,
                  finish: 'cateye'
                }
              }
            }
            return tab
          })
          
          // Check if any tab has content (original image or generated designs)
          const hasContent = migratedTabs.some((tab: DesignTab) => tab.originalImage || tab.finalPreviews.length > 0)
          
          if (hasContent) {
            setDesignTabs(migratedTabs)
            if (savedActiveTabId) {
              setActiveTabId(savedActiveTabId)
            }
            console.log('✅ Restored design tabs from session:', migratedTabs)
            
            // Find the active tab and check if it needs camera
            const activeTabToRestore = migratedTabs.find((t: DesignTab) => t.id === savedActiveTabId) || migratedTabs[0]
            
            // Restore the active tab's state immediately
            if (activeTabToRestore.originalImage) {
              setCapturedImage(activeTabToRestore.originalImage)
              console.log('✅ Restored capturedImage from session')
            }
            if (activeTabToRestore.finalPreviews.length > 0) {
              setFinalPreviews(activeTabToRestore.finalPreviews)
            }
            setDesignSettings(activeTabToRestore.designSettings)
            setSelectedDesignImages(activeTabToRestore.selectedDesignImages)
            setDrawingImageUrl(activeTabToRestore.drawingImageUrl)
            setAiPrompt(activeTabToRestore.aiPrompt)
            setIsGenerating(activeTabToRestore.isGenerating)
            setGenerationProgress(activeTabToRestore.generationProgress)
            
            // Only start camera if the active tab has no content (no image AND no designs)
            if (!activeTabToRestore.originalImage && activeTabToRestore.finalPreviews.length === 0) {
              console.log('⚠️ Active tab has no content, starting camera')
              setTimeout(() => startCamera(), 200)
            } else {
              console.log('✅ Active tab has content, NOT starting camera')
            }
            
            // Mark initial load as complete
            setTimeout(() => {
              isInitialLoadRef.current = false
              setIsInitializing(false)
            }, 200)
            
            return
          }
        } catch (e) {
          console.error('Error parsing saved tabs:', e)
        }
      }
      
      // No existing tabs with content - check if we have a capturedImage before starting camera
      if (!capturedImage) {
        console.log('⚠️ No saved tabs and no capturedImage, starting camera')
        startCamera()
      } else {
        console.log('✅ Have capturedImage, NOT starting camera')
      }
      
      // Mark initial load as complete
      setTimeout(() => {
        isInitialLoadRef.current = false
        setIsInitializing(false)
      }, 200)
    }

    initializePage()
    
    return () => {
      stopCamera()
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current)
      }
    }
  }, [])

  // Save design tabs whenever they change (but skip during initial load)
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      localStorage.setItem("captureSession_designTabs", JSON.stringify(designTabs))
      console.log('Saved design tabs to session')
    }
  }, [designTabs])

  // Save active tab ID whenever it changes
  useEffect(() => {
    localStorage.setItem("captureSession_activeTabId", activeTabId)
  }, [activeTabId])

  const startCamera = async () => {
    try {
      // On native iOS, we don't need to start a camera stream
      // The native camera will be triggered when user taps capture
      if (isNativeIOS()) {
        console.log('Native iOS detected - camera will be triggered on capture')
        return
      }
      
      // Only clean up if we actually have an existing stream
      if (streamRef.current) {
        console.log('Cleaning up existing camera stream before starting new one')
        stopCamera()
        // Add a small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera is not supported on this device or browser.")
        return
      }

      // Check current permission state
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
          console.log('Camera permission status:', permissionStatus.state)
          
          if (permissionStatus.state === 'denied') {
            alert("Camera access is blocked. Please enable camera permissions in your browser settings:\n\n1. Click the lock icon in the address bar\n2. Allow camera access\n3. Refresh the page")
            return
          }
        } catch (permError) {
          // Permission API might not be fully supported, continue anyway
          console.log('Permission API not fully supported:', permError)
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert("Camera access denied. Please allow camera permissions and refresh the page.\n\nTo enable:\n1. Click the lock/info icon in your browser's address bar\n2. Allow camera access\n3. Refresh this page")
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert("No camera found on this device.")
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        alert("Camera is already in use by another application. Please close other apps using the camera and try again.")
      } else if (error.name === 'OverconstrainedError') {
        alert("Camera doesn't support the requested settings. Trying with default settings...")
        // Try again with basic constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
        } catch (retryError) {
          console.error("Retry failed:", retryError)
          alert("Unable to access camera with any settings.")
        }
      } else {
        alert("Unable to access camera. Please check permissions and try again.")
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    
    // Clear video element source
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.pause()
    }
  }

  const flipCamera = useCallback(async () => {
    setIsFlipping(true)
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'

    try {
      // Stop current stream first
      stopCamera()
      
      // Pause and clear the video element
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.srcObject = null
      }

      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacingMode } 
      })
      
      streamRef.current = stream
      setFacingMode(newFacingMode)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setTimeout(() => {
          setIsFlipping(false)
        }, 100)
      }
    } catch (error) {
      console.error("Error flipping camera:", error)
      alert("Unable to flip camera.")
      setIsFlipping(false)
    }
  }, [facingMode])

  const capturePhoto = async () => {
    // On native iOS, use native camera
    if (isNativeIOS()) {
      try {
        console.log('Using native iOS camera')
        const result = await takePicture({ source: 'camera', allowEditing: false })
        
        if (result?.dataUrl) {
          setCapturedImage(result.dataUrl)
          // Clear saved image since user took a new photo
          setSavedImageBeforeReplace(null)
          console.log('Native camera photo captured successfully')
        }
      } catch (error) {
        console.error('Native camera error:', error)
        if (error !== 'User cancelled') {
          alert('Unable to access camera. Please check permissions in Settings.')
        }
      }
      return
    }
    
    // Web camera implementation
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      
      if (ctx) {
        // Apply beauty filter
        ctx.filter = 'brightness(1.05) contrast(1.05) saturate(1.1) blur(0.3px)'

        // Flip for front camera
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }

        ctx.drawImage(videoRef.current, 0, 0)

        try {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData()
              formData.append('file', blob, 'photo.jpg')
              formData.append('type', 'image')

              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })

              if (uploadResponse.ok) {
                const { url } = await uploadResponse.json()
                setCapturedImage(url)
                // Clear saved image since user took a new photo
                setSavedImageBeforeReplace(null)
              } else {
                const dataUrl = canvas.toDataURL("image/jpeg")
                setCapturedImage(dataUrl)
                // Clear saved image since user took a new photo
                setSavedImageBeforeReplace(null)
              }
            }
          }, 'image/jpeg', 0.9)
        } catch (error) {
          console.error('Photo upload error:', error)
          const dataUrl = canvas.toDataURL("image/jpeg")
          setCapturedImage(dataUrl)
          // Clear saved image since user took a new photo
          setSavedImageBeforeReplace(null)
        }

        stopCamera()
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // On native iOS, use native photo picker
    if (isNativeIOS()) {
      try {
        console.log('Using native iOS photo picker')
        const result = await takePicture({ source: 'photos', allowEditing: false })
        
        if (result?.dataUrl) {
          setCapturedImage(result.dataUrl)
          // Clear saved image since user uploaded a new photo
          setSavedImageBeforeReplace(null)
          console.log('Native photo picker image selected successfully')
        }
      } catch (error) {
        console.error('Native photo picker error:', error)
        if (error !== 'User cancelled') {
          alert('Unable to access photo library. Please check permissions in Settings.')
        }
      }
      return
    }
    
    // Web file upload implementation
    const file = e.target.files?.[0]
    if (file) {
      setIsUploadingImage(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'image')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          setCapturedImage(url)
          // Clear saved image since user uploaded a new photo
          setSavedImageBeforeReplace(null)
        } else {
          const reader = new FileReader()
          reader.onload = (e) => {
            setCapturedImage(e.target?.result as string)
            // Clear saved image since user uploaded a new photo
            setSavedImageBeforeReplace(null)
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('File upload error:', error)
        const reader = new FileReader()
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string)
          // Clear saved image since user uploaded a new photo
          setSavedImageBeforeReplace(null)
        }
        reader.readAsDataURL(file)
      } finally {
        setIsUploadingImage(false)
      }

      stopCamera()
    }
  }

  const buildPrompt = (settings: DesignSettings) => {
    // Format nail shape for better prompt readability
    const formattedShape = settings.nailShape
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return `Ultra-detailed, high-resolution nail art design applied ONLY inside a fingernail area. Nail length: ${settings.nailLength}, Nail shape: ${formattedShape}. Base color: ${settings.baseColor}. Finish: ${settings.finish}. Texture: ${settings.texture}. Design style: ${settings.patternType} pattern, ${settings.styleVibe} aesthetic. Accent color: ${settings.accentColor}. Highly realistic nail polish appearance: smooth polish, crisp clean edges, even color distribution, professional salon quality with maximum detail, subtle natural reflections. Design must: stay strictly within the nail surface, follow realistic nail curvature, respect nail boundaries, appear physically painted onto the nail with expert precision. Ultra-high resolution rendering, realistic lighting, natural skin reflection preserved, sharp details, vibrant colors with accurate saturation.`
  }

  const handleVisualizeClick = (settings: DesignSettings) => {
    // Show confirmation dialog
    setPendingGenerationSettings(settings)
    setShowConfirmDialog(true)
  }

  const handleConfirmGeneration = () => {
    setShowConfirmDialog(false)
    if (pendingGenerationSettings) {
      generateAIPreview(pendingGenerationSettings)
      setPendingGenerationSettings(null)
    }
    
    // Complete onboarding when user confirms generation (step 13, index 12)
    if (shouldShowOnboarding && onboardingStep === 12) {
      completeOnboarding()
    }
  }

  const handleCancelGeneration = () => {
    setShowConfirmDialog(false)
    setPendingGenerationSettings(null)
  }

  const generateAIPreview = async (settings: DesignSettings) => {
    if (!capturedImage) return
    
    // Check credits before generating
    if (!hasCredits(1)) {
      toast.error('Insufficient credits', {
        description: 'You need 1 credit to generate a design. Refer friends to earn more!',
        action: {
          label: 'Get Credits',
          onClick: () => router.push('/settings/credits'),
        },
      })
      return
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    setIsGenerating(true)
    setGenerationProgress(0)
    
    // Simulate progress updates - 70 seconds to reach 95%
    // Update every 500ms, so 140 updates total
    // 95% / 140 updates = ~0.68% per update
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) return prev
        // Gradually slow down as we approach 95%
        const increment = (95 - prev) * 0.015 + 0.3
        return Math.min(prev + increment, 95)
      })
    }, 500)
    
    try {
      const prompt = buildPrompt(settings)
      
      // Build weights for Nail Editor
      const weights = {
        drawing: influenceWeights.nailEditor_drawing,
        designImage: influenceWeights.nailEditor_designImage,
        stylePrompt: 0, // Not used in Nail Editor
        baseColor: influenceWeights.nailEditor_baseColor,
        finish: influenceWeights.nailEditor_finish,
        texture: influenceWeights.nailEditor_texture,
        nailLength: 100,
        nailShape: 100
      }
      
      const response = await fetch('/api/generate-nail-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          originalImage: capturedImage,
          selectedDesignImages: selectedDesignImages,
          drawingImageUrl: drawingImageUrl,
          influenceWeights: weights
        }),
        signal: abortControllerRef.current.signal
      })

      if (response.ok) {
        setGenerationProgress(100)
        const { imageUrl, imageUrls, creditsRemaining } = await response.json()
        // Use imageUrls if available (new format), fallback to imageUrl for backward compatibility
        const images = imageUrls || [imageUrl]
        setFinalPreviews(images)
        setFinalPreview(images[0]) // Set first image as primary for backward compatibility
        
        // Refresh credits display
        refreshCredits()
        
        // Auto-save the designs
        await autoSaveDesigns(images)
      } else {
        const error = await response.json()
        toast.error('Generation failed', {
          description: error.error || 'Failed to generate design',
        })
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled by user')
        toast.info('Generation cancelled', {
          description: 'Your design generation was cancelled. No credits were charged.',
        })
      } else {
        console.error('Error generating AI preview:', error)
        toast.error('Generation failed', {
          description: 'An unexpected error occurred. Please try again.',
        })
      }
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      setGenerationProgress(0)
      abortControllerRef.current = null
    }
  }

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
      setGenerationProgress(0)
      toast.info('Cancelling...', {
        description: 'Stopping design generation',
      })
    }
  }

  const handleDesignSettingChange = (key: keyof DesignSettings, value: string) => {
    const newSettings = { ...designSettings, [key]: value }
    setDesignSettings(newSettings)
  }

  // Convert hue (0-360) and lightness (0-100) to hex color
  const hslToHex = (hue: number, lightness: number) => {
    const h = hue / 360
    const s = 0.7 // Keep saturation constant
    const l = lightness / 100
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255)
    const g = Math.round(hue2rgb(p, q, h) * 255)
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255)
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  // Convert hex to hue (0-360) and lightness (0-100)
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    
    let hue = 0
    if (delta !== 0) {
      if (max === r) {
        hue = ((g - b) / delta) % 6
      } else if (max === g) {
        hue = (b - r) / delta + 2
      } else {
        hue = (r - g) / delta + 4
      }
      hue = Math.round(hue * 60)
      if (hue < 0) hue += 360
    }
    
    const lightness = Math.round(((max + min) / 2) * 100)
    
    return { hue, lightness }
  }

  const handleHueChange = (hue: number[]) => {
    const hex = hslToHex(hue[0], colorLightness)
    handleDesignSettingChange('baseColor', hex)
  }

  const handleLightnessChange = (lightness: number[]) => {
    setColorLightness(lightness[0])
    const { hue } = hexToHsl(designSettings.baseColor)
    const hex = hslToHex(hue, lightness[0])
    handleDesignSettingChange('baseColor', hex)
  }

  // Auto-set design mode to 'design' on mount
  useEffect(() => {
    if (capturedImage && !designMode) {
      setDesignMode('design')
      setOnboardingPhase('design') // Update onboarding phase
    }
  }, [capturedImage, designMode])

  // Update onboarding phase when user starts designing
  useEffect(() => {
    if (designSettings.baseColor !== '#FF6B9D' || designSettings.nailShape !== 'oval') {
      setOnboardingPhase('visualize')
    }
  }, [designSettings])

  // Auto-advance onboarding when photo is captured (step 1 -> step 2)
  useEffect(() => {
    console.log('🔍 Photo captured check:', { shouldShowOnboarding, onboardingStep, hasCapturedImage: !!capturedImage })
    
    if (shouldShowOnboarding && onboardingStep === 0 && capturedImage) {
      // User captured a photo, advance to step 2 (open upload drawer)
      console.log('✅ Advancing from step 1 to step 2 (open upload drawer)')
      setTimeout(() => {
        setOnboardingStep(1)
      }, 1000) // Wait for transition to design view
    }
  }, [capturedImage, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when upload drawer opens (step 2 -> step 3)
  useEffect(() => {
    console.log('🔍 Drawer state changed:', { 
      shouldShowOnboarding, 
      onboardingStep, 
      isUploadDrawerOpen,
      willAdvance: shouldShowOnboarding && onboardingStep === 1 && isUploadDrawerOpen
    })
    
    if (shouldShowOnboarding && onboardingStep === 1 && isUploadDrawerOpen) {
      // User opened upload drawer, advance to step 3 (upload button step) after drawer animation completes
      console.log('✅ Advancing from step 2 to step 3 (upload button)')
      setTimeout(() => {
        console.log('✅ Setting onboarding step to 2')
        setOnboardingStep(2)
      }, 1200) // Increased delay to ensure drawer is fully open and button is rendered
    }
  }, [isUploadDrawerOpen, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when design image is uploaded (step 3 -> step 4)
  useEffect(() => {
    console.log('🔍 Design images changed:', { shouldShowOnboarding, onboardingStep, selectedDesignImagesCount: selectedDesignImages.length })
    
    if (shouldShowOnboarding && onboardingStep === 2 && selectedDesignImages.length > 0) {
      // User uploaded a design image, advance to step 4 (close drawer step) after showing success
      console.log('✅ Advancing from step 3 to step 4 (close drawer)')
      setTimeout(() => {
        setOnboardingStep(3)
      }, 1500) // Wait for success banner to be visible
    }
  }, [selectedDesignImages, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when upload drawer closes (step 4 -> step 5)
  useEffect(() => {
    console.log('🔍 Upload drawer closed check:', { shouldShowOnboarding, onboardingStep, isUploadDrawerOpen, hasDesignImages: selectedDesignImages.length > 0 })
    
    if (shouldShowOnboarding && onboardingStep === 3 && !isUploadDrawerOpen && selectedDesignImages.length > 0) {
      // User closed the upload drawer after uploading, advance to step 5 (drawing canvas)
      console.log('✅ Advancing from step 4 to step 5 (drawing canvas)')
      setTimeout(() => {
        setOnboardingStep(4)
      }, 500) // Wait for drawer close animation
    }
  }, [isUploadDrawerOpen, shouldShowOnboarding, onboardingStep, selectedDesignImages])

  // Auto-advance onboarding when drawing canvas opens (step 5 -> step 6)
  useEffect(() => {
    console.log('🔍 Drawing canvas opened check:', { shouldShowOnboarding, onboardingStep, showDrawingCanvas })
    
    if (shouldShowOnboarding && onboardingStep === 4 && showDrawingCanvas) {
      // User opened drawing canvas, advance to step 6 (close canvas step) after a moment
      console.log('✅ Advancing from step 5 to step 6 (close canvas) - canvas opened')
      setTimeout(() => {
        setOnboardingStep(5)
      }, 1000) // Give them a moment to see the canvas
    }
  }, [showDrawingCanvas, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when drawing canvas is closed (step 6 -> step 7)
  useEffect(() => {
    console.log('🔍 Drawing canvas closed check:', { shouldShowOnboarding, onboardingStep, showDrawingCanvas })
    
    if (shouldShowOnboarding && onboardingStep === 5 && !showDrawingCanvas) {
      // User closed drawing canvas, advance to step 7 (nail shape)
      console.log('✅ Advancing from step 6 to step 7 (nail shape)')
      setTimeout(() => {
        setOnboardingStep(6)
        // Auto-open the drawer so nail shape option is visible
        setIsDrawerOpen(true)
      }, 500)
    }
  }, [showDrawingCanvas, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when nail shape section opens (step 7 -> step 8)
  useEffect(() => {
    console.log('🔍 Nail shape section check:', { shouldShowOnboarding, onboardingStep, expandedSection })
    
    if (shouldShowOnboarding && onboardingStep === 6 && expandedSection === 'shape') {
      // User opened nail shape section, advance to step 8 (select shape from slider)
      console.log('✅ Advancing from step 7 to step 8 (nail shape slider)')
      setTimeout(() => {
        setOnboardingStep(7)
      }, 500)
    }
  }, [expandedSection, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when nail shape is selected (step 8 -> step 9)
  useEffect(() => {
    console.log('🔍 Nail shape selection check:', { shouldShowOnboarding, onboardingStep, nailShape: designSettings.nailShape })
    
    if (shouldShowOnboarding && onboardingStep === 7) {
      // User selected a nail shape (changed from default 'oval'), advance to next step
      if (designSettings.nailShape !== 'oval') {
        console.log('✅ Advancing from step 8 to step 9 (close design drawer) - nail shape selected')
        setTimeout(() => {
          setOnboardingStep(8)
        }, 500)
      }
    }
  }, [designSettings.nailShape, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when design drawer closes (step 9 -> step 10)
  useEffect(() => {
    console.log('🔍 Design drawer closed check:', { shouldShowOnboarding, onboardingStep, isDrawerOpen })
    
    if (shouldShowOnboarding && onboardingStep === 8 && !isDrawerOpen) {
      // User closed the design drawer, advance to next step
      console.log('✅ Advancing from step 9 to step 10 (replace photo)')
      setTimeout(() => {
        setOnboardingStep(9)
      }, 500)
    }
  }, [isDrawerOpen, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when replace button is clicked and camera opens (step 10 -> step 11)
  useEffect(() => {
    console.log('🔍 Camera opened for replace check:', { shouldShowOnboarding, onboardingStep, capturedImage })
    
    if (shouldShowOnboarding && onboardingStep === 9 && !capturedImage) {
      // User clicked replace and camera opened (capturedImage is null), advance to close camera step
      console.log('✅ Advancing from step 10 to step 11 (close camera)')
      setTimeout(() => {
        setOnboardingStep(10)
      }, 800)
    }
  }, [capturedImage, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when camera closes after replace (step 11 -> step 12)
  useEffect(() => {
    console.log('🔍 Camera closed after replace check:', { shouldShowOnboarding, onboardingStep, capturedImage })
    
    if (shouldShowOnboarding && onboardingStep === 10 && capturedImage) {
      // User closed camera and has image again, advance to visualize step
      console.log('✅ Advancing from step 11 to step 12 (visualize)')
      setTimeout(() => {
        setOnboardingStep(11)
      }, 500)
    }
  }, [capturedImage, shouldShowOnboarding, onboardingStep])

  // Auto-advance onboarding when confirmation dialog opens (step 12 -> step 13)
  useEffect(() => {
    console.log('🔍 Confirmation dialog check:', { shouldShowOnboarding, onboardingStep, showConfirmDialog })
    
    if (shouldShowOnboarding && onboardingStep === 11 && showConfirmDialog) {
      // User clicked visualize and dialog opened, advance to final step
      console.log('✅ Advancing from step 12 to step 13 (confirm generation)')
      setTimeout(() => {
        setOnboardingStep(12)
      }, 500)
    }
  }, [showConfirmDialog, shouldShowOnboarding, onboardingStep])

  const generateAIDesigns = async () => {
    if (!aiPrompt.trim()) return

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setIsGenerating(true)
    setGenerationProgress(0)
    
    // Simulate progress updates - 70 seconds to reach 95%
    // Update every 500ms, so 140 updates total
    // 95% / 140 updates = ~0.68% per update
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) return prev
        // Gradually slow down as we approach 95%
        const increment = (95 - prev) * 0.015 + 0.3
        return Math.min(prev + increment, 95)
      })
    }, 500)
    
    try {
      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
        signal: abortControllerRef.current.signal
      })

      if (response.ok) {
        setGenerationProgress(100)
        const { designs, inferredSettings } = await response.json()
        setGeneratedDesigns(designs)
        
        if (inferredSettings) {
          setDesignSettings(prev => ({ ...prev, ...inferredSettings }))
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('AI design generation cancelled by user')
        toast.info('Generation cancelled', {
          description: 'Design search was cancelled',
        })
      } else {
        console.error("Error generating designs:", error)
        toast.error('Generation failed', {
          description: 'Failed to search for designs. Please try again.',
        })
      }
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      setGenerationProgress(0)
      abortControllerRef.current = null
    }
  }

  const handleDesignSelect = (designUrl: string) => {
    setSelectedDesignImages([...selectedDesignImages, designUrl])
    handleNailEditorDesignImageInfluence(100)
  }

  const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed max (1 image)
    if (selectedDesignImages.length + files.length > 1) {
      toast.error('Maximum 1 design image', {
        description: 'You can upload 1 reference image',
      })
      return
    }

    setIsUploadingDesign(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/analyze-design-image', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          return data.imageUrl
        }
        return null
      })

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[]
      
      if (uploadedUrls.length > 0) {
        setSelectedDesignImages([...selectedDesignImages, ...uploadedUrls])
        handleNailEditorDesignImageInfluence(100)
        toast.success(`${uploadedUrls.length} design image${uploadedUrls.length > 1 ? 's' : ''} uploaded!`)
      }
    } catch (error) {
      console.error('Error uploading design:', error)
      toast.error('Failed to upload images')
    } finally {
      setIsUploadingDesign(false)
    }
  }

  const removeDesignImage = (imageUrl: string) => {
    setSelectedDesignImages(selectedDesignImages.filter(url => url !== imageUrl))
    if (selectedDesignImages.length === 1) {
      // Last image being removed, reset influence
      handleNailEditorDesignImageInfluence(0)
    }
  }

  const applyDesign = async () => {
    await generateAIPreview(designSettings)
  }

  const autoSaveDesigns = async (images: string[]) => {
    console.log('autoSaveDesigns called with images:', images)
    console.log('autoSaveDesigns called with capturedImage:', capturedImage)
    
    if (!images || images.length === 0) {
      console.error('No designs available to save')
      return false
    }

    try {
      let userStr = localStorage.getItem("ivoryUser")
      
      // If user data is missing, try to fetch it from session
      if (!userStr) {
        console.log('User data missing, fetching from session...')
        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (sessionData.user) {
              localStorage.setItem("ivoryUser", JSON.stringify(sessionData.user))
              userStr = JSON.stringify(sessionData.user)
              console.log('User session restored')
            }
          }
        } catch (error) {
          console.error('Failed to fetch user session:', error)
        }
      }
      
      if (!userStr) {
        console.error('No user found in localStorage')
        toast.error('Session expired', {
          description: 'Please log in again to save your designs',
        })
        router.push("/")
        return false
      }

      const user = JSON.parse(userStr)
      console.log(`Auto-saving ${images.length} design(s) for user:`, user.id)
      
      // Show loading toast
      const loadingToast = toast.loading(`Saving ${images.length} design${images.length > 1 ? 's' : ''}...`)
      
      // Save all designs
      const savePromises = images.map((imageUrl, index) => {
        // Create comprehensive metadata for remix/edit functionality
        const designMetadata = {
          designSettings,
          selectedDesignImages,
          drawingImageUrl,
          aiPrompt: aiPrompt || null,
          influenceWeights,
          handReference,
          designMode,
          colorLightness,
        }
        
        const payload = {
          userId: user.id,
          title: `Design ${new Date().toLocaleDateString()}${images.length > 1 ? ` (${index + 1})` : ''}`,
          imageUrl: imageUrl,
          originalImageUrl: capturedImage,
          designSettings,
          aiPrompt: aiPrompt || null,
          designMetadata, // Store all settings for remix/edit
          isPublic: false,
        }
        
        console.log(`Sending save request for design ${index + 1}:`, payload)
        
        return fetch('/api/looks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      })

      const responses = await Promise.all(savePromises)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Check if all saves were successful
      const allSuccessful = responses.every(response => response.ok)
      const successCount = responses.filter(response => response.ok).length

      console.log(`Save results: ${successCount}/${images.length} successful`)

      if (allSuccessful) {
        toast.success(`${images.length} design${images.length > 1 ? 's' : ''} saved! 🎉`, {
          description: 'Redirecting to your collection...',
          duration: 2000,
        })
        
        // Clear session data after successful save
        localStorage.removeItem("captureSession_designTabs")
        localStorage.removeItem("captureSession_activeTabId")
        
        // Small delay to show the success message, then redirect
        setTimeout(() => {
          // Redirect based on user type
          if (user.userType === 'tech') {
            router.push("/tech/dashboard?tab=designs")
          } else {
            router.push("/home")
          }
          router.refresh()
        }, 1500)
        return true
      } else if (successCount > 0) {
        toast.success(`${successCount} of ${images.length} designs saved`, {
          description: 'Redirecting to your collection...',
        })
        
        // Clear session data after partial save
        localStorage.removeItem("captureSession_designTabs")
        localStorage.removeItem("captureSession_activeTabId")
        
        setTimeout(() => {
          // Redirect based on user type
          if (user.userType === 'tech') {
            router.push("/tech/dashboard?tab=designs")
          } else {
            router.push("/home")
          }
          router.refresh()
        }, 1500)
        return true
      } else {
        // Find the first failed response
        const failedResponse = responses.find(r => !r.ok)
        let errorMessage = 'Please try again'
        
        if (failedResponse) {
          try {
            const errorData = await failedResponse.json()
            errorMessage = errorData.error || errorMessage
            console.error('Failed to save designs:', errorData)
          } catch (parseError) {
            // If JSON parsing fails, try to get text
            try {
              const errorText = await failedResponse.text()
              console.error('Failed to save designs (text):', errorText)
              errorMessage = errorText || `Server error (${failedResponse.status})`
            } catch {
              console.error('Failed to save designs (status):', failedResponse.status, failedResponse.statusText)
              errorMessage = `Server error: ${failedResponse.statusText || failedResponse.status}`
            }
          }
        }
        
        toast.error('Failed to save designs', {
          description: errorMessage,
        })
        return false
      }
    } catch (error) {
      console.error('Error saving designs:', error)
      toast.error('An error occurred while saving', {
        description: 'Please check your connection and try again',
      })
      return false
    }
  }



  const changePhoto = () => {
    // Clear the current tab's data
    setDesignTabs(tabs => tabs.map(tab => 
      tab.id === activeTabId 
        ? {
            ...tab,
            originalImage: null,
            finalPreviews: [],
            selectedDesignImages: [],
            drawingImageUrl: null
          }
        : tab
    ))
    
    // Clear current state
    setCapturedImage(null)
    setFinalPreview(null)
    setFinalPreviews([])
    setSelectedDesignImages([])
    setGeneratedDesigns([])
    setDesignMode(null)
    setDrawingImageUrl(null)
    
    // Start camera for new photo
    startCamera()
  }

  const replaceHandPhoto = async () => {
    // On native iOS, use native camera directly
    if (isNativeIOS()) {
      try {
        console.log('Using native iOS camera for replace')
        const result = await takePicture({ source: 'camera', allowEditing: false })
        
        if (result?.dataUrl) {
          // Update the original image in ALL tabs
          setDesignTabs(tabs => tabs.map(tab => ({
            ...tab,
            originalImage: result.dataUrl
          })))
          
          setCapturedImage(result.dataUrl)
          // Clear saved image since user took a new photo
          setSavedImageBeforeReplace(null)
          console.log('Native camera photo replaced successfully')
        }
      } catch (error) {
        console.error('Native camera replace error:', error)
        if (error !== 'User cancelled') {
          alert('Unable to access camera. Please check permissions in Settings.')
        }
      }
      return
    }
    
    // Web camera implementation
    // Save the current image before clearing it
    if (capturedImage) {
      setSavedImageBeforeReplace(capturedImage)
    }
    
    // Clear the original image from ALL tabs but keep their designs
    setDesignTabs(tabs => tabs.map(tab => ({
      ...tab,
      originalImage: null
    })))
    
    // Clear current state
    setCapturedImage(null)
    setDesignMode(null)
    
    // Start camera for new hand photo
    startCamera()
  }
  
  const cancelReplaceHandPhoto = () => {
    // Restore the saved image
    if (savedImageBeforeReplace) {
      setCapturedImage(savedImageBeforeReplace)
      
      // Restore to all tabs
      setDesignTabs(tabs => tabs.map(tab => ({
        ...tab,
        originalImage: savedImageBeforeReplace
      })))
      
      // Clear the saved image
      setSavedImageBeforeReplace(null)
      
      // Stop camera
      stopCamera()
    }
  }

  const handleDrawingComplete = (dataUrl: string) => {
    console.log('🎨 Drawing completed, saving to state')
    setDrawingImageUrl(dataUrl)
    setShowDrawingCanvas(false)
    
    // When a drawing is added, set it to 100% influence
    setInfluenceWeights(prev => ({
      ...prev,
      nailEditor_drawing: 100,
      nailEditor_designImage: 0,
      nailEditor_baseColor: 0
    }))
    
    toast.success('Drawing saved!', {
      description: 'Your drawing will guide the AI design generation at 100% influence',
    })
  }

  const handleRemoveDrawing = () => {
    setDrawingImageUrl(null)
    
    // When drawing is removed, restore influence to design images or base color
    if (selectedDesignImages.length > 0) {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_drawing: 0,
        nailEditor_designImage: 100,
        nailEditor_baseColor: 0
      }))
    } else {
      setInfluenceWeights(prev => ({
        ...prev,
        nailEditor_drawing: 0,
        nailEditor_designImage: 0,
        nailEditor_baseColor: 100
      }))
    }
    
    toast.info('Drawing removed')
  }

  // Create a composite image of the captured image + drawing for editing
  const createCompositeImageForEditing = async (): Promise<string> => {
    if (!capturedImage) {
      console.log('❌ No captured image')
      return ''
    }
    
    // If no drawing exists, just return the captured image
    if (!drawingImageUrl) {
      console.log('📸 No drawing to composite, using original image')
      return capturedImage
    }
    
    console.log('🎨 Creating composite image with drawing overlay')
    console.log('📸 Captured image type:', capturedImage.substring(0, 30))
    console.log('✏️ Drawing image type:', drawingImageUrl.substring(0, 30))
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('❌ Failed to get canvas context')
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // Proxy R2 URLs to avoid CORS issues
      const getProxiedUrl = (url: string) => {
        if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
          return `/api/proxy-image?url=${encodeURIComponent(url)}`
        }
        return url
      }
      
      // Load the base image - use window.Image for browser compatibility
      const baseImg = new window.Image()
      baseImg.crossOrigin = 'anonymous'
      
      baseImg.onload = () => {
        console.log('✅ Base image loaded:', baseImg.width, 'x', baseImg.height)
        
        // Set canvas size to match base image
        canvas.width = baseImg.width
        canvas.height = baseImg.height
        
        // Draw base image
        ctx.drawImage(baseImg, 0, 0)
        
        // Load and draw the drawing overlay
        const drawingImg = new window.Image()
        drawingImg.crossOrigin = 'anonymous'
        
        drawingImg.onload = () => {
          console.log('✅ Drawing image loaded:', drawingImg.width, 'x', drawingImg.height)
          
          // Draw the drawing overlay on top
          ctx.drawImage(drawingImg, 0, 0, canvas.width, canvas.height)
          
          // Convert to data URL
          try {
            const compositeDataUrl = canvas.toDataURL('image/png')
            console.log('✅ Composite image created, size:', compositeDataUrl.length)
            resolve(compositeDataUrl)
          } catch (e) {
            console.error('❌ Failed to convert canvas to data URL:', e)
            reject(e)
          }
        }
        
        drawingImg.onerror = (e) => {
          console.error('❌ Failed to load drawing image:', e)
          // Return just the base image if drawing fails to load
          resolve(capturedImage)
        }
        
        drawingImg.src = getProxiedUrl(drawingImageUrl)
      }
      
      baseImg.onerror = (e) => {
        console.error('❌ Failed to load base image:', e)
        console.error('Base image src length:', capturedImage?.length)
        console.error('Base image starts with:', capturedImage?.substring(0, 50))
        reject(new Error('Failed to load base image'))
      }
      
      // Set src after all handlers are attached, using proxy for R2 URLs
      baseImg.src = getProxiedUrl(capturedImage)
    })
  }

  // Handler to open drawing canvas with composite image
  const handleOpenDrawingCanvas = async () => {
    console.log('🎨 Opening drawing canvas...')
    
    // If there's no previous drawing, just use the captured image
    if (!drawingImageUrl) {
      console.log('📸 No previous drawing, using captured image directly')
      setCompositeImageForEditing(capturedImage)
      setShowDrawingCanvas(true)
      return
    }
    
    // Try to create composite, but fallback to captured image if it fails
    try {
      const composite = await createCompositeImageForEditing()
      setCompositeImageForEditing(composite)
      setShowDrawingCanvas(true)
    } catch (error) {
      console.error('Failed to create composite, using captured image:', error)
      setCompositeImageForEditing(capturedImage)
      setShowDrawingCanvas(true)
    }
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      lastTouchDistanceRef.current = distance
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )

      if (lastTouchDistanceRef.current > 0) {
        const delta = distance - lastTouchDistanceRef.current
        const zoomChange = delta * 0.01
        setZoom(prev => Math.min(Math.max(prev + zoomChange, 1), 5))
        
        setShowZoomIndicator(true)
        if (zoomIndicatorTimeoutRef.current) {
          clearTimeout(zoomIndicatorTimeoutRef.current)
        }
        zoomIndicatorTimeoutRef.current = setTimeout(() => {
          setShowZoomIndicator(false)
        }, 1500)
      }

      lastTouchDistanceRef.current = distance
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    lastTouchDistanceRef.current = 0
  }, [])



  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

  if (capturedImage) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#F8F7F5] via-white to-white flex flex-col">
        {/* Zero Credits Banner */}
        <ZeroCreditsBanner credits={credits} />
        
        {/* Elegant Header */}
        <div className={`absolute top-0 left-0 right-0 px-3 sm:px-6 lg:px-10 pb-3 sm:pb-4 z-10 bg-white/95 backdrop-blur-md border-b border-[#E8E8E8]/50 transition-all duration-500 ${isNative() ? 'pt-safe-extra' : 'pt-safe'}`}>
          <div className={`max-w-7xl mx-auto ${isNative() ? 'pt-16' : 'pt-2'}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              {/* Left side - Back button */}
              <button
                onClick={() => router.back()}
                className="h-8 sm:h-10 w-8 sm:w-10 border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5] hover:border-[#8B7355] active:scale-[0.98] transition-all duration-500 flex items-center justify-center rounded-none"
                title="Go back"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Center - Title */}
              <h1 className="font-serif text-base sm:text-xl lg:text-2xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-tight absolute left-1/2 -translate-x-1/2">
                Design Your Nails
              </h1>
              
              {/* Right side - Credits only */}
              <div className="flex items-center ml-auto">
                <CreditsDisplay showLabel={true} credits={credits} />
              </div>
            </div>
            
            {/* Elegant Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:justify-end scrollbar-hide">
              {designTabs.map((tab) => (
                <div key={tab.id} className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => setActiveTabId(tab.id)}
                    className={`h-8 sm:h-9 px-3 sm:px-4 font-light text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-none ${
                      activeTabId === tab.id
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5] hover:border-[#8B7355]'
                    }`}
                  >
                    {tab.name}
                    {/* Show reference image indicator */}
                    {tab.selectedDesignImages && tab.selectedDesignImages.length > 0 && (
                      <span 
                        className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded-sm flex items-center gap-0.5 sm:gap-1 ${
                          activeTabId === tab.id ? 'bg-white/20' : 'bg-[#8B7355]/10 text-[#8B7355]'
                        }`}
                        title={`${tab.selectedDesignImages.length} reference image${tab.selectedDesignImages.length > 1 ? 's' : ''}`}
                      >
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {tab.selectedDesignImages.length}
                      </span>
                    )}
                    {/* Show drawing indicator */}
                    {tab.drawingImageUrl && (
                      <span 
                        className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded-sm ${
                          activeTabId === tab.id ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                        }`}
                        title="Has drawing overlay"
                      >
                        <Pencil className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      </span>
                    )}
                    {tab.isGenerating && (
                      <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                    )}
                    {!tab.isGenerating && tab.finalPreviews.length > 0 && (
                      <span className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded-sm ${
                        activeTabId === tab.id ? 'bg-white/20' : 'bg-[#F8F7F5]'
                      }`}>
                        {tab.finalPreviews.length}
                      </span>
                    )}
                  </button>
                  {designTabs.length > 1 && (
                    <button
                      onClick={() => removeTab(tab.id)}
                      className="w-6 h-6 sm:w-7 sm:h-7 border border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F8F7F5] hover:text-[#1A1A1A] hover:border-[#8B7355] transition-all duration-500 flex items-center justify-center rounded-none"
                    >
                      <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={1} />
                    </button>
                  )}
                </div>
              ))}
              {designTabs.length < 5 && (
                <button
                  onClick={addNewTab}
                  className="h-8 sm:h-9 px-3 sm:px-4 border border-[#E8E8E8] text-[#1A1A1A] font-light text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:bg-[#F8F7F5] hover:border-[#8B7355] transition-all duration-500 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-none"
                >
                  <span className="text-sm sm:text-base leading-none">+</span>
                  <span className="hidden sm:inline">New Design</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Elegant Image Preview Section - Side by Side */}
        <div 
          className="pt-28 sm:pt-32 lg:pt-36 pb-32 sm:pb-36 px-4 sm:px-8 lg:px-12 overflow-y-auto transition-all duration-700" 
          style={{ 
            height: '100vh'
          }}
        >
          <div className="max-w-4xl mx-auto h-full flex flex-col gap-4">
            {/* Original Image Card - Full Width */}
            <div className="relative overflow-hidden border border-[#E8E8E8]/50 group flex-1 bg-white shadow-sm hover:shadow-lg transition-all duration-700 rounded-sm animate-fade-in">
              <div
                onClick={!isNative() ? handleOpenDrawingCanvas : undefined}
                className={`relative bg-gradient-to-br from-[#F8F7F5] to-white h-full w-full ${!isNative() ? 'cursor-pointer' : ''}`}
                role={!isNative() ? "button" : undefined}
                tabIndex={!isNative() ? 0 : undefined}
                onKeyDown={!isNative() ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleOpenDrawingCanvas()
                  }
                } : undefined}
                title={!isNative() ? "Click to draw on image" : undefined}
              >
                {/* Show loading GIF when generating, empty state when no image, otherwise show original image */}
                {isGenerating ? (
                  <>
                    <Image 
                      src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bXN6aG5wbWhlbTIwZ2F3ajNjdXRhemdpanhlMXEwZnhnOHNlZHpjYyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/YlEMMJMwAeaPK/giphy.gif" 
                      alt="Generating design..." 
                      fill 
                      className="object-contain p-2 sm:p-4 md:p-6 pointer-events-none" 
                    />
                    {/* Centered percentage text overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-4">
                        <div className="text-white text-5xl font-bold tracking-wide">
                          {Math.round(generationProgress)}%
                        </div>
                      </div>
                    </div>
                  </>
                ) : capturedImage ? (
                  <Image src={capturedImage} alt="Original" fill className="object-contain p-2 sm:p-4 md:p-6 transition-transform duration-700 group-hover:scale-[1.02] pointer-events-none" />
                ) : (
                  /* Empty state - no image captured yet */
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6B6B6B] p-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#F8F7F5] border-2 border-[#E8E8E8] flex items-center justify-center">
                        <Camera className="w-8 h-8 text-[#8B7355]" strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-light text-[#1A1A1A] mb-2">Tap camera icon to upload</p>
                        <p className="text-sm text-[#6B6B6B] font-light">your first hand photo</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Drawing Overlay - Only for current tab (hide during generation) */}
                {drawingImageUrl && !isGenerating && (
                  <Image 
                    src={drawingImageUrl} 
                    alt="Drawing overlay" 
                    fill 
                    className="object-contain p-2 sm:p-4 md:p-6 pointer-events-none z-10" 
                  />
                )}
                
                {/* Snapchat-Style Vertical Icon Bar - Right Side */}
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 sm:gap-5 z-20 pointer-events-auto">
                  {/* Upload Design Image Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsUploadDrawerOpen(!isUploadDrawerOpen)
                    }}
                    data-onboarding="design-images-option"
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full backdrop-blur-md border-2 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 ${
                      isUploadDrawerOpen 
                        ? 'bg-[#8B7355] border-[#8B7355] text-white' 
                        : 'bg-white/90 border-[#8B7355] text-[#8B7355]'
                    }`}
                    title="Upload design images"
                  >
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                  </button>

                  {/* Draw Button - Hidden on native iOS */}
                  {!isNative() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenDrawingCanvas()
                      }}
                      data-onboarding="drawing-canvas-button"
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md border-2 border-[#8B7355] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
                      title="Draw on image"
                    >
                      <Pencil className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7355] group-hover:text-[#2D7A4F]" strokeWidth={2} />
                    </button>
                  )}

                  {/* Settings/Parameters Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDrawerOpen(!isDrawerOpen)
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full backdrop-blur-md border-2 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 ${
                      isDrawerOpen 
                        ? 'bg-[#8B7355] border-[#8B7355] text-white' 
                        : 'bg-white/90 border-[#E8E8E8] text-[#1A1A1A]'
                    }`}
                    title="Design settings"
                  >
                    <Image 
                      src="/logo-icon.png" 
                      alt="Design settings" 
                      width={43} 
                      height={43} 
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${isDrawerOpen ? 'brightness-0 invert' : ''}`}
                    />
                  </button>

                  {/* Replace Hand Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      replaceHandPhoto()
                    }}
                    data-onboarding="replace-photo-button"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md border-2 border-[#E8E8E8] text-[#1A1A1A] flex items-center justify-center shadow-xl hover:scale-110 hover:border-[#8B7355] active:scale-95 transition-all duration-300"
                    title="Replace hand photo"
                  >
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                  </button>
                </div>
                
                {/* Drawing Status Badge - Top Left */}
                {drawingImageUrl && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#2D7A4F] text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-light tracking-wide shadow-lg z-10 pointer-events-none flex items-center gap-1.5">
                    <Pencil className="w-3 h-3" strokeWidth={2} />
                    <span>Drawing Added</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Visualize Button Bar - At Bottom Above Nav */}
        <div className="fixed left-0 right-0 bottom-20 z-30 px-3 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-6 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            {!isGenerating ? (
              <button 
                onClick={() => handleVisualizeClick(designSettings)} 
                disabled={!hasCredits(1)}
                data-onboarding="visualize-button"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] text-white font-light text-xs sm:text-sm tracking-[0.2em] uppercase hover:from-[#8B7355] hover:via-[#A0826D] hover:to-[#8B7355] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl rounded-sm disabled:opacity-50 disabled:cursor-not-allowed border border-[#E8E8E8]/20 backdrop-blur-sm animate-shimmer"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" strokeWidth={1.5} />
                <span className="hidden xs:inline">Visualize</span>
                <span className="xs:hidden">Visualize</span>
                {credits !== null && (
                  <span className="ml-1 text-[10px] sm:text-xs opacity-70 font-light">
                    (1 credit)
                  </span>
                )}
              </button>
            ) : (
              <button 
                onClick={cancelGeneration}
                className="w-full h-12 sm:h-14 border-2 border-red-300 bg-white text-red-600 font-light text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-red-50 hover:border-red-400 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 rounded-sm shadow-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                <span>Cancel Generation</span>
              </button>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImageModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImageModal(null)}
          >
            <div className="relative max-w-5xl w-full max-h-[90vh]">
              {/* Close button */}
              <button
                onClick={() => setSelectedImageModal(null)}
                className="absolute -top-14 right-0 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-2xl">
                <Image 
                  src={selectedImageModal} 
                  alt="Design Preview" 
                  fill 
                  className="object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Image info */}
              <div className="mt-4 text-center" onClick={(e) => e.stopPropagation()}>
                <p className="text-white/80 text-sm font-medium">Tap outside to close</p>
              </div>
            </div>
          </div>
        )}

        {/* Elegant Bottom Drawer with Mobile Optimization */}
        <div 
          data-drawer="bottom"
          className={`fixed inset-0 bg-white z-40 touch-action-pan-y transition-all duration-500 ${
            isDrawerOpen 
              ? 'translate-y-0 opacity-100 pointer-events-auto' 
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
          style={{ 
            visibility: isDrawerOpen ? 'visible' : 'hidden'
          }}
        >
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Clear Close Button */}
            <div className={`flex items-center justify-center py-4 ${isNativeIOS() ? 'pt-safe-drawer' : ''}`}>
              <button
                onClick={() => setIsDrawerOpen(false)}
                data-onboarding="close-design-drawer"
                className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F5] hover:bg-[#E8E8E8] border border-[#E8E8E8] text-[#1A1A1A] rounded-full transition-all duration-300 active:scale-95"
                aria-label="Close drawer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-xs font-light tracking-wider uppercase">Close</span>
              </button>
            </div>

            <div className="w-full flex-1 flex flex-col overflow-hidden">
              {(designMode === 'design' || designMode === null) && (
                <div 
                  className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 overflow-y-auto overscroll-contain flex-1 scrollbar-hide"
                  data-onboarding="design-parameters-drawer"
                >
                  {/* Low Credits Warning */}
                  {credits !== null && credits <= 2 && credits > 0 && (
                    <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFF9E6]/50 border border-[#E8E8E8]/50 p-4 sm:p-5 text-sm rounded-sm shadow-sm animate-fade-in">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0 rounded-sm shadow-sm">
                          <span className="text-lg sm:text-xl">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-[0.15em] uppercase mb-2 text-[10px] sm:text-xs">Low on credits!</p>
                          <p className="text-[#6B6B6B] text-xs sm:text-sm leading-relaxed font-light">
                            You have {credits} credit{credits !== 1 ? 's' : ''} left. 
                            <button 
                              onClick={() => router.push('/settings/credits')}
                              className="underline ml-1 hover:text-[#1A1A1A] transition-colors duration-300"
                            >
                              Get more
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Credits Warning */}
                  {credits !== null && credits === 0 && (
                    <div className="bg-gradient-to-r from-[#FFF0F0] to-[#FFF0F0]/50 border border-[#E8E8E8]/50 p-4 sm:p-5 text-sm rounded-sm shadow-sm animate-fade-in">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0 rounded-sm shadow-sm">
                          <span className="text-lg sm:text-xl">❌</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-[0.15em] uppercase mb-2 text-[10px] sm:text-xs">No credits remaining</p>
                          <p className="text-[#6B6B6B] text-xs sm:text-sm leading-relaxed font-light">
                            Refer 3 friends to earn 1 free credit!
                            <button 
                              onClick={() => router.push('/settings/credits')}
                              className="underline ml-1 hover:text-[#1A1A1A] transition-colors duration-300"
                            >
                              Learn more
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Drawing Status with Influence Control */}
                  {drawingImageUrl && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'drawing' ? null : 'drawing')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-white/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-md active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 border-2 border-white bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center flex-shrink-0 rounded-xl shadow-sm">
                            <Pencil className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-bold text-charcoal mb-0.5">Drawing</p>
                            <p className="text-xs text-muted-foreground">Tap to adjust influence</p>
                          </div>
                          <span className="text-sm font-bold text-white bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 rounded-full shadow-sm">{influenceWeights.nailEditor_drawing}%</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ml-2 ${expandedSection === 'drawing' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'drawing' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                          {/* Drawing Preview */}
                          <div className="relative aspect-square rounded-lg overflow-hidden max-w-[200px] mx-auto">
                            <Image src={drawingImageUrl} alt="Your drawing" fill className="object-contain bg-white" />
                          </div>
                          
                          {/* Influence Slider */}
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-muted-foreground">Drawing Influence</label>
                            <span className="text-xs font-bold text-green-600">{influenceWeights.nailEditor_drawing}%</span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 h-2 rounded-full" style={{
                              background: 'linear-gradient(to right, #e0e0e0 0%, #10b981 50%, #059669 100%)',
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }} />
                            <Slider
                              value={[influenceWeights.nailEditor_drawing]}
                              onValueChange={(value) => handleNailEditorDrawingInfluence(value[0])}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full relative z-10"
                            />
                          </div>
                          <div className="text-[10px] text-muted-foreground space-y-1">
                            {selectedDesignImages.length > 0 && (
                              <p>Design Images: {influenceWeights.nailEditor_designImage}%</p>
                            )}
                            <p>Base Color: {influenceWeights.nailEditor_baseColor}%</p>
                          </div>
                          <button
                            onClick={handleRemoveDrawing}
                            className="w-full mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove Drawing
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Uploaded Design Previews with Influence Control */}
                  {selectedDesignImages.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'design-images' ? null : 'design-images')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-white/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-md active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex -space-x-2">
                            {selectedDesignImages.slice(0, 3).map((img, idx) => (
                              <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                <Image src={img} alt={`Design ${idx + 1}`} fill className="object-cover" />
                              </div>
                            ))}
                            {selectedDesignImages.length > 3 && (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-rose flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-white text-xs font-bold">+{selectedDesignImages.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-bold text-charcoal mb-0.5">{selectedDesignImages.length} Design{selectedDesignImages.length > 1 ? 's' : ''}</p>
                            <p className="text-xs text-muted-foreground">Tap to adjust influence</p>
                          </div>
                          <span className="text-sm font-bold text-white bg-gradient-to-r from-terracotta to-rose px-3 py-1.5 rounded-full shadow-sm">{influenceWeights.nailEditor_designImage}%</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ml-2 ${expandedSection === 'design-images' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'design-images' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                          {/* Design Images Grid */}
                          <div className="grid grid-cols-3 gap-2">
                            {selectedDesignImages.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                <Image src={img} alt={`Design ${idx + 1}`} fill className="object-cover" />
                                <button
                                  onClick={() => removeDesignImage(img)}
                                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Influence Slider */}
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-muted-foreground">Design Images</label>
                            <span className="text-xs font-bold text-primary">{influenceWeights.nailEditor_designImage}%</span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 h-2 rounded-full" style={{
                              background: 'linear-gradient(to right, #e0e0e0 0%, #9b59b6 50%, #8e44ad 100%)',
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }} />
                            <Slider
                              value={[influenceWeights.nailEditor_designImage]}
                              onValueChange={(value) => handleNailEditorDesignImageInfluence(value[0])}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full relative z-10"
                            />
                          </div>
                          <div className="text-[10px] text-muted-foreground space-y-1">
                            {drawingImageUrl && (
                              <p>Drawing: {influenceWeights.nailEditor_drawing}%</p>
                            )}
                            <p>Base Color: {influenceWeights.nailEditor_baseColor}%</p>
                          </div>
                          <button
                            onClick={() => setSelectedDesignImages([])}
                            className="w-full mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove All Design Images
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-[#E8E8E8] pt-4" data-onboarding="design-section">
                    <p className="text-xs font-light text-[#6B6B6B] uppercase tracking-widest mb-4">Design Parameters</p>

                    {/* Nail Length - Redesigned */}
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'length' ? null : 'length')}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-gradient-to-br from-white to-[#FEFEFE] hover:border-[#8B7355] hover:shadow-md transition-all duration-300 active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A0826D] flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium text-[#1A1A1A] tracking-wide block">Nail Length</span>
                            <span className="text-xs text-[#8B7355] capitalize font-light">{designSettings.nailLength.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-[#6B6B6B] transition-transform duration-300 ${expandedSection === 'length' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                      </button>
                      {expandedSection === 'length' && (
                        <div className="mt-3 p-4 bg-gradient-to-br from-[#FAFAFA] to-white rounded-lg border border-[#E8E8E8] shadow-inner animate-fade-in">
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { value: 'short', label: 'Short', height: 'h-8' },
                              { value: 'medium', label: 'Medium', height: 'h-12' },
                              { value: 'long', label: 'Long', height: 'h-16' },
                              { value: 'extra-long', label: 'Extra', height: 'h-20' }
                            ].map((length) => (
                              <button
                                key={length.value}
                                onClick={() => handleDesignSettingChange('nailLength', length.value)}
                                className={`group relative flex flex-col items-center justify-end p-3 rounded-xl border-2 transition-all duration-300 ${
                                  designSettings.nailLength === length.value
                                    ? 'border-[#8B7355] bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10 shadow-lg scale-105'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]/50 hover:shadow-md hover:scale-102'
                                }`}
                              >
                                <div className={`w-5 ${length.height} bg-gradient-to-t from-[#8B7355] to-[#A0826D] rounded-t-full mb-2 shadow-sm transition-all duration-300 ${
                                  designSettings.nailLength === length.value ? 'scale-110' : ''
                                }`} />
                                <span className={`text-[10px] font-medium tracking-wide transition-colors ${
                                  designSettings.nailLength === length.value ? 'text-[#8B7355]' : 'text-[#6B6B6B]'
                                }`}>{length.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Nail Shape - Image Slider */}
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'shape' ? null : 'shape')}
                        data-onboarding="nail-shape-option"
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-gradient-to-br from-white to-[#FEFEFE] hover:border-[#8B7355] hover:shadow-md transition-all duration-300 active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A0826D] flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium text-[#1A1A1A] tracking-wide block">Nail Shape</span>
                            <span className="text-xs text-[#8B7355] capitalize font-light">{designSettings.nailShape.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-[#6B6B6B] transition-transform duration-300 ${expandedSection === 'shape' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                      </button>
                      {expandedSection === 'shape' && (
                        <div className="mt-3 p-3 sm:p-4 bg-gradient-to-br from-[#FAFAFA] to-white rounded-lg border border-[#E8E8E8] shadow-inner animate-fade-in">
                          <div className="relative">
                            {/* Horizontal scrollable container */}
                            <div className="overflow-x-auto pb-2 scrollbar-hide -mx-1">
                              <div 
                                className="flex gap-2 sm:gap-3 min-w-max px-1"
                                data-onboarding="nail-shape-slider"
                              >
                                {[
                                  { value: 'square', label: 'Square', image: '/SQUARE.png' },
                                  { value: 'squoval', label: 'Squoval', image: '/SQUARED OVAL SQUOVAL.png' },
                                  { value: 'oval', label: 'Oval', image: '/OVAL.png' },
                                  { value: 'rounded', label: 'Rounded', image: '/ROUNDED.png' },
                                  { value: 'almond', label: 'Almond', image: '/ALMOND.png' },
                                  { value: 'mountain-peak', label: 'Mountain Peak', image: '/MOUNTAIN PEAK.png' },
                                  { value: 'stiletto', label: 'Stiletto', image: '/STILETTO.png' },
                                  { value: 'ballerina', label: 'Ballerina', image: '/BALLERINA.png' },
                                  { value: 'edge', label: 'Edge', image: '/EDGE.png' },
                                  { value: 'lipstick', label: 'Lipstick', image: '/LIPSTICK.png' },
                                  { value: 'flare', label: 'Flare', image: '/FLARE.png' },
                                  { value: 'arrow-head', label: 'Arrow Head', image: '/ARROW HEAD.png' }
                                ].map((shape) => (
                                  <button
                                    key={shape.value}
                                    onClick={() => handleDesignSettingChange('nailShape', shape.value)}
                                    className={`group relative flex-shrink-0 w-20 sm:w-24 flex flex-col items-center p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 ${
                                      designSettings.nailShape === shape.value
                                        ? 'border-[#8B7355] bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10 shadow-lg scale-105'
                                        : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]/50 hover:shadow-md hover:scale-102'
                                    }`}
                                  >
                                    {/* Image container with aspect ratio */}
                                    <div className="relative w-full aspect-[3/4] mb-1.5 sm:mb-2 overflow-hidden rounded-lg">
                                      <Image
                                        src={shape.image}
                                        alt={shape.label}
                                        fill
                                        sizes="(max-width: 640px) 80px, 96px"
                                        className={`object-contain transition-all duration-300 ${
                                          designSettings.nailShape === shape.value ? 'scale-110' : 'group-hover:scale-105'
                                        }`}
                                      />
                                    </div>
                                    <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide text-center transition-colors leading-tight ${
                                      designSettings.nailShape === shape.value ? 'text-[#8B7355]' : 'text-[#6B6B6B]'
                                    }`}>{shape.label}</span>
                                    {/* Selection indicator - Always visible on top */}
                                    {designSettings.nailShape === shape.value && (
                                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-5 sm:h-5 bg-[#8B7355] rounded-full flex items-center justify-center shadow-md z-10 ring-2 ring-white">
                                        <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Scroll indicators - adjusted for mobile */}
                            <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-[#FAFAFA] to-transparent pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Base Color - Redesigned with Sliders */}
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'color' ? null : 'color')}
                        data-onboarding="base-color-option"
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-gradient-to-br from-white to-[#FEFEFE] hover:border-[#8B7355] hover:shadow-md transition-all duration-300 active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div 
                            className="w-10 h-10 rounded-full shadow-md ring-2 ring-white ring-offset-2 transition-all duration-300"
                            style={{ backgroundColor: designSettings.baseColor }}
                          />
                          <div className="flex-1 text-left">
                            <span className="text-sm font-medium text-[#1A1A1A] tracking-wide block">Base Color</span>
                            <span className="text-xs text-[#8B7355] font-light">{designSettings.baseColor}</span>
                          </div>
                          <span className="text-xs font-medium text-white bg-gradient-to-r from-[#8B7355] to-[#A0826D] px-3 py-1.5 rounded-full shadow-sm">
                            {influenceWeights.nailEditor_baseColor}%
                          </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-[#6B6B6B] transition-transform duration-300 ml-2 ${expandedSection === 'color' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                      </button>
                      {expandedSection === 'color' && (
                        <div className="mt-3 space-y-5 p-5 sm:p-6 bg-gradient-to-br from-[#FAFAFA] to-white rounded-lg border border-[#E8E8E8] shadow-inner animate-fade-in">
                          {/* Color Preview */}
                          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E8E8E8] shadow-sm">
                            <div 
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg ring-4 ring-white transition-all duration-300"
                              style={{ backgroundColor: designSettings.baseColor }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#6B6B6B] font-light uppercase tracking-wider mb-1">Current Color</p>
                              <p className="text-base sm:text-lg font-medium text-[#1A1A1A] tracking-tight truncate">{designSettings.baseColor}</p>
                              <p className="text-xs text-[#8B7355] font-light mt-0.5">
                                HSL({hexToHsl(designSettings.baseColor).hue}°, 100%, {colorLightness}%)
                              </p>
                            </div>
                          </div>

                          {/* Hue Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-xs sm:text-sm text-[#1A1A1A] font-medium tracking-wider uppercase">Hue</label>
                              <span className="text-xs sm:text-sm text-white bg-[#8B7355] px-3 py-1.5 rounded-full font-medium shadow-sm min-w-[60px] text-center">
                                {hexToHsl(designSettings.baseColor).hue}°
                              </span>
                            </div>
                            <div className="relative py-1">
                              <div className="relative h-7 sm:h-9 rounded-full overflow-hidden shadow-lg border-2 border-white ring-1 ring-[#E8E8E8]">
                                <div className="absolute inset-0 rounded-full" style={{
                                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                                }} />
                                <Slider
                                  value={[hexToHsl(designSettings.baseColor).hue]}
                                  onValueChange={handleHueChange}
                                  max={360}
                                  step={1}
                                  className="w-full relative z-10 slider-transparent h-full"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Lightness Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-xs sm:text-sm text-[#1A1A1A] font-medium tracking-wider uppercase">Brightness</label>
                              <span className="text-xs sm:text-sm text-white bg-[#8B7355] px-3 py-1.5 rounded-full font-medium shadow-sm min-w-[60px] text-center">
                                {colorLightness}%
                              </span>
                            </div>
                            <div className="relative py-1">
                              <div className="relative h-7 sm:h-9 rounded-full overflow-hidden shadow-lg border-2 border-white ring-1 ring-[#E8E8E8]">
                                <div className="absolute inset-0 rounded-full" style={{
                                  background: `linear-gradient(to right, hsl(${hexToHsl(designSettings.baseColor).hue}, 100%, 10%), hsl(${hexToHsl(designSettings.baseColor).hue}, 100%, 50%), hsl(${hexToHsl(designSettings.baseColor).hue}, 100%, 90%))`,
                                }} />
                                <Slider
                                  value={[colorLightness]}
                                  onValueChange={handleLightnessChange}
                                  max={100}
                                  min={10}
                                  step={1}
                                  className="w-full relative z-10 slider-transparent h-full"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Influence Slider */}
                          <div className="pt-4 border-t border-[#E8E8E8]">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-xs sm:text-sm text-[#1A1A1A] font-medium tracking-wider uppercase">Color Influence</label>
                              <span className="text-xs sm:text-sm text-white bg-gradient-to-r from-[#8B7355] to-[#A0826D] px-3 py-1.5 rounded-full font-medium shadow-sm min-w-[60px] text-center">
                                {influenceWeights.nailEditor_baseColor}%
                              </span>
                            </div>
                            <div className="relative py-1">
                              <div className="relative h-7 sm:h-9 rounded-full overflow-hidden shadow-lg border-2 border-white ring-1 ring-[#E8E8E8]">
                                <div className="absolute inset-0 rounded-full" style={{
                                  background: 'linear-gradient(to right, #f5f5f5 0%, #8B7355 50%, #6B5345 100%)',
                                }} />
                                <Slider
                                  value={[influenceWeights.nailEditor_baseColor]}
                                  onValueChange={(value) => handleNailEditorBaseColorInfluence(value[0])}
                                  min={0}
                                  max={100}
                                  step={5}
                                  className="w-full relative z-10 slider-transparent h-full"
                                />
                              </div>
                            </div>
                            {selectedDesignImages.length > 0 && (
                              <p className="text-[10px] sm:text-xs text-[#6B6B6B] font-light mt-2 text-center">
                                Design Images: {influenceWeights.nailEditor_designImage}%
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Finish - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'finish' ? null : 'finish')}
                        data-onboarding="finish-option"
                        className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-light text-[#1A1A1A] tracking-wide">Finish</span>
                          <span className="text-xs text-[#6B6B6B] capitalize font-light">{designSettings.finish}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedSection === 'finish' ? 'rotate-180' : ''}`} strokeWidth={1} />
                      </button>
                      {expandedSection === 'finish' && (
                        <div className="mt-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'glossy', label: 'Glossy', gradient: 'bg-gradient-to-br from-pink-400 to-pink-600' },
                              { value: 'matte', label: 'Matte', gradient: 'bg-pink-400' },
                              { value: 'satin', label: 'Satin', gradient: 'bg-gradient-to-b from-pink-300 to-pink-500' },
                              { value: 'metallic', label: 'Metallic', gradient: 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300' },
                              { value: 'chrome', label: 'Chrome', gradient: 'bg-gradient-to-br from-gray-300 via-pink-200 to-gray-300' },
                              { value: 'cateye', label: 'Cat-Eye', gradient: 'bg-gradient-to-r from-pink-500 via-pink-300 to-pink-500' }
                            ].map((finish) => (
                              <button
                                key={finish.value}
                                onClick={() => handleDesignSettingChange('finish', finish.value)}
                                className={`flex flex-col items-center p-2 border transition-all ${
                                  designSettings.finish === finish.value
                                    ? 'border-[#8B7355] bg-white'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]'
                                }`}
                              >
                                <div className={`w-full h-12 ${finish.gradient} mb-1.5`} />
                                <span className="text-[10px] font-light text-[#1A1A1A]">{finish.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Texture - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'texture' ? null : 'texture')}
                        className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-light text-[#1A1A1A] tracking-wide">Texture</span>
                          <span className="text-xs text-[#6B6B6B] capitalize font-light">{designSettings.texture}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedSection === 'texture' ? 'rotate-180' : ''}`} strokeWidth={1} />
                      </button>
                      {expandedSection === 'texture' && (
                        <div className="mt-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'smooth', label: 'Smooth', pattern: 'bg-pink-400' },
                              { value: 'glitter', label: 'Glitter', pattern: 'bg-gradient-to-br from-pink-300 via-pink-500 to-pink-300 bg-[length:4px_4px]' },
                              { value: 'shimmer', label: 'Shimmer', pattern: 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300' },
                              { value: 'textured', label: 'Textured', pattern: 'bg-pink-400' },
                              { value: 'holographic', label: 'Holo', pattern: 'bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300' }
                            ].map((texture) => (
                              <button
                                key={texture.value}
                                onClick={() => handleDesignSettingChange('texture', texture.value)}
                                className={`flex flex-col items-center p-2 border transition-all ${
                                  designSettings.texture === texture.value
                                    ? 'border-[#8B7355] bg-white'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]'
                                }`}
                              >
                                <div className={`w-full h-12 ${texture.pattern} mb-1.5 ${texture.value === 'glitter' ? 'animate-pulse' : ''}`} 
                                  style={texture.value === 'textured' ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px)' } : {}}
                                />
                                <span className="text-[10px] font-light text-[#1A1A1A]">{texture.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}


            </div>
            <input
              ref={designUploadRef}
              type="file"
              accept="image/*"
              onChange={handleDesignUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Upload Design Images Drawer */}
        <div 
          data-drawer="upload"
          className={`fixed inset-0 bg-white z-40 touch-action-pan-y transition-all duration-500 ${
            isUploadDrawerOpen 
              ? 'translate-y-0 opacity-100 pointer-events-auto' 
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
          style={{ 
            visibility: isUploadDrawerOpen ? 'visible' : 'hidden'
          }}
        >
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Clear Close Button */}
            <div className={`flex items-center justify-center py-4 ${isNativeIOS() ? 'pt-safe-drawer' : ''}`}>
              <button
                onClick={() => setIsUploadDrawerOpen(false)}
                data-onboarding="close-upload-drawer"
                className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F5] hover:bg-[#E8E8E8] border border-[#E8E8E8] text-[#1A1A1A] rounded-full transition-all duration-300 active:scale-95"
                aria-label="Close drawer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-xs font-light tracking-wider uppercase">Close</span>
              </button>
            </div>

            <div className="w-full flex-1 flex flex-col overflow-hidden">
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 overflow-y-auto overscroll-contain flex-1 scrollbar-hide">
                {/* Success Banner when design is uploaded */}
                {selectedDesignImages.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-lg animate-in fade-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-green-900 mb-1">Design Uploaded Successfully!</h3>
                        <p className="text-sm text-green-700 font-light">
                          {selectedDesignImages.length} design{selectedDesignImages.length > 1 ? 's' : ''} ready to influence your nail art
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl sm:text-2xl font-serif text-[#1A1A1A] mb-4">Upload Design Images</h2>
                
                {/* Upload Button */}
                <button 
                  onClick={() => designUploadRef.current?.click()}
                  data-onboarding="upload-design-button"
                  className="w-full h-32 border-2 border-dashed border-[#E8E8E8] text-[#1A1A1A] font-light text-sm tracking-[0.15em] uppercase hover:bg-[#F8F7F5] hover:border-[#8B7355] active:scale-[0.98] transition-all duration-500 flex flex-col items-center justify-center gap-3 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploadingDesign || selectedDesignImages.length >= 3}
                >
                  {isUploadingDesign ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" strokeWidth={1.5} />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#8B7355]" strokeWidth={1.5} />
                      <span>Upload Design Image</span>
                      <span className="text-xs opacity-70">({selectedDesignImages.length}/1)</span>
                    </>
                  )}
                </button>

                {/* Uploaded Design Previews with Influence Control */}
                {selectedDesignImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="border border-[#E8E8E8] rounded-sm p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-light tracking-[0.15em] uppercase text-[#1A1A1A]">
                          {selectedDesignImages.length} Design{selectedDesignImages.length > 1 ? 's' : ''} Uploaded
                        </h3>
                        <span className="text-sm font-medium text-[#8B7355]">{influenceWeights.nailEditor_designImage}%</span>
                      </div>
                      
                      {/* Design Images Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {selectedDesignImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-sm overflow-hidden group border border-[#E8E8E8]">
                            <Image src={img} alt={`Design ${idx + 1}`} fill className="object-cover" />
                            <button
                              onClick={() => removeDesignImage(img)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Influence Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-light text-[#6B6B6B] uppercase tracking-wider">Design Influence</label>
                          <span className="text-xs font-medium text-[#8B7355]">{influenceWeights.nailEditor_designImage}%</span>
                        </div>
                        <Slider
                          value={[influenceWeights.nailEditor_designImage]}
                          onValueChange={(value) => handleNailEditorDesignImageInfluence(value[0])}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-[10px] text-[#6B6B6B] font-light">
                          Base Color: {influenceWeights.nailEditor_baseColor}%
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedDesignImages([])
                          setIsUploadDrawerOpen(false)
                        }}
                        className="w-full mt-4 h-10 border border-red-300 text-red-600 text-xs font-light tracking-[0.15em] uppercase hover:bg-red-50 hover:border-red-400 transition-all duration-300 rounded-sm"
                      >
                        Remove All Images
                      </button>
                    </div>
                  </div>
                )}

                {selectedDesignImages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#6B6B6B] font-light">No design images uploaded yet</p>
                    <p className="text-xs text-[#6B6B6B] font-light mt-2">Upload a reference image to guide your design</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav onCenterAction={changePhoto} centerActionLabel="Capture" />

        {/* Generation Confirmation Dialog */}
        <GenerationConfirmationDialog
          isOpen={showConfirmDialog}
          onConfirm={handleConfirmGeneration}
          onCancel={handleCancelGeneration}
          credits={credits}
        />

        {/* Drawing Canvas Modal - Hidden on native iOS */}
        {!isNative() && showDrawingCanvas && compositeImageForEditing && (
          <DrawingCanvas
            imageUrl={compositeImageForEditing}
            onSave={handleDrawingComplete}
            onClose={() => {
              setShowDrawingCanvas(false)
              setCompositeImageForEditing(null)
            }}
          />
        )}
        
        {/* Onboarding Tour */}
        {shouldShowOnboarding && (
          <CaptureOnboarding 
            onComplete={completeOnboarding}
            currentPhase={onboardingPhase}
            currentStep={onboardingStep}
            onStepChange={setOnboardingStep}
          />
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1A1A1A] via-black to-[#1A1A1A]">
      <div
        className="relative w-full h-full"
        onTouchStart={!isNativeIOS() ? handleTouchStart : undefined}
        onTouchMove={!isNativeIOS() ? handleTouchMove : undefined}
        onTouchEnd={!isNativeIOS() ? handleTouchEnd : undefined}
      >
        {/* Video element - hidden on native iOS */}
        {!isNativeIOS() && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transition-all duration-500"
            style={{
              transform: `${facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'} scale(${zoom})`,
              filter: 'brightness(1.08) contrast(1.08) saturate(1.15)',
              opacity: isFlipping ? 0 : 1,
              transition: 'transform 0.3s ease-out, opacity 0.5s ease-out',
            }}
          />
        )}

        {/* Native iOS camera placeholder */}
        {isNativeIOS() && (
          <div className="w-full h-full bg-gradient-to-b from-[#2A2A2A] via-[#1A1A1A] to-[#2A2A2A] flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-white/60 mx-auto mb-4" strokeWidth={1} />
              <p className="text-white/80 text-lg font-light tracking-[0.2em] uppercase mb-2">Native Camera</p>
              <p className="text-white/60 text-sm font-light">Tap capture button to take photo</p>
            </div>
          </div>
        )}

        {/* Hand Reference Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[5] overflow-visible">
          <style jsx>{`
            @keyframes elegant-pulse {
              0%, 100% { opacity: ${shouldShowOnboarding && onboardingStep === 0 ? '0.15' : '0.4'}; transform: scale(1); }
              50% { opacity: ${shouldShowOnboarding && onboardingStep === 0 ? '0.25' : '0.7'}; transform: scale(1.02); }
            }
            .hand-outline {
              animation: elegant-pulse 3s ease-in-out infinite;
            }
          `}</style>
          <img
            src={`/ref${handReference}.png`}
            alt="Hand reference"
            className="hand-outline w-full h-full object-contain transition-all duration-700"
            style={{
              transform: `scale(${handReference === 1 ? 2.7 : handReference === 3 ? 4.575 : 4.35})`,
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6)) brightness(1.1)',
            }}
          />
        </div>

        {isFlipping && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-black flex items-center justify-center backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={1.5} />
              <p className="text-white/80 text-sm font-light tracking-[0.2em] uppercase">Switching Camera</p>
            </div>
          </div>
        )}

        {isUploadingImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-black flex items-center justify-center backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={1.5} />
              <p className="text-white/80 text-sm font-light tracking-[0.2em] uppercase">Loading Image</p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 bg-gradient-to-b from-[#1A1A1A] via-black to-[#1A1A1A] flex flex-col items-center justify-center backdrop-blur-sm z-[150]">
            <div className="flex flex-col items-center gap-6 animate-fade-in">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-white animate-spin" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{Math.round(generationProgress)}%</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-white text-lg font-light tracking-[0.2em] uppercase">Generating Design</p>
                <p className="text-white/60 text-sm font-light">This usually takes about 1 minute</p>
              </div>
              <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8B7355] to-[#A0826D] transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Elegant Top Bar */}
        <div className="absolute top-0 left-0 right-0 pt-safe px-4 sm:px-6 pb-5 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pt-3">
            <button
              onClick={() => {
                // If we have a saved image (user is in replace mode), restore it
                if (savedImageBeforeReplace) {
                  cancelReplaceHandPhoto()
                } else {
                  router.back()
                }
              }}
              data-onboarding="camera-close-button"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-500 shadow-lg active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-white font-serif text-base sm:text-lg font-light tracking-[0.25em] uppercase">Capture</div>
            
            <div className="flex items-center">
              <CreditsDisplay showLabel={false} credits={credits} />
            </div>
          </div>
          
          {/* Instructional Message */}
          <div className="flex items-center justify-center animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                <p className="text-white text-xs sm:text-sm font-light tracking-[0.15em] uppercase">
                  {isNativeIOS() ? 'Tap capture button to take a photo' : 'Take a photo of your hand with good lighting'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Zoom Indicator - hidden on native iOS */}
        {!isNativeIOS() && showZoomIndicator && zoom > 1 && (
          <div className="absolute top-28 sm:top-32 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-500 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full flex items-center space-x-3 shadow-2xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-light text-sm tracking-wider">{zoom.toFixed(1)}×</span>
            </div>
          </div>
        )}

        {/* Elegant Right Side Controls */}
        <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4 animate-fade-in-delayed">
          {/* Flip Camera Button - hidden on native iOS */}
          {!isNativeIOS() && (
            <button
              onClick={flipCamera}
              disabled={isFlipping}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-md border flex flex-col items-center justify-center transition-all duration-500 active:scale-95 ${
                facingMode === "environment"
                  ? "bg-white/95 border-white/50 text-[#1A1A1A] shadow-2xl"
                  : "bg-white/10 border-white/20 hover:bg-white/20 text-white shadow-xl"
              } ${isFlipping ? "opacity-50" : ""}`}
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Hand Reference Toggle - Right Arrow */}
          <button
            onClick={() => setHandReference(handReference === 3 ? 2 : handReference === 2 ? 1 : 3)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white shadow-xl flex flex-col items-center justify-center transition-all duration-500 active:scale-95"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Elegant Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-10 pt-8 px-6 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => {
                if (isNativeIOS()) {
                  // Use native photo picker on iOS
                  handleFileUpload({} as React.ChangeEvent<HTMLInputElement>)
                } else {
                  // Use web file input on other platforms
                  fileInputRef.current?.click()
                }
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-500 shadow-xl flex items-center justify-center active:scale-95"
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            <button
              onClick={capturePhoto}
              data-onboarding="capture-button"
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95 shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f7f5 100%)',
                border: '5px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-inner"></div>
            </button>

            <div className="w-14 sm:w-16"></div>
          </div>
          
          {/* Elegant Instruction Text */}
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-white/70 text-xs sm:text-sm font-light tracking-[0.15em] uppercase">
              Position your hand in the frame
            </p>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      
      {/* Onboarding Tour */}
      {shouldShowOnboarding && (
        <CaptureOnboarding 
          onComplete={completeOnboarding}
          currentPhase={onboardingPhase}
          currentStep={onboardingStep}
          onStepChange={setOnboardingStep}
        />
      )}
    </div>
  )
}
