"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Loader2, Check, X } from "lucide-react"

interface UploadDesignDialogProps {
  onUploadComplete?: () => void
  trigger?: React.ReactNode
}

export function UploadDesignDialog({ onUploadComplete, trigger }: UploadDesignDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [originalFilename, setOriginalFilename] = useState("")
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
      
      // Set uploaded URL and default title from filename
      setUploadedUrl(url)
      const filename = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      setOriginalFilename(filename)
      setTitle(filename)
      setUploading(false)
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

  const handleSave = async () => {
    if (!uploadedUrl) return

    setUploading(true)

    try {
      // Save design
      const saveResponse = await fetch('/api/saved-designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          title: title.trim() || originalFilename,
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
      setUploadedUrl(null)
      setTitle("")
      setOriginalFilename("")
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify parent
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error: any) {
      console.error('Save error:', error)
      alert(error?.message || 'Failed to save design')
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setUploadedUrl(null)
    setTitle("")
    setOriginalFilename("")
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // If showing title editor
  if (uploadedUrl && !uploading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
          <h3 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
            Name Your Design
          </h3>
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Design name"
            className="border-[#E8E8E8] focus:border-[#8B7355]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave()
              } else if (e.key === 'Escape') {
                handleCancel()
              }
            }}
          />
          
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="flex-1 h-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light"
            >
              <Check className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 h-12 border-[#E8E8E8] hover:border-[#8B7355] text-xs tracking-widest uppercase rounded-none font-light"
            >
              <X className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
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
        <div onClick={handleButtonClick}>
          {trigger}
        </div>
      ) : (
        <Button
          onClick={handleButtonClick}
          disabled={uploading}
          className="h-12 sm:h-14 px-8 sm:px-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Upload Design
            </>
          )}
        </Button>
      )}
    </>
  )
}
