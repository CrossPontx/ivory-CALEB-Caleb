// Client-safe Stripe configuration
// This file can be imported in both client and server code

// Subscription plans for CLIENTS (regular users)
export const CLIENT_SUBSCRIPTION_PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 2000, // $20/month in cents
    credits: 15, // 15 credits per month
    interval: 'month' as const,
    userType: 'client' as const,
    features: [
      '15 AI designs per month',
      'Auto-recharge when credits hit 0',
      'Priority support',
      'Advanced design tools',
      'Save favorite designs',
      'Share with nail techs',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 6000, // $60/month in cents
    credits: 40, // 40 credits per month
    interval: 'month' as const,
    userType: 'client' as const,
    features: [
      '40 AI designs per month',
      'Auto-recharge when credits hit 0',
      'Priority support',
      'Advanced design tools',
      'Save unlimited designs',
      'Share with nail techs',
      'Early access to new features',
    ],
    popular: true,
  },
] as const;

// Subscription plans for NAIL TECHS
export const TECH_SUBSCRIPTION_PLANS = [
  {
    id: 'business',
    name: 'Business',
    price: 6000, // $60/month in cents
    credits: 0, // Techs don't use credits
    interval: 'month' as const,
    userType: 'tech' as const,
    features: [
      'Unlimited bookings',
      'Portfolio showcase',
      'Client management',
      'Advanced analytics',
      'Priority listing',
      'Custom branding',
      'Stripe Connect payouts',
    ],
    popular: true,
    freeBookings: 5, // 5 free bookings before subscription required
  },
] as const;

// Combined for backwards compatibility
export const SUBSCRIPTION_PLANS = [
  ...CLIENT_SUBSCRIPTION_PLANS,
  ...TECH_SUBSCRIPTION_PLANS,
] as const;

// Auto-recharge credit packages (when credits hit 0 - only for subscribers)
// Priced at $1.50 per credit
export const CREDIT_PACKAGES = [
  {
    id: 'credits_5',
    name: '5 Credits',
    credits: 5,
    price: 750, // $7.50 in cents ($1.50/credit)
    popular: false,
    pricePerCredit: 150, // $1.50 per credit
  },
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 1500, // $15.00 in cents ($1.50/credit)
    popular: true,
    pricePerCredit: 150, // $1.50 per credit
  },
] as const;

export type ClientSubscriptionPlan = typeof CLIENT_SUBSCRIPTION_PLANS[number];
export type TechSubscriptionPlan = typeof TECH_SUBSCRIPTION_PLANS[number];
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[number];
export type CreditPackage = typeof CREDIT_PACKAGES[number];

export function getSubscriptionPlan(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

export function getClientPlans(): ClientSubscriptionPlan[] {
  return [...CLIENT_SUBSCRIPTION_PLANS];
}

export function getTechPlans(): TechSubscriptionPlan[] {
  return [...TECH_SUBSCRIPTION_PLANS];
}

export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
}
