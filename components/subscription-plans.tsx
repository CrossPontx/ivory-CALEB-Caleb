'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe-config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionPlansProps {
  currentTier?: string;
  currentStatus?: string;
}

export function SubscriptionPlans({ currentTier = 'free', currentStatus = 'inactive' }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);

      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start subscription. Please try again.');
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentTier === planId && currentStatus === 'active';
  };

  const isBasicPlan = currentTier === 'free';

  return (
    <div className="space-y-6">
      {/* Basic Tier */}
      <div className={`border ${isBasicPlan ? 'border-[#8B7355]' : 'border-[#E8E8E8]'} p-6 sm:p-8 bg-white`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                Basic
              </h3>
              {isBasicPlan && (
                <span className="px-3 py-1 bg-[#8B7355] text-white text-xs tracking-wider uppercase font-light">
                  Current
                </span>
              )}
            </div>
            <p className="text-sm text-[#6B6B6B] font-light">
              Perfect for trying out the platform
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-serif text-4xl sm:text-5xl font-light text-[#1A1A1A]">$0</div>
            <div className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light mt-1">Forever</div>
          </div>
        </div>
        
        <ul className="space-y-4">
          <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#1A1A1A]">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <span>5 credits on signup</span>
          </li>
          <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#1A1A1A]">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <span>Basic design tools</span>
          </li>
          <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#1A1A1A]">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <span>Community support</span>
          </li>
          <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#6B6B6B]">
            <Check className="h-5 w-5 text-[#6B6B6B] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <span>Upgrade to buy more credits</span>
          </li>
        </ul>
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative border-2 ${
              plan.popular ? 'border-[#8B7355]' : 'border-[#E8E8E8]'
            } ${isCurrentPlan(plan.id) ? 'border-green-600' : ''} p-6 sm:p-8 bg-white`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B7355] text-white text-xs tracking-wider uppercase px-4 py-1.5 font-light z-10">
                Most Popular
              </div>
            )}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs tracking-wider uppercase px-4 py-1.5 font-light z-10">
                Active
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
              <div className="flex-1">
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-[#6B6B6B] font-light">
                  {plan.credits} credits per month
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="font-serif text-4xl sm:text-5xl font-light text-[#1A1A1A]">
                  ${plan.price / 100}
                </div>
                <div className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light mt-1">/month</div>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm sm:text-base font-light text-[#1A1A1A]">
                  <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading !== null || isCurrentPlan(plan.id)}
              className={`w-full h-12 font-light text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                isCurrentPlan(plan.id)
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1} />
                  Processing...
                </>
              ) : isCurrentPlan(plan.id) ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={1} />
                  Current Plan
                </>
              ) : (
                `Subscribe to ${plan.name}`
              )}
            </button>

            {!isCurrentPlan(plan.id) && (
              <p className="text-xs text-center text-[#6B6B6B] font-light mt-4">
                Buy additional credits anytime after subscribing
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5]">
        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight mb-6">
          About Subscriptions
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <div>
              <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Monthly Credits</p>
              <p className="text-xs text-[#6B6B6B] font-light">Refresh on your billing date</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <div>
              <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Credits Roll Over</p>
              <p className="text-xs text-[#6B6B6B] font-light">Unused credits never expire</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <div>
              <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Buy More Anytime</p>
              <p className="text-xs text-[#6B6B6B] font-light">Starting from 5 credits</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <div>
              <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">Cancel Anytime</p>
              <p className="text-xs text-[#6B6B6B] font-light">No long-term commitment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
