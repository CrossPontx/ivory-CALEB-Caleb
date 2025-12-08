"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, DollarSign, MessageCircle, User } from "lucide-react"
import Image from "next/image"

type ClientRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
}

export default function TechDashboardPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<ClientRequest[]>([])

  useState(() => {
    const loadRequests = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        const response = await fetch(`/api/design-requests?techId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          // Transform data to match component format
          const formattedRequests = data.map((req: any) => ({
            id: req.id.toString(),
            clientName: `Client ${req.clientId}`, // Would need to join with users table
            designImage: req.lookId ? "/placeholder.svg" : "/placeholder.svg", // Would need to join with looks table
            message: req.clientMessage || "",
            status: req.status,
            date: req.createdAt,
          }))
          setRequests(formattedRequests)
        }
      } catch (error) {
        console.error('Error loading requests:', error)
      }
    }

    loadRequests()
  })

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/design-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' }),
      })

      if (response.ok) {
        setRequests(requests.map((req) => (req.id === id ? { ...req, status: "approved" as const } : req)))
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRequestModification = (id: string) => {
    router.push(`/tech/review/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Tech Dashboard</h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/profile")} className="h-9 sm:h-10 active:scale-95 transition-transform">
            <span className="hidden sm:inline">Profile</span>
            <User className="w-4 h-4 sm:hidden" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full mb-4 sm:mb-6 grid grid-cols-3 h-11 sm:h-12">
            <TabsTrigger value="requests" className="text-xs sm:text-sm whitespace-nowrap">
              Requests
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs sm:text-sm whitespace-nowrap">
              Approved
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs sm:text-sm whitespace-nowrap">
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {requests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
                      {/* Design Image */}
                      <div className="w-full sm:w-40 md:w-48 h-48 sm:h-40 md:h-48 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Client design"
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-0.5 sm:mb-1 truncate">{request.clientName}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(request.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0 text-xs">New</Badge>
                        </div>

                        {request.message && (
                          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs sm:text-sm text-foreground line-clamp-2">{request.message}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => handleApprove(request.id)} className="h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequestModification(request.id)} className="h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform">
                            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            <span className="hidden sm:inline">Request Changes</span>
                            <span className="sm:hidden">Changes</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform">
                            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            <span className="hidden sm:inline">Offer Add-ons</span>
                            <span className="sm:hidden">Add-ons</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "pending").length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending requests at the moment</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {requests
              .filter((req) => req.status === "approved")
              .map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-center">
                      <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Approved design"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal mb-1">{request.clientName}</h3>
                        <Badge className="bg-green-500">Approved</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "approved").length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No approved designs yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gallery">
            <Card className="p-12 text-center">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">Your portfolio gallery will be displayed here</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
