'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Capacitor } from '@capacitor/core';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins, Check, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { CREDIT_PACKAGES } from '@/lib/stripe-config';
import { iapManager, IAP_PRODUCT_IDS, PRODUCT_CREDITS } from '@/lib/iap';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BuyCreditsDialogProps {
  children?: React.ReactNode;
}

export function BuyCreditsDialog({ children }: BuyCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative && open) {
      setupIAPListeners();
    }
  }, [isNative, open]);

  const setupIAPListeners = () => {
    iapManager.onPurchaseComplete(async (result) => {
      try {
        // Validate with server
        const response = await fetch('/api/iap/validate-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receipt: result.receipt,
            productId: result.productId,
            transactionId: result.transactionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const credits = PRODUCT_CREDITS[result.productId] || 0;
          toast.success(`Success! ${credits} credits added to your account.`);
          
          // Finish the transaction
          await iapManager.finishTransaction(result.transactionId);
          
          // Close dialog and reload
          setOpen(false);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          throw new Error('Validation failed');
        }
      } catch (error) {
        console.error('Purchase validation error:', error);
        toast.error('Failed to add credits. Please contact support.');
      } finally {
        setLoading(null);
      }
    });

    iapManager.onPurchaseError((error) => {
      console.error('Purchase error:', error);
      toast.error(error.errorMessage || 'Purchase failed');
      setLoading(null);
    });
  };

  const handlePurchaseIAP = async (packageId: string, credits: number) => {
    try {
      setLoading(packageId);
      
      // Map credits to IAP product ID
      const productIdKey = `CREDITS_${credits}` as keyof typeof IAP_PRODUCT_IDS;
      const productId = IAP_PRODUCT_IDS[productIdKey];

      if (!productId) {
        throw new Error('Product not found');
      }

      await iapManager.purchase(productId);
      // Loading state will be cleared by purchase listener
    } catch (error) {
      console.error('IAP purchase error:', error);
      toast.error('Failed to start purchase');
      setLoading(null);
    }
  };

  const handlePurchaseStripe = async (packageId: string) => {
    try {
      setLoading(packageId);

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }));
        
        if (response.status === 403) {
          toast.error('Please subscribe to a plan first to purchase additional credits.');
          setTimeout(() => {
            window.location.href = '/billing';
          }, 2000);
          return;
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const handlePurchase = async (packageId: string, credits: number) => {
    if (isNative) {
      return handlePurchaseIAP(packageId, credits);
    }
    return handlePurchaseStripe(packageId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Coins className="h-4 w-4" />
            Buy Credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Buy Credits</DialogTitle>
          <DialogDescription>
            Choose a credit package to continue generating AI nail designs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Payment Methods Info */}
          {!isNative && (
            <div className="flex items-center justify-center gap-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Credit Card</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Apple Pay</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.59 3.475A5.1 5.1 0 0 0 20.15.03a5.1 5.1 0 0 0-3.44 3.444 5.1 5.1 0 0 0 3.44 3.445 5.1 5.1 0 0 0 3.44-3.445zm-3.44 17.05a5.1 5.1 0 0 0-3.44 3.444 5.1 5.1 0 0 0 3.44 3.445 5.1 5.1 0 0 0 3.44-3.445 5.1 5.1 0 0 0-3.44-3.445zM.41 3.475A5.1 5.1 0 0 1 3.85.03a5.1 5.1 0 0 1 3.44 3.444A5.1 5.1 0 0 1 3.85 6.92a5.1 5.1 0 0 1-3.44-3.445zm3.44 17.05a5.1 5.1 0 0 1 3.44 3.444A5.1 5.1 0 0 1 3.85 27.414a5.1 5.1 0 0 1-3.44-3.445 5.1 5.1 0 0 1 3.44-3.445z"/>
                </svg>
                <span>Cash App</span>
              </div>
            </div>
          )}

          {isNative && (
            <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Secure payment via Apple In-App Purchase</span>
            </div>
          )}

          {/* Credit Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative p-6 cursor-pointer transition-all hover:shadow-lg ${
                  pkg.popular
                    ? 'border-2 border-primary shadow-md'
                    : 'border hover:border-primary/50'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pkg.credits} AI generations
                      </p>
                    </div>
                    <Coins className="h-8 w-8 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        ${(pkg.price / 100).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                    {pkg.savings && (
                      <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-1 rounded">
                        <Check className="h-3 w-3" />
                        Save {pkg.savings}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Instant delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Never expires</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Secure payment</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handlePurchase(pkg.id, pkg.credits)}
                    disabled={loading !== null}
                  >
                    {loading === pkg.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Purchase'
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {isNative 
              ? 'Secure payment powered by Apple. Managed through iOS Settings.'
              : 'Secure payment powered by Stripe. Your payment information is encrypted and secure.'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
