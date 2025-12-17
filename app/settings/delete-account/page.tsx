"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default function DeleteAccountPage() {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      // Clear local storage
      localStorage.removeItem("ivoryUser")
      
      // Redirect to home
      router.push("/")
    } catch (err) {
      setError("Failed to delete account. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1} />
          </Button>
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            Delete Account
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <div className="border-2 border-red-200 p-6 sm:p-8 bg-white">
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" strokeWidth={1} />
            <div>
              <h2 className="font-serif text-xl font-light text-red-600 tracking-tight mb-2">Warning: This Cannot Be Undone</h2>
              <p className="text-sm text-[#6B6B6B] font-light">
                Deleting your account will permanently remove all your data, including:
              </p>
            </div>
          </div>

          <ul className="text-sm text-[#6B6B6B] space-y-2 mb-8 ml-10 list-disc font-light">
            <li>Your profile and account information</li>
            <li>All nail designs and images you've created</li>
            <li>AI-generated designs and history</li>
            <li>Design requests and conversations</li>
            <li>Favorites and saved looks</li>
            <li>Reviews and ratings (if you're a nail tech)</li>
          </ul>

          <div className="bg-[#F8F7F5] border border-[#E8E8E8] p-6 mb-6">
            <p className="text-sm font-light mb-4">To confirm deletion, type <span className="font-serif font-normal">DELETE</span> below:</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              disabled={isDeleting}
              className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-red-500 transition-all duration-300 mb-2"
            />
            {error && (
              <p className="text-xs text-red-600 font-light mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              disabled={isDeleting}
              className="flex-1 h-12 border border-[#E8E8E8] text-[#1A1A1A] font-light text-sm tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== "DELETE"}
              className="flex-1 h-12 bg-red-600 text-white font-light text-sm tracking-wider uppercase hover:bg-red-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete My Account"}
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  )
}
