"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Camera, Image as ImageIcon, Loader2, X } from "lucide-react"
import Image from "next/image"

interface UploadDesignDialogProps {
  onUploadComplete?: () => void
  trigger?: React.ReactNode
}

export function UploadDesignDialog({ onUploadComplete, trigger }: UploadDesignDialogProps) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [notes, setNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!imageFile) {
      alert('Please select an image')
      return
    }

    setUploading(true)

    try {
      // Upload image
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('type', 'saved-design')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await uploadResponse.json()

      // Save design
      const saveResponse = await fetch('/api/saved-designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: url,
          title: title.trim() || null,
          sourceUrl: sourceUrl.trim() || null,
          sourceType: 'upload',
          notes: notes.trim() || null,
          collectionId: null, // Will use default collection
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save design')
      }

      // Reset form
      setImageFile(null)
      setImagePreview(null)
      setTitle("")
      setSourceUrl("")
      setNotes("")
      setOpen(false)

      // Notify parent
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error?.message || 'Failed to upload design')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-12 sm:h-14 px-8 sm:px-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light">
            <Upload className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Upload Design
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light tracking-tight">
            Upload Design
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-xs tracking-wider uppercase text-[#6B6B6B]">
              Image *
            </Label>
            
            {!imagePreview ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-32 flex-col gap-2 border-2 border-dashed hover:border-[#8B7355] transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 text-[#6B6B6B]" strokeWidth={1} />
                    <span className="text-xs">Choose Photo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment')
                        fileInputRef.current.click()
                      }
                    }}
                    className="h-32 flex-col gap-2 border-2 border-dashed hover:border-[#8B7355] transition-colors"
                  >
                    <Camera className="w-8 h-8 text-[#6B6B6B]" strokeWidth={1} />
                    <span className="text-xs">Take Photo</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F8F7F5] border border-[#E8E8E8]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs tracking-wider uppercase text-[#6B6B6B]">
              Title (Optional)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., French Tips with Gold Accent"
              className="border-[#E8E8E8] focus:border-[#8B7355]"
            />
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <Label htmlFor="sourceUrl" className="text-xs tracking-wider uppercase text-[#6B6B6B]">
              Source Link (Optional)
            </Label>
            <Input
              id="sourceUrl"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="e.g., https://instagram.com/..."
              className="border-[#E8E8E8] focus:border-[#8B7355]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs tracking-wider uppercase text-[#6B6B6B]">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this design..."
              rows={3}
              className="border-[#E8E8E8] focus:border-[#8B7355] resize-none"
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!imageFile || uploading}
            className="w-full h-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Save Design
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
