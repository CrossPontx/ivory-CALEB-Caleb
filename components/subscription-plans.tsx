'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { CLIENT_SUBSCRIPTION_PLANS, TECH_SUBSCRIPTION_PLANS, getClientPlans, getTechPlans } from '@/lib/stripe-config';
import { iapManager, IAP_PRODUCT_IDS } from '@/lib/iap';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionPlansProps {
  currentTier?: string;
  currentStatus?: string;
  isNative?: boolean;
  userType?: 'client' | 'tech';
}

export function SubscriptionPlans({ currentTier = 'free', currentStatus = 'inactive', isNative = false, userType = 'client' }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [iapProducts, setIapProducts] = useState<any[]>([]);
  const [iapLoading, setIapLoading] = useState(false);
  const [iapError, setIapError] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  
  // Get plans based on user type
  const plans = userType === 'tech' ? getTechPlans() : getClientPlans();

  useEffect(() => {
    if (isNative) {
      loadIAPProducts();
      setupIAPListeners();
    }
  }, [isNative]);

  const loadIAPProducts = async () => {
    try {
      setIapLoading(true);
      setIapError(null);
      console.log('🔵 Loading IAP products...');
      
      const products = await iapManager.loadProducts();
      console.log(`✅ Loaded ${products.length} IAP products`);
      
      setIapProducts(products);
      
      if (products.length === 0) {
        const errorMsg = 'No subscription products available. Please check your internet connection and try again.';
        setIapError(errorMsg);
        console.error('❌', errorMsg);
      } else {
        products.forEach(p => {
          console.log(`📦 ${p.productId}: ${p.title} - ${p.priceString}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to load IAP products:', error);
      const errorMsg = 'Failed to load subscription options. Please try again.';
      setIapError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIapLoading(false);
    }
  };

  const setupIAPListeners = () => {
    iapManager.onPurchaseComplete(async (result) => {
      try {
        // Validate with server
        const response = await fetch('/api/iap/validate-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Ensure cookies are sent
          body: JSON.stringify({
            receipt: result.receipt,
            productId: result.productId,
            transactionId: result.transactionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Show success toast with subscription details
          toast.success(
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Subscription Activated!</p>
                <p className="text-sm text-gray-600 mt-1">
                  {data.added} credits added to your account
                </p>
              </div>
            </div>,
            { duration: 5000 }
          );
          
          // Finish the transaction
          await iapManager.finishTransaction(result.transactionId);
          
          // Update local state to show subscribed status immediately
          setLoading('success');
          setShowSuccessBanner(true);
          
          // Wait a moment to show success state, then reload
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error('Validation failed');
        }
      } catch (error) {
        console.error('Purchase validation error:', error);
        toast.error('Failed to activate subscription. Please contact support.');
        setLoading(null);
      }
    });

    iapManager.onPurchaseError((error) => {
      console.error('Purchase error:', error);
      toast.error(error.errorMessage || 'Purchase failed');
      setLoading(null);
    });
  };

  const handleSubscribeIAP = async (planId: string) => {
    try {
      setLoading(planId);
      console.log('🔵 Starting IAP purchase for plan:', planId);
      
      // Check if IAP is available
      if (!iapManager.isNativePlatform()) {
        throw new Error('IAP is only available on iOS devices');
      }
      
      // Check if products are loaded
      if (iapProducts.length === 0) {
        console.error('❌ No IAP products loaded');
        toast.error('Subscription products not loaded. Please try reloading the app.');
        setLoading(null);
        return;
      }
      
      // Map plan ID to IAP product ID
      const productId = planId === 'pro' 
        ? IAP_PRODUCT_IDS.PRO_MONTHLY 
        : IAP_PRODUCT_IDS.BUSINESS_MONTHLY;

      console.log('🔵 Mapped to product ID:', productId);
      console.log('🔵 Available IAP products:', iapProducts.map(p => p.productId).join(', '));

      // Check if product is available
      const product = iapProducts.find(p => p.productId === productId);
      if (!product) {
        console.error('❌ Product not found in available products');
        console.error('❌ Looking for:', productId);
        console.error('❌ Available:', iapProducts.map(p => p.productId));
        toast.error('This subscription is not available. Please try reloading the app.');
        setLoading(null);
        return;
      }

      console.log('✅ Product found:', product.title, '-', product.priceString);
      console.log('🔵 Initiating purchase...');
      
      await iapManager.purchase(productId);
      console.log('✅ Purchase initiated successfully');
      
      // Loading state will be cleared by purchase listener
    } catch (error) {
      console.error('❌ IAP purchase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start purchase';
      toast.error(errorMessage);
      setLoading(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    console.log('🔵 handleSubscribe called with planId:', planId);
    console.log('🔵 isNative:', isNative);
    console.log('🔵 loading state:', loading);
    console.log('🔵 iapProducts loaded:', iapProducts.length);
    
    if (isNative) {
      console.log('🔵 Using IAP flow');
      return handleSubscribeIAP(planId);
    }
    
    try {
      setLoading(planId);
      console.log('Starting Stripe subscription flow for plan:', planId);

      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      console.log('Stripe API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const { url } = await response.json();
      console.log('Checkout URL received:', url);

      if (url) {
        console.log('Redirecting to Stripe checkout...');
        // Show loading state while redirecting
        toast.loading('Redirecting to secure checkout...', { duration: 2000 });
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start subscription. Please try again.');
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentTier === planId && currentStatus === 'active';
  };

  const isBasicPlan = currentTier === 'free';

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="border-2 border-green-600 p-6 sm:p-8 bg-green-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 border-2 border-green-600 flex items-center justify-center flex-shrink-0 bg-white rounded-full">
              <Check className="w-6 h-6 text-green-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl sm:text-2xl font-light text-green-900 mb-2 tracking-tight">
                Welcome to Pro! 🎉
              </h3>
              <p className="text-sm sm:text-base text-green-800 leading-relaxed font-light mb-4">
                Your subscription is now active. Credits have been added to your account and you can start creating amazing designs right away!
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Sparkles className="h-4 w-4" strokeWidth={1} />
                  <span>Monthly credits added</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="h-4 w-4" strokeWidth={1} />
                  <span>Premium features unlocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IAP Loading State */}
      {isNative && iapLoading && (
        <div className="border border-[#E8E8E8] p-8 bg-white text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#8B7355]" strokeWidth={1} />
          <p className="text-sm text-[#6B6B6B] font-light">Loading subscription options...</p>
        </div>
      )}

      {/* IAP Error State */}
      {isNative && iapError && !iapLoading && (
        <div className="border border-red-200 p-6 bg-red-50">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 border border-red-200 flex items-center justify-center flex-shrink-0 bg-white">
              <Sparkles className="w-6 h-6 text-red-600" strokeWidth={1} />
            </div>
            <div className="flex-1">
              <p className="font-serif text-base font-light text-red-900 mb-1">Unable to Load Subscriptions</p>
              <p className="text-sm text-red-700 font-light">{iapError}</p>
            </div>
          </div>
          <Button 
            onClick={loadIAPProducts}
            variant="outline"
            size="sm"
            className="w-full border-red-300 text-red-700 hover:bg-red-50"
          >
            Retry
          </Button>
        </div>
      )}

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
          {userType === 'tech' && (
            <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#1A1A1A]">
              <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
              <span>5 free bookings</span>
            </li>
          )}
          <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#1A1A1A]">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <span>Basic design tools</span>
          </li>
          <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#1A1A1A]">
            <Check className="h-5 w-5 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1} />
            <span>Community support</span>
          </li>
          {userType === 'client' && (
            <li className="flex items-start gap-3 text-sm sm:text-base font-light text-[#6B6B6B]">
              <Check className="h-5 w-5 text-[#6B6B6B] flex-shrink-0 mt-0.5" strokeWidth={1} />
              <span>Upgrade to buy more credits</span>
            </li>
          )}
        </ul>
      </div>

      {/* Subscription Plans */}
      <div className={`grid ${plans.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
        {plans.map((plan) => (
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
                  {userType === 'tech' 
                    ? 'Unlimited bookings' 
                    : `${plan.credits} credits per month`}
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

            <Button
              onClick={() => {
                console.log('🔵 Button clicked for plan:', plan.id);
                handleSubscribe(plan.id);
              }}
              disabled={
                loading !== null || 
                isCurrentPlan(plan.id) || 
                (isNative && (iapLoading || iapProducts.length === 0))
              }
              type="button"
              className={`w-full h-14 sm:h-12 font-light text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
                loading === 'success'
                  ? 'bg-green-600 text-white cursor-default hover:bg-green-600'
                  : isCurrentPlan(plan.id)
                  ? 'bg-green-600 text-white cursor-default hover:bg-green-600'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 active:scale-[0.97] active:bg-[#1A1A1A]/80'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              {loading === 'success' ? (
                <>
                  <Check className="h-5 w-5 animate-pulse" strokeWidth={2} />
                  Subscribed!
                </>
              ) : loading === plan.id ? (
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
            </Button>

            {!isCurrentPlan(plan.id) && (
              <div className="mt-4 space-y-2">
                {userType === 'client' && (
                  <p className="text-xs text-center text-[#6B6B6B] font-light">
                    Buy additional credits anytime after subscribing
                  </p>
                )}
                {userType === 'tech' && 'freeBookings' in plan && (
                  <p className="text-xs text-center text-[#6B6B6B] font-light">
                    First {plan.freeBookings} bookings free, then subscription required
                  </p>
                )}
                <p className="text-xs text-center text-[#6B6B6B] font-light">
                  By subscribing, you agree to our{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#8B7355]">
                    Terms of Use
                  </a>
                  {' '}and{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#8B7355]">
                    Privacy Policy
                  </a>
                </p>
              </div>
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
