"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Home, Sparkles, User } from "lucide-react"
import Image from "next/image"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()
  const [looks, setLooks] = useState<NailLook[]>([])

  useEffect(() => {
    // Load user's looks from database
    const loadLooks = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
        // Redirect tech users to their dashboard
        if (user.userType === 'tech') {
          router.push("/tech/dashboard")
          return
        }

        const response = await fetch(`/api/looks?userId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setLooks(data)
        }
      } catch (error) {
        console.error('Error loading looks:', error)
      }
    }

    loadLooks()
  }, [router])

  const startNewDesign = () => {
    router.push("/capture")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">Ivory</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-1 sm:mb-2">Your Looks</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Your personal nail design collection</p>
        </div>

        {/* Gallery Grid */}
        {looks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {looks.map((look) => (
              <Card
                key={look.id}
                className="overflow-hidden cursor-pointer active:scale-95 hover:shadow-xl transition-all border-0 bg-white"
                onClick={() => router.push(`/look/${look.id}`)}
              >
                <div className="aspect-square relative">
                  <Image src={look.imageUrl || "/placeholder.svg"} alt={look.title} fill className="object-cover" />
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="font-semibold text-xs sm:text-sm text-charcoal mb-0.5 sm:mb-1 line-clamp-1">{look.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(look.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-2">No designs yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Start creating your first nail design</p>
          </div>
        )}

        {/* Create Button - Large */}
        <div className="flex justify-center px-4">
          <Button
            size="lg"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all w-full sm:w-auto"
            onClick={startNewDesign}
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Start New Design
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border safe-bottom z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-around h-20 sm:h-24">
            <button
              onClick={() => router.push("/home")}
              className="flex flex-col items-center justify-center gap-1 text-primary min-w-[60px] active:scale-95 transition-transform"
            >
              <Home className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xs sm:text-sm font-medium">Home</span>
            </button>

            <button
              onClick={startNewDesign}
              className="flex flex-col items-center justify-center -mt-8 sm:-mt-10 bg-gradient-to-br from-terracotta to-rose text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-xl active:scale-95 transition-transform"
            >
              <Plus className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground active:text-foreground transition-colors min-w-[60px] active:scale-95"
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xs sm:text-sm font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
