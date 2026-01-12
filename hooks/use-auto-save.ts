import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface UseAutoSaveOptions {
  onSave: () => Promise<void>
  delay?: number
  enabled?: boolean
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  triggerSave: () => void
  hasUnsavedChanges: boolean
}

export function useAutoSave({
  onSave,
  delay = 2000, // 2 seconds default
  enabled = true
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const savePromiseRef = useRef<Promise<void> | null>(null)

  const triggerSave = useCallback(async () => {
    if (!enabled || isSaving) return

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // If there's already a save in progress, wait for it
    if (savePromiseRef.current) {
      await savePromiseRef.current
    }

    setIsSaving(true)
    
    try {
      const savePromise = onSave()
      savePromiseRef.current = savePromise
      await savePromise
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      // Show subtle success indicator
      toast({
        title: "Auto-saved",
        description: "Your changes have been saved automatically",
        duration: 2000,
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
      toast({
        title: "Auto-save failed",
        description: "Your changes are saved locally. Please check your connection.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
      savePromiseRef.current = null
    }
  }, [enabled, isSaving, onSave, toast])

  const debouncedSave = useCallback(() => {
    if (!enabled) return

    setHasUnsavedChanges(true)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      triggerSave()
    }, delay)
  }, [enabled, delay, triggerSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isSaving,
    lastSaved,
    triggerSave,
    hasUnsavedChanges,
    // Expose the debounced save function for manual triggering
    debouncedSave
  } as UseAutoSaveReturn & { debouncedSave: () => void }
}