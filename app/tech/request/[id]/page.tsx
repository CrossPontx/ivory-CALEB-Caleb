"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, FileText, Sparkles, Check, X } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"

type DesignRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
  lookId?: number
}

type Message = {
  id: string
  sender: "client" | "tech"
  type: "text" | "image" | "file" | "design"
  content: string
  fileName?: string
  timestamp: Date
}

export default function TechRequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [request, setRequest] = useState<DesignRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [implementationGuidance, setImplementationGuidance] = useState<string>("")
  const [loadingGuidance, setLoadingGuidance] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
            const reqData = {
              id: foundRequest.id.toString(),
              clientName: foundRequest.client?.username || `Client ${foundRequest.clientId}`,
              designImage: foundRequest.look?.imageUrl || "/placeholder.svg",
              message: foundRequest.clientMessage || "",
              status: foundRequest.status,
              date: foundRequest.createdAt,
              lookId: foundRequest.lookId,
            }
            setRequest(reqData)
            
            // Initialize messages with the design and client message
            const initialMessages: Message[] = [
              {
                id: "design-1",
                sender: "client",
                type: "design",
                content: reqData.designImage,
                timestamp: new Date(reqData.date),
              }
            ]
            
            if (reqData.message) {
              initialMessages.push({
                id: "msg-1",
                sender: "client",
                type: "text",
                content: reqData.message,
                timestamp: new Date(reqData.date),
              })
            }
            
            setMessages(initialMessages)
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

  const generateImplementationGuidance = async () => {
    if (!request?.designImage) return
    
    setLoadingGuidance(true)
    
    try {
      const response = await fetch('/api/analyze-design-for-tech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: request.designImage }),
      })

      if (response.ok) {
        const data = await response.json()
        setImplementationGuidance(data.guidance)
        setShowGuidance(true)
      }
    } catch (error) {
      console.error('Error generating guidance:', error)
    } finally {
      setLoadingGuidance(false)
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: "tech",
      type: "text",
      content: newMessage.trim(),
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage("")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const isImage = file.type.startsWith('image/')
    const message: Message = {
      id: `file-${Date.now()}`,
      sender: "tech",
      type: isImage ? "image" : "file",
      content: URL.createObjectURL(file),
      fileName: file.name,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, message])
  }

  const handleApprove = async () => {
    if (!request) return
    
    try {
      const response = await fetch('/api/design-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: request.id, status: 'approved' }),
      })

      if (response.ok) {
        setRequest({ ...request, status: "approved" })
        // Add approval message to thread
        const message: Message = {
          id: `approval-${Date.now()}`,
          sender: "tech",
          type: "text",
          content: "✓ Design approved! Looking forward to bringing this to life.",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, message])
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
        <div className="text-center p-8">
          <h2 className="font-serif text-3xl font-light text-[#1A1A1A] mb-6 tracking-[-0.01em]">Request Not Found</h2>
          <Button 
            onClick={() => router.push('/tech/dashboard')} 
            className="h-12 px-8 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 text-[11px] tracking-[0.25em] uppercase font-light rounded-none"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50 safe-top">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-10 w-10 p-0 hover:bg-[#F8F7F5] rounded-none"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              </Button>
              <div>
                <h1 className="font-serif text-lg font-light text-[#1A1A1A]">{request.clientName}</h1>
                <p className="text-[10px] text-[#6B6B6B] font-light tracking-wide">
                  {request.status === "approved" ? "Approved" : "Active conversation"}
                </p>
              </div>
            </div>
            
            {request.status === "pending" && (
              <Button
                onClick={handleApprove}
                size="sm"
                className="h-9 px-4 bg-[#1A1A1A] hover:bg-[#8B7355] text-white text-[10px] tracking-[0.15em] uppercase font-light rounded-none"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                Approve
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* AI Guide Button - Subtle */}
      {!showGuidance && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E8]">
          <div className="max-w-3xl mx-auto px-4 py-2">
            <button
              onClick={generateImplementationGuidance}
              disabled={loadingGuidance}
              className="flex items-center gap-2 text-[10px] text-[#8B7355] font-light tracking-wide hover:text-[#1A1A1A] transition-colors"
            >
              {loadingGuidance ? (
                <>
                  <div className="w-3 h-3 border border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing design...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                  <span>Get AI implementation tips</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Guidance Panel - Subtle collapsible */}
      {showGuidance && implementationGuidance && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-[#E8E8E8]">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-[#8B7355]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#8B7355] font-light tracking-wide uppercase">AI Tips</span>
                </div>
                <p className="text-xs text-[#6B6B6B] font-light leading-relaxed line-clamp-2">
                  {implementationGuidance}
                </p>
              </div>
              <button
                onClick={() => setShowGuidance(false)}
                className="p-1 hover:bg-[#F8F7F5] rounded-none"
              >
                <X className="w-4 h-4 text-[#6B6B6B]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "tech" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${message.sender === "tech" ? "items-end" : "items-start"}`}>
                {message.type === "design" && (
                  <div className="mb-1">
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-white border border-[#E8E8E8] overflow-hidden">
                      <Image
                        src={message.content}
                        alt="Design"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p className="text-[10px] text-[#6B6B6B] font-light mt-1.5 tracking-wide">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
                
                {message.type === "text" && (
                  <div>
                    <div className={`px-4 py-3 ${
                      message.sender === "tech" 
                        ? "bg-[#1A1A1A] text-white" 
                        : "bg-white border border-[#E8E8E8] text-[#1A1A1A]"
                    }`}>
                      <p className="text-sm font-light leading-relaxed">{message.content}</p>
                    </div>
                    <p className={`text-[10px] text-[#6B6B6B] font-light mt-1.5 tracking-wide ${
                      message.sender === "tech" ? "text-right" : ""
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
                
                {message.type === "image" && (
                  <div>
                    <div className="relative w-48 h-48 bg-white border border-[#E8E8E8] overflow-hidden">
                      <Image
                        src={message.content}
                        alt="Shared image"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p className={`text-[10px] text-[#6B6B6B] font-light mt-1.5 tracking-wide ${
                      message.sender === "tech" ? "text-right" : ""
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
                
                {message.type === "file" && (
                  <div>
                    <div className={`flex items-center gap-3 px-4 py-3 ${
                      message.sender === "tech" 
                        ? "bg-[#1A1A1A] text-white" 
                        : "bg-white border border-[#E8E8E8] text-[#1A1A1A]"
                    }`}>
                      <FileText className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-sm font-light truncate">{message.fileName}</span>
                    </div>
                    <p className={`text-[10px] text-[#6B6B6B] font-light mt-1.5 tracking-wide ${
                      message.sender === "tech" ? "text-right" : ""
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] safe-bottom z-40">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 p-0 hover:bg-[#F8F7F5] rounded-none flex-shrink-0"
            >
              <Paperclip className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1.5} />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="min-h-[44px] max-h-32 py-3 px-4 resize-none border-[#E8E8E8] focus:border-[#8B7355] rounded-none text-sm font-light"
                rows={1}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-10 w-10 p-0 bg-[#1A1A1A] hover:bg-[#8B7355] text-white rounded-none flex-shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
