"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Check, CheckCheck, Trash2, Loader2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default function NotificationsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<number | undefined>()
  
  useEffect(() => {
    const userStr = localStorage.getItem('ivoryUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
    } else {
      router.push('/')
    }
  }, [router])

  const {
    notifications,
    unreadCount,
    loading,
    permissionGranted,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission,
  } = useNotifications({ userId, autoFetch: !!userId })

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead([notification.id])
    }
    
    const path = getNotificationPath(notification)
    if (path) {
      router.push(path)
    }
  }

  const getNotificationPath = (notification: Notification): string | null => {
    switch (notification.type) {
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_paid':
      case 'design_breakdown_ready':
        return notification.relatedId ? `/booking/${notification.relatedId}` : '/bookings'
      
      case 'design_request':
      case 'request_received':
        return notification.relatedId ? `/tech/request/${notification.relatedId}` : '/tech/dashboard'
      
      case 'request_approved':
      case 'request_modified':
      case 'request_rejected':
        return notification.relatedId ? `/booking/${notification.relatedId}` : '/bookings'
      
      case 'new_review':
        return '/tech/dashboard'
      
      case 'credits_low':
      case 'credits_added':
        return '/settings/credits'
      
      default:
        return null
    }
  }

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'booking_confirmed': return '✅'
      case 'booking_cancelled': return '❌'
      case 'booking_paid': return '💳'
      case 'design_request':
      case 'request_received': return '📩'
      case 'request_approved': return '👍'
      case 'request_modified': return '✏️'
      case 'request_rejected': return '👎'
      case 'new_review': return '⭐'
      case 'credits_low': return '⚠️'
      case 'credits_added': return '💎'
      case 'design_breakdown_ready': return '📋'
      case 'content_flagged': return '🚩'
      case 'user_blocked': return '🚫'
      default: return '🔔'
    }
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top backdrop-blur-md bg-white/98">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-xs text-[#8B7355] font-light">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-[#8B7355] hover:text-[#6B5344] hover:bg-transparent"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="hover:bg-[#F8F7F5] rounded-none">
                <Settings className="w-5 h-5" strokeWidth={1} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Permission Banner */}
      {!permissionGranted && (
        <div className="bg-[#F8F7F5] border-b border-[#E8E8E8] px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <p className="text-sm text-[#6B6B6B] font-light">
              Enable notifications to stay updated
            </p>
            <Button
              size="sm"
              onClick={requestPermission}
              className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] text-xs rounded-none"
            >
              Enable
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <Bell className="w-16 h-16 text-[#E8E8E8] mb-6" strokeWidth={1} />
            <h2 className="font-serif text-xl font-light text-[#1A1A1A] mb-2">
              No notifications yet
            </h2>
            <p className="text-sm text-[#6B6B6B] font-light max-w-xs">
              We'll notify you when something important happens, like new bookings or design requests.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E8E8]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "px-4 sm:px-6 py-4 sm:py-5 hover:bg-[#F8F7F5] transition-colors cursor-pointer group",
                  !notification.isRead && "bg-[#F8F7F5]/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm sm:text-base text-[#1A1A1A] leading-snug",
                        !notification.isRead && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead([notification.id])
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-white text-[#9B9B9B] hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {notification.message && (
                      <p className="text-sm text-[#6B6B6B] font-light mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    
                    <p className="text-xs text-[#9B9B9B] font-light mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <span className="w-2.5 h-2.5 bg-[#8B7355] rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
