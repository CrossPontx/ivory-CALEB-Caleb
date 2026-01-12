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
  maxImages,
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

    // Check if adding these files would exceed max (only if maxImages is set)
    if (maxImages && images.length + files.length > maxImages) {
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

  const canUploadMore = !maxImages || images.length < maxImages

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Button */}
      {canUploadMore && (
        <div className="text-center space-y-4 sm:space-y-6">
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
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 ease-out px-8 sm:px-12 h-12 sm:h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98] border-0"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" strokeWidth={1.5} />
                  {uploadProgress}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-3" strokeWidth={1.5} />
                  {buttonText}
                </>
              )}
            </Button>
          </div>
          {images.length > 0 && (
            <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#8B7355] font-light">
              {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
            </p>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden bg-[#F8F7F5] group border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-500"
            >
              <Image
                src={url}
                alt={`Portfolio image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 bg-[#1A1A1A]/80 hover:bg-[#8B7355] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
              {/* Image overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-12 sm:py-16 lg:py-20 border border-[#E8E8E8] bg-gradient-to-b from-[#FAFAF8] to-white">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-white flex items-center justify-center">
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" strokeWidth={1} />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-3 sm:mb-4 tracking-tight">
            Share Your Best Work
          </h3>
          <p className="text-sm sm:text-base text-[#6B6B6B] font-light mb-6 sm:mb-8 max-w-md mx-auto leading-[1.7] tracking-wide">
            Upload photos of your nail art to showcase your skills and attract clients
          </p>
        </div>
      )}
    </div>
  )
}
