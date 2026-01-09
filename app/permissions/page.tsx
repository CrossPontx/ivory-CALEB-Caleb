"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, ImageIcon, Bell, Check, Loader2 } from "lucide-react"
import { 
  requestCameraPermission, 
  getCameraPermissionStatus,
  requestPhotosPermission,
  getPhotosPermissionStatus,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isNative 
} from "@/lib/native-bridge"

type Permission = "camera" | "photos" | "notifications"

interface PermissionState {
  granted: boolean
  requesting: boolean
}

export default function PermissionsPage() {
  const router = useRouter()
  const [permissions, setPermissions] = useState<Record<Permission, PermissionState>>({
    camera: { granted: false, requesting: false },
    photos: { granted: false, requesting: false },
    notifications: { granted: false, requesting: false },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Check current permission status on mount
  useEffect(() => {
    checkPermissionStatus()
  }, [])

  const checkPermissionStatus = async () => {
    try {
      const [cameraStatus, photosStatus, notificationStatus] = await Promise.all([
        getCameraPermissionStatus().catch(() => ({ authorized: false })),
        getPhotosPermissionStatus().catch(() => ({ authorized: false })),
        getNotificationPermissionStatus().catch(() => ({ authorized: false })),
      ])

      setPermissions({
        camera: { granted: cameraStatus.authorized, requesting: false },
        photos: { granted: photosStatus.authorized, requesting: false },
        notifications: { granted: notificationStatus.authorized, requesting: false },
      })
    } catch (error) {
      console.error('Error checking permission status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestPermission = async (permission: Permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: { ...prev[permission], requesting: true }
    }))

    try {
      let result = { granted: false }

      switch (permission) {
        case 'camera':
          result = await requestCameraPermission()
          break
        case 'photos':
          result = await requestPhotosPermission()
          break
        case 'notifications':
          result = await requestNotificationPermission()
          break
      }

      setPermissions(prev => ({
        ...prev,
        [permission]: { granted: result.granted, requesting: false }
      }))

      // Save to backend
      await savePermissionsToBackend()
    } catch (error) {
      console.error(`Error requesting ${permission} permission:`, error)
      setPermissions(prev => ({
        ...prev,
        [permission]: { granted: false, requesting: false }
      }))
    }
  }

  const savePermissionsToBackend = async () => {
    try {
      const response = await fetch('/api/user/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: {
            camera: permissions.camera.granted,
            photos: permissions.photos.granted,
            notifications: permissions.notifications.granted,
          }
        }),
      })

      if (!response.ok) {
        // If user is not authenticated, just continue without saving
        if (response.status === 401) {
          console.log('User not authenticated, skipping permission save')
          return
        }
        throw new Error('Failed to save permissions')
      }
    } catch (error) {
      console.error('Error saving permissions to backend:', error)
      // Don't block the user flow if backend save fails
    }
  }

  const handleContinue = async () => {
    setIsSaving(true)
    await savePermissionsToBackend()
    setIsSaving(false)
    router.push("/home")
  }

  const permissionConfigs = [
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

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
          {permissionConfigs.map((permissionConfig) => {
            const permissionState = permissions[permissionConfig.id]
            const isGranted = permissionState.granted
            const isRequesting = permissionState.requesting
            
            return (
              <div
                key={permissionConfig.id}
                className={`border transition-all duration-700 cursor-pointer bg-white group hover:shadow-lg ${
                  isGranted 
                    ? "border-[#8B7355] shadow-md shadow-[#8B7355]/10" 
                    : "border-[#E8E8E8] hover:border-[#8B7355]"
                } ${isRequesting ? "opacity-75" : ""}`}
                onClick={() => !isRequesting && !isGranted && requestPermission(permissionConfig.id)}
              >
                <div className="p-8 sm:p-10">
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 border flex items-center justify-center flex-shrink-0 transition-all duration-700 ${
                      isGranted
                        ? "border-[#8B7355] bg-[#8B7355]"
                        : "border-[#E8E8E8] bg-[#F8F7F5] group-hover:border-[#8B7355] group-hover:bg-[#8B7355]"
                    }`}>
                      {isRequesting ? (
                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-[#8B7355]" />
                      ) : (
                        <permissionConfig.icon 
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-700 ${
                            isGranted
                              ? "text-white"
                              : "text-[#1A1A1A] group-hover:text-white"
                          }`} 
                          strokeWidth={1} 
                        />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight mb-2 sm:mb-3">
                        {permissionConfig.title}
                      </h3>
                      <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                        {permissionConfig.description}
                      </p>
                      {isGranted && (
                        <p className="text-xs text-[#8B7355] mt-2 font-medium">
                          Permission granted
                        </p>
                      )}
                    </div>
                    
                    {/* Status Indicator */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 border-2 flex items-center justify-center flex-shrink-0 transition-all duration-700 ${
                        isGranted 
                          ? "bg-[#8B7355] border-[#8B7355]" 
                          : "border-[#E8E8E8] group-hover:border-[#8B7355]"
                      }`}
                    >
                      {isGranted && (
                        <Check className="w-5 h-5 text-white" strokeWidth={2} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <button
            onClick={handleContinue}
            disabled={isSaving}
            className="flex-1 h-14 sm:h-16 border border-[#E8E8E8] text-[#1A1A1A] font-light text-[11px] tracking-[0.25em] uppercase hover:bg-[#F8F7F5] hover:scale-[1.01] active:scale-[0.98] transition-all duration-700 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            ) : (
              "Skip for Now"
            )}
          </button>
          <button
            onClick={handleContinue}
            disabled={isSaving}
            className="flex-1 h-14 sm:h-16 bg-[#1A1A1A] text-white font-light text-[11px] tracking-[0.25em] uppercase hover:bg-[#8B7355] hover:scale-[1.01] active:scale-[0.98] transition-all duration-700 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
