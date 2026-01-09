"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Trash2, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface NotificationCenterProps {
  userId?: number
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ userId, autoFetch: !!userId })

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead([notification.id])
    }
    
    // Navigate based on notification type
    const path = getNotificationPath(notification)
    if (path) {
      setOpen(false)
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
      
      case 'content_flagged':
      case 'user_blocked':
        return '/settings'
      
      default:
        return null
    }
  }

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'booking_confirmed':
        return '✅'
      case 'booking_cancelled':
        return '❌'
      case 'booking_paid':
        return '💳'
      case 'design_request':
      case 'request_received':
        return '📩'
      case 'request_approved':
        return '👍'
      case 'request_modified':
        return '✏️'
      case 'request_rejected':
        return '👎'
      case 'new_review':
        return '⭐'
      case 'credits_low':
        return '⚠️'
      case 'credits_added':
        return '💎'
      case 'design_breakdown_ready':
        return '📋'
      case 'content_flagged':
        return '🚩'
      case 'user_blocked':
        return '🚫'
      default:
        return '🔔'
    }
  }

  if (!userId) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 rounded-none"
        >
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8B7355] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 sm:p-6 border-b border-[#E8E8E8]">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A]">
              Notifications
            </SheetTitle>
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
          </div>
        </SheetHeader>
        
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B7355]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-12 h-12 text-[#E8E8E8] mb-4" strokeWidth={1} />
              <p className="text-[#6B6B6B] font-light">No notifications yet</p>
              <p className="text-sm text-[#9B9B9B] font-light mt-1">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E8E8]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 sm:p-5 hover:bg-[#F8F7F5] transition-colors cursor-pointer group",
                    !notification.isRead && "bg-[#F8F7F5]/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm text-[#1A1A1A] leading-snug",
                          !notification.isRead && "font-medium"
                        )}>
                          {notification.title}
                        </p>
                        
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead([notification.id])
                              }}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-white text-[#9B9B9B] hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                      <span className="w-2 h-2 bg-[#8B7355] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Standalone notification badge for use in other places
export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null
  
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#8B7355] text-white text-[10px] font-medium rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  )
}
