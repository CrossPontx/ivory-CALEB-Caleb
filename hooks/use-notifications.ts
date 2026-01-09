"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  isNative, 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  scheduleLocalNotification,
  setBadgeCount,
  clearBadge,
  addEventListener,
  removeEventListener,
  LocalNotificationOptions
} from '@/lib/native-bridge';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string | null;
  relatedId: number | null;
  isRead: boolean;
  createdAt: string;
}

interface UseNotificationsOptions {
  userId?: number;
  autoFetch?: boolean;
  pollInterval?: number; // in milliseconds, 0 to disable
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { userId, autoFetch = true, pollInterval = 30000 } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Check notification permission status
  const checkPermission = useCallback(async () => {
    const status = await getNotificationPermissionStatus();
    setPermissionGranted(status.authorized);
    return status.authorized;
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermissionGranted(result.granted);
    return result.granted;
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: userId.toString(),
        ...(unreadOnly && { unreadOnly: 'true' }),
      });
      
      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        
        // Update badge count on native
        if (isNative()) {
          await setBadgeCount(data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
        
        // Update badge
        if (isNative()) {
          await setBadgeCount(Math.max(0, unreadCount - notificationIds.length));
        }
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [unreadCount]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, markAllRead: true }),
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        
        if (isNative()) {
          await clearBadge();
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [userId]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
          if (isNative()) {
            await setBadgeCount(Math.max(0, unreadCount - 1));
          }
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications, unreadCount]);

  // Show a local notification
  const showLocalNotification = useCallback(async (options: LocalNotificationOptions) => {
    if (!permissionGranted) {
      const granted = await requestPermission();
      if (!granted) return { success: false, identifier: '' };
    }
    
    return scheduleLocalNotification(options);
  }, [permissionGranted, requestPermission]);

  // Handle incoming notifications from native
  useEffect(() => {
    const handleNotification = (data: any) => {
      console.log('Received notification:', data);
      // Refresh notifications when a new one arrives
      fetchNotifications();
    };

    addEventListener('notificationReceived', handleNotification);
    
    return () => {
      removeEventListener('notificationReceived', handleNotification);
    };
  }, [fetchNotifications]);

  // Initial fetch and polling
  useEffect(() => {
    if (autoFetch && userId) {
      fetchNotifications();
      checkPermission();
      
      if (pollInterval > 0) {
        const interval = setInterval(() => {
          fetchNotifications();
        }, pollInterval);
        
        return () => clearInterval(interval);
      }
    }
  }, [autoFetch, userId, pollInterval, fetchNotifications, checkPermission]);

  return {
    notifications,
    unreadCount,
    loading,
    permissionGranted,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showLocalNotification,
    requestPermission,
    checkPermission,
  };
}
