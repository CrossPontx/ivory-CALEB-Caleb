'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/haptics'

interface AnimatedTabsProps {
  tabs: Array<{
    id: string
    label: string
    count?: number
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function AnimatedTabs({ tabs, activeTab, onTabChange, className }: AnimatedTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({})
  const tabRefs = React.useRef<{ [key: string]: HTMLButtonElement | null }>({})

  // Update indicator position when active tab changes
  React.useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
        transform: 'translateX(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      })
    }
  }, [activeTab])

  const handleTabClick = (tabId: string) => {
    if (tabId === activeTab) return
    
    haptics.light()
    onTabChange(tabId)
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex bg-white border border-[#E8E8E8] relative overflow-hidden">
        {/* Animated indicator */}
        <div
          className="absolute bottom-0 h-0.5 bg-[#1A1A1A] z-10"
          style={indicatorStyle}
        />
        
        {/* Background highlight */}
        <div
          className="absolute top-0 h-full bg-[#F8F7F5] z-0 transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            transform: indicatorStyle.transform,
          }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'flex-1 py-4 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light',
              'transition-all duration-300 relative z-20',
              'hover:text-[#8B7355] active:scale-[0.98]',
              activeTab === tab.id
                ? 'text-[#1A1A1A]'
                : 'text-[#6B6B6B]'
            )}
          >
            <span className="relative">
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1">({tab.count})</span>
              )}
              
              {/* Subtle glow effect on active tab */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-[#1A1A1A]/5 rounded-sm animate-pulse" />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}