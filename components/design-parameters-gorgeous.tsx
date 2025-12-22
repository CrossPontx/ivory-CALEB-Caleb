"use client"

import { ChevronDown } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"

type DesignSettings = {
  nailLength: string
  nailShape: string
  baseColor: string
  finish: string
  texture: string
  patternType: string
  styleVibe: string
  accentColor: string
}

type InfluenceWeights = {
  nailEditor_designImage: number
  nailEditor_baseColor: number
  nailEditor_finish: number
  nailEditor_texture: number
}

interface DesignParametersProps {
  designSettings: DesignSettings
  influenceWeights: InfluenceWeights
  selectedDesignImages: string[]
  colorLightness: number
  expandedSection: string | null
  setExpandedSection: (section: string | null) => void
  handleDesignSettingChange: (key: keyof DesignSettings, value: string) => void
  handleHueChange: (value: number[]) => void
  handleLightnessChange: (value: number[]) => void
  handleNailEditorBaseColorInfluence: (value: number) => void
  hexToHsl: (hex: string) => { hue: number; lightness: number }
}

export function DesignParametersGorgeous({
  designSettings,
  influenceWeights,
  selectedDesignImages,
  colorLightness,
  expandedSection,
  setExpandedSection,
  handleDesignSettingChange,
  handleHueChange,
  handleLightnessChange,
  handleNailEditorBaseColorInfluence,
  hexToHsl,
}: DesignParametersProps) {
  return (
    <div className="border-t border-[#E8E8E8] pt-4">
      <p className="text-xs font-light text-[#6B6B6B] uppercase tracking-widest mb-4">Design Parameters</p>

      {/* Nail Length - Redesigned */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'length' ? null : 'length')}
          className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E8E8E8] bg-gradient-to-br from-white to-[#FEFEFE] hover:border-[#8B7355] hover:shadow-md transition-all duration-300 active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B7355] to-[#A0826D] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-[#1A1A1A] tracking-wide block">Nail Length</span>
              <span className="text-xs text-[#8B7355] capitalize font-light">{designSettings.nailLength.replace('-', ' ')}</span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#6B6B6B] transition-transform duration-300 ${expandedSection === 'length' ? 'rotate-180' : ''}`} strokeWidth={1.5} />
        </button>
        {expandedSection === 'length' && (
          <div className="mt-3 p-4 bg-gradient-to-br from-[#FAFAFA] to-white rounded-lg border border-[#E8E8E8] shadow-inner animate-fade-in">
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'short', label: 'Short', height: 'h-8', emoji: '💅' },
                { value: 'medium', label: 'Medium', height: 'h-12', emoji: '✨' },
                { value: 'long', label: 'Long', height: 'h-16', emoji: '💎' },
                { value: 'extra-long', label: 'Extra', height: 'h-20', emoji: '👑' }
              ].map((length) => (
                <button
                  key={length.value}
                  onClick={() => handleDesignSettingChange('nailLength', length.value)}
                  className={`group relative flex flex-col items-center justify-end p-3 rounded-xl border-2 transition-all duration-300 ${
                    designSettings.nailLength === length.value
                      ? 'border-[#8B7355] bg-gradient-to-br from-[#8B7355]/5 to-[#8B7355]/10 shadow-lg scale-105'
                      : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]/50 hover:shadow-md hover:scale-102'
                  }`}
                >
                  <div className="absolute -top-2 right-2 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {length.emoji}
                  </div>
                  <div className={`w-5 ${length.height} bg-gradient-to-t from-[#8B7355] to-[#A0826D] rounded-t-full mb-2 shadow-sm transition-all duration-300 ${
                    designSettings.nailLength === length.value ? 'scale-110' : ''
                  }`} />
                  <span className={`text-[10px] font-medium tracking-wide transition-colors ${
                    designSettings.nailLength === length.value ? 'text-[#8B7355]' : 'text-[#6B6B6B]'
                  }`}>{length.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add other parameters similarly... */}
    </div>
  )
}
