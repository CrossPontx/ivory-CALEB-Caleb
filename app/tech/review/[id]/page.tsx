"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Clock, MessageSquare } from "lucide-react"
import Image from "next/image"

type DesignRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
  lookId?: number
}

export default function TechReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [notes, setNotes] = useState("")
  const [request, setRequest] = useState<DesignRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
        const requestsRes = await fetch(`/api/design-requests?techId=${user.id}`)
        if (requestsRes.ok) {
          const data = await requestsRes.json()
          const foundRequest = data.find((req: any) => req.id.toString() === params.id)
          
          if (foundRequest) {
            setRequest({
              id: foundRequest.id.toString(),
              clientName: foundRequest.client?.username || `Client ${foundRequest.clientId}`,
              designImage: foundRequest.look?.imageUrl || "/placeholder.svg",
              message: foundRequest.clientMessage || "",
              status: foundRequest.status,
              date: foundRequest.createdAt,
              lookId: foundRequest.lookId,
            })
          }
        }
      } catch (error) {
        console.error('Error loading request:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRequest()
  }, [router, params.id])

  const handleSend = () => {
    // In real app, send feedback to client
    router.push("/tech/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border border-[#E8E8E8] bg-white flex items-center justify-center mx-auto mb-6">
            <div className="w-6 h-6 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] text-[#6B6B6B] font-light tracking-[0.25em] uppercase">Loading</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="w-20 h-20 border border-[#E8E8E8] bg-white flex items-center justify-center mx-auto mb-8">
            <MessageSquare className="w-8 h-8 text-[#8B7355]" strokeWidth={1} />
          </div>
          <h2 className="font-serif text-3xl font-light text-[#1A1A1A] mb-4 tracking-[-0.01em]">Request Not Found</h2>
          <p className="text-sm text-[#6B6B6B] font-light mb-8 leading-relaxed">
            This design request may have been removed.
          </p>
          <Button 
            onClick={() => router.push('/tech/dashboard')} 
            className="h-12 px-8 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 text-[11px] tracking-[0.25em] uppercase rounded-none font-light"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="w-10 h-10 hover:bg-[#F8F7F5] rounded-none"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
          </Button>
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Review</p>
            <h1 className="font-serif text-lg font-light text-[#1A1A1A]">{request.clientName}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          
          {/* Design Image */}
          <div className="bg-white border border-[#E8E8E8]">
            <div className="relative aspect-square w-full max-w-md mx-auto">
              <Image
                src={request.designImage || "/placeholder.svg"}
                alt="Client design"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white p-5 sm:p-6 border border-[#E8E8E8]">
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B] font-light">
              <Clock className="w-4 h-4" strokeWidth={1} />
              <span>
                {new Date(request.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Client Message */}
          {request.message && (
            <div className="bg-white p-5 sm:p-6 border border-[#E8E8E8]">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#8B7355]" strokeWidth={1} />
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Client Notes</p>
              </div>
              <p className="text-sm sm:text-base text-[#1A1A1A] font-light leading-relaxed">
                {request.message}
              </p>
            </div>
          )}

          {/* Feedback Section */}
          <div className="bg-white p-5 sm:p-6 border border-[#E8E8E8]">
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light mb-4">Your Response</p>
            <Textarea
              placeholder="Share your thoughts, suggest modifications, or confirm the design..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full border-[#E8E8E8] focus:border-[#8B7355] focus:ring-0 text-sm font-light leading-relaxed resize-none rounded-none bg-[#F8F7F5]"
            />
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSend}
            className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light"
          >
            <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Send Feedback
          </Button>
        </div>
      </main>
    </div>
  )
}
