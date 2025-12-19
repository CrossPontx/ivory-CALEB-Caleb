// Client-safe Stripe configuration
// This file can be imported in both client and server code

// Subscription plans for CLIENTS (regular users)
export const CLIENT_SUBSCRIPTION_PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 2000, // $20/month in cents
    credits: 20,
    interval: 'month' as const,
    userType: 'client' as const,
    features: [
      '20 AI designs per month',
      'Buy additional credits anytime',
      'Priority support',
      'Advanced design tools',
      'Save favorite designs',
      'Share with nail techs',
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

// One-time credit packages (for additional credits - only for paid subscribers)
export const CREDIT_PACKAGES = [
  {
    id: 'credits_5',
    name: '5 Credits',
    credits: 5,
    price: 499, // $4.99 in cents
    popular: false,
    savings: undefined,
  },
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 899, // $8.99 in cents
    popular: false,
    savings: '10%',
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 1999, // $19.99 in cents
    popular: true,
    savings: '20%',
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 3499, // $34.99 in cents
    popular: false,
    savings: '30%',
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 5999, // $59.99 in cents
    popular: false,
    savings: '40%',
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
