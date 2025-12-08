"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Share2, Trash2, Send } from "lucide-react"
import Image from "next/image"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
}

export default function LookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [look, setLook] = useState<NailLook | null>(null)

  useEffect(() => {
    const loadLook = async () => {
      try {
        const response = await fetch(`/api/looks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setLook({
            id: data.id.toString(),
            imageUrl: data.imageUrl,
            title: data.title,
            createdAt: data.createdAt,
          })
        }
      } catch (error) {
        console.error('Error loading look:', error)
      }
    }

    loadLook()
  }, [params.id])

  const handleShare = () => {
    router.push(`/share/${params.id}`)
  }

  const handleSendToTech = () => {
    router.push(`/send-to-tech/${params.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this design?')) return

    try {
      const response = await fetch(`/api/looks/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push("/home")
      } else {
        alert('Failed to delete design')
      }
    } catch (error) {
      console.error('Error deleting look:', error)
      alert('An error occurred')
    }
  }

  if (!look) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal line-clamp-1">{look.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-4 sm:mb-6">
          <div className="aspect-square relative">
            <Image src={look.imageUrl || "/placeholder.svg"} alt={look.title} fill className="object-cover" />
          </div>
        </Card>

        <div className="space-y-2.5 sm:space-y-3">
          <Button size="lg" className="w-full h-12 sm:h-14 text-base font-semibold active:scale-95 transition-transform" onClick={handleSendToTech}>
            <Send className="w-5 h-5 mr-2" />
            Send to Nail Tech
          </Button>

          <Button size="lg" variant="outline" className="w-full h-12 sm:h-14 text-base bg-transparent active:scale-95 transition-transform" onClick={handleShare}>
            <Share2 className="w-5 h-5 mr-2" />
            Share with Friends
          </Button>

          <Button size="lg" variant="outline" className="w-full h-12 sm:h-14 text-base bg-transparent text-destructive active:scale-95 transition-transform" onClick={handleDelete}>
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Design
          </Button>
        </div>

        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-lg">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Created on{" "}
            {new Date(look.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </main>
    </div>
  )
}
