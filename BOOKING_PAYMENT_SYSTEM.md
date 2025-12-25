# Booking Payment System - Apple Compliance

## Overview

The booking payment system uses **Apple In-App Purchases (IAP)** exclusively for the native iOS app to comply with Apple's App Store guidelines. Stripe is only used on the web version accessed through browsers.

## Apple Compliance

✅ **IAP ONLY in Native App** - No Stripe references or alternative payment methods visible
✅ **Web uses Stripe** - Separate web version for browser users
✅ **Tech Payouts via Stripe Connect** - Backend only, not visible to app users
✅ **12.5% Platform Fee** - Transparent pricing disclosed to users

## Payment Flow - Native iOS App

### For Clients

1. **Client books appointment** → Selects service, date, time, and design
2. **IAP initiated** → App determines price tier and initiates Apple IAP
3. **Apple processes payment** → User completes payment through Apple
4. **Receipt validation** → Backend validates receipt with Apple servers
5. **Booking confirmed** → Payment marked as paid, tech receives notification
6. **Tech receives payout** → Funds transferred to tech's Stripe Connect wallet (backend only)

### For Techs

Techs setup their payout wallet through the app, but this is presented as "Payout Settings" without mentioning Stripe to maintain Apple compliance. The actual Stripe Connect onboarding happens in a web view.

## IAP Product Configuration

### Booking Payment Tiers

Configure these products in App Store Connect as **Consumable** products:

```
com.yourcompany.ivory.booking.tier1  // $0-50
com.yourcompany.ivory.booking.tier2  // $51-100
com.yourcompany.ivory.booking.tier3  // $101-150
com.yourcompany.ivory.booking.tier4  // $151-200
com.yourcompany.ivory.booking.tier5  // $201+
```

### Price Tier Mapping

The system automatically selects the appropriate product ID based on total booking price:

```typescript
if (totalPrice <= 50) → BOOKING_TIER_1
if (totalPrice <= 100) → BOOKING_TIER_2
if (totalPrice <= 150) → BOOKING_TIER_3
if (totalPrice <= 200) → BOOKING_TIER_4
if (totalPrice > 200) → BOOKING_TIER_5
```

## Tech Wallet Setup (Backend Only)

Techs setup their wallet through the app, but the actual Stripe Connect integration is:
- Presented as "Payout Wallet" or "Payment Settings"
- No mention of "Stripe" in the app UI
- Onboarding happens in web view
- Backend handles all Stripe API calls

### Wallet Status

- **Not Setup** → Tech hasn't started onboarding
- **Pending** → Onboarding started but not complete
- **Active** → Fully verified, can receive payouts

## Revenue Split

### Platform Fee: 12.5%

For every booking:
- **Service Price** → Goes to tech (via Stripe Connect backend)
- **Service Fee (12.5%)** → Platform revenue
- **Total Price** → Service Price + Service Fee

### Example

Service Price: $80
Service Fee: $10 (12.5%)
Total Price: $90

- Client pays: $90 (via Apple IAP)
- Tech receives: $80 (transferred to their bank via Stripe Connect)
- Platform keeps: $10

## API Endpoints

### IAP Payment Validation

```
POST /api/iap/validate-booking-payment
Authorization: Bearer {token}

Body:
{
  "receipt": "base64_encoded_receipt",
  "productId": "com.yourcompany.ivory.booking.tier1",
  "transactionId": "1000000123456789",
  "bookingId": 123
}

Response:
{
  "success": true,
  "bookingId": 123,
  "paymentStatus": "paid"
}
```

### Tech Wallet Setup (Backend)

These endpoints are called from the app but don't expose Stripe branding:

```
POST /api/stripe/connect/onboard
GET /api/stripe/connect/status
POST /api/stripe/connect/dashboard
```

## Database Schema

### Bookings Table

```sql
bookings:
  - servicePrice: decimal (original service price)
  - serviceFee: decimal (12.5% platform fee)
  - totalPrice: decimal (servicePrice + serviceFee)
  - paymentStatus: 'pending' | 'paid' | 'refunded'
  - stripePaymentIntentId: varchar (stores IAP transaction ID with 'iap_' prefix)
  - paidAt: timestamp
```

### Tech Profiles Table

```sql
tech_profiles:
  - stripeConnectAccountId: varchar (backend only)
  - stripeAccountStatus: 'not_setup' | 'pending' | 'active'
  - payoutsEnabled: boolean
  - chargesEnabled: boolean
```

## Apple App Store Compliance Checklist

✅ **No Stripe Branding** - Zero mentions of Stripe in app UI
✅ **IAP Only** - All payments go through Apple IAP
✅ **No External Links** - No links to external payment pages
✅ **Transparent Pricing** - 12.5% fee clearly disclosed
✅ **Payout Settings** - Wallet setup presented as generic "Payout Settings"
✅ **Web View for Onboarding** - Stripe Connect onboarding in web view
✅ **Backend Integration** - All Stripe API calls server-side only

## Testing

### Test IAP Payments

1. Use Sandbox Apple ID in TestFlight
2. Configure sandbox products in App Store Connect
3. Test booking flow
4. Verify receipt validation
5. Check booking payment status
6. Confirm tech receives notification

### Test Tech Wallet

1. Setup wallet from app
2. Complete Stripe onboarding in web view
3. Verify status updates in app
4. Test booking payment flow
5. Confirm payout to tech bank account

## Environment Variables

```env
# Apple IAP
APPLE_IAP_SHARED_SECRET=your_shared_secret_from_app_store_connect

# Stripe (Backend Only)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Important Notes for Apple Review

1. **Never mention "Stripe"** in any user-facing text
2. **Use generic terms** like "Payout Wallet", "Payment Settings", "Bank Transfer"
3. **IAP is mandatory** for all in-app purchases
4. **Web version is separate** - different codebase/domain if needed
5. **Backend integration is allowed** - Stripe Connect for payouts is compliant

## Support

For payment issues:
- Check booking payment status in database
- Verify Apple receipt validation logs
- Review tech wallet status
- Check Stripe Connect account status (backend only)


## IAP Product Configuration

### Booking Payment Tiers

Configure these products in App Store Connect:

```
com.yourcompany.ivory.booking.tier1  // $0-50
com.yourcompany.ivory.booking.tier2  // $51-100
com.yourcompany.ivory.booking.tier3  // $101-150
com.yourcompany.ivory.booking.tier4  // $151-200
com.yourcompany.ivory.booking.tier5  // $201+
```

**Important:** Set these as **Consumable** products, not subscriptions.

### Price Tier Mapping

The system automatically selects the appropriate product ID based on total booking price:

```typescript
if (totalPrice <= 50) → BOOKING_TIER_1
if (totalPrice <= 100) → BOOKING_TIER_2
if (totalPrice <= 150) → BOOKING_TIER_3
if (totalPrice <= 200) → BOOKING_TIER_4
if (totalPrice > 200) → BOOKING_TIER_5
```

## Tech Wallet Setup (Stripe Connect)

### For Nail Techs

Techs must setup their Stripe Connect wallet to receive payouts from bookings:

1. **Navigate to Settings** → Tech Settings page
2. **Setup Wallet** → Click "Setup Wallet" button
3. **Complete Stripe Onboarding** → Provide business info and bank details
4. **Verification** → Stripe verifies identity and bank account
5. **Activate** → Wallet becomes active for receiving payments

### Wallet Status

- **Not Setup** → Tech hasn't started onboarding
- **Pending** → Onboarding started but not complete
- **Active** → Fully verified, can receive payouts

### API Endpoints

#### Setup/Continue Onboarding
```
POST /api/stripe/connect/onboard
Authorization: Bearer {token}

Response:
{
  "url": "https://connect.stripe.com/setup/..."
}
```

#### Check Wallet Status
```
GET /api/stripe/connect/status
Authorization: Bearer {token}

Response:
{
  "status": "active",
  "payoutsEnabled": true,
  "chargesEnabled": true,
  "detailsSubmitted": true
}
```

#### Access Dashboard
```
POST /api/stripe/connect/dashboard
Authorization: Bearer {token}

Response:
{
  "url": "https://connect.stripe.com/express/..."
}
```

## Payment Processing

### IAP Payment Validation

```
POST /api/iap/validate-booking-payment
Authorization: Bearer {token}

Body:
{
  "receipt": "base64_encoded_receipt",
  "productId": "com.yourcompany.ivory.booking.tier1",
  "transactionId": "1000000123456789",
  "bookingId": 123
}

Response:
{
  "success": true,
  "bookingId": 123,
  "paymentStatus": "paid"
}
```

### Stripe Payment

```
POST /api/stripe/create-booking-checkout
Authorization: Bearer {token}

Body:
{
  "bookingId": 123
}

Response:
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

## Revenue Split

### Platform Fee: 12.5%

For every booking:
- **Service Price** → Goes to tech (via Stripe Connect)
- **Service Fee (12.5%)** → Platform revenue
- **Total Price** → Service Price + Service Fee

### Example

Service Price: $80
Service Fee: $10 (12.5%)
Total Price: $90

- Client pays: $90
- Tech receives: $80 (transferred to their Stripe Connect account)
- Platform keeps: $10

### Stripe Connect Transfer

When tech has Stripe Connect setup:

```typescript
// Stripe Checkout with destination charges
{
  application_fee_amount: Math.round(serviceFee * 100), // $10 in cents
  transfer_data: {
    destination: techStripeConnectAccountId // Tech receives $80
  }
}
```

When tech doesn't have Stripe Connect:
- Payment still processed
- Funds held by platform
- Tech must setup wallet to receive payout

## Database Schema

### Bookings Table

```sql
bookings:
  - servicePrice: decimal (original service price)
  - serviceFee: decimal (12.5% platform fee)
  - totalPrice: decimal (servicePrice + serviceFee)
  - paymentStatus: 'pending' | 'paid' | 'refunded'
  - stripePaymentIntentId: varchar (Stripe PI or IAP transaction ID)
  - stripeCheckoutSessionId: varchar (Stripe session ID)
  - paidAt: timestamp
```

### Tech Profiles Table

```sql
tech_profiles:
  - stripeConnectAccountId: varchar
  - stripeAccountStatus: 'not_setup' | 'pending' | 'active' | 'restricted'
  - payoutsEnabled: boolean
  - chargesEnabled: boolean
```

## Testing

### Test IAP Payments

1. Use Sandbox Apple ID in TestFlight
2. Configure sandbox products in App Store Connect
3. Test purchase flow
4. Verify receipt validation
5. Check booking payment status

### Test Stripe Payments

1. Use Stripe test mode
2. Test card: `4242 4242 4242 4242`
3. Complete checkout
4. Verify webhook processing
5. Check booking payment status

### Test Stripe Connect

1. Use test mode Connect account
2. Complete onboarding with test data
3. Verify account status updates
4. Test payout flow with test booking

## Environment Variables

```env
# Apple IAP
APPLE_IAP_SHARED_SECRET=your_shared_secret_from_app_store_connect

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Notifications

After successful payment (IAP or Stripe):

1. **Booking Paid Notification** → Sent to tech
2. **Design Breakdown Generation** → Auto-generated if design attached
3. **Breakdown Ready Notification** → Sent to tech when complete

## Error Handling

### IAP Errors

- **Invalid Receipt** → Receipt validation failed with Apple
- **Already Processed** → Transaction already recorded
- **Product Mismatch** → Product ID doesn't match receipt

### Stripe Errors

- **Payment Failed** → Card declined or insufficient funds
- **Session Expired** → Checkout session expired
- **Webhook Failed** → Webhook signature verification failed

### Wallet Errors

- **Not Setup** → Tech hasn't completed Stripe onboarding
- **Restricted** → Stripe account restricted or suspended
- **Verification Required** → Additional verification needed

## Apple App Store Compliance

✅ **Compliant:** Using IAP for digital bookings in native app
✅ **Compliant:** Using Stripe for web version
✅ **Compliant:** 12.5% platform fee disclosed to users
✅ **Compliant:** Techs receive payouts via Stripe Connect

## Future Enhancements

- [ ] Support for refunds (partial/full)
- [ ] Automatic payout scheduling
- [ ] Multi-currency support
- [ ] Booking deposits
- [ ] Cancellation fees
- [ ] Tip functionality
- [ ] Promo codes/discounts

## Support

For payment issues:
- Check booking payment status in database
- Verify Stripe webhook logs
- Check Apple receipt validation logs
- Review tech Stripe Connect account status
