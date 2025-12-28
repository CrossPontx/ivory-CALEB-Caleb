"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onUpload: (url: string) => void
  onRemove?: (url: string) => void
  images?: string[]
  maxImages?: number
  className?: string
  buttonText?: string
  multiple?: boolean
}

export function ImageUpload({
  onUpload,
  onRemove,
  images = [],
  maxImages = 10,
  className,
  buttonText = "Upload Photos",
  multiple = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`)
      return
    }

    setUploading(true)
    setUploadProgress(`Uploading 0/${files.length}...`)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is too large. Max size is 10MB`)
          continue
        }

        setUploadProgress(`Uploading ${i + 1}/${files.length}...`)

        // Compress image if needed (for mobile)
        const compressedFile = await compressImage(file)

        const formData = new FormData()
        formData.append('file', compressedFile)
        formData.append('type', 'portfolio')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const data = await response.json()
        onUpload(data.url)
      }

      setUploadProgress("")
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error?.message || 'Failed to upload images')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Compress image for better mobile performance
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Max dimensions for portfolio images
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

  const handleRemove = (url: string) => {
    if (onRemove) {
      onRemove(url)
    }
  }

  const canUploadMore = images.length < maxImages

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Button */}
      {canUploadMore && (
        <div className="text-center space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-12 sm:h-14 text-sm sm:text-base active:scale-95 transition-transform"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  {uploadProgress}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {buttonText}
                </>
              )}
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {images.length}/{maxImages} images • Max 10MB per image
          </p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              <Image
                src={url}
                alt={`Portfolio image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 sm:py-12 border-2 border-dashed border-border rounded-lg">
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Upload photos of your best work
          </p>
        </div>
      )}
    </div>
  )
}
