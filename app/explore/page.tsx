"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// Sample designs for browsing without authentication
const sampleDesigns = [
  {
    id: "sample-1",
    imageUrl: "/sample-designs/elegant-french.jpg",
    title: "Classic French Elegance",
    description: "Timeless sophistication with a modern twist",
    style: "French Manicure"
  },
  {
    id: "sample-2",
    imageUrl: "/sample-designs/floral-spring.jpg",
    title: "Spring Blossom",
    description: "Delicate floral patterns for the season",
    style: "Floral Art"
  },
  {
    id: "sample-3",
    imageUrl: "/sample-designs/geometric-modern.jpg",
    title: "Geometric Precision",
    description: "Bold lines and contemporary design",
    style: "Geometric"
  },
  {
    id: "sample-4",
    imageUrl: "/sample-designs/minimalist-nude.jpg",
    title: "Minimalist Nude",
    description: "Understated elegance in neutral tones",
    style: "Minimalist"
  },
  {
    id: "sample-5",
    imageUrl: "/sample-designs/glitter-glam.jpg",
    title: "Evening Glamour",
    description: "Sparkle and shine for special occasions",
    style: "Glitter"
  },
  {
    id: "sample-6",
    imageUrl: "/sample-designs/ombre-sunset.jpg",
    title: "Sunset Ombre",
    description: "Gradient perfection in warm hues",
    style: "Ombre"
  }
]

export default function ExplorePage() {
  const router = useRouter()
  const [selectedStyle, setSelectedStyle] = useState<string>("all")

  const styles = ["all", "French Manicure", "Floral Art", "Geometric", "Minimalist", "Glitter", "Ombre"]

  const filteredDesigns = selectedStyle === "all" 
    ? sampleDesigns 
    : sampleDesigns.filter(design => design.style === selectedStyle)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-sm border-b border-[#E8E8E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button 
              onClick={() => router.push('/')}
              className="font-serif text-xl sm:text-2xl tracking-tight text-[#1A1A1A] font-light"
            >
              IVORY'S CHOICE
            </button>
            
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={() => router.push('/auth')}
                className="text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 hidden sm:block"
              >
                Sign In
              </button>
              <Button 
                onClick={() => router.push('/auth?signup=true')}
                className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-300 px-4 sm:px-8 h-9 sm:h-11 text-xs tracking-widest uppercase rounded-none"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 bg-gradient-to-b from-[#F8F7F5] to-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 sm:mb-6 font-light">
            Inspiration Gallery
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight">
            Explore Our Collection
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Browse curated nail designs created by our AI and master artisans. 
            Sign up to create your own custom designs.
          </p>

          {/* Style Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-4 sm:px-6 py-2 text-xs tracking-wider uppercase transition-all duration-300 ${
                  selectedStyle === style
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white border border-[#E8E8E8] text-[#6B6B6B] hover:border-[#8B7355]"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDesigns.map((design) => (
              <div key={design.id} className="group cursor-pointer" onClick={() => {
                // Prompt to sign up to create custom designs
                if (confirm("Sign up to create your own custom nail designs!")) {
                  router.push('/auth?signup=true')
                }
              }}>
                <div className="aspect-[3/4] overflow-hidden relative mb-4 bg-[#F8F7F5]">
                  {/* Placeholder for sample images */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-4 border border-[#E8E8E8] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">
                        {design.style}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm tracking-wider uppercase text-[#1A1A1A] font-light">
                    {design.title}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] font-light">
                    {design.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#1A1A1A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-white mb-6 tracking-tight">
            Ready to Create Your Own?
          </h2>
          <p className="text-sm sm:text-base text-white/70 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Sign up to generate custom nail designs with AI, connect with master artisans, 
            and book appointments.
          </p>
          <Button 
            onClick={() => router.push('/auth?signup=true')}
            className="bg-white text-[#1A1A1A] hover:bg-[#8B7355] hover:text-white transition-all duration-500 px-12 h-14 text-xs tracking-widest uppercase rounded-none font-light"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  )
}
