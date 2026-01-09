"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, BellOff, Loader2, Smartphone, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  isNative, 
  requestNotificationPermission, 
  getNotificationPermissionStatus 
} from "@/lib/native-bridge"

interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  bookingReminders: boolean
  designRequests: boolean
  promotions: boolean
  creditAlerts: boolean
}

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isNativeApp, setIsNativeApp] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    bookingReminders: true,
    designRequests: true,
    promotions: false,
    creditAlerts: true,
  })

  useEffect(() => {
    const loadSettings = async () => {
      // Check if running in native app
      setIsNativeApp(isNative())
      
      // Check notification permission status
      const status = await getNotificationPermissionStatus()
      setPermissionGranted(status.authorized)
      
      // Load saved settings from localStorage
      const savedSettings = localStorage.getItem('notificationSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      
      setLoading(false)
    }
    
    loadSettings()
  }, [])

  const handleRequestPermission = async () => {
    setSaving(true)
    const result = await requestNotificationPermission()
    setPermissionGranted(result.granted)
    
    if (result.granted) {
      setSettings(prev => ({ ...prev, pushEnabled: true }))
    }
    setSaving(false)
  }

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings))
  }

  const SettingRow = ({ 
    icon: Icon, 
    title, 
    description, 
    settingKey, 
    disabled = false 
  }: { 
    icon: any
    title: string
    description: string
    settingKey: keyof NotificationSettings
    disabled?: boolean
  }) => (
    <div className={`flex items-center justify-between py-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="w-5 h-5 text-[#6B6B6B] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-light text-[#1A1A1A]">{title}</p>
          <p className="text-xs text-[#6B6B6B] font-light mt-0.5">{description}</p>
        </div>
      </div>
      <Switch
        checked={settings[settingKey]}
        onCheckedChange={(checked) => updateSetting(settingKey, checked)}
        disabled={disabled}
        className="flex-shrink-0 ml-3"
      />
    </div>
  )

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
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
          </button>
          <h1 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
            Notifications
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Push Notification Permission Banner */}
        {isNativeApp && !permissionGranted && (
          <div className="bg-[#F8F7F5] border border-[#E8E8E8] p-4 mb-6">
            <div className="flex items-start gap-3">
              <BellOff className="w-5 h-5 text-[#8B7355] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-sm font-light text-[#1A1A1A]">
                  Push notifications are disabled
                </p>
                <p className="text-xs text-[#6B6B6B] font-light mt-1">
                  Enable notifications to get updates about bookings, design requests, and more.
                </p>
                <Button
                  onClick={handleRequestPermission}
                  disabled={saving}
                  className="mt-3 h-10 bg-[#1A1A1A] text-white hover:bg-[#8B7355] text-xs tracking-[0.15em] uppercase rounded-none font-light"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Enable Notifications'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Permission Granted Banner */}
        {isNativeApp && permissionGranted && (
          <div className="bg-green-50 border border-green-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-green-600 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-sm font-light text-green-800">
                Push notifications are enabled
              </p>
            </div>
          </div>
        )}

        {/* Notification Channels */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light mb-4">
            Notification Channels
          </p>
          <div className="border border-[#E8E8E8] divide-y divide-[#E8E8E8]">
            <div className="px-4">
              <SettingRow
                icon={Smartphone}
                title="Push Notifications"
                description="Receive notifications on your device"
                settingKey="pushEnabled"
                disabled={isNativeApp && !permissionGranted}
              />
            </div>
            <div className="px-4">
              <SettingRow
                icon={Mail}
                title="Email Notifications"
                description="Receive important updates via email"
                settingKey="emailEnabled"
              />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light mb-4">
            Notification Types
          </p>
          <div className="border border-[#E8E8E8] divide-y divide-[#E8E8E8]">
            <div className="px-4">
              <SettingRow
                icon={Bell}
                title="Booking Reminders"
                description="Get reminded about upcoming appointments"
                settingKey="bookingReminders"
              />
            </div>
            <div className="px-4">
              <SettingRow
                icon={MessageSquare}
                title="Design Requests"
                description="Notifications about new design requests and responses"
                settingKey="designRequests"
              />
            </div>
            <div className="px-4">
              <SettingRow
                icon={Bell}
                title="Credit Alerts"
                description="Get notified when your credits are running low"
                settingKey="creditAlerts"
              />
            </div>
            <div className="px-4">
              <SettingRow
                icon={Bell}
                title="Promotions & Updates"
                description="News about new features and special offers"
                settingKey="promotions"
              />
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-xs text-[#6B6B6B] font-light text-center">
          You can change these settings at any time. Some notifications may still be sent for important account-related updates.
        </p>
      </main>
    </div>
  )
}
