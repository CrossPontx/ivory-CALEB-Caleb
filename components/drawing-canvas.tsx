"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Undo, Redo, Trash2, Palette, X } from 'lucide-react'
import Image from 'next/image'

interface DrawingCanvasProps {
  imageUrl: string
  onSave: (dataUrl: string) => void
  onClose: () => void
}

type DrawingLine = {
  points: { x: number; y: number }[]
  color: string
  width: number
}

const COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#FF6B9D', // Pink
  '#FFD93D', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#FF00FF', // Magenta
  '#FFA500', // Orange
]

const BRUSH_SIZES = [2, 4, 6, 8, 12, 16]

export function DrawingCanvas({ imageUrl, onSave, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#FF0000')
  const [brushSize, setBrushSize] = useState(4)
  const [lines, setLines] = useState<DrawingLine[]>([])
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null)
  const [undoneLines, setUndoneLines] = useState<DrawingLine[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBrushPicker, setShowBrushPicker] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Load and setup canvas
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
    
    img.onload = () => {
      imageRef.current = img
      
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        
        // Calculate dimensions to fit image in container while maintaining aspect ratio
        const imgAspect = img.width / img.height
        const containerAspect = containerWidth / containerHeight
        
        let width, height
        if (imgAspect > containerAspect) {
          width = containerWidth
          height = containerWidth / imgAspect
        } else {
          height = containerHeight
          width = containerHeight * imgAspect
        }
        
        setCanvasDimensions({ width, height })
        
        const canvas = canvasRef.current
        canvas.width = width
        canvas.height = height
        
        setImageLoaded(true)
        redrawCanvas([], img, width, height)
      }
    }
  }, [imageUrl])

  // Redraw canvas with image and all lines
  const redrawCanvas = useCallback((linesToDraw: DrawingLine[], img?: HTMLImageElement, w?: number, h?: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const image = img || imageRef.current
    const width = w || canvasDimensions.width
    const height = h || canvasDimensions.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw image
    if (image) {
      ctx.drawImage(image, 0, 0, width, height)
    }
    
    // Draw all lines
    linesToDraw.forEach(line => {
      if (line.points.length < 2) return
      
      ctx.strokeStyle = line.color
      ctx.lineWidth = line.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(line.points[0].x, line.points[0].y)
      
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y)
      }
      
      ctx.stroke()
    })
  }, [canvasDimensions])

  // Redraw when lines change
  useEffect(() => {
    if (imageLoaded) {
      const allLines = currentLine ? [...lines, currentLine] : lines
      redrawCanvas(allLines)
    }
  }, [lines, currentLine, imageLoaded, redrawCanvas])

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const rect = canvas.getBoundingClientRect()
    
    let clientX, clientY
    if ('touches' in e) {
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (!coords) return
    
    setIsDrawing(true)
    setCurrentLine({
      points: [coords],
      color: currentColor,
      width: brushSize
    })
    setUndoneLines([]) // Clear redo stack when starting new drawing
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!isDrawing || !currentLine) return
    
    const coords = getCoordinates(e)
    if (!coords) return
    
    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, coords]
    })
  }

  const stopDrawing = () => {
    if (currentLine && currentLine.points.length > 0) {
      setLines([...lines, currentLine])
      setCurrentLine(null)
    }
    setIsDrawing(false)
  }

  const undo = () => {
    if (lines.length === 0) return
    const lastLine = lines[lines.length - 1]
    setUndoneLines([...undoneLines, lastLine])
    setLines(lines.slice(0, -1))
  }

  const redo = () => {
    if (undoneLines.length === 0) return
    const lineToRedo = undoneLines[undoneLines.length - 1]
    setLines([...lines, lineToRedo])
    setUndoneLines(undoneLines.slice(0, -1))
  }

  const clear = () => {
    setLines([])
    setUndoneLines([])
    setCurrentLine(null)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-white font-semibold text-lg">Draw on Image</h2>
        <Button
          onClick={handleSave}
          size="sm"
          className="bg-gradient-to-r from-terracotta to-rose hover:from-terracotta/90 hover:to-rose/90"
        >
          Save
        </Button>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none max-w-full max-h-full rounded-lg shadow-2xl"
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            cursor: 'crosshair'
          }}
        />
      </div>

      {/* Controls */}
      <div className="p-4 bg-white/10 backdrop-blur-md border-t border-white/20 space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={undo}
            disabled={lines.length === 0}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 disabled:opacity-30"
          >
            <Undo className="w-4 h-4 mr-1" />
            Undo
          </Button>
          <Button
            onClick={redo}
            disabled={undoneLines.length === 0}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 disabled:opacity-30"
          >
            <Redo className="w-4 h-4 mr-1" />
            Redo
          </Button>
          <Button
            onClick={clear}
            disabled={lines.length === 0}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker)
              setShowBrushPicker(false)
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Color</span>
            </div>
            <div 
              className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: currentColor }}
            />
          </button>
          
          {showColorPicker && (
            <div className="grid grid-cols-5 gap-2 p-3 bg-white/10 rounded-xl">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setCurrentColor(color)
                    setShowColorPicker(false)
                  }}
                  className={`w-full aspect-square rounded-full border-2 transition-all active:scale-95 ${
                    currentColor === color ? 'border-white scale-110' : 'border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brush Size Picker */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowBrushPicker(!showBrushPicker)
              setShowColorPicker(false)
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div 
                className="rounded-full bg-white"
                style={{ width: brushSize + 8, height: brushSize + 8 }}
              />
              <span className="text-white font-medium">Brush Size</span>
            </div>
            <span className="text-white font-semibold">{brushSize}px</span>
          </button>
          
          {showBrushPicker && (
            <div className="grid grid-cols-6 gap-2 p-3 bg-white/10 rounded-xl">
              {BRUSH_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setBrushSize(size)
                    setShowBrushPicker(false)
                  }}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                    brushSize === size ? 'bg-white/30 scale-110' : 'bg-white/10'
                  }`}
                >
                  <div 
                    className="rounded-full bg-white"
                    style={{ width: size, height: size }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
