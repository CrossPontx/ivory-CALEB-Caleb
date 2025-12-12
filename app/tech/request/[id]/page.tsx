"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageCircle, User, Calendar, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

type RequestDetail = {
  id: string
  clientId: string
  clientName: string
  lookId: string
  designImage: string
  clientMessage: string
  techResponse: string | null
  status: "pending" | "approved" | "modified"
  createdAt: string
  updatedAt: string
}

export default function RequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const requestId = params.id as string
        
        // Load design request
        const res = await fetch(`/api/design-requests/${requestId}`)
        if (!res.ok) {
          toast({
            title: "Error",
            description: "Failed to load request details",
            variant: "destructive",
          })
          router.back()
          return
        }

        const data = await res.json()
        
        // Fetch look image
        let designImage = "/placeholder.svg"
        if (data.lookId) {
          try {
            const lookRes = await fetch(`/api/looks/${data.lookId}`)
            if (lookRes.ok) {
              const look = await lookRes.json()
              designImage = look.imageUrl || "/placeholder.svg"
            }
          } catch (error) {
            console.error(`Error fetching look:`, error)
          }
        }

        setRequest({
          id: data.id.toString(),
          clientId: data.clientId.toString(),
          clientName: `Client ${data.clientId}`,
          lookId: data.lookId?.toString() || "",
          designImage,
          clientMessage: data.clientMessage || "",
          techResponse: data.techResponse,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        })

        setNotes(data.techResponse || "")
      } catch (error) {
        console.error("Error loading request:", error)
        toast({
          title: "Error",
          description: "Failed to load request details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadRequest()
  }, [params.id, router, toast])

  const handleSaveNotes = async () => {
    if (!request) return

    setSaving(true)
    try {
      const response = await fetch("/api/design-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          techResponse: notes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Notes saved! 📝",
          description: "Your notes have been updated",
        })
        setRequest({ ...request, techResponse: notes })
      } else {
        throw new Error("Failed to save notes")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading request...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return null
  }

  const getStatusBadge = () => {
    switch (request.status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "modified":
        return <Badge className="bg-blue-500">Modified</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Request Details</h1>
          </div>
          {getStatusBadge()}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe space-y-6">
        {/* Design Image */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-serif text-lg font-bold text-charcoal">Design</h2>
            </div>
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-muted">
              <Image
                src={request.designImage}
                alt="Client design"
                fill
                className="object-cover cursor-pointer hover:scale-105 transition-transform"
                unoptimized
                onClick={() => window.open(request.designImage, "_blank")}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Tap image to view full size
            </p>
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-serif text-lg font-bold text-charcoal">Client Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{request.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Request Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium">
                    {new Date(request.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Message */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-serif text-lg font-bold text-charcoal">Client Message</h2>
            </div>
            {request.clientMessage ? (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">{request.clientMessage}</p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">No message provided</p>
            )}
          </CardContent>
        </Card>

        {/* Tech Notes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-charcoal">Your Notes</h2>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={saving || notes === request.techResponse}
                className="active:scale-95 transition-transform"
              >
                {saving ? "Saving..." : "Save Notes"}
              </Button>
            </div>
            <Textarea
              placeholder="Add notes about this request, pricing, timeline, or any other details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              These notes are private and only visible to you
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        {request.status === "pending" && (
          <Card>
            <CardContent className="p-6">
              <h2 className="font-serif text-lg font-bold text-charcoal mb-4">Actions</h2>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/design-requests", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: request.id, status: "approved" }),
                      })

                      if (response.ok) {
                        toast({
                          title: "Design approved! ✅",
                          description: "The client will be notified",
                        })
                        setRequest({ ...request, status: "approved" })
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to approve design",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="active:scale-95 transition-transform"
                >
                  Approve Design
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/tech/review/${request.id}`)}
                  className="active:scale-95 transition-transform"
                >
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
