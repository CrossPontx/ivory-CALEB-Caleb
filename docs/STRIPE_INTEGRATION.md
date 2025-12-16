# Stripe Payment Integration

## Overview

Complete Stripe payment integration for purchasing credits with support for multiple payment methods.

## Payment Methods Supported

✅ **Credit/Debit Cards** (Visa, Mastercard, Amex, Discover, etc.)  
✅ **Apple Pay** (iOS, macOS, Safari)  
✅ **Cash App Pay** (US customers)

## Credit Packages

| Package | Credits | Price | Per Credit | Savings | Badge |
|---------|---------|-------|------------|---------|-------|
| Starter | 10 | $4.99 | $0.50 | - | - |
| Popular | 25 | $9.99 | $0.40 | 20% | ⭐ Most Popular |
| Value | 50 | $16.99 | $0.34 | 32% | - |
| Best | 100 | $29.99 | $0.30 | 40% | - |

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User visits /settings/credits                            │
│    - Views current balance                                   │
│    - Sees "Buy Credits" button                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Opens Buy Credits Dialog                                 │
│    - 4 credit packages displayed                            │
│    - Shows price, savings, features                         │
│    - Payment method icons visible                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Selects Package & Clicks "Purchase"                      │
│    - API creates Stripe Checkout session                    │
│    - Includes user metadata                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Redirected to Stripe Checkout                            │
│    - Secure Stripe-hosted page                              │
│    - Choose payment method:                                 │
│      • Credit Card                                          │
│      • Apple Pay (if available)                             │
│      • Cash App Pay (if available)                          │
│    - 3D Secure authentication if required                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Complete Payment                                          │
│    - Stripe processes payment                               │
│    - Sends webhook to app                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Webhook Processes Payment                                │
│    - Verifies webhook signature                             │
│    - Adds credits to user account                           │
│    - Logs transaction                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. User Redirected Back                                     │
│    - Success message displayed                              │
│    - Updated balance shown                                  │
│    - Transaction in history                                 │
└─────────────────────────────────────────────────────────────┘
```

## Technical Architecture

### Frontend Components

**`components/buy-credits-dialog.tsx`**
- Modal dialog with credit packages
- Stripe.js integration
- Loading states and error handling
- Payment method icons

### Backend API Routes

**`app/api/stripe/create-checkout/route.ts`**
- Creates Stripe Checkout session
- Authenticates user
- Configures payment options
- Sets metadata for webhook

**`app/api/stripe/webhook/route.ts`**
- Receives Stripe events
- Verifies webhook signature
- Processes successful payments
- Adds credits and logs transactions

### Configuration

**`lib/stripe.ts`**
- Stripe client initialization
- Credit package definitions
- Helper functions

## Security Features

✅ **Webhook Signature Verification** - Ensures webhooks are from Stripe  
✅ **3D Secure Support** - Additional authentication for cards  
✅ **User Authentication** - Only authenticated users can purchase  
✅ **Secure Tokens** - JWT-based session management  
✅ **Metadata Validation** - Verifies payment metadata  
✅ **HTTPS Only** - All communication encrypted

## Database Schema

### Credit Transactions

Purchases are logged in the `creditTransactions` table:

```typescript
{
  id: number
  userId: number
  amount: number          // Credits purchased
  type: 'purchase'
  description: string     // e.g., "Purchased 25 credits (credits_25)"
  balanceAfter: number    // New balance after purchase
  createdAt: timestamp
}
```

## Environment Variables

### Required

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Webhook Secret (from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_BASE_URL=https://ivory-blond.vercel.app
```

## Stripe Dashboard Setup

### 1. Payment Methods

Enable in **Settings → Payment methods**:
- Cards
- Apple Pay
- Cash App Pay

### 2. Webhook Configuration

Create webhook at **Developers → Webhooks**:
- **URL**: `https://ivory-blond.vercel.app/api/stripe/webhook`
- **Events**:
  - `checkout.session.completed`
  - `payment_intent.payment_failed`

### 3. Apple Pay Domain Verification

For Apple Pay to work:
1. Add domain in Stripe Dashboard
2. Download verification file
3. Place at: `public/.well-known/apple-developer-merchantid-domain-association`

## Testing

### Test Mode

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any CVC.

### Production Testing

1. Make small test purchase ($4.99)
2. Verify credits added
3. Check transaction history
4. Monitor webhook in Stripe Dashboard

## Monitoring

### Stripe Dashboard

- **Payments**: View all transactions
- **Customers**: Customer payment history
- **Webhooks**: Delivery status and logs
- **Events**: All Stripe events

### Application Logs

Check Vercel logs for:
- Checkout session creation
- Webhook processing
- Credit additions
- Errors

## Error Handling

### User-Facing Errors

- Payment declined
- Insufficient funds
- Network errors
- Session expired

### System Errors

- Webhook signature verification failed
- User not found
- Invalid package
- Database errors

All errors are logged and user-friendly messages displayed.

## Future Enhancements

- [ ] Subscription plans with monthly credits
- [ ] Promotional discounts and coupon codes
- [ ] Gift credits to other users
- [ ] Credit bundles for teams
- [ ] Loyalty rewards program
- [ ] Refund handling
- [ ] Payment method management

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Webhook Guide](https://stripe.com/docs/webhooks)
- [Payment Methods](https://stripe.com/docs/payments/payment-methods)

## Compliance

- **PCI Compliance**: Stripe handles all card data
- **Data Privacy**: No card details stored in app
- **GDPR**: Customer data handled per Stripe's policies
- **Secure**: All payments processed over HTTPS

## Quick Reference

### Add Buy Button Anywhere

```tsx
import { BuyCreditsDialog } from '@/components/buy-credits-dialog';

<BuyCreditsDialog />
```

### Modify Credit Packages

Edit `lib/stripe.ts`:

```typescript
export const CREDIT_PACKAGES = [
  {
    id: 'credits_custom',
    name: 'Custom Package',
    credits: 75,
    price: 1999, // $19.99 in cents
    popular: false,
    savings: '25%',
  },
];
```

### Check User Balance

```typescript
import { getCreditsBalance } from '@/lib/credits';

const balance = await getCreditsBalance(userId);
```

## Troubleshooting

### Credits Not Added

1. Check webhook is configured
2. Verify webhook secret
3. Check Vercel logs
4. Test webhook delivery in Stripe

### Payment Method Not Available

1. Enable in Stripe Dashboard
2. Check country availability
3. Verify domain for Apple Pay

### Webhook Errors

1. Verify signature secret
2. Check endpoint URL
3. Review event logs in Stripe
4. Test with Stripe CLI

## Contact

For payment issues, contact Stripe Support.  
For app issues, check application logs.
