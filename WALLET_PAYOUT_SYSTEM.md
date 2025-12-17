# Wallet & Payout System

## Overview
Nail techs can now set up a Stripe Connect wallet to receive payments directly from client bookings. The platform automatically splits payments: techs receive the service price, and the platform receives a 12.5% service fee.

## Features

### For Nail Techs
- **Stripe Connect Integration**: Secure wallet setup through Stripe Express
- **Automatic Payouts**: Receive service payments directly to bank account
- **Dashboard Access**: View earnings, payouts, and transaction history
- **Status Tracking**: Real-time wallet status (Not Setup, Pending, Active)

### Payment Flow
1. Client books appointment and pays total amount (service price + 12.5% fee)
2. Payment is processed through Stripe
3. Service price is transferred to tech's Stripe Connect account
4. Platform fee (12.5%) is retained by the platform
5. Tech receives automatic payouts to their bank account

## Database Changes

### Tech Profiles Table
Added Stripe Connect fields:
```sql
ALTER TABLE tech_profiles 
ADD COLUMN stripe_connect_account_id VARCHAR(255),
ADD COLUMN stripe_account_status VARCHAR(50) DEFAULT 'not_setup',
ADD COLUMN payouts_enabled BOOLEAN DEFAULT false,
ADD COLUMN charges_enabled BOOLEAN DEFAULT false;
```

## API Endpoints

### 1. Setup Wallet Onboarding
**POST** `/api/stripe/connect/onboard`
- Creates Stripe Connect account if doesn't exist
- Returns onboarding URL for tech to complete setup
- Requires authentication

### 2. Check Wallet Status
**GET** `/api/stripe/connect/status`
- Returns current wallet status
- Shows if payouts are enabled
- Updates database with latest Stripe account info

### 3. Access Stripe Dashboard
**POST** `/api/stripe/connect/dashboard`
- Creates login link to Stripe Express Dashboard
- Allows techs to view earnings and manage payouts
- Requires active Stripe Connect account

## Components

### StripeConnectWallet Component
Location: `components/stripe-connect-wallet.tsx`

Features:
- Visual status indicators (Active, Pending, Not Setup)
- One-click wallet setup
- Dashboard access button
- Real-time status updates
- Elegant design matching landing page aesthetic

Usage:
```tsx
import { StripeConnectWallet } from '@/components/stripe-connect-wallet';

// In tech dashboard or settings
<StripeConnectWallet />
```

## Booking Payment Flow

### Updated Checkout API
Location: `app/api/stripe/create-booking-checkout/route.ts`

Changes:
- Checks if tech has Stripe Connect account
- Uses destination charges for payment splitting
- Sets application fee (12.5%) automatically
- Transfers service price to tech's account

### Payment Breakdown
For a $100 service:
- Client pays: $112.50 (service + 12.5% fee)
- Tech receives: $100.00 (service price)
- Platform receives: $12.50 (service fee)

## Setup Instructions

### For Nail Techs
1. Navigate to dashboard or settings
2. Find "Payout Wallet" section
3. Click "Setup Wallet"
4. Complete Stripe onboarding (business info, bank details)
5. Wait for Stripe verification (usually instant)
6. Start receiving payments from bookings!

### For Platform Admin
1. Ensure Stripe API keys are set in environment variables
2. Run database migration: `db/migrations/add_stripe_connect_to_tech_profiles.sql`
3. Test with Stripe test mode first
4. Monitor Connect accounts in Stripe Dashboard

## Environment Variables Required
```env
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Testing

### Test Mode
1. Use Stripe test API keys
2. Create test Connect account
3. Use test card: 4242 4242 4242 4242
4. Verify payment splitting in Stripe Dashboard

### Production Checklist
- [ ] Live Stripe API keys configured
- [ ] Database migration applied
- [ ] Webhook endpoints configured
- [ ] Terms of service updated with payout terms
- [ ] Support documentation created

## Security

- All Stripe operations use server-side API
- Connect account IDs stored securely in database
- OAuth-style onboarding flow
- PCI compliance handled by Stripe
- No sensitive banking info stored in our database

## Support

### Common Issues
1. **Payouts not enabled**: Tech needs to complete Stripe verification
2. **Account restricted**: Contact Stripe support
3. **Missing payments**: Check Stripe Dashboard for transfer status

### Tech Support Flow
1. Check wallet status in component
2. Verify Stripe account in dashboard
3. Review recent bookings and payments
4. Contact Stripe support if needed

## Future Enhancements
- [ ] Instant payouts (for additional fee)
- [ ] Earnings analytics dashboard
- [ ] Payout schedule customization
- [ ] Multi-currency support
- [ ] Tax document generation
