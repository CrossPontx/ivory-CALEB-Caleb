"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft } from "lucide-react"

export default function AccountSecurityPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters")
      return
    }

    setIsUpdating(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        throw new Error("Failed to update password")
      }

      setMessage("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setMessage("Failed to update password. Please try again.")
    } finally {
      setIsUpdating(false)
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
            Account Security
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white mb-6">
          <h2 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isUpdating}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            {message && (
              <p className={`text-sm font-light ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-12 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300"
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white">
          <h2 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-3">Two-Factor Authentication</h2>
          <p className="text-sm text-[#6B6B6B] font-light mb-6">
            Add an extra layer of security to your account
          </p>
          <button
            disabled
            className="w-full h-12 border border-[#E8E8E8] text-[#6B6B6B] font-light text-sm tracking-wider uppercase cursor-not-allowed"
          >
            Enable 2FA (Coming Soon)
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  )
}
