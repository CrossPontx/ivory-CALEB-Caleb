/// <reference path="../types/langflow.d.ts" />
"use client"

import React, { useEffect, useState } from "react"
import Script from "next/script"

interface ChatbotProps {
  position?: "landing" | "app"
}

export default function CustomerServiceChatbot({ position = "app" }: ChatbotProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [chatKey, setChatKey] = useState(0)

  // Determine host URL based on environment
  const getHostUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3000'
    
    // Check if we're in production (ivoryschoice.com)
    if (window.location.hostname === 'www.ivoryschoice.com' || 
        window.location.hostname === 'ivoryschoice.com') {
      return 'https://www.ivoryschoice.com'
    }
    
    // Fallback to localhost for development
    return 'http://localhost:3000'
  }

  const hostUrl = getHostUrl()

  useEffect(() => {
    // Check if script is loaded
    if (typeof window !== 'undefined' && (window as any).LangflowChat) {
      setIsLoaded(true)
    }
  }, [])

  const handleScriptLoad = () => {
    setIsLoaded(true)
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    // Force re-render of chat widget when opening
    if (!isOpen) {
      setChatKey(prev => prev + 1)
    }
  }

  if (position === "landing") {
    // Landing page version - bottom right corner
    return (
      <>
        <Script
          src="https://cdn.jsdelivr.net/gh/logspace-ai/langflow-embedded-chat@v1.0.7/dist/build/static/js/bundle.min.js"
          onLoad={handleScriptLoad}
          strategy="lazyOnload"
        />
        
        <div className="fixed bottom-6 right-6 z-50">
          {/* Custom styled trigger button */}
          <button
            onClick={toggleChat}
            className="group relative bg-[#8B7355] hover:bg-[#1A1A1A] text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-2xl hover:shadow-[#8B7355]/30 transition-all duration-500 flex items-center justify-center hover:scale-110 active:scale-95"
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
                className="w-6 h-6 sm:w-8 sm:h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-[#8B7355] animate-ping opacity-20" />
          </button>

          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-[#1A1A1A] text-white text-xs sm:text-sm font-light tracking-wide rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
              Need help? Chat with us
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1A1A1A]" />
            </div>
          )}
        </div>

        {/* Langflow Chat Widget */}
        {isOpen && (
          <div className="fixed bottom-28 right-6 z-40 w-[90vw] sm:w-96 h-[70vh] sm:h-[600px] bg-white rounded-2xl shadow-2xl border border-[#E8E8E8] overflow-hidden animate-fade-in">
            {/* Close button */}
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white rounded-full p-2 shadow-lg transition-all duration-300"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {isLoaded ? (
              React.createElement('langflow-chat', {
                key: chatKey,
                window_title: "Ivory's Choice Support",
                flow_id: "fb51d726-4af1-4101-8b7e-221884191359",
                host_url: hostUrl,
                chat_input_field: "Message",
                chat_trigger_style: "display: none;"
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
                  <p className="text-sm text-[#6B6B6B] font-light">Loading chat...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  // App version - top right corner
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/gh/logspace-ai/langflow-embedded-chat@v1.0.7/dist/build/static/js/bundle.min.js"
        onLoad={handleScriptLoad}
        strategy="lazyOnload"
      />
      
      <div className="fixed top-20 sm:top-24 right-4 sm:right-6 z-40">
        {/* Compact trigger button for app */}
        <button
          onClick={toggleChat}
          className="group relative bg-[#8B7355] hover:bg-[#1A1A1A] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg hover:shadow-xl hover:shadow-[#8B7355]/20 transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
          aria-label="Open customer service chat"
        >
          {!isOpen ? (
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ) : (
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-light tracking-wide rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Help
            <div className="absolute bottom-full right-4 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-[#1A1A1A]" />
          </div>
        )}
      </div>

      {/* Langflow Chat Widget */}
      {isOpen && (
        <div className="fixed top-36 sm:top-40 right-4 sm:right-6 z-30 w-[90vw] sm:w-96 h-[70vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-[#E8E8E8] overflow-hidden animate-fade-in">
          {/* Close button */}
          <button
            onClick={toggleChat}
            className="absolute top-4 right-4 z-50 bg-white/90 hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white rounded-full p-2 shadow-lg transition-all duration-300"
            aria-label="Close chat"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {isLoaded ? (
            React.createElement('langflow-chat', {
              key: chatKey,
              window_title: "Ivory's Choice Support",
              flow_id: "fb51d726-4af1-4101-8b7e-221884191359",
              host_url: hostUrl,
              chat_input_field: "Message",
              chat_trigger_style: "display: none;"
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
                <p className="text-sm text-[#6B6B6B] font-light">Loading chat...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
