'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Plus, User, Calendar, Settings, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsAppleWatch } from './watch-optimized-layout'
import { haptics } from '@/lib/haptics'
import { AnimatedNavButton } from './animated-nav-button'
import { NotificationCenter } from './notification-center'

interface BottomNavProps {
  onCenterAction?: () => void
  centerActionLabel?: string
}

export function BottomNav({ onCenterAction, centerActionLabel = 'Create' }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isWatch = useIsAppleWatch()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path)

  // Check if user is a tech and get user ID
  const [userType, setUserType] = React.useState<'client' | 'tech'>('client')
  const [userId, setUserId] = React.useState<number | undefined>()
  
  React.useEffect(() => {
    const userStr = localStorage.getItem('ivoryUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserType(user.userType || 'client')
      setUserId(user.id)
    }
  }, [])

  const handleHomeClick = () => {
    const userStr = localStorage.getItem("ivoryUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.userType === 'tech') {
        router.push('/tech/dashboard');
        return;
      }
    }
    router.push('/home')
  }

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <nav className="vertical-sidebar hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-20 flex-col items-center justify-center bg-white/98 backdrop-blur-sm border-r border-[#E8E8E8]">
        <div className="flex flex-col items-center space-y-6">
          {/* Home navigation item */}
          <AnimatedNavButton
            icon={Home}
            path="/home"
            isActive={isActive('/home') || isActive('/tech/dashboard')}
            onClick={handleHomeClick}
            variant="desktop"
            direction="right"
          />

          {/* Bookings for Tech Users */}
          {userType === 'tech' && (
            <AnimatedNavButton
              icon={Calendar}
              path="/tech/bookings"
              isActive={isActive('/tech/bookings')}
              variant="desktop"
              direction="right"
            />
          )}

          {/* Center Action Button */}
          <button
            onClick={() => {
              haptics.medium()
              onCenterAction?.()
            }}
            className="relative flex items-center justify-center bg-[#1A1A1A] hover:bg-[#8B7355] active:scale-95 transition-all duration-300 w-12 h-12 rounded-lg nav-button-ripple"
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>

          {/* Notifications */}
          <NotificationCenter userId={userId} />

          {/* Profile navigation item */}
          <AnimatedNavButton
            icon={User}
            path="/profile"
            isActive={isActive('/profile')}
            variant="desktop"
            direction="right"
          />

          {/* Settings for Tech Users */}
          {userType === 'tech' && (
            <AnimatedNavButton
              icon={Settings}
              path="/tech/settings"
              isActive={isActive('/tech/settings')}
              variant="desktop"
              direction="right"
            />
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-30 safe-bottom lg:hidden",
        isWatch && "watch-nav"
      )}>
        {/* Elegant backdrop */}
        <div className="absolute inset-0 bg-white/98 backdrop-blur-sm border-t border-[#E8E8E8]" />
        
        <div className={cn(
          "relative max-w-screen-xl mx-auto",
          isWatch ? "px-2" : "px-6 sm:px-8"
        )}>
          <div className={cn(
            "flex items-center",
            isWatch ? "h-12" : "h-16 sm:h-18",
            "max-w-md mx-auto",
            userType === 'tech' ? "justify-around" : "justify-around"
          )}>
            {/* Home Button */}
            <AnimatedNavButton
              icon={Home}
              label="Home"
              path="/home"
              isActive={isActive('/home') || isActive('/tech/dashboard')}
              onClick={handleHomeClick}
              isWatch={isWatch}
              variant="mobile"
              direction="up"
            />

            {/* Bookings for Tech Users */}
            {userType === 'tech' && (
              <AnimatedNavButton
                icon={Calendar}
                label="Book"
                path="/tech/bookings"
                isActive={isActive('/tech/bookings')}
                isWatch={isWatch}
                variant="mobile"
                direction="up"
              />
            )}

            {/* Center Action Button */}
            <button
              onClick={() => {
                haptics.medium();
                onCenterAction?.();
              }}
              className={cn(
                "relative flex items-center justify-center bg-[#1A1A1A] hover:bg-[#8B7355] active:scale-95 transition-all duration-300 nav-button-ripple",
                isWatch ? "w-10 h-10 rounded-full" : "w-12 h-12 -mt-2"
              )}
            >
              <Plus className={isWatch ? "w-5 h-5 text-white" : "w-6 h-6 text-white"} strokeWidth={1.5} />
            </button>

            {/* Profile Button */}
            <AnimatedNavButton
              icon={User}
              label="Profile"
              path="/profile"
              isActive={isActive('/profile')}
              isWatch={isWatch}
              variant="mobile"
              direction="up"
            />

            {/* Settings for Tech Users */}
            {userType === 'tech' && (
              <AnimatedNavButton
                icon={Settings}
                label="Settings"
                path="/tech/settings"
                isActive={isActive('/tech/settings')}
                isWatch={isWatch}
                variant="mobile"
                direction="up"
              />
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
