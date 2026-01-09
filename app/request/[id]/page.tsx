"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Paperclip, FileText, Check, Clock, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"
import { toast } from "sonner"

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
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-[9px] sm:text-[10px] font-light tracking-wide">Approved</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 text-[#8B7355]">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-[9px] sm:text-[10px] font-light tracking-wide">Pending</span>
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
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50 pt-safe">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-10 w-10 p-0 hover:bg-[#F8F7F5] rounded-none flex-shrink-0 active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-serif text-base sm:text-lg font-light text-[#1A1A1A] truncate">{request.techName}</h1>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-36 sm:pb-32">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "client" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[88%] sm:max-w-[85%] ${message.sender === "client" ? "items-end" : "items-start"}`}>
                {message.type === "design" && (
                  <div className="mb-1">
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-white border border-[#E8E8E8] overflow-hidden">
                      <Image
                        src={message.content}
                        alt="Design"
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, 320px"
                      />
                    </div>
                    <p className={`text-[9px] sm:text-[10px] text-[#6B6B6B] font-light mt-1.5 tracking-wide ${message.sender === "client" ? "text-right" : ""}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
                
                {message.type === "text" && (
                  <div>
                    <div className={`px-3.5 sm:px-4 py-2.5 sm:py-3 ${
                      message.sender === "client" 
                        ? "bg-[#1A1A1A] text-white" 
                        : "bg-white border border-[#E8E8E8] text-[#1A1A1A]"
                    }`}>
                      <p className="text-[13px] sm:text-sm font-light leading-relaxed">{message.content}</p>
                    </div>
                    <p className={`text-[9px] sm:text-[10px] text-[#6B6B6B] font-light mt-1 sm:mt-1.5 tracking-wide ${
                      message.sender === "client" ? "text-right" : ""
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
                
                {message.type === "image" && (
                  <div>
                    <div className="relative w-40 h-40 sm:w-48 sm:h-48 bg-white border border-[#E8E8E8] overflow-hidden">
                      <Image
                        src={message.content}
                        alt="Shared image"
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="(max-width: 640px) 160px, 192px"
                      />
                    </div>
                    <p className={`text-[9px] sm:text-[10px] text-[#6B6B6B] font-light mt-1 sm:mt-1.5 tracking-wide ${
                      message.sender === "client" ? "text-right" : ""
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                )}
                
                {message.type === "file" && (
                  <div>
                    <div className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 ${
                      message.sender === "client" 
                        ? "bg-[#1A1A1A] text-white" 
                        : "bg-white border border-[#E8E8E8] text-[#1A1A1A]"
                    }`}>
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[13px] sm:text-sm font-light truncate max-w-[180px] sm:max-w-none">{message.fileName}</span>
                    </div>
                    <p className={`text-[9px] sm:text-[10px] text-[#6B6B6B] font-light mt-1 sm:mt-1.5 tracking-wide ${
                      message.sender === "client" ? "text-right" : ""
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] pb-safe z-40">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-end gap-2 sm:gap-2.5">
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
              className="h-11 w-11 sm:h-10 sm:w-10 p-0 hover:bg-[#F8F7F5] rounded-none flex-shrink-0 active:scale-95 transition-transform touch-manipulation"
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
                className="min-h-[44px] max-h-28 sm:max-h-32 py-3 px-3.5 sm:px-4 resize-none border-[#E8E8E8] focus:border-[#8B7355] rounded-none text-[14px] sm:text-sm font-light"
                rows={1}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              className="h-11 w-11 sm:h-10 sm:w-10 p-0 bg-[#1A1A1A] hover:bg-[#8B7355] text-white rounded-none flex-shrink-0 disabled:opacity-40 active:scale-95 transition-transform touch-manipulation"
            >
              {sendingMessage ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
