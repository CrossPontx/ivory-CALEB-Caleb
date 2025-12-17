'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/bottom-nav';
import { BuyCreditsDialog } from '@/components/buy-credits-dialog';
import { SubscriptionPlans } from '@/components/subscription-plans';
import { ReferralCard } from '@/components/referral-card';
import { useIsAppleWatch } from '@/components/watch-optimized-layout';
import {
  Shield,
  Bell,
  Lock,
  Trash2,
  HelpCircle,
  UserX,
  Coins,
  CreditCard,
  History,
  Sparkles,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { CREDIT_PACKAGES } from '@/lib/stripe-config';
import { toast } from 'sonner';

interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const isWatch = useIsAppleWatch();
  const [username, setUsername] = useState('');
  const [credits, setCredits] = useState<number | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'billing' | 'credits'>('overview');

  useEffect(() => {
    // Check for payment success/cancel
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const canceled = urlParams.get('canceled');

      if (success === 'true') {
        toast.success('Payment successful! Your credits will be added shortly.');
        window.history.replaceState({}, '', '/settings');
      } else if (canceled === 'true') {
        toast.error('Payment canceled. You can try again anytime.');
        window.history.replaceState({}, '', '/settings');
      }
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsername(user.username);
        setSubscriptionTier(user.subscriptionTier || 'free');
        setSubscriptionStatus(user.subscriptionStatus || 'inactive');
        setCredits(user.credits || 0);
      }

      // Fetch current credits balance
      const balanceResponse = await fetch('/api/credits/balance');
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setCredits(balanceData.credits);
      }

      // Fetch transactions
      const response = await fetch('/api/credits/history');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPaidPlan = subscriptionTier !== 'free' && subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top ${isWatch ? 'watch-compact' : ''}`}>
        <div className={`max-w-screen-xl mx-auto ${isWatch ? 'px-3 py-2' : 'px-5 sm:px-6 py-4 sm:py-5'}`}>
          <h1 className={`font-serif font-light text-[#1A1A1A] tracking-tight ${isWatch ? 'text-sm' : 'text-xl sm:text-2xl'}`}>
            SETTINGS
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-4xl mx-auto pb-28 sm:pb-32 ${isWatch ? 'px-3 py-3' : 'px-4 sm:px-6 py-6 sm:py-8'}`}>
        {/* Section Navigation */}
        <div className="border-b border-[#E8E8E8] mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveSection('overview')}
              className={`pb-4 border-b-2 text-sm tracking-[0.2em] uppercase font-light transition-all ${
                activeSection === 'overview'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('billing')}
              className={`pb-4 border-b-2 text-sm tracking-[0.2em] uppercase font-light transition-all ${
                activeSection === 'billing'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              Billing
            </button>
            <button
              onClick={() => setActiveSection('credits')}
              className={`pb-4 border-b-2 text-sm tracking-[0.2em] uppercase font-light transition-all ${
                activeSection === 'credits'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              Credits
            </button>
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Account Info */}
            <div className="border border-[#E8E8E8] p-6 bg-[#F8F7F5]">
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Account</p>
              <h2 className="font-serif text-2xl font-light text-[#1A1A1A] tracking-tight mb-4">{username}</h2>
              <div className="flex items-center gap-2">
                {isPaidPlan ? (
                  <>
                    <Crown className="h-4 w-4 text-[#8B7355]" strokeWidth={1} />
                    <span className="text-sm text-[#6B6B6B] font-light">
                      {subscriptionTier === 'pro' ? 'Pro' : 'Business'} Plan
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-[#6B6B6B] font-light">Basic Plan</span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Quick Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('billing')}
                  className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-[#E8E8E8] flex items-center justify-center bg-[#F8F7F5]">
                      <CreditCard className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-base font-light text-[#1A1A1A]">Billing & Subscriptions</p>
                      <p className="text-xs text-[#6B6B6B] font-light">Manage your plan and payments</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
                </button>

                <button
                  onClick={() => setActiveSection('credits')}
                  className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border border-[#E8E8E8] flex items-center justify-center bg-[#F8F7F5]">
                      <Coins className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                    </div>
                    <div className="text-left">
                      <p className="font-serif text-base font-light text-[#1A1A1A]">Credits & Referrals</p>
                      <p className="text-xs text-[#6B6B6B] font-light">
                        {credits !== null ? `${credits} credits available` : 'Loading...'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
                </button>
              </div>
            </div>

            {/* Settings Sections */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Privacy & Security</p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/settings/privacy')}
                  className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Shield className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                    <div className="text-left">
                      <p className="font-serif text-base font-light text-[#1A1A1A]">Privacy & Data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
                </button>

                <button
                  onClick={() => router.push('/settings/account')}
                  className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Lock className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                    <div className="text-left">
                      <p className="font-serif text-base font-light text-[#1A1A1A]">Account Security</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
                </button>

                <button
                  onClick={() => router.push('/settings/blocked-users')}
                  className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <UserX className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                    <div className="text-left">
                      <p className="font-serif text-base font-light text-[#1A1A1A]">Blocked Users</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Preferences</p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/settings/notifications')}
                  className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                    <div className="text-left">
                      <p className="font-serif text-base font-light text-[#1A1A1A]">Notifications</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Support</p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/settings/help')}
                  className="w-full border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <HelpCircle className="w-5 h-5 text-[#6B6B6B]" strokeWidth={1} />
                    <div className="text-left">
                      <p className="font-serif text-base font-light text-[#1A1A1A]">Get Help</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#8B7355] transition-colors" strokeWidth={1} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-red-600 mb-4 font-light">Danger Zone</p>
              <button
                onClick={() => router.push('/settings/delete-account')}
                className="w-full border border-red-200 p-4 bg-white hover:border-red-500 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <Trash2 className="w-5 h-5 text-red-600" strokeWidth={1} />
                  <div className="text-left">
                    <p className="font-serif text-base font-light text-red-600">Delete Account</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" strokeWidth={1} />
              </button>
            </div>
          </div>
        )}

        {/* Billing Section */}
        {activeSection === 'billing' && (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="border border-[#E8E8E8] p-6 bg-[#F8F7F5]">
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Current Plan</p>
              <h2 className="font-serif text-2xl font-light text-[#1A1A1A] tracking-tight mb-2">
                {isPaidPlan ? (subscriptionTier === 'pro' ? 'Pro' : 'Business') : 'Basic'}
              </h2>
              <p className="text-sm text-[#6B6B6B] font-light">
                {isPaidPlan ? 'Active subscription' : 'Free plan'}
              </p>
            </div>

            {/* Subscription Plans */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Plans</p>
              <SubscriptionPlans currentTier={subscriptionTier} currentStatus={subscriptionStatus} />
            </div>
          </div>
        )}

        {/* Credits Section */}
        {activeSection === 'credits' && (
          <div className="space-y-8">
            {/* Balance */}
            <div className="border border-[#E8E8E8] p-6 bg-[#F8F7F5]">
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Your Balance</p>
              <h2 className="font-serif text-3xl font-light text-[#1A1A1A] tracking-tight">
                {credits !== null ? credits : '...'} <span className="text-xl text-[#6B6B6B]">Credits</span>
              </h2>
            </div>

            {/* Referral Card */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Earn Free Credits</p>
              <ReferralCard />
            </div>

            {/* Buy Credits - Only for paid users */}
            {isPaidPlan && (
              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Purchase Credits</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <BuyCreditsDialog key={pkg.id}>
                      <div className="border border-[#E8E8E8] p-6 bg-white cursor-pointer hover:border-[#8B7355] active:scale-[0.98] transition-all duration-300 group">
                        <div className="text-center">
                          <div className="text-4xl font-light text-[#1A1A1A] mb-2 group-hover:text-[#8B7355] transition-colors">
                            {pkg.credits}
                          </div>
                          <div className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-4 font-light">credits</div>
                          <div className="text-2xl font-light text-[#1A1A1A] mb-2">
                            ${(pkg.price / 100).toFixed(2)}
                          </div>
                          {pkg.savings && (
                            <div className="text-xs text-green-600 font-light">Save {pkg.savings}</div>
                          )}
                        </div>
                      </div>
                    </BuyCreditsDialog>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4 font-light">Transaction History</p>
              {loading ? (
                <div className="border border-[#E8E8E8] p-12 text-center bg-white">
                  <div className="w-12 h-12 border-2 border-[#E8E8E8] border-t-[#8B7355] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-[#6B6B6B] font-light">Loading...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="border border-[#E8E8E8] p-12 text-center bg-white">
                  <History className="w-8 h-8 text-[#6B6B6B] mx-auto mb-4" strokeWidth={1} />
                  <p className="text-sm text-[#6B6B6B] font-light">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-[#E8E8E8] p-4 bg-white hover:border-[#8B7355] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-base font-light text-[#1A1A1A] mb-1 truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">
                            {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p
                            className={`text-xl font-light ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-[#1A1A1A]'
                            }`}
                          >
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount}
                          </p>
                          <p className="text-xs text-[#6B6B6B] font-light whitespace-nowrap">
                            Balance: {transaction.balanceAfter}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  );
}
