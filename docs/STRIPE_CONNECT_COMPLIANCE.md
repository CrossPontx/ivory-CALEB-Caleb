# Stripe Connect Compliance Guide (Uber Model)

## Overview

This guide explains how Ivory implements the Uber-style payment compliance model using Stripe Connect. This ensures legal compliance with payment regulations, tax laws, and KYC (Know Your Customer) requirements.

## How It Works

### 1. Platform Structure

**Ivory (Platform)**
- Merchant of record for all transactions
- Collects payments from clients
- Distributes funds to nail techs
- Handles compliance and reporting

**Nail Techs (Connected Accounts)**
- Independent service providers
- Receive transfers for completed services
- Must complete identity verification
- Payouts locked until verified

### 2. Compliance Requirements

Stripe automatically handles:

#### Identity Verification (KYC)
- Full legal name
- Date of birth
- Social Security Number (US) or Tax ID
- Government-issued ID verification
- Address verification

#### Bank Account Verification
- Bank account number
- Routing number
- Account ownership verification
- Micro-deposit verification (if needed)

#### Tax Compliance
- W-9 form collection (US)
- 1099 reporting for earnings over $600/year
- Tax ID verification
- Business structure documentation

#### Business Information
- Business name (if applicable)
- Business type (individual/company)
- Business address
- Phone number
- Website/social media

## Implementation Flow

### Step 1: Tech Signs Up
```
1. User creates account on Ivory
2. Selects "Nail Tech" user type
3. Completes basic profile setup
```

### Step 2: Wallet Setup Initiated
```
1. Tech clicks "Setup Wallet" button
2. Platform creates Stripe Connect Express account
3. Account ID saved to database
4. Status: "not_setup"
```

### Step 3: Stripe Onboarding
```
1. Tech redirected to Stripe-hosted onboarding
2. Stripe collects required information:
   - Personal information
   - Identity verification
   - Bank account details
   - Tax information
3. Stripe verifies information automatically
4. Tech completes onboarding
```

### Step 4: Verification & Activation
```
1. Stripe processes verification (usually instant)
2. Account status updated to "active"
3. Payouts enabled: true
4. Tech can now receive payments
```

### Step 5: Ongoing Compliance
```
1. Stripe monitors account activity
2. May request additional verification
3. Automatic tax document generation
4. Annual 1099 forms sent
```

## Account Statuses

### not_setup
- No Stripe account created yet
- Cannot receive payments
- Action: Click "Setup Wallet"

### pending
- Account created but verification incomplete
- Payouts disabled
- Action: Complete Stripe onboarding

### active
- Fully verified and operational
- Payouts enabled
- Can receive transfers

### restricted
- Account has compliance issues
- Payouts may be paused
- Action: Resolve issues in Stripe Dashboard

## Payment Flow

### When Client Books Appointment

```
1. Client pays $112.50 total
   - Service: $100.00
   - Platform fee: $12.50 (12.5%)

2. Stripe processes payment
   - Charges client's card
   - Holds funds in platform account

3. Service completed
   - Booking marked as "completed"
   - Transfer triggered to tech

4. Tech receives payout
   - $100.00 transferred to tech's Stripe account
   - Platform retains $12.50 fee
   - Tech's bank receives funds (2-7 days)
```

### Payout Schedule

**Standard (Default)**
- Automatic daily payouts
- 2-7 business days to bank account
- No additional fees

**Instant Payouts (Optional)**
- Available for eligible accounts
- Funds in minutes
- Small fee per payout (~1%)

## Compliance Checks

### Before First Payout

Stripe verifies:
- ✅ Identity confirmed
- ✅ Bank account verified
- ✅ Tax information collected
- ✅ No fraud indicators
- ✅ Terms of service accepted

### Ongoing Monitoring

Stripe continuously checks:
- Transaction patterns
- Dispute rates
- Refund rates
- Customer complaints
- Regulatory compliance

## Handling Non-Compliance

### Missing Information
```
Status: pending
Action: Tech must complete onboarding
Result: Payouts remain disabled
```

### Failed Verification
```
Status: restricted
Action: Tech must provide additional documents
Result: Payouts paused until resolved
```

### Account Restrictions
```
Status: restricted
Reasons:
- High dispute rate
- Suspicious activity
- Regulatory issues
Action: Contact Stripe support
```

## Tax Reporting

### For Nail Techs

**Earnings < $600/year**
- No 1099 required
- Tech reports income on tax return

**Earnings ≥ $600/year**
- Stripe generates 1099-K form
- Sent by January 31st
- Tech receives copy via email
- Filed with IRS automatically

### For Platform

- Stripe handles all 1099 reporting
- Platform doesn't need to file
- Stripe is the payment processor of record

## API Endpoints

### Create Connect Account
```typescript
POST /api/stripe/connect/create-account
Response: { accountId, status }
```

### Verify Account Status
```typescript
POST /api/stripe/connect/verify-status
Body: { accountId }
Response: { status, payoutsEnabled, requirements }
```

### Create Onboarding Link
```typescript
POST /api/stripe/connect/onboard
Response: { url }
```

### Check Requirements
```typescript
GET /api/stripe/connect/requirements
Response: { currentlyDue, eventuallyDue, errors }
```

## Database Schema

```sql
tech_profiles:
  - stripe_connect_account_id: VARCHAR(255)
  - stripe_account_status: VARCHAR(50) -- not_setup, pending, active, restricted
  - payouts_enabled: BOOLEAN
  - charges_enabled: BOOLEAN
```

## Webhooks

### Important Events

```typescript
// Account updated
account.updated
→ Update status in database

// Account verification completed
account.external_account.created
→ Enable payouts

// Payout sent
payout.paid
→ Notify tech

// Payout failed
payout.failed
→ Alert tech to update bank info
```

## Security & Privacy

### Data Protection
- Stripe stores all sensitive data
- Platform never sees SSN or bank details
- PCI DSS Level 1 compliant
- SOC 2 Type II certified

### Access Control
- Techs can only access their own account
- Platform can view status but not details
- Stripe Dashboard for detailed info

## Testing

### Test Mode

Use Stripe test mode for development:

```env
STRIPE_SECRET_KEY=sk_test_...
```

### Test Data

**Test SSN:** 000-00-0000
**Test Bank:** 
- Routing: 110000000
- Account: 000123456789

### Test Scenarios

1. **Successful Verification**
   - Use test SSN
   - Complete all fields
   - Account activates instantly

2. **Failed Verification**
   - Use invalid SSN
   - Account goes to restricted

3. **Missing Information**
   - Skip required fields
   - Account stays pending

## Troubleshooting

### "Payouts not enabled"
- Check account status
- Verify all requirements met
- Look for errors in Stripe Dashboard

### "Account restricted"
- Review restriction reason
- Provide requested documents
- Contact Stripe support

### "Bank account invalid"
- Verify routing number
- Check account number
- Try micro-deposit verification

## Support Resources

- **Stripe Connect Docs**: https://stripe.com/docs/connect
- **KYC Requirements**: https://stripe.com/docs/connect/identity-verification
- **Tax Reporting**: https://stripe.com/docs/connect/taxes
- **Stripe Support**: https://support.stripe.com

## Legal Considerations

### Platform Responsibilities
- Maintain accurate records
- Respond to Stripe inquiries
- Handle customer disputes
- Comply with local regulations

### Tech Responsibilities
- Provide accurate information
- Report all income
- Maintain business licenses
- Follow local regulations

## Next Steps

1. ✅ Enable Stripe Connect in dashboard
2. ✅ Configure webhook endpoints
3. ✅ Test with test accounts
4. ✅ Update terms of service
5. ✅ Train support team
6. ✅ Launch to production

## Conclusion

By using Stripe Connect Express accounts, Ivory automatically handles all compliance requirements just like Uber. Techs complete a simple onboarding flow, Stripe verifies their identity and bank account, and payouts are automatically enabled once verified. The platform never handles sensitive information and remains compliant with all regulations.
