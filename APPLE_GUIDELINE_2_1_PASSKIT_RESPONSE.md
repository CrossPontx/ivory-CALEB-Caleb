# Apple Review Guideline 2.1 - PassKit Framework Response

## Issue
Guideline 2.1 - Information Needed: The app binary includes the PassKit framework for implementing Apple Pay, but Apple was unable to verify any integration of Apple Pay within the app.

## Response to Apple

**The app does NOT implement Apple Pay or use PassKit functionality.**

### Explanation

The PassKit framework is being included in the binary as a transitive dependency from third-party SDKs, specifically:

1. **Stripe SDK** - Used for web-based payment processing (credit card payments via Stripe Checkout)
2. **Capacitor Framework** - May include PassKit as part of its iOS bridge capabilities

### Payment Implementation Details

Our app uses **Stripe Checkout** for all payment processing:

- **Credit purchases**: Users are redirected to Stripe-hosted checkout pages (web-based)
- **Subscription purchases**: Users are redirected to Stripe-hosted checkout pages (web-based)
- **Booking payments**: Users are redirected to Stripe-hosted checkout pages (web-based)

**Location in app:**
- Settings → Credits → "Buy Credits" button → Redirects to Stripe Checkout
- Settings → Billing → "Upgrade" button → Redirects to Stripe Checkout
- Booking flow → "Pay Now" button → Redirects to Stripe Checkout

### In-App Purchases

The app also implements **Apple In-App Purchases (StoreKit)** for iOS-native purchases:
- Credit packages available via IAP
- Subscriptions available via IAP
- Located in: Settings → Credits → iOS native purchase options

### No PassKit Usage

The app does **NOT**:
- Use Apple Pay buttons
- Process Apple Pay transactions
- Access PassKit APIs
- Implement PKPaymentAuthorizationViewController
- Use any PassKit functionality

### Technical Evidence

You can verify this by:
1. Searching the codebase for "PassKit" - no imports or usage
2. Searching for "PKPayment" - no references
3. Checking Info.plist - no PassKit entitlements or usage descriptions
4. The framework is included only as a dependency of Stripe/Capacitor SDKs

### Review Notes for App Store Connect

**Suggested text for Review Notes:**

```
PASSKIT FRAMEWORK:
The PassKit framework is included in the binary as a transitive dependency 
from the Stripe SDK and Capacitor framework. The app does NOT implement 
Apple Pay or use any PassKit functionality.

PAYMENT METHODS:
- Web payments: Stripe Checkout (hosted pages)
- iOS payments: Apple In-App Purchases (StoreKit)

No Apple Pay integration is present in the app.
```

## Action Items

### For Next Submission

1. **Add to Review Notes** in App Store Connect:
   - Copy the suggested text above into the "Notes" field
   - Be explicit that PassKit is not used

2. **Consider Removing PassKit** (Optional):
   - Update Stripe SDK to a version without PassKit if available
   - Or add build flags to exclude PassKit from dependencies

3. **Alternative**: If you want to implement Apple Pay in the future:
   - Add proper Apple Pay merchant configuration
   - Implement PKPaymentAuthorizationViewController
   - Add Apple Pay buttons to checkout flows
   - Document the implementation for reviewers

## Verification Steps

To verify PassKit is not used:

```bash
# Search Swift files for PassKit
grep -r "import PassKit" ios/

# Search for Apple Pay references
grep -r "PKPayment" ios/

# Check Info.plist for PassKit keys
grep -i "passkit\|apple pay" ios/App/App/Info.plist
```

All searches should return no results (or only comments).

---

**Status**: Ready for resubmission with clarification in Review Notes
**Date**: December 18, 2024
