"use client"

import { useRef, useEffect, useState, useCallback } from "react"

interface ColorWheelPickerProps {
  hue: number // 0-360
  lightness: number // 0-100
  onHueChange: (hue: number) => void
  onLightnessChange: (lightness: number) => void
  currentColor: string
}

export function ColorWheelPicker({
  hue,
  lightness,
  onHueChange,
  onLightnessChange,
  currentColor,
}: ColorWheelPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggingType, setDraggingType] = useState<'hue' | 'lightness' | null>(null)
  const [size] = useState(280) // Size of the color wheel
  const centerX = size / 2
  const centerY = size / 2
  const outerRadius = size / 2 - 10
  const innerRadius = size / 2 - 60
  const lightnessRadius = innerRadius - 20

  // Draw the color wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw outer hue ring
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 90) * Math.PI / 180
      const endAngle = (angle - 89) * Math.PI / 180

      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
      ctx.closePath()
      
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`
      ctx.fill()
    }

    // Draw inner lightness circle with radial gradient from white (center) to black (edge)
    const lightnessGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, lightnessRadius)
    lightnessGradient.addColorStop(0, '#ffffff')
    lightnessGradient.addColorStop(1, '#000000')
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, lightnessRadius, 0, 2 * Math.PI)
    ctx.fillStyle = lightnessGradient
    ctx.fill()
    
    // Add subtle border between hue ring and lightness circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw hue indicator on outer ring
    const hueAngle = (hue - 90) * Math.PI / 180
    const hueIndicatorRadius = (outerRadius + innerRadius) / 2
    const hueX = centerX + Math.cos(hueAngle) * hueIndicatorRadius
    const hueY = centerY + Math.sin(hueAngle) * hueIndicatorRadius
    
    // Hue indicator - larger and more visible
    ctx.beginPath()
    ctx.arc(hueX, hueY, 14, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.strokeStyle = '#8B7355'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // Inner dot showing selected hue
    ctx.beginPath()
    ctx.arc(hueX, hueY, 6, 0, 2 * Math.PI)
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
    ctx.fill()

    // Draw lightness indicator in center circle
    // Position based on distance from center (0% = center/white, 100% = edge/black)
    const lightnessDistance = ((100 - lightness) / 100) * lightnessRadius
    const lightnessX = centerX
    const lightnessY = centerY - lightnessDistance
    
    // Lightness indicator
    ctx.beginPath()
    ctx.arc(lightnessX, lightnessY, 12, 0, 2 * Math.PI)
    ctx.fillStyle = currentColor
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.strokeStyle = '#8B7355'
    ctx.lineWidth = 2
    ctx.stroke()

  }, [hue, lightness, currentColor, size, centerX, centerY, outerRadius, innerRadius, lightnessRadius])

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If already dragging, continue with that type
    if (isDragging && draggingType === 'hue' && distance >= innerRadius - 20) {
      let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
      if (angle < 0) angle += 360
      onHueChange(Math.round(angle))
      return
    }
    
    if (isDragging && draggingType === 'lightness' && distance <= lightnessRadius + 20) {
      const lightnessValue = 100 - (distance / lightnessRadius) * 100
      onLightnessChange(Math.max(10, Math.min(100, Math.round(lightnessValue))))
      return
    }

    // Initial click - determine which circle
    if (!isDragging) {
      // Check if click is on hue ring (outer)
      if (distance >= innerRadius && distance <= outerRadius) {
        setDraggingType('hue')
        let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
        if (angle < 0) angle += 360
        onHueChange(Math.round(angle))
      }
      // Check if click is in lightness circle (inner)
      else if (distance <= lightnessRadius) {
        setDraggingType('lightness')
        const lightnessValue = 100 - (distance / lightnessRadius) * 100
        onLightnessChange(Math.max(10, Math.min(100, Math.round(lightnessValue))))
      }
    }
  }, [centerX, centerY, innerRadius, outerRadius, lightnessRadius, onHueChange, onLightnessChange, isDragging, draggingType])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    handleInteraction(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleInteraction(e.clientX, e.clientY)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggingType(null)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDragging(true)
    const touch = e.touches[0]
    handleInteraction(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (isDragging) {
      const touch = e.touches[0]
      handleInteraction(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDragging(false)
    setDraggingType(null)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="cursor-pointer touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      <div className="text-center space-y-3">
        <div className="flex items-center gap-4 justify-center">
          <div 
            className="w-12 h-12 rounded-full shadow-lg ring-4 ring-white ring-offset-2"
            style={{ backgroundColor: currentColor }}
          />
          <div className="text-left">
            <div className="text-xs text-[#6B6B6B] font-light mb-1">Selected Color</div>
            <div className="text-sm font-mono font-medium text-[#1A1A1A]">{currentColor}</div>
          </div>
        </div>
        
        <div className="flex gap-6 justify-center text-xs">
          <div className="text-center">
            <div className="text-[#6B6B6B] font-light mb-1">Hue</div>
            <div className="text-[#8B7355] font-medium">{hue}°</div>
          </div>
          <div className="text-center">
            <div className="text-[#6B6B6B] font-light mb-1">Lightness</div>
            <div className="text-[#8B7355] font-medium">{lightness}%</div>
          </div>
        </div>
        
        <div className="text-[10px] text-[#6B6B6B] font-light max-w-[240px]">
          Drag the outer ring to change hue • Drag the inner circle to adjust lightness
        </div>
      </div>
    </div>
  )
}
