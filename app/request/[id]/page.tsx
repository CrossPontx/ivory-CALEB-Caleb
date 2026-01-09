"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Paperclip, FileText, Check, Clock, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"
import { toast } from "sonner"

// Native haptic feedback
const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.haptics) {
    (window as any).webkit.messageHandlers.haptics.postMessage({ style })
  }
}

type DesignRequest = {
  id: string
  techName: string
  techId: number
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

export default function ClientRequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [request, setRequest] = useState<DesignRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

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
        setCurrentUserId(user.id)
        
        const requestsRes = await fetch(`/api/design-requests?clientId=${user.id}`)
        if (requestsRes.ok) {
          const data = await requestsRes.json()
          const foundRequest = data.find((req: any) => req.id.toString() === params.id)
          
          if (foundRequest) {
            const reqData: DesignRequest = {
              id: foundRequest.id.toString(),
              techName: foundRequest.tech?.username || `Tech ${foundRequest.techId}`,
              techId: foundRequest.techId,
              designImage: foundRequest.look?.imageUrl || "/placeholder.svg",
              message: foundRequest.clientMessage || "",
              status: foundRequest.status,
              date: foundRequest.createdAt,
              lookId: foundRequest.lookId,
            }
            setRequest(reqData)
            
            // Load messages from database
            await loadMessages(foundRequest.id, reqData)
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

  const loadMessages = async (requestId: number, reqData: DesignRequest) => {
    try {
      const messagesRes = await fetch(`/api/design-requests/${requestId}/messages`)
      
      // Start with the design image as the first message
      const initialMessages: Message[] = [
        {
          id: "design-1",
          sender: "client",
          type: "design",
          content: reqData.designImage,
          timestamp: new Date(reqData.date),
        }
      ]
      
      // Add the initial client message if it exists
      if (reqData.message) {
        initialMessages.push({
          id: "initial-msg",
          sender: "client",
          type: "text",
          content: reqData.message,
          timestamp: new Date(reqData.date),
        })
      }
      
      if (messagesRes.ok) {
        const dbMessages = await messagesRes.json()
        
        // Convert database messages to our Message type
        const convertedMessages: Message[] = dbMessages.map((msg: any) => ({
          id: msg.id.toString(),
          sender: msg.senderType as "client" | "tech",
          type: msg.messageType as "text" | "image" | "file" | "design",
          content: msg.content,
          fileName: msg.fileName,
          timestamp: new Date(msg.createdAt),
        }))
        
        setMessages([...initialMessages, ...convertedMessages])
      } else {
        setMessages(initialMessages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
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
          id: "initial-msg",
          sender: "client",
          type: "text",
          content: reqData.message,
          timestamp: new Date(reqData.date),
        })
      }
      setMessages(initialMessages)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !request || !currentUserId) return
    
    setSendingMessage(true)
    triggerHaptic('light')
    
    try {
      const response = await fetch(`/api/design-requests/${request.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          senderType: 'client',
          messageType: 'text',
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const savedMessage = await response.json()
        
        const message: Message = {
          id: savedMessage.id.toString(),
          sender: "client",
          type: "text",
          content: newMessage.trim(),
          timestamp: new Date(savedMessage.createdAt),
        }
        
        setMessages(prev => [...prev, message])
        setNewMessage("")
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !request || !currentUserId) return
    
    const isImage = file.type.startsWith('image/')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadRes.ok) {
        toast.error('Failed to upload file')
        return
      }
      
      const { url } = await uploadRes.json()
      
      const response = await fetch(`/api/design-requests/${request.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          senderType: 'client',
          messageType: isImage ? 'image' : 'file',
          content: url,
          fileName: file.name,
        }),
      })

      if (response.ok) {
        const savedMessage = await response.json()
        
        const message: Message = {
          id: savedMessage.id.toString(),
          sender: "client",
          type: isImage ? "image" : "file",
          content: url,
          fileName: file.name,
          timestamp: new Date(savedMessage.createdAt),
        }
        
        setMessages(prev => [...prev, message])
      } else {
        toast.error('Failed to send file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const getStatusBadge = () => {
    switch (request?.status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 text-[#34C759]">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span className="text-[11px] sm:text-xs font-medium">Approved</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 text-[#FF9500]">
            <Clock className="w-4 h-4" strokeWidth={2} />
            <span className="text-[11px] sm:text-xs font-medium">Pending</span>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 border border-[#E8E8E8] bg-white flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#6B6B6B] font-light tracking-[0.2em] sm:tracking-[0.25em] uppercase">Loading</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-5 sm:mb-6 tracking-[-0.01em]">Request Not Found</h2>
          <Button 
            onClick={() => router.push('/home')} 
            className="h-11 sm:h-12 px-6 sm:px-8 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase font-light rounded-none active:scale-95 touch-manipulation"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex flex-col">
      {/* Header - iOS Native Style */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-[#E8E8E8]/80 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  triggerHaptic('light')
                  router.back()
                }}
                className="h-11 w-11 p-0 hover:bg-[#F8F7F5] rounded-full flex-shrink-0 active:scale-90 transition-all duration-150"
              >
                <ArrowLeft className="w-5 h-5 text-[#8B7355]" strokeWidth={2} />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-[15px] sm:text-base text-[#1A1A1A] truncate">{request.techName}</h1>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area - iMessage Style */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-[calc(80px+env(safe-area-inset-bottom))] sm:pb-32">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-1">
          {messages.map((message, index) => {
            const showTimestamp = index === 0 || 
              (new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime()) > 300000
            
            return (
              <div key={message.id}>
                {showTimestamp && (
                  <p className="text-[11px] text-[#8E8E93] font-normal text-center py-2 sm:py-3">
                    {formatTime(message.timestamp)}
                  </p>
                )}
                <div className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"} mb-0.5`}>
                  <div className={`max-w-[80%] sm:max-w-[75%]`}>
                    {message.type === "design" && (
                      <div className={`relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-sm ${
                        message.sender === "client" ? "rounded-br-[6px]" : "rounded-bl-[6px]"
                      }`}>
                        <Image
                          src={message.content}
                          alt="Design"
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 640px) 208px, (max-width: 768px) 240px, 288px"
                        />
                      </div>
                    )}
                    
                    {message.type === "text" && (
                      <div className={`px-4 py-2.5 ${
                        message.sender === "client" 
                          ? "bg-[#8B7355] text-white rounded-[20px] rounded-br-[6px]" 
                          : "bg-[#E9E9EB] text-[#1A1A1A] rounded-[20px] rounded-bl-[6px]"
                      }`}>
                        <p className="text-[15px] sm:text-[16px] font-normal leading-[1.35]">{message.content}</p>
                      </div>
                    )}
                    
                    {message.type === "image" && (
                      <div className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-sm ${
                        message.sender === "client" ? "rounded-br-[6px]" : "rounded-bl-[6px]"
                      }`}>
                        <Image
                          src={message.content}
                          alt="Shared image"
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 640px) 176px, 208px"
                        />
                      </div>
                    )}
                    
                    {message.type === "file" && (
                      <div className={`flex items-center gap-3 px-4 py-3 ${
                        message.sender === "client" 
                          ? "bg-[#8B7355] text-white rounded-[20px] rounded-br-[6px]" 
                          : "bg-[#E9E9EB] text-[#1A1A1A] rounded-[20px] rounded-bl-[6px]"
                      }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          message.sender === "client" ? "bg-white/20" : "bg-[#8B7355]/10"
                        }`}>
                          <FileText className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <span className="text-[14px] font-normal truncate max-w-[160px] sm:max-w-[200px]">{message.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - iOS Native Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E8E8E8]/80 pb-[env(safe-area-inset-bottom)] z-40">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2">
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
              onClick={() => {
                triggerHaptic('light')
                fileInputRef.current?.click()
              }}
              className="h-10 w-10 p-0 hover:bg-[#F8F7F5] rounded-full flex-shrink-0 active:scale-90 transition-all duration-150 touch-manipulation"
            >
              <Paperclip className="w-5 h-5 text-[#8B7355]" strokeWidth={2} />
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
                placeholder="Message"
                className="min-h-[40px] max-h-[120px] py-2.5 px-4 resize-none border-[#E8E8E8] focus:border-[#8B7355] rounded-[20px] text-[16px] font-normal bg-[#F8F7F5] placeholder:text-[#8E8E93]"
                style={{ fontSize: '16px' }} // Prevents iOS zoom
                rows={1}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              className="h-10 w-10 p-0 bg-[#8B7355] hover:bg-[#7A6548] text-white rounded-full flex-shrink-0 disabled:opacity-40 active:scale-90 transition-all duration-150 touch-manipulation shadow-sm"
            >
              {sendingMessage ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" strokeWidth={2} />
              )}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
