"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, ImageIcon, Bell, Check } from "lucide-react"

type Permission = "camera" | "photos" | "notifications"

export default function PermissionsPage() {
  const router = useRouter()
  const [granted, setGranted] = useState<Set<Permission>>(new Set())

  const requestPermission = (permission: Permission) => {
    setGranted((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(permission)) {
        newSet.delete(permission)
      } else {
        newSet.add(permission)
      }
      return newSet
    })
  }

  const handleContinue = () => {
    router.push("/home")
  }

  const permissions = [
    {
      id: "camera" as Permission,
      icon: Camera,
      title: "Camera Access",
      description: "Take photos of your hands to design nail art in real-time",
    },
    {
      id: "photos" as Permission,
      icon: ImageIcon,
      title: "Photo Library",
      description: "Upload existing photos to apply nail designs",
    },
    {
      id: "notifications" as Permission,
      icon: Bell,
      title: "Notifications",
      description: "Get updates when your nail tech responds or approves designs",
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-6 sm:mb-8 font-light">
            Setup
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-[#1A1A1A] mb-6 sm:mb-8 tracking-[-0.01em] leading-[1.1]">
            Enable Permissions
          </h1>
          <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide max-w-xl mx-auto">
            To get the best experience, we need a few permissions
          </p>
        </div>

        {/* Permission Cards */}
        <div className="space-y-5 sm:space-y-6 mb-12 sm:mb-16">
          {permissions.map((permission) => (
            <div
              key={permission.id}
              className={`border transition-all duration-700 cursor-pointer bg-white group hover:shadow-lg ${
                granted.has(permission.id) 
                  ? "border-[#8B7355] shadow-md shadow-[#8B7355]/10" 
                  : "border-[#E8E8E8] hover:border-[#8B7355]"
              }`}
              onClick={() => requestPermission(permission.id)}
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 border flex items-center justify-center flex-shrink-0 transition-all duration-700 ${
                    granted.has(permission.id)
                      ? "border-[#8B7355] bg-[#8B7355]"
                      : "border-[#E8E8E8] bg-[#F8F7F5] group-hover:border-[#8B7355] group-hover:bg-[#8B7355]"
                  }`}>
                    <permission.icon 
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-700 ${
                        granted.has(permission.id)
                          ? "text-white"
                          : "text-[#1A1A1A] group-hover:text-white"
                      }`} 
                      strokeWidth={1} 
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight mb-2 sm:mb-3">
                      {permission.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                      {permission.description}
                    </p>
                  </div>
                  
                  {/* Checkbox */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 border-2 flex items-center justify-center flex-shrink-0 transition-all duration-700 ${
                      granted.has(permission.id) 
                        ? "bg-[#8B7355] border-[#8B7355]" 
                        : "border-[#E8E8E8] group-hover:border-[#8B7355]"
                    }`}
                  >
                    {granted.has(permission.id) && (
                      <Check className="w-5 h-5 text-white" strokeWidth={2} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <button
            onClick={handleContinue}
            className="flex-1 h-14 sm:h-16 border border-[#E8E8E8] text-[#1A1A1A] font-light text-[11px] tracking-[0.25em] uppercase hover:bg-[#F8F7F5] hover:scale-[1.01] active:scale-[0.98] transition-all duration-700"
          >
            Skip for Now
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 h-14 sm:h-16 bg-[#1A1A1A] text-white font-light text-[11px] tracking-[0.25em] uppercase hover:bg-[#8B7355] hover:scale-[1.01] active:scale-[0.98] transition-all duration-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
