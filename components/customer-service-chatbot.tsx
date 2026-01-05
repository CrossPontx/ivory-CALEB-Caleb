"use client"

import React, { useEffect, useState, useRef } from "react"
import dynamic from 'next/dynamic'

interface ChatbotProps {
  position?: "landing" | "app"
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function CustomerServiceChatbot({ position = "app" }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ensure component only renders on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm here to help you with any questions about Ivory's Choice. How can I assist you today?",
        timestamp: new Date()
      }])
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isMounted) {
    return null
  }

  if (position === "landing") {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Elegant trigger button */}
        <button
          onClick={toggleChat}
          className="group relative bg-red-900 hover:bg-red-950 text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-2xl hover:shadow-red-900/30 transition-all duration-500 flex items-center justify-center hover:scale-110 active:scale-95 touch-manipulation"
          aria-label="Open customer service chat"
        >
          {!isOpen ? (
            <svg 
              className="w-7 h-7 sm:w-9 sm:h-9 transition-transform duration-500 group-hover:rotate-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ) : (
            <svg 
              className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 rotate-0 group-hover:rotate-90" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="absolute inset-0 rounded-full bg-red-900 animate-ping opacity-20" />
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-[#1A1A1A] text-white text-xs sm:text-sm font-light tracking-wide rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none transform group-hover:translate-y-0 translate-y-1">
            Need help? Chat with us
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1A1A1A]" />
          </div>
        )}

        {/* Elegant Chat Window */}
        {isOpen && (
          <div className="fixed bottom-28 right-6 w-[90vw] sm:w-96 h-[70vh] sm:h-[600px] bg-white rounded-2xl shadow-2xl border border-[#E8E8E8] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 fade-in duration-500">
            {/* Header with subtle gradient animation */}
            <div className="bg-gradient-to-r from-[#8B7355] via-[#6B5845] to-[#1A1A1A] bg-[length:200%_100%] animate-gradient px-6 py-4">
              <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-700">
                <div>
                  <h3 className="font-serif text-lg text-white font-light tracking-wide">Ivory's Choice</h3>
                  <p className="text-xs text-white/80 font-light tracking-wide">We're here to help</p>
                </div>
                <button
                  onClick={toggleChat}
                  className="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-full touch-manipulation"
                  aria-label="Close chat"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages with staggered animations */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 fade-in duration-500`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 transform transition-all duration-300 hover:scale-[1.02] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-[#8B7355] to-[#6B5845] text-white shadow-lg shadow-[#8B7355]/20'
                        : 'bg-white text-[#1A1A1A] border border-[#E8E8E8] shadow-sm hover:shadow-md'
                    }`}
                  >
                    <p className="text-sm font-light leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input with smooth focus animations */}
            <div className="p-4 bg-white border-t border-[#E8E8E8] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-base font-light focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-br from-[#8B7355] to-[#6B5845] hover:from-[#1A1A1A] hover:to-[#2A2A2A] text-white p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl touch-manipulation"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5 transition-transform duration-300 hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // App version - top right corner
  return (
    <div className="fixed top-20 sm:top-24 right-4 sm:right-6 z-40">
      {/* Compact trigger button */}
      <button
        onClick={toggleChat}
        className="group relative bg-red-900 hover:bg-red-950 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg hover:shadow-xl hover:shadow-red-900/20 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 touch-manipulation"
        aria-label="Open customer service chat"
      >
        {!isOpen ? (
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-12" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ) : (
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 rotate-0 group-hover:rotate-90" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Elegant Chat Window - Mobile optimized with keyboard handling */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 bottom-4 sm:top-40 sm:right-6 sm:left-auto sm:bottom-auto sm:w-96 sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-[#E8E8E8] overflow-hidden flex flex-col animate-in slide-in-from-top-8 fade-in duration-500">
          {/* Header with subtle gradient animation */}
          <div className="bg-gradient-to-r from-[#8B7355] via-[#6B5845] to-[#1A1A1A] bg-[length:200%_100%] animate-gradient px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-700">
              <div>
                <h3 className="font-serif text-base sm:text-lg text-white font-light tracking-wide">Ivory's Choice</h3>
                <p className="text-xs text-white/80 font-light tracking-wide">We're here to help</p>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-full touch-manipulation"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages with staggered animations */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F5] min-h-0">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 fade-in duration-500`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 transform transition-all duration-300 hover:scale-[1.02] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#8B7355] to-[#6B5845] text-white shadow-lg shadow-[#8B7355]/20'
                      : 'bg-white text-[#1A1A1A] border border-[#E8E8E8] shadow-sm hover:shadow-md'
                  }`}
                >
                  <p className="text-sm font-light leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#8B7355] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input with smooth focus animations */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#E8E8E8] backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-base font-light focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-br from-[#8B7355] to-[#6B5845] hover:from-[#1A1A1A] hover:to-[#2A2A2A] text-white p-2.5 sm:p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl touch-manipulation flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-5 h-5 transition-transform duration-300 hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export with SSR disabled
export default dynamic(() => Promise.resolve(CustomerServiceChatbot), {
  ssr: false
})
