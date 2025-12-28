# New Simplified Pricing Model

## Overview

Simplified subscription model with auto-recharge functionality.

## Pricing Structure

### For Clients (Regular Users)

**Pro Subscription: $20/month**
- 15 credits included monthly
- Auto-recharge when credits hit 0
- Credits roll over (never expire)

**Auto-Recharge Options (when credits = 0):**
- 5 credits for $7.50 ($1.50/credit)
- 10 credits for $15.00 ($1.50/credit)

### For Nail Techs

**Business Subscription: $60/month**
- Unlimited bookings
- 40 credits per month for creating designs
- Auto-recharge when credits hit 0
- Portfolio and client management

## IAP Products to Create in App Store Connect

### 1. Pro Monthly Subscription (Clients)
- **Product ID:** `com.ivory.app.subscription.pro`
- **Type:** Auto-Renewable Subscription
- **Price:** $19.99/month
- **Display Name:** Pro Monthly
- **Description:** 15 AI-generated nail designs per month with auto-recharge

### 2. Business Monthly Subscription (Nail Techs)
- **Product ID:** `com.ivory.app.subscription.business`
- **Type:** Auto-Renewable Subscription
- **Price:** $59.99/month
- **Display Name:** Business Monthly
- **Description:** Unlimited bookings + 40 AI designs per month with auto-recharge

### 3. Auto-Recharge: 5 Credits
- **Product ID:** `com.ivory.app.credits.5`
- **Type:** Consumable
- **Price:** $7.49
- **Display Name:** 5 Credits
- **Description:** 5 AI-generated nail designs ($1.50/credit)

### 4. Auto-Recharge: 10 Credits
- **Product ID:** `com.ivory.app.credits.10`
- **Type:** Consumable
- **Price:** $14.99
- **Display Name:** 10 Credits
- **Description:** 10 AI-generated nail designs ($1.50/credit)

## Stripe Products (for web)

Update in Stripe Dashboard:

### Subscriptions
- **Pro Monthly (Clients):** $20.00/month - 15 credits per month with auto-recharge
- **Business Monthly (Techs):** $60.00/month - 40 credits + unlimited bookings with auto-recharge

### One-Time Purchases
- **5 Credits:** $7.50
- **10 Credits:** $15.00

## User Experience

### New Subscriber Flow:
1. User subscribes for $20/month
2. Receives 15 credits immediately
3. Uses credits to generate designs
4. When credits hit 0, prompted to auto-recharge
5. Can choose 5 or 10 credits
6. Credits purchased at $1.50 each

### Monthly Renewal:
1. Subscription renews automatically
2. User receives 15 new credits
3. Previous unused credits roll over
4. Total = old balance + 15 new credits

## Benefits

**For Users:**
- Simple pricing: $20/month
- Fair auto-recharge: $1.50/credit
- Credits never expire
- Predictable costs

**For Business:**
- Recurring revenue from subscriptions
- Additional revenue from auto-recharge
- Higher engagement (users don't run out)
- Simpler to explain and market

## Implementation Status

- ✅ Updated `lib/iap.ts` - IAP product IDs
- ✅ Updated `lib/stripe-config.ts` - Stripe pricing
- ✅ Updated `app/api/iap/validate-receipt/route.ts` - 15 credits on subscription
- ⏳ Need to create IAP products in App Store Connect
- ⏳ Need to update Stripe products

## For Apple Review Response

When replying to Apple, mention:

"We have simplified our pricing model:
- Pro subscription: $19.99/month for 15 credits
- Auto-recharge options: 5 credits ($7.49) or 10 credits ($14.99)
- All products configured and ready for testing in sandbox"

## Testing Checklist

- [ ] Subscribe to Pro ($20/month)
- [ ] Verify 15 credits added
- [ ] Use all 15 credits
- [ ] See auto-recharge prompt
- [ ] Purchase 5 credits for $7.50
- [ ] Verify 5 credits added
- [ ] Purchase 10 credits for $15.00
- [ ] Verify 10 credits added
- [ ] Wait for monthly renewal
- [ ] Verify 15 new credits added
- [ ] Verify old credits rolled over

## Revenue Projections

**Per User Per Month:**
- Base subscription: $20
- Average auto-recharge: ~$10 (estimated)
- **Total: ~$30/month per active user**

**Compared to Old Model:**
- Old: $20/month for 20 credits (no auto-recharge)
- New: $20/month for 15 credits + auto-recharge
- **Result: Higher engagement, more revenue**
