"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { GoogleMapsSearch } from "@/components/google-maps-search"
import { ArrowLeft, Plus, X, Loader2, Info, CheckCircle, ExternalLink, Sparkles, Check, Save, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAutoSave } from "@/hooks/use-auto-save"

type Service = {
  id: string
  name: string
  price: string
  duration: string
  description: string
}

export default function TechProfileSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [website, setWebsite] = useState("")
  const [hasIvoryWebsite, setHasIvoryWebsite] = useState(false)
  const [instagramHandle, setInstagramHandle] = useState("")
  const [tiktokHandle, setTiktokHandle] = useState("")
  const [facebookHandle, setFacebookHandle] = useState("")
  const [otherSocialLinks, setOtherSocialLinks] = useState<Array<{platform: string, handle: string, url: string}>>([])
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([]);
  
  // No-show fee settings
  const [noShowFeeEnabled, setNoShowFeeEnabled] = useState(false)
  const [noShowFeePercent, setNoShowFeePercent] = useState("50")
  const [cancellationWindowHours, setCancellationWindowHours] = useState("24")

  // Auto-save functionality
  const saveProfile = useCallback(async () => {
    if (!userId) return

    try {
      // Save tech profile
      const profileRes = await fetch("/api/tech-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          businessName,
          phoneNumber,
          website: hasIvoryWebsite ? website : '', // Only save Ivory websites
          instagramHandle,
          tiktokHandle,
          facebookHandle,
          otherSocialLinks,
          bio,
          location,
          noShowFeeEnabled,
          noShowFeePercent: parseInt(noShowFeePercent) || 50,
          cancellationWindowHours: parseInt(cancellationWindowHours) || 24,
        }),
      })

      if (!profileRes.ok && profileRes.status !== 404) {
        const errorData = await profileRes.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save profile")
      }

      // Save services
      const servicesRes = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          services: services
            .filter((s) => s.name && s.price)
            .map((s) => ({
              name: s.name,
              price: parseFloat(s.price),
              duration: parseInt(s.duration) || 60,
              description: s.description,
            })),
        }),
      })

      if (!servicesRes.ok && servicesRes.status !== 404) {
        throw new Error("Failed to save services")
      }

      // Store in localStorage as fallback for 404s
      if (profileRes.status === 404 || servicesRes.status === 404) {
        localStorage.setItem("techProfile", JSON.stringify({
          businessName,
          phoneNumber,
          website,
          instagramHandle,
          tiktokHandle,
          facebookHandle,
          otherSocialLinks,
          bio,
          location,
          noShowFeeEnabled,
          noShowFeePercent,
          cancellationWindowHours,
        }))
        localStorage.setItem("techServices", JSON.stringify(services))
      }
    } catch (error) {
      console.error("Auto-save error:", error)
      // Store locally as fallback
      localStorage.setItem("techProfile", JSON.stringify({
        businessName,
        phoneNumber,
        website,
        instagramHandle,
        tiktokHandle,
        facebookHandle,
        otherSocialLinks,
        bio,
        location,
        noShowFeeEnabled,
        noShowFeePercent,
        cancellationWindowHours,
      }))
      localStorage.setItem("techServices", JSON.stringify(services))
      throw error
    }
  }, [
    userId, businessName, phoneNumber, website, hasIvoryWebsite, instagramHandle,
    tiktokHandle, facebookHandle, otherSocialLinks, bio, location, noShowFeeEnabled,
    noShowFeePercent, cancellationWindowHours, services
  ])

  const { isSaving: autoSaving, lastSaved, hasUnsavedChanges, debouncedSave } = useAutoSave({
    onSave: saveProfile,
    delay: 3000, // 3 seconds delay
    enabled: !loading && userId !== null
  }) as any

  // Auto-save wrapper functions
  const setBusinessNameWithAutoSave = useCallback((value: string) => {
    setBusinessName(value)
    debouncedSave()
  }, [debouncedSave])

  const setPhoneNumberWithAutoSave = useCallback((value: string) => {
    setPhoneNumber(value)
    debouncedSave()
  }, [debouncedSave])

  const setWebsiteWithAutoSave = useCallback((value: string) => {
    setWebsite(value)
    debouncedSave()
  }, [debouncedSave])

  const setInstagramHandleWithAutoSave = useCallback((value: string) => {
    setInstagramHandle(value)
    debouncedSave()
  }, [debouncedSave])

  const setTiktokHandleWithAutoSave = useCallback((value: string) => {
    setTiktokHandle(value)
    debouncedSave()
  }, [debouncedSave])

  const setFacebookHandleWithAutoSave = useCallback((value: string) => {
    setFacebookHandle(value)
    debouncedSave()
  }, [debouncedSave])

  const setBioWithAutoSave = useCallback((value: string) => {
    setBio(value)
    debouncedSave()
  }, [debouncedSave])

  const setLocationWithAutoSave = useCallback((value: string) => {
    setLocation(value)
    debouncedSave()
  }, [debouncedSave])

  const setNoShowFeeEnabledWithAutoSave = useCallback((value: boolean) => {
    setNoShowFeeEnabled(value)
    debouncedSave()
  }, [debouncedSave])

  const setNoShowFeePercentWithAutoSave = useCallback((value: string) => {
    setNoShowFeePercent(value)
    debouncedSave()
  }, [debouncedSave])

  const setCancellationWindowHoursWithAutoSave = useCallback((value: string) => {
    setCancellationWindowHours(value)
    debouncedSave()
  }, [debouncedSave])

  const updateServiceWithAutoSave = useCallback((id: string, field: "name" | "price" | "duration" | "description", value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
    debouncedSave()
  }, [services, debouncedSave])

  const updateOtherSocialLinkWithAutoSave = useCallback((index: number, field: "platform" | "handle" | "url", value: string) => {
    setOtherSocialLinks(otherSocialLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
    debouncedSave()
  }, [otherSocialLinks, debouncedSave])

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        setUserId(user.id)

        // Load tech profile
        const profileRes = await fetch(`/api/tech-profiles?userId=${user.id}`)
        if (profileRes.ok) {
          const profile = await profileRes.json()
          if (profile) {
            setBusinessName(profile.businessName || "")
            setPhoneNumber(profile.phoneNumber || "")
            setWebsite(profile.website || "")
            setInstagramHandle(profile.instagramHandle || "")
            setTiktokHandle(profile.tiktokHandle || "")
            setFacebookHandle(profile.facebookHandle || "")
            setOtherSocialLinks(profile.otherSocialLinks || [])
            setBio(profile.bio || "")
            setLocation(profile.location || "")
            setNoShowFeeEnabled(profile.noShowFeeEnabled || false)
            setNoShowFeePercent(profile.noShowFeePercent?.toString() || "50")
            setCancellationWindowHours(profile.cancellationWindowHours?.toString() || "24")
          }
        }

        // Check if user has an Ivory website
        try {
          const websiteRes = await fetch('/api/websites')
          if (websiteRes.ok) {
            const websiteData = await websiteRes.json()
            if (websiteData) {
              setHasIvoryWebsite(true)
              // If they have an Ivory website but no website URL in profile, set it
              if (!website && websiteData.fullUrl) {
                setWebsite(`https://${websiteData.fullUrl}`)
              }
            }
          } else if (websiteRes.status === 404) {
            // API route doesn't exist yet or no website found - this is expected
            setHasIvoryWebsite(false)
          }
        } catch (error) {
          // Network error or API not available - gracefully handle
          console.log('Website API not available yet')
          setHasIvoryWebsite(false)
        }

        // Load portfolio images
        const imagesRes = await fetch(`/api/portfolio-images?userId=${user.id}`)
        if (imagesRes.ok) {
          const data = await imagesRes.json()
          setPortfolioImages(data.images?.map((img: any) => img.imageUrl) || [])
        }

        // Load services
        const servicesRes = await fetch(`/api/services?userId=${user.id}`)
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          if (data.services && data.services.length > 0) {
            setServices(
              data.services.map((s: any) => ({
                id: s.id.toString(),
                name: s.name,
                price: s.price.toString(),
                duration: s.duration?.toString() || "60",
                description: s.description || "",
              }))
            )
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: "", price: "", duration: "60", description: "" }])
  }

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const updateService = (id: string, field: "name" | "price" | "duration" | "description", value: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const addOtherSocialLink = () => {
    setOtherSocialLinks([...otherSocialLinks, { platform: "", handle: "", url: "" }])
  }

  const removeOtherSocialLink = (index: number) => {
    setOtherSocialLinks(otherSocialLinks.filter((_, i) => i !== index))
  }

  const updateOtherSocialLink = (index: number, field: "platform" | "handle" | "url", value: string) => {
    setOtherSocialLinks(otherSocialLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
  }

  const handleImageUpload = async (url: string) => {
    try {
      // Save to database
      const response = await fetch("/api/portfolio-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          imageUrl: url,
        }),
      })

      if (!response.ok) {
        // If API not deployed yet, store locally as fallback
        if (response.status === 404) {
          console.warn("API not deployed yet, storing locally")
          // Use functional update to avoid stale state when uploading multiple images
          setPortfolioImages(prev => [...prev, url])
          toast({
            title: "Image uploaded (temporary)",
            description: "Image saved locally. Will sync to database when API is ready.",
          })
          return
        }
        throw new Error("Failed to save image")
      }

      // Use functional update to avoid stale state when uploading multiple images
      setPortfolioImages(prev => [...prev, url])
      toast({
        title: "Image uploaded",
        description: "Your portfolio image has been added successfully",
      })
    } catch (error: any) {
      console.error("Error saving image:", error)
      // Fallback: still show the image locally
      // Use functional update to avoid stale state when uploading multiple images
      setPortfolioImages(prev => [...prev, url])
      toast({
        title: "Image uploaded (local only)",
        description: "Image saved locally. Database sync pending deployment.",
      })
    }
  }

  const handleImageRemove = async (url: string) => {
    try {
      // Find image ID from database
      const imagesRes = await fetch(`/api/portfolio-images?userId=${userId}`)
      if (imagesRes.ok) {
        const data = await imagesRes.json()
        const image = data.images?.find((img: any) => img.imageUrl === url)
        
        if (image) {
          const response = await fetch(`/api/portfolio-images?id=${image.id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Failed to delete image")
          }
        }
      }

      setPortfolioImages(portfolioImages.filter((img) => img !== url))
      toast({
        title: "Image removed",
        description: "Your portfolio image has been removed",
      })
    } catch (error: any) {
      console.error("Error removing image:", error)
      toast({
        title: "Remove failed",
        description: error?.message || "Failed to remove image",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    let profileSaved = false
    let servicesSaved = false

    try {
      // Save tech profile
      const profileRes = await fetch("/api/tech-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          businessName,
          phoneNumber,
          website: hasIvoryWebsite ? website : '', // Only save Ivory websites
          instagramHandle,
          tiktokHandle,
          facebookHandle,
          otherSocialLinks,
          bio,
          location,
          noShowFeeEnabled,
          noShowFeePercent: parseInt(noShowFeePercent) || 50,
          cancellationWindowHours: parseInt(cancellationWindowHours) || 24,
        }),
      })

      if (profileRes.ok || profileRes.status === 200 || profileRes.status === 201) {
        profileSaved = true
      } else if (profileRes.status === 404) {
        console.warn("Tech profiles API not deployed yet")
        // Store in localStorage as fallback
        localStorage.setItem("techProfile", JSON.stringify({
          businessName,
          phoneNumber,
          website,
          instagramHandle,
          tiktokHandle,
          facebookHandle,
          otherSocialLinks,
          bio,
          location,
        }))
        profileSaved = true
      } else {
        const errorData = await profileRes.json().catch(() => ({}))
        console.error("Profile save error:", errorData)
        throw new Error(errorData.error || "Failed to save profile")
      }

      // Save services
      const servicesRes = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          services: services
            .filter((s) => s.name && s.price)
            .map((s) => ({
              name: s.name,
              price: parseFloat(s.price),
              duration: parseInt(s.duration) || 60,
              description: s.description,
            })),
        }),
      })

      if (servicesRes.ok) {
        servicesSaved = true
      } else if (servicesRes.status === 404) {
        console.warn("Services API not deployed yet")
        // Store in localStorage as fallback
        localStorage.setItem("techServices", JSON.stringify(services))
        servicesSaved = true
      } else {
        throw new Error("Failed to save services")
      }

      if (profileSaved && servicesSaved) {
        toast({
          title: "Profile saved",
          description: "Your tech profile has been updated successfully",
        })
        router.push("/tech/dashboard")
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Save failed",
        description: error?.message || "Failed to save profile. Data saved locally.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top backdrop-blur-md bg-white/98">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] tracking-tight">Profile Setup</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#6B6B6B] font-light hidden sm:block">Professional Details</p>
                {/* Auto-save status */}
                {autoSaving && (
                  <div className="flex items-center gap-1 text-[10px] text-[#8B7355]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                  </div>
                )}
                {!autoSaving && lastSaved && (
                  <div className="flex items-center gap-1 text-[10px] text-green-600">
                    <Check className="w-3 h-3" />
                    <span className="hidden sm:inline">Auto-saved</span>
                  </div>
                )}
                {!autoSaving && hasUnsavedChanges && (
                  <div className="flex items-center gap-1 text-[10px] text-orange-500">
                    <Clock className="w-3 h-3" />
                    <span className="hidden sm:inline">Unsaved changes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-10 sm:h-12 lg:h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 px-5 sm:px-8 lg:px-10 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" strokeWidth={1} />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F8F7F5] to-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">Welcome</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-3 sm:mb-4 tracking-tight leading-[1.1]">
            Build Your Professional Profile
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#6B6B6B] font-light max-w-2xl mx-auto leading-[1.7] tracking-wide">
            Showcase your expertise and connect with clients who value your craft. Your changes are automatically saved as you type.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {/* Business Info */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section I</p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight leading-[1.1]">Business Information</h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light mt-2 leading-[1.7] tracking-wide">Essential details about your practice</p>
            </div>

            <div className="space-y-5 sm:space-y-6 lg:space-y-7">
              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                  Business Name
                </label>
                <Input
                  placeholder="Your salon or business name"
                  value={businessName}
                  onChange={(e) => setBusinessNameWithAutoSave(e.target.value)}
                  className="h-12 sm:h-14 lg:h-16 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                  Business Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumberWithAutoSave(e.target.value)}
                  className="h-12 sm:h-14 lg:h-16 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                />
                <p className="text-xs text-[#6B6B6B] mt-2 font-light tracking-wide">Clients can call you to discuss appointments</p>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                  Location
                </label>
                <GoogleMapsSearch
                  onLocationSelect={(location) => setLocationWithAutoSave(location)}
                  placeholder="Search for your city..."
                  className="h-12 sm:h-14 lg:h-16 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light pl-10 transition-all duration-300"
                />
                {location && (
                  <p className="text-xs sm:text-sm text-[#6B6B6B] mt-2 sm:mt-3 font-light tracking-wide">
                    Selected: {location}
                  </p>
                )}
              </div>

              {/* Social Media Handles - Grouped */}
              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-4 font-light">
                  Social Media
                </label>
                <p className="text-xs text-[#6B6B6B] mb-4 font-light tracking-wide">Connect your social profiles (all optional)</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Instagram */}
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#8B8B8B] mb-2 font-light">
                      Instagram
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B8B] text-sm font-light">
                        @
                      </span>
                      <Input
                        placeholder="username"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandleWithAutoSave(e.target.value.replace('@', ''))}
                        className="pl-6 h-11 text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* TikTok */}
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#8B8B8B] mb-2 font-light">
                      TikTok
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8B8B] text-sm font-light">
                        @
                      </span>
                      <Input
                        placeholder="username"
                        value={tiktokHandle}
                        onChange={(e) => setTiktokHandleWithAutoSave(e.target.value.replace('@', ''))}
                        className="pl-6 h-11 text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#8B8B8B] mb-2 font-light">
                      Facebook
                    </label>
                    <Input
                      placeholder="page or username"
                      value={facebookHandle}
                      onChange={(e) => setFacebookHandleWithAutoSave(e.target.value)}
                      className="h-11 text-sm border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                    />
                  </div>

                  {/* Add Other Link Button */}
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOtherSocialLink}
                      className="h-11 w-full border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#6B6B6B] hover:text-[#8B7355] rounded-none text-[10px] tracking-[0.2em] uppercase font-light transition-all duration-700"
                    >
                      <Plus className="w-3 h-3 mr-2" strokeWidth={1} />
                      Add Other
                    </Button>
                  </div>
                </div>

                {/* Other Social Links */}
                {otherSocialLinks.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#8B8B8B] font-light">Other Platforms</p>
                    {otherSocialLinks.map((link, index) => (
                      <div key={index} className="flex gap-3 p-3 border border-[#F0F0F0] bg-[#FAFAFA] group hover:border-[#E8E8E8] transition-all duration-300">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Platform (e.g., YouTube)"
                            value={link.platform}
                            onChange={(e) => updateOtherSocialLinkWithAutoSave(index, "platform", e.target.value)}
                            className="h-9 text-xs border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light bg-white"
                          />
                          <Input
                            placeholder="Username or URL"
                            value={link.handle || link.url}
                            onChange={(e) => {
                              if (e.target.value.startsWith('http')) {
                                updateOtherSocialLinkWithAutoSave(index, "url", e.target.value);
                                updateOtherSocialLinkWithAutoSave(index, "handle", "");
                              } else {
                                updateOtherSocialLinkWithAutoSave(index, "handle", e.target.value);
                                updateOtherSocialLinkWithAutoSave(index, "url", "");
                              }
                            }}
                            className="h-9 text-xs border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light bg-white"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOtherSocialLink(index)}
                          className="h-9 w-9 flex-shrink-0 hover:bg-red-50 hover:text-red-500 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <X className="w-3 h-3" strokeWidth={1.5} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                  Bio
                </label>
                <Textarea
                  placeholder="Tell clients about your experience and style..."
                  value={bio}
                  onChange={(e) => setBioWithAutoSave(e.target.value)}
                  rows={5}
                  className="text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 resize-none font-light leading-[1.7] tracking-wide transition-all duration-300"
                />
                <p className="text-xs text-[#6B6B6B] mt-2 font-light tracking-wide">Share your story and what makes your work unique</p>
              </div>
            </div>
          </div>

          {/* Services & Prices */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 lg:mb-10 gap-4">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section II</p>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight leading-[1.1]">Services & Pricing</h2>
                <p className="text-sm sm:text-base text-[#6B6B6B] font-light mt-2 leading-[1.7] tracking-wide">Define what you offer</p>
              </div>
              {services.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={addService}
                  className="h-11 sm:h-12 lg:h-14 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-700 px-5 sm:px-6 lg:px-8 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                  Add Service
                </Button>
              )}
            </div>

            <div className="space-y-5 sm:space-y-6">
              {services.length === 0 ? (
                <div className="text-center py-12 sm:py-16 lg:py-20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" strokeWidth={1} />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] mb-3 sm:mb-4 tracking-tight">
                    Add Your Services
                  </h3>
                  <p className="text-sm sm:text-base text-[#6B6B6B] font-light mb-6 sm:mb-8 max-w-md mx-auto leading-[1.7] tracking-wide">
                    Start by adding the nail services you offer. Include pricing and duration to help clients book appointments.
                  </p>
                  <Button 
                    onClick={addService}
                    className="h-12 sm:h-14 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 px-6 sm:px-8 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                    Add Your First Service
                  </Button>
                </div>
              ) : (
                services.map((service, index) => (
                  <div key={service.id} className="border border-[#E8E8E8] p-5 sm:p-6 lg:p-7 group hover:border-[#8B7355]/30 transition-all duration-700">
                    <div className="flex items-start justify-between mb-4 sm:mb-5">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Service {index + 1}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeService(service.id)}
                        className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 rounded-none opacity-60 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" strokeWidth={1} />
                      </Button>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-5">
                      <div>
                        <label className="block text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-2 font-light">
                          Service Name
                        </label>
                        <Input
                          placeholder="e.g., Full Set, Gel Manicure"
                          value={service.name}
                          onChange={(e) => updateServiceWithAutoSave(service.id, "name", e.target.value)}
                          className="h-12 sm:h-14 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-2 font-light">
                          Description
                        </label>
                        <Textarea
                          placeholder="Brief description of what's included..."
                          value={service.description}
                          onChange={(e) => updateServiceWithAutoSave(service.id, "description", e.target.value)}
                          rows={2}
                          className="text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 resize-none font-light leading-[1.7] tracking-wide transition-all duration-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-2 font-light">
                            Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-sm sm:text-base font-light">
                              $
                            </span>
                            <Input
                              placeholder="0"
                              type="number"
                              value={service.price}
                              onChange={(e) => updateServiceWithAutoSave(service.id, "price", e.target.value)}
                              className="pl-6 sm:pl-7 h-12 sm:h-14 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-2 font-light">
                            Duration (min)
                          </label>
                          <Input
                            placeholder="60"
                            type="number"
                            value={service.duration}
                            onChange={(e) => updateServiceWithAutoSave(service.id, "duration", e.target.value)}
                            className="h-12 sm:h-14 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Portfolio Gallery */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section III</p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight mb-2 leading-[1.1]">
                Portfolio Gallery
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">Showcase your finest work and attract clients</p>
            </div>
            <ImageUpload
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              images={portfolioImages}
              buttonText="Select Images"
              multiple={true}
            />
          </div>

          {/* Cancellation & No-Show Policy */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section IV</p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight mb-2 leading-[1.1]">
                Availability & Schedule
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">Set your working hours for client bookings</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 sm:p-5 bg-[#F8F7F5] border border-[#E8E8E8]">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-[#1A1A1A] mb-2">Set Your Availability</h3>
                    <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-3">
                      Configure your working hours so clients know when they can book appointments with you.
                    </p>
                    <Button
                      type="button"
                      onClick={() => router.push('/tech/availability')}
                      className="h-10 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-300 px-4 text-[10px] tracking-[0.2em] uppercase rounded-none font-light"
                    >
                      Configure Availability
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation & No-Show Policy */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8 lg:mb-10">
              <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Section V</p>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight mb-2 leading-[1.1]">
                Cancellation Policy
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">Protect your time with optional no-show fees</p>
            </div>

            <div className="space-y-6">
              {/* Enable No-Show Fee */}
              <div className="flex items-start justify-between gap-4 p-4 sm:p-5 bg-[#F8F7F5] border border-[#E8E8E8]">
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-medium text-[#1A1A1A] mb-1">Enable No-Show Fee</h3>
                  <p className="text-xs sm:text-sm text-[#6B6B6B] font-light leading-relaxed">
                    Charge clients a percentage of the service price if they don't show up or cancel too late
                  </p>
                </div>
                <Switch
                  checked={noShowFeeEnabled}
                  onCheckedChange={setNoShowFeeEnabledWithAutoSave}
                />
              </div>

              {noShowFeeEnabled && (
                <div className="space-y-5 pl-0 sm:pl-4 border-l-0 sm:border-l-2 border-[#8B7355]/20">
                  {/* Fee Percentage */}
                  <div>
                    <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                      No-Show Fee Percentage
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="10"
                        max="100"
                        value={noShowFeePercent}
                        onChange={(e) => setNoShowFeePercentWithAutoSave(e.target.value)}
                        className="w-24 h-12 sm:h-14 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light text-center"
                      />
                      <span className="text-sm text-[#6B6B6B]">% of service price</span>
                    </div>
                  </div>

                  {/* Cancellation Window */}
                  <div>
                    <label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 sm:mb-3 font-light">
                      Free Cancellation Window
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="1"
                        max="72"
                        value={cancellationWindowHours}
                        onChange={(e) => setCancellationWindowHoursWithAutoSave(e.target.value)}
                        className="w-24 h-12 sm:h-14 text-sm sm:text-base border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light text-center"
                      />
                      <span className="text-sm text-[#6B6B6B]">hours before appointment</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-white border border-[#E8E8E8] rounded-none">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A] mb-1">Policy Preview</p>
                        <p className="text-xs text-[#6B6B6B] leading-relaxed">
                          Clients who cancel less than {cancellationWindowHours} hours before their appointment 
                          or don't show up will be charged {noShowFeePercent}% of the service price.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Website - Moved to bottom with pulsing animation */}
          <div className="border border-[#8B7355]/50 hover:border-[#8B7355] transition-all duration-700 p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            {/* Pulsing background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B7355]/5 via-[#8B7355]/10 to-[#8B7355]/5 animate-pulse" />
            
            <div className="relative z-10">
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light animate-pulse">Section VI • Featured</p>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-tight mb-2 leading-[1.1]">
                  Professional Website
                </h2>
                <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Create a professional website to book customers with in seconds
                </p>
              </div>

              <div className="border border-[#8B7355]/30 p-4 sm:p-5 bg-gradient-to-br from-[#FAFAF8] to-white">
                {hasIvoryWebsite ? (
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#1A1A1A] mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Your Ivory Website is Ready
                      </h3>
                      <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-3">
                        You have a professional website created through Ivory. Manage it, customize it, or view analytics.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          onClick={() => router.push('/tech/website')}
                          className="h-10 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-300 px-4 text-[10px] tracking-[0.2em] uppercase rounded-none font-light"
                        >
                          Manage Website
                        </Button>
                        {website && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.open(website, '_blank')}
                            className="h-10 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#6B6B6B] hover:text-[#8B7355] rounded-none text-[10px] tracking-[0.2em] uppercase font-light"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Live Site
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#1A1A1A] mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#8B7355] animate-pulse" />
                        Create Your Professional Website
                      </h3>
                      <p className="text-xs text-[#6B6B6B] font-light leading-relaxed mb-4">
                        Create a professional website to book customers with in seconds.
                      </p>
                      <Button
                        type="button"
                        onClick={() => router.push('/tech/website')}
                        className="h-12 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-500 px-6 text-[11px] tracking-[0.2em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98] animate-pulse hover:animate-none"
                      >
                        <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Create Website (1 Credit)
                      </Button>
                    </div>
                  </div>
                )}
                
                {website && hasIvoryWebsite && (
                  <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
                    <p className="text-xs text-[#6B6B6B] font-light mb-1">Your Ivory website:</p>
                    <div className="flex items-center justify-between gap-2">
                      <a 
                        href={website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#8B7355] hover:text-[#1A1A1A] transition-colors truncate"
                      >
                        {website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button - Mobile Bottom */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E8E8] safe-bottom backdrop-blur-md bg-white/98">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
