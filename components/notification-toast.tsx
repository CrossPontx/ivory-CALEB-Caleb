"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { addEventListener, removeEventListener } from "@/lib/native-bridge"

interface ToastNotification {
  id: string
  title: string
  body: string
  type?: string
  data?: Record<string, any>
}

export function NotificationToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  useEffect(() => {
    const handleNotification = (data: any) => {
      const toast: ToastNotification = {
        id: `toast-${Date.now()}`,
        title: data.title,
        body: data.body,
        type: data.data?.type,
        data: data.data,
      }
      
      setToasts(prev => [...prev, toast])
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 5000)
    }

    addEventListener('notificationReceived', handleNotification)
    
    return () => {
      removeEventListener('notificationReceived', handleNotification)
    }
  }, [])

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "bg-white border border-[#E8E8E8] shadow-lg rounded-lg p-4 pointer-events-auto",
              "animate-in slide-in-from-right-full duration-300",
              "flex items-start gap-3"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1A1A1A]">{toast.title}</p>
              {toast.body && (
                <p className="text-sm text-[#6B6B6B] font-light mt-1 line-clamp-2">
                  {toast.body}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

// Hook to show toast notifications programmatically
export function useNotificationToast() {
  const showToast = (title: string, body: string, options?: { type?: string; data?: Record<string, any> }) => {
    // Dispatch a custom event that the provider will catch
    const event = new CustomEvent('showNotificationToast', {
      detail: { title, body, ...options }
    })
    window.dispatchEvent(event)
  }

  return { showToast }
}
