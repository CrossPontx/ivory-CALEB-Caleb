"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Send } from "lucide-react"

export default function HelpPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("ivoryUser")
    if (user) {
      const userData = JSON.parse(user)
      setUsername(userData.username)
      setEmail(userData.email || "")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      setStatusMessage("Please fill in all fields")
      return
    }

    setIsSending(true)
    setStatusMessage("")

    try {
      const response = await fetch("/api/support/help-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          subject,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send help request")
      }

      setStatusMessage("Your help request has been sent successfully! We'll get back to you soon.")
      setSubject("")
      setMessage("")
      
      // Redirect back to settings after 2 seconds
      setTimeout(() => {
        router.push("/settings")
      }, 2000)
    } catch (error) {
      setStatusMessage("Failed to send help request. Please try again or email us directly at mirrosocial@gmail.com")
    } finally {
      setIsSending(false)
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
            Help & Support
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white mb-6">
          <h2 className="font-serif text-2xl font-light text-[#1A1A1A] tracking-tight mb-2">How can we help?</h2>
          <p className="text-sm text-[#6B6B6B] font-light mb-8">
            Send us a message and we'll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSending}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What do you need help with?"
                required
                disabled={isSending}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300"
              />
            </div>

            <div>
              <label className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block font-light">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue or question in detail..."
                required
                disabled={isSending}
                rows={6}
                className="w-full px-4 py-3 border border-[#E8E8E8] font-light text-base focus:outline-none focus:border-[#8B7355] transition-all duration-300 resize-none"
              />
            </div>

            {statusMessage && (
              <p className={`text-sm font-light ${statusMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {statusMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full h-12 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4" strokeWidth={1} />
                  Send Help Request
                </>
              )}
            </button>
          </form>
        </div>

        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-white">
          <h3 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-4">Other Ways to Reach Us</h3>
          <div className="space-y-3 text-sm font-light text-[#6B6B6B]">
            <div>
              <span className="text-[#1A1A1A]">Email:</span>{" "}
              <a href="mailto:mirrosocial@gmail.com" className="text-[#8B7355] hover:underline">
                mirrosocial@gmail.com
              </a>
            </div>
            <div>
              <span className="text-[#1A1A1A]">Response Time:</span> We typically respond within 24-48 hours
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  )
}
