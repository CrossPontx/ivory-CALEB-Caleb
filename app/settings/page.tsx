'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Bell, Lock, Trash2, HelpCircle, UserX, CreditCard, ChevronRight, Coins } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { ArrowLeft } from 'lucide-react';

export default function ClientSettingsPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userStr);
      
      // Redirect techs to their settings page
      if (user.userType === 'tech') {
        router.push('/tech/settings');
        return;
      }
      
      setSubscriptionTier(user.subscriptionTier || 'free');
      setSubscriptionStatus(user.subscriptionStatus || 'inactive');

      // Load credits
      try {
        const response = await fetch('/api/user/credits');
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error loading credits:', error);
      }
      
      setLoading(false);
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, variant = 'default' }: any) => (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center justify-between group active:scale-[0.98] transition-all duration-200 ${
        variant === 'danger' 
          ? 'bg-red-50 border-b border-red-100 active:bg-red-100' 
          : 'bg-white border-b border-[#E8E8E8] active:bg-[#F8F7F5]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Icon className={`w-5 h-5 flex-shrink-0 ${variant === 'danger' ? 'text-red-600' : 'text-[#6B6B6B]'}`} strokeWidth={1.5} />
        <div className="text-left min-w-0 flex-1">
          <p className={`text-sm font-light ${variant === 'danger' ? 'text-red-600' : 'text-[#1A1A1A]'}`}>{title}</p>
          {subtitle && (
            <p className={`text-xs font-light mt-0.5 truncate ${variant === 'danger' ? 'text-red-500' : 'text-[#6B6B6B]'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform group-active:translate-x-1 ${
        variant === 'danger' ? 'text-red-600' : 'text-[#6B6B6B]'
      }`} strokeWidth={1.5} />
    </button>
  );

  return (
    <div className="min-h-screen bg-white pb-20 lg:pl-20">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
          </button>
          <h1 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
            Settings
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto pb-safe">
        {/* Privacy & Security */}
        <div className="mt-6">
          <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Privacy & Security</p>
          <div className="bg-white">
            <SettingItem
              icon={Shield}
              title="Privacy & Data"
              onClick={() => router.push('/settings/privacy')}
            />
            <SettingItem
              icon={Lock}
              title="Account Security"
              onClick={() => router.push('/settings/account')}
            />
            <SettingItem
              icon={UserX}
              title="Blocked Users"
              onClick={() => router.push('/settings/blocked-users')}
            />
          </div>
        </div>

        {/* Billing & Subscription */}
        <div className="mt-6">
          <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Billing & Subscription</p>
          <div className="bg-white">
            <SettingItem
              icon={CreditCard}
              title="Manage Subscription"
              subtitle={subscriptionTier !== 'free' && subscriptionStatus === 'active' 
                ? `${subscriptionTier === 'pro' ? 'Pro' : 'Business'} Plan` 
                : 'Basic Plan'}
              onClick={() => router.push('/billing')}
            />
          </div>
        </div>

        {/* Credits */}
        <div className="mt-6">
          <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Credits</p>
          <div className="bg-white">
            <SettingItem
              icon={Coins}
              title="Credits & Referrals"
              subtitle={credits !== null ? `${credits} credits available` : 'Loading...'}
              onClick={() => router.push('/settings/credits')}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="mt-6">
          <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Preferences</p>
          <div className="bg-white">
            <SettingItem
              icon={Bell}
              title="Notifications"
              onClick={() => router.push('/settings/notifications')}
            />
          </div>
        </div>

        {/* Support */}
        <div className="mt-6">
          <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Support</p>
          <div className="bg-white">
            <SettingItem
              icon={HelpCircle}
              title="Get Help"
              onClick={() => router.push('/settings/help')}
            />
          </div>
        </div>

        {/* Legal */}
        <div className="mt-6">
          <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-[#8B7355] font-light">Legal</p>
          <div className="bg-white">
            <SettingItem
              icon={Shield}
              title="Terms of Use"
              onClick={() => router.push('/terms')}
            />
            <SettingItem
              icon={Lock}
              title="Privacy Policy"
              onClick={() => router.push('/privacy-policy')}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 mb-6">
          <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-red-600 font-light">Danger Zone</p>
          <div className="bg-white">
            <SettingItem
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete your account and all data"
              onClick={() => router.push('/settings/delete-account')}
              variant="danger"
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
