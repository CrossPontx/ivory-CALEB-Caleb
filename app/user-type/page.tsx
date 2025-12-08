"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Scissors } from "lucide-react"

export default function UserTypePage() {
  const router = useRouter()

  const selectUserType = async (type: "client" | "tech") => {
    try {
      const userStr = localStorage.getItem("ivoryUser")
      if (!userStr) {
        router.push("/")
        return
      }

      const user = JSON.parse(userStr)
      
      // Update user type in database
      const response = await fetch('/api/users/update-type', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userType: type }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        localStorage.setItem("ivoryUser", JSON.stringify(updatedUser))
        
        if (type === 'tech') {
          router.push("/tech/profile-setup")
        } else {
          router.push("/permissions")
        }
      }
    } catch (error) {
      console.error('Error updating user type:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal mb-2 sm:mb-3">Welcome to Ivory</h1>
          <p className="text-base sm:text-lg text-foreground/70">How would you like to use the app?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <Card
            className="border-2 border-border hover:border-primary active:border-primary hover:shadow-xl active:scale-95 transition-all cursor-pointer bg-white/95 backdrop-blur"
            onClick={() => selectUserType("client")}
          >
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-2 sm:mb-3">Design My Nails</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Create stunning nail designs with AI, share with friends, and connect with nail techs
              </p>
              <Button className="w-full h-11 sm:h-12 text-base font-semibold" size="lg">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-border hover:border-primary active:border-primary hover:shadow-xl active:scale-95 transition-all cursor-pointer bg-white/95 backdrop-blur"
            onClick={() => selectUserType("tech")}
          >
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-charcoal to-primary flex items-center justify-center">
                <Scissors className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-2 sm:mb-3">I'm a Nail Tech</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Receive client designs, manage appointments, and showcase your portfolio
              </p>
              <Button className="w-full h-11 sm:h-12 text-base font-semibold bg-transparent" size="lg" variant="outline">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
