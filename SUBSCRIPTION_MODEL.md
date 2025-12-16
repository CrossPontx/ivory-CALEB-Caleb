# Subscription Revenue Model 🚀

## Overview

The app now features a subscription-based revenue model with two premium tiers, plus the ability to purchase additional credits on top of subscriptions.

## Pricing Tiers

### Free Tier
- **Price**: $0
- **Credits**: 5 on signup
- **Features**:
  - Buy credits as needed
  - Basic design tools
  - Community support

### Pro Tier ⭐
- **Price**: $20/month
- **Credits**: 20 per month
- **Features**:
  - 20 AI designs per month
  - Priority support
  - Advanced design tools
  - Portfolio showcase
  - Client booking system

### Business Tier 💼
- **Price**: $60/month
- **Credits**: 60 per month
- **Features**:
  - 60 AI designs per month
  - Everything in Pro
  - Team collaboration tools
  - Advanced analytics
  - Priority design queue
  - Custom branding
  - API access

## Additional Credits

Users on any tier (including subscriptions) can purchase additional credits:

| Package | Credits | Price | Per Credit | Savings |
|---------|---------|-------|------------|---------|
| Small | 10 | $9.99 | $1.00 | - |
| Medium | 25 | $19.99 | $0.80 | 20% |
| Large | 50 | $34.99 | $0.70 | 30% |
| XL | 100 | $59.99 | $0.60 | 40% |

## How It Works

### For Subscribers

1. **Monthly Credits**
   - Credits refresh on billing date
   - Unused credits roll over
   - No expiration

2. **Additional Purchases**
   - Buy extra credits anytime
   - Discounted rates for subscribers
   - Instant delivery

3. **Flexible Usage**
   - Use subscription credits first
   - Purchase more when needed
   - No commitment required

### For Free Users

1. **Pay As You Go**
   - Start with 5 free credits
   - Buy credits when needed
   - No monthly fees

2. **Upgrade Anytime**
   - Switch to Pro or Business
   - Get monthly credits
   - Access premium features

## Database Schema

### Users Table Updates

```typescript
{
  // Existing fields...
  subscriptionTier: 'free' | 'pro' | 'business'
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'inactive'
  stripeCustomerId: string
  stripeSubscriptionId: string
  subscriptionCurrentPeriodEnd: timestamp
}
```

## API Routes

### Create Subscription
**POST** `/api/stripe/create-subscription`

Creates a Stripe Checkout session for subscription.

```typescript
{
  planId: 'pro' | 'business'
}
```

### Webhook Events Handled

- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Cancel subscription
- `invoice.payment_succeeded` - Add monthly credits
- `payment_intent.payment_failed` - Handle failed payments

## Components

### SubscriptionPlans
Displays all subscription tiers with features and pricing.

```tsx
import { SubscriptionPlans } from '@/components/subscription-plans';

<SubscriptionPlans 
  currentTier="free"
  currentStatus="inactive"
/>
```

**Features:**
- Visual tier comparison
- Feature lists
- Current plan indicator
- Subscribe buttons
- Popular badge

### Updated Billing Page
Now includes tabs for:
- **Subscriptions** - View and manage plans
- **Buy Credits** - Purchase additional credits

## User Flow

### Subscribing to Pro/Business

```
Billing Page
  ↓
Click "Subscriptions" tab
  ↓
View plan comparison
  ↓
Click "Subscribe to Pro/Business"
  ↓
Stripe Checkout
  ↓
Complete payment
  ↓
Subscription activated
  ↓
Monthly credits added
```

### Buying Additional Credits

```
Billing Page
  ↓
Click "Buy Credits" tab
  ↓
Select credit package
  ↓
Complete purchase
  ↓
Credits added instantly
```

## Subscription Benefits

### Pro Plan ($20/month)
- **Value**: $1/credit vs $1/credit one-time
- **Savings**: Consistent monthly credits
- **Features**: Priority support, advanced tools

### Business Plan ($60/month)
- **Value**: $1/credit vs $1/credit one-time
- **Savings**: Best for high-volume users
- **Features**: Team tools, analytics, API access

## Credit Management

### Monthly Refresh
- Credits added automatically on billing date
- Webhook: `invoice.payment_succeeded`
- Transaction logged in history

### Rollover Policy
- Unused credits carry over
- No expiration
- Accumulate over time

### Additional Purchases
- Available to all users
- Instant delivery
- Separate from subscription credits

## Stripe Configuration

### Products to Create in Stripe Dashboard

1. **Pro Subscription**
   - Name: "Pro Plan"
   - Price: $20/month
   - Recurring: Monthly

2. **Business Subscription**
   - Name: "Business Plan"
   - Price: $60/month
   - Recurring: Monthly

### Webhook Events to Enable

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.payment_failed`

## Testing

### Test Subscription Flow

1. Go to `/billing`
2. Click "Subscriptions" tab
3. Select Pro or Business
4. Use test card: `4242 4242 4242 4242`
5. Verify subscription activated
6. Check credits added

### Test Credit Purchase

1. Go to `/billing`
2. Click "Buy Credits" tab
3. Select package
4. Complete purchase
5. Verify credits added

## Migration

### Existing Users

Existing users remain on free tier:
- Keep current credits
- Can upgrade anytime
- No forced migration

### Database Migration

Run migration to add new fields:

```bash
yarn db:generate
yarn db:push
```

## Revenue Projections

### Monthly Recurring Revenue (MRR)

- **100 Pro users**: $2,000/month
- **50 Business users**: $3,000/month
- **Total MRR**: $5,000/month

### Additional Credit Sales

- Average $500-1,000/month
- Supplements subscription revenue
- Higher margins

## Customer Segments

### Free Users
- Casual users
- Trying the platform
- Occasional designs

### Pro Subscribers
- Regular users
- Nail techs
- Small businesses

### Business Subscribers
- Salons
- Multiple techs
- High volume

## Competitive Advantages

1. **Flexible Model**
   - Subscribe or pay-as-you-go
   - Buy additional credits
   - No lock-in

2. **Fair Pricing**
   - $1/credit baseline
   - Volume discounts
   - Rollover credits

3. **Premium Features**
   - Team collaboration
   - Advanced analytics
   - API access

## Future Enhancements

- [ ] Annual billing (save 20%)
- [ ] Team management for Business
- [ ] Usage analytics dashboard
- [ ] API access for Business
- [ ] Custom branding options
- [ ] Priority support queue
- [ ] Referral rewards for subscribers

## Summary

✅ **Two subscription tiers** - Pro ($20) and Business ($60)  
✅ **Monthly credits** - 20 and 60 respectively  
✅ **Additional purchases** - Buy more credits anytime  
✅ **Flexible model** - Subscribe or pay-as-you-go  
✅ **Premium features** - Team tools, analytics, API  
✅ **Rollover credits** - Never lose unused credits  
✅ **Instant activation** - Start using immediately  

The subscription model provides predictable revenue while maintaining flexibility for all user types!
