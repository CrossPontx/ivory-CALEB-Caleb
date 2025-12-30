"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

interface UploadDesignDialogProps {
  onUploadComplete?: () => void
  trigger?: React.ReactNode
}

export function UploadDesignDialog({ onUploadComplete, trigger }: UploadDesignDialogProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image is too large. Max size is 10MB')
      return
    }

    setUploading(true)

    try {
      // Compress image if needed
      const compressedFile = await compressImage(file)

      // Upload image
      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('type', 'saved-design')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await uploadResponse.json()
      
      // Auto-generate title from filename
      const filename = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      const autoTitle = filename || `Design ${new Date().toLocaleDateString()}`
      
      // Save design immediately without showing name dialog
      const saveResponse = await fetch('/api/saved-designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: url,
          title: autoTitle,
          sourceUrl: null,
          sourceType: 'upload',
          notes: null,
          collectionId: null,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save design')
      }

      // Reset state
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error?.message || 'Failed to upload image')
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Max dimensions
          const maxDimension = 2048
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(new File([blob], file.name, { type: 'image/jpeg' }))
                } else {
                  resolve(file)
                }
              },
              'image/jpeg',
              0.85
            )
          } else {
            resolve(file)
          }
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
      
      {trigger ? (
        <div onClick={handleButtonClick} className={uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}>
          {trigger}
        </div>
      ) : (
        <Button
          onClick={handleButtonClick}
          disabled={uploading}
          className="w-full h-12 sm:h-14 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 text-xs sm:text-sm tracking-[0.2em] sm:tracking-widest uppercase rounded-none font-light active:scale-95 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#1A1A1A] disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" strokeWidth={1.5} />
              <span className="hidden sm:inline">Uploading...</span>
              <span className="sm:hidden">Uploading</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={1.5} />
              <span className="hidden sm:inline">Upload Design</span>
              <span className="sm:hidden">Upload</span>
            </>
          )}
        </Button>
      )}
    </>
  )
}
