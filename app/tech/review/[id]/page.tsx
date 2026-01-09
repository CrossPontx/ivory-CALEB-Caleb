"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Sparkles, Check, Plus, X, Edit2, Clock, MessageSquare } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"

type DesignRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
  lookId?: number
}

type AddOn = {
  id: string
  label: string
  price: number
  selected: boolean
}

export default function TechReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [notes, setNotes] = useState("")
  const [request, setRequest] = useState<DesignRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: "glitter", label: "Glitter Accent", price: 10, selected: false },
    { id: "rhinestone", label: "Rhinestone Charms", price: 15, selected: false },
    { id: "gel", label: "Gel Extension", price: 25, selected: false },
  ])
  const [newAddonLabel, setNewAddonLabel] = useState("")
  const [newAddonPrice, setNewAddonPrice] = useState("")
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null)
  const [editingPrice, setEditingPrice] = useState("")

  const toggleAddOn = (id: string) => {
    setAddOns(prev => prev.map(addon => 
      addon.id === id ? { ...addon, selected: !addon.selected } : addon
    ))
  }

  const addNewAddon = () => {
    if (!newAddonLabel.trim() || !newAddonPrice.trim()) return
    
    const price = parseFloat(newAddonPrice)
    if (isNaN(price) || price < 0) return
    
    const newAddon: AddOn = {
      id: `addon-${Date.now()}`,
      label: newAddonLabel.trim(),
      price: price,
      selected: false
    }
    
    setAddOns(prev => [...prev, newAddon])
    setNewAddonLabel("")
    setNewAddonPrice("")
  }

  const startEditingPrice = (id: string, currentPrice: number) => {
    setEditingAddonId(id)
    setEditingPrice(currentPrice.toString())
  }

  const saveEditedPrice = (id: string) => {
    const price = parseFloat(editingPrice)
    if (isNaN(price) || price < 0) {
      setEditingAddonId(null)
      return
    }
    
    setAddOns(prev => prev.map(addon => 
      addon.id === id ? { ...addon, price } : addon
    ))
    setEditingAddonId(null)
    setEditingPrice("")
  }

  const removeAddon = (id: string) => {
    setAddOns(prev => prev.filter(addon => addon.id !== id))
  }

  const totalAddOns = addOns.filter(a => a.selected).reduce((sum, a) => sum + a.price, 0)

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
          <div className="w-20 h-20 border border-[#E8E8E8] bg-white flex items-center justify-center mx-auto mb-8">
            <div className="w-8 h-8 border border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] text-[#6B6B6B] font-light tracking-[0.25em] uppercase">Loading Design</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">
        <div className="text-center p-8 sm:p-12 max-w-md mx-auto">
          <div className="w-24 h-24 border border-[#E8E8E8] bg-white flex items-center justify-center mx-auto mb-10">
            <MessageSquare className="w-10 h-10 text-[#8B7355]" strokeWidth={1} />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-6 tracking-[-0.01em]">Request Not Found</h2>
          <p className="text-base text-[#6B6B6B] font-light mb-10 leading-[1.7] tracking-wide">
            This design request may have been removed or doesn't exist.
          </p>
          <Button 
            onClick={() => router.push('/tech/dashboard')} 
            className="h-14 px-12 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-700 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Elegant Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-5 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="w-10 h-10 hover:bg-[#F8F7F5] transition-all duration-500 rounded-none"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
            </Button>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#8B7355] font-light mb-1">Review</p>
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] tracking-[-0.01em]">Client Design</h1>
            </div>
          </div>
          <div className="hidden sm:block text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light px-4 py-2 border border-[#E8E8E8] bg-white">
            #{request.id}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-10 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20">
          
          {/* Left Column - Design Image */}
          <div className="space-y-8 sm:space-y-10">
            {/* Client Info Card */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 border border-[#E8E8E8]">
              <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-5 font-light">Client</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-[-0.01em] mb-4 leading-[1.1]">
                {request.clientName}
              </h2>
              <div className="flex items-center gap-2 text-sm text-[#6B6B6B] font-light tracking-wide">
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

            {/* Design Image */}
            <div className="relative group">
              <div className="relative aspect-square bg-white border border-[#E8E8E8] overflow-hidden">
                <Image
                  src={request.designImage || "/placeholder.svg"}
                  alt="Client design"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </div>

            {/* Client Message */}
            {request.message && (
              <div className="bg-white p-6 sm:p-8 lg:p-10 border border-[#E8E8E8]">
                <div className="flex items-center gap-3 mb-5">
                  <MessageSquare className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                  <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] font-light">Client Notes</p>
                </div>
                <p className="text-base sm:text-lg text-[#1A1A1A] font-light leading-[1.8] tracking-wide">
                  "{request.message}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Feedback & Add-ons */}
          <div className="space-y-8 sm:space-y-10">
            
            {/* Feedback Section */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 border border-[#E8E8E8]">
              <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-5 font-light">Your Response</p>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-6 tracking-[-0.01em]">
                Share Your Thoughts
              </h3>
              <p className="text-sm text-[#6B6B6B] font-light mb-6 leading-[1.7] tracking-wide">
                Provide feedback, suggest modifications, or confirm the design is ready to go.
              </p>
              <Textarea
                placeholder="Your professional feedback..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full border-[#E8E8E8] focus:border-[#8B7355] focus:ring-0 transition-colors duration-500 text-base font-light leading-[1.8] tracking-wide resize-none rounded-none bg-[#F8F7F5]"
              />
            </div>

            {/* Add-ons Section */}
            <div className="bg-white p-6 sm:p-8 lg:p-10 border border-[#E8E8E8]">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] font-light">Optional Add-ons</p>
              </div>
              
              <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-6 tracking-[-0.01em]">
                Suggest Enhancements
              </h3>
              
              {/* Existing Add-ons */}
              <div className="space-y-4 mb-8">
                {addOns.map((addon) => (
                  <div
                    key={addon.id}
                    className={`w-full flex items-center justify-between p-4 sm:p-5 border transition-all duration-500 group ${
                      addon.selected 
                        ? 'border-[#8B7355] bg-[#F8F7F5]' 
                        : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleAddOn(addon.id)}
                        className={`w-5 h-5 border flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                          addon.selected 
                            ? 'border-[#8B7355] bg-[#8B7355]' 
                            : 'border-[#E8E8E8] group-hover:border-[#8B7355]'
                        }`}
                      >
                        {addon.selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2} />}
                      </button>
                      <span className="text-sm sm:text-base text-[#1A1A1A] font-light tracking-wide">
                        {addon.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                      {editingAddonId === addon.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#8B7355]">$</span>
                          <Input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditedPrice(addon.id)
                              if (e.key === 'Escape') setEditingAddonId(null)
                            }}
                            className="w-20 h-9 text-sm border-[#8B7355] focus:border-[#8B7355] rounded-none"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => saveEditedPrice(addon.id)}
                            className="h-9 px-3 bg-[#8B7355] hover:bg-[#1A1A1A] text-white rounded-none"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm sm:text-base text-[#8B7355] font-light tracking-wide">
                            +${addon.price}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingPrice(addon.id, addon.price)}
                            className="h-9 w-9 p-0 hover:bg-[#F8F7F5] rounded-none"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#6B6B6B]" strokeWidth={1.5} />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAddon(addon.id)}
                        className="h-9 w-9 p-0 hover:bg-red-50 rounded-none"
                      >
                        <X className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Addon */}
              <div className="border-t border-[#E8E8E8] pt-8">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light mb-5">Create Custom Add-on</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="Add-on name"
                    value={newAddonLabel}
                    onChange={(e) => setNewAddonLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addNewAddon()
                    }}
                    className="flex-1 border-[#E8E8E8] focus:border-[#8B7355] h-12 rounded-none bg-[#F8F7F5] font-light"
                  />
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] font-light">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newAddonPrice}
                        onChange={(e) => setNewAddonPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addNewAddon()
                        }}
                        className="w-24 pl-8 border-[#E8E8E8] focus:border-[#8B7355] h-12 rounded-none bg-[#F8F7F5] font-light"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <Button
                      onClick={addNewAddon}
                      disabled={!newAddonLabel.trim() || !newAddonPrice.trim()}
                      className="h-12 px-5 bg-[#1A1A1A] hover:bg-[#8B7355] text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-none transition-all duration-500 text-[10px] tracking-[0.2em] uppercase font-light"
                    >
                      <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              
              {totalAddOns > 0 && (
                <div className="mt-8 pt-8 border-t border-[#E8E8E8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Total Add-ons</span>
                    <span className="font-serif text-3xl font-light text-[#8B7355]">${totalAddOns}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-5">
              <Button 
                size="lg" 
                onClick={handleSend}
                className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-700 h-16 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4 mr-3" strokeWidth={1.5} />
                Send Feedback
              </Button>
              <p className="text-xs text-center text-[#6B6B6B] font-light tracking-wide leading-relaxed">
                Your feedback will be sent to the client for review
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
