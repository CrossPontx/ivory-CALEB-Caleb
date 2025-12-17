# Booking Payment System

## Overview

Complete Stripe payment integration for nail tech bookings with a 12.5% service fee paid by clients.

## Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Selects Service & Time                            │
│    - Chooses nail tech                                       │
│    - Selects service, design, date/time                     │
│    - Adds special notes                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Price Breakdown Displayed                                │
│    - Service Price: $50.00                                  │
│    - Service Fee (12.5%): $6.25                            │
│    - Total: $56.25                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Click "Continue to Payment"                              │
│    - Booking created with status: pending                   │
│    - Payment status: pending                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Stripe Checkout Session Created                          │
│    - Line item 1: Service ($50.00)                          │
│    - Line item 2: Service Fee ($6.25)                       │
│    - Total: $56.25                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Redirected to Stripe Checkout                            │
│    - Secure Stripe-hosted payment page                      │
│    - Enter card details                                     │
│    - Complete payment                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Stripe Webhook Processes Payment                         │
│    - Verifies webhook signature                             │
│    - Updates booking: payment_status = 'paid'               │
│    - Saves payment_intent_id                                │
│    - Records paid_at timestamp                              │
│    - Notifies nail tech                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Client Redirected Back                                   │
│    - Success message displayed                              │
│    - Booking shows "Paid" status                            │
│    - Nail tech can now confirm appointment                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Nail Tech Reviews Booking                                │
│    - Sees payment is complete                               │
│    - Views service price they'll receive                    │
│    - Confirms or declines appointment                       │
└─────────────────────────────────────────────────────────────┘
```

## Service Fee Structure

### Fee Breakdown
- **Service Fee**: 12.5% of service price
- **Paid By**: Client (not deducted from nail tech)
- **Example**:
  - Service Price: $50.00
  - Service Fee: $6.25 (12.5%)
  - Client Pays: $56.25
  - Tech Receives: $50.00

### Why 12.5%?
- Covers platform costs (hosting, payment processing, AI features)
- Competitive with other booking platforms
- Transparent to both clients and techs
- Allows sustainable platform growth

## Database Schema

### Booking Payment Fields

```typescript
{
  servicePrice: decimal,           // Original service price (tech's rate)
  serviceFee: decimal,             // 12.5% platform fee
  totalPrice: decimal,             // servicePrice + serviceFee
  paymentStatus: string,           // 'pending' | 'paid' | 'refunded'
  stripePaymentIntentId: string,   // Stripe payment ID
  stripeCheckoutSessionId: string, // Stripe session ID
  paidAt: timestamp,               // When payment completed
  refundedAt: timestamp,           // If refunded
  refundAmount: decimal,           // Refund amount if applicable
}
```

## API Routes

### `/api/stripe/create-booking-checkout`
**POST** - Creates Stripe Checkout session for booking payment

**Request:**
```json
{
  "bookingId": 123
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Process:**
1. Validates user owns the booking
2. Checks payment not already completed
3. Calculates service price + 12.5% fee
4. Creates Stripe Checkout with 2 line items
5. Saves checkout session ID to booking
6. Returns checkout URL

### `/api/stripe/webhook`
**POST** - Handles Stripe webhook events

**Events Handled:**
- `checkout.session.completed` - Payment successful
  - Updates booking payment status
  - Records payment intent ID
  - Sets paid_at timestamp
  - Notifies nail tech

## Frontend Components

### Booking Flow (`/book/[techId]`)

**Price Display:**
```tsx
<div className="border-t border-[#E8E8E8] pt-3 mt-3 space-y-2">
  <div className="flex justify-between text-sm">
    <span>Service Price:</span>
    <span>$50.00</span>
  </div>
  <div className="flex justify-between text-sm">
    <span>Service Fee (12.5%):</span>
    <span>$6.25</span>
  </div>
  <div className="flex justify-between text-lg font-bold border-t pt-2">
    <span>Total:</span>
    <span>$56.25</span>
  </div>
</div>
```

**Payment Button:**
```tsx
<Button onClick={handleBooking}>
  Continue to Payment
</Button>
<p className="text-xs text-center text-gray-500 mt-2">
  You'll be redirected to secure payment. 
  Booking will be sent to the nail tech after payment.
</p>
```

### My Bookings (`/bookings`)

**Payment Status Badge:**
```tsx
<Badge className={paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
  {paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
</Badge>
```

**Complete Payment Button:**
```tsx
{booking.paymentStatus !== 'paid' && (
  <Button onClick={handlePayment}>
    Complete Payment
  </Button>
)}
```

### Tech Bookings (`/tech/bookings`)

**Payment Info Display:**
```tsx
<div className="bg-gray-50 p-3 rounded">
  <div className="flex justify-between">
    <span>Service Price:</span>
    <span>$50.00</span>
  </div>
  <div className="flex justify-between">
    <span>Platform Fee:</span>
    <span>$6.25</span>
  </div>
  <div className="flex justify-between font-bold">
    <span>Total Paid:</span>
    <span>$56.25</span>
  </div>
  <p className="text-xs text-gray-500 mt-2">
    You'll receive $50.00 after the appointment is completed.
  </p>
</div>
```

## Payment States

### Client View

| Status | Payment Status | Actions Available |
|--------|---------------|-------------------|
| pending | pending | Complete Payment |
| pending | paid | View Details |
| confirmed | paid | View Details |
| completed | paid | Leave Review |
| cancelled | paid | View Refund Status |

### Tech View

| Status | Payment Status | Actions Available |
|--------|---------------|-------------------|
| pending | pending | (Hidden - not paid yet) |
| pending | paid | Confirm / Decline |
| confirmed | paid | Mark Complete |
| completed | paid | View Details |

## Security Features

✅ **Payment Before Confirmation** - Techs only see paid bookings  
✅ **Webhook Signature Verification** - Ensures webhooks are from Stripe  
✅ **User Authorization** - Only booking owner can pay  
✅ **Duplicate Payment Prevention** - Checks if already paid  
✅ **Secure Checkout** - Stripe-hosted payment page  
✅ **PCI Compliance** - No card data touches our servers

## Stripe Configuration

### Required Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

### Payment Methods

Enable in Stripe Dashboard:
- Credit/Debit Cards
- Apple Pay
- Google Pay
- Cash App Pay (US only)

## Testing

### Test Cards

**Success:**
```
Card: 4242 4242 4242 4242
Exp: Any future date
CVC: Any 3 digits
```

**Decline:**
```
Card: 4000 0000 0000 0002
```

**3D Secure:**
```
Card: 4000 0025 0000 3155
```

### Test Flow

1. Create booking as client
2. See price breakdown with 12.5% fee
3. Click "Continue to Payment"
4. Use test card on Stripe Checkout
5. Complete payment
6. Verify redirect to success page
7. Check booking shows "Paid" status
8. Login as tech
9. Verify booking appears in requests
10. Confirm appointment

## Payout to Nail Techs

### Current Setup
- Payments collected by platform
- Service price held for nail tech
- Payout after appointment completion

### Future: Stripe Connect
- [ ] Implement Stripe Connect for direct payouts
- [ ] Automatic transfers to tech accounts
- [ ] Tech dashboard for earnings
- [ ] Instant payouts option
- [ ] Tax reporting (1099 forms)

## Refund Policy

### When Refunds Are Issued

**Full Refund:**
- Tech cancels appointment
- Tech doesn't respond within 48 hours
- Service not provided

**Partial Refund:**
- Client cancels 24+ hours before
- Service partially completed

**No Refund:**
- Client no-show
- Client cancels <24 hours before

### Refund Process

```typescript
// Future implementation
await stripe.refunds.create({
  payment_intent: booking.stripePaymentIntentId,
  amount: refundAmount, // in cents
  reason: 'requested_by_customer',
});

await db.update(bookings)
  .set({
    paymentStatus: 'refunded',
    refundedAt: new Date(),
    refundAmount: refundAmount,
  })
  .where(eq(bookings.id, bookingId));
```

## Error Handling

### Payment Failures

**Client-Side:**
- Card declined → Show error, allow retry
- Insufficient funds → Show error message
- Network error → Retry payment

**Server-Side:**
- Webhook failure → Logged, manual review
- Database error → Transaction rolled back
- Invalid booking → Error returned

### User Messages

```typescript
// Success
"Payment successful! Your booking request has been sent to the nail tech."

// Cancelled
"Payment cancelled. Your booking was not completed."

// Failed
"Payment failed. Please try again or use a different payment method."

// Already Paid
"This booking has already been paid."
```

## Monitoring

### Stripe Dashboard

Monitor:
- Successful payments
- Failed payments
- Refunds
- Webhook delivery status

### Application Logs

Track:
- Booking creation
- Checkout session creation
- Webhook processing
- Payment status updates
- Errors and failures

## Future Enhancements

- [ ] Stripe Connect for direct tech payouts
- [ ] Automatic refund processing
- [ ] Deposit option (partial payment upfront)
- [ ] Subscription discounts on service fees
- [ ] Promotional codes
- [ ] Split payments (multiple clients)
- [ ] Tip functionality
- [ ] Recurring appointments with saved payment
- [ ] Payment method management
- [ ] Invoice generation

## Compliance

- **PCI DSS**: Stripe handles all card data
- **Data Privacy**: No payment info stored in app
- **GDPR**: Customer data handled per Stripe policies
- **Tax**: Platform responsible for service fee tax
- **Terms**: Clear fee disclosure to users

## Support

### For Clients
- Payment issues → Check Stripe Dashboard
- Refund requests → Contact support
- Receipt → Available in Stripe email

### For Nail Techs
- Payout questions → Coming with Stripe Connect
- Fee questions → Documented in terms
- Payment disputes → Platform handles

## Quick Reference

### Calculate Total Price

```typescript
const servicePrice = parseFloat(service.price);
const serviceFee = servicePrice * 0.125; // 12.5%
const totalPrice = servicePrice + serviceFee;
```

### Check Payment Status

```typescript
if (booking.paymentStatus === 'paid') {
  // Show to tech, allow confirmation
} else {
  // Hide from tech, prompt client to pay
}
```

### Create Checkout

```typescript
const response = await fetch('/api/stripe/create-booking-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ bookingId }),
});

const { url } = await response.json();
window.location.href = url;
```

## Summary

The booking payment system ensures:
- ✅ Clients pay upfront (service + 12.5% fee)
- ✅ Techs only see paid bookings
- ✅ Secure Stripe payment processing
- ✅ Transparent fee breakdown
- ✅ Automatic payment tracking
- ✅ Ready for future payout automation

All payments are secure, tracked, and ready for scale! 💳✨
