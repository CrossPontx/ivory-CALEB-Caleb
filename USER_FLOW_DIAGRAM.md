# User Flow Diagrams - Apple Review Compliance

## Flow 1: Browse Without Account (Guideline 5.1.1) ✅

```
┌─────────────────┐
│   Launch App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Landing Page   │ ◄── No login required
│  - Hero section │
│  - Features     │
│  - Pricing      │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│ Browse Designs  │  │ Get Started  │
│   (Explore)     │  │   (Sign Up)  │
└────────┬────────┘  └──────┬───────┘
         │                  │
         ▼                  │
┌─────────────────┐         │
│ Sample Designs  │         │
│ - French        │         │
│ - Floral        │         │
│ - Geometric     │         │
│ - Minimalist    │         │
└────────┬────────┘         │
         │                  │
         ▼                  │
┌─────────────────┐         │
│  Tap Design     │         │
└────────┬────────┘         │
         │                  │
         ▼                  │
┌─────────────────┐         │
│ Prompt: Sign Up │         │
│ to Create       │         │
└────────┬────────┘         │
         │                  │
         └──────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   Auth Page     │
         └─────────────────┘
```

## Flow 2: OAuth with Safari View Controller (Guideline 4.0) ✅

```
┌─────────────────┐
│   Auth Page     │
│  - Email/Pass   │
│  - Google       │
│  - Apple        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tap "Continue   │
│  with Google"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Safari View Controller Opens   │ ◄── IN-APP (not external)
│  ┌───────────────────────────┐  │
│  │ ✓ URL Bar Visible         │  │
│  │ ✓ "Done" Button           │  │
│  │ ✓ SSL Certificate         │  │
│  │ ✓ accounts.google.com     │  │
│  └───────────────────────────┘  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ User Completes  │
│  Google Auth    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Auto Return to  │ ◄── Seamless
│      App        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select User     │
│     Type        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │
└─────────────────┘
```

## Flow 3: Existing User (Session Detected)

```
┌─────────────────┐
│   Launch App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Session   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Session Found   │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────┐
│ Client User     │  │  Tech User   │
│   Dashboard     │  │  Dashboard   │
└─────────────────┘  └──────────────┘
```

## Feature Access Matrix

### ✅ Public Access (No Account Required)

| Feature | Access | Location |
|---------|--------|----------|
| Landing Page | ✅ Public | `/` |
| Explore Gallery | ✅ Public | `/explore` |
| Sample Designs | ✅ Public | `/explore` |
| Pricing Info | ✅ Public | `/` |
| Terms of Service | ✅ Public | `/terms` |
| Privacy Policy | ✅ Public | `/privacy-policy` |

### 🔒 Account Required (Authentication Needed)

| Feature | Access | Location |
|---------|--------|----------|
| Generate AI Designs | 🔒 Auth Required | `/capture` |
| Save Designs | 🔒 Auth Required | `/home` |
| User Dashboard | 🔒 Auth Required | `/home` |
| Book Appointments | 🔒 Auth Required | `/send-to-tech` |
| Profile Settings | 🔒 Auth Required | `/settings` |
| Tech Dashboard | 🔒 Auth Required | `/tech/dashboard` |
| Credits Management | 🔒 Auth Required | `/billing` |

## Authentication Methods Comparison

### ❌ Before (Guideline 4.0 Violation)

```
App → Tap OAuth → External Safari Opens
                   ↓
              Full Safari Browser
              - App disappears
              - Safari tabs visible
              - Manual return needed
```

### ✅ After (Guideline 4.0 Compliant)

```
App → Tap OAuth → Safari View Controller
                   ↓
              In-App Browser
              - URL bar visible
              - "Done" button
              - Auto return to app
              - SSL verification
```

## User Journey: First Time User

```
Day 1: Discovery
├─ Launch app
├─ Browse landing page (no account)
├─ Tap "Browse Designs"
├─ View sample designs (no account)
├─ Get inspired
└─ Close app

Day 2: Engagement
├─ Launch app
├─ Remember designs from yesterday
├─ Tap "Get Started"
├─ Choose "Continue with Google"
├─ Safari View Controller opens (in-app)
├─ Complete authentication
├─ Return to app automatically
├─ Select user type (Client)
└─ Access full features

Day 3: Active Use
├─ Launch app
├─ Auto-login (session detected)
├─ Go directly to dashboard
├─ Generate custom designs
├─ Book appointment
└─ Full app experience
```

## Key Improvements Summary

### Guideline 4.0 Compliance
- ✅ OAuth in Safari View Controller (in-app)
- ✅ URL verification visible
- ✅ SSL certificate inspection available
- ✅ No external browser redirect
- ✅ Seamless user experience

### Guideline 5.1.1 Compliance
- ✅ Browse without account
- ✅ View sample content freely
- ✅ Clear feature gating
- ✅ Authentication only when needed
- ✅ Transparent user journey

## Testing Scenarios

### Scenario 1: Curious User
```
Goal: Browse designs before committing
Path: Launch → Landing → Explore → View Designs
Result: ✅ No account required
```

### Scenario 2: Ready to Sign Up
```
Goal: Create account and generate design
Path: Launch → Get Started → OAuth (in-app) → Dashboard → Generate
Result: ✅ Seamless in-app authentication
```

### Scenario 3: Returning User
```
Goal: Quick access to features
Path: Launch → Auto-login → Dashboard
Result: ✅ Instant access
```

### Scenario 4: Privacy-Conscious User
```
Goal: Verify authentication security
Path: Launch → Sign In → OAuth → View URL bar → Check SSL
Result: ✅ Full transparency in Safari View Controller
```

---

## Visual Indicators

### Safari View Controller (What Reviewers Will See)

```
┌─────────────────────────────────────┐
│ ← Done    accounts.google.com    🔒 │ ◄── URL bar visible
├─────────────────────────────────────┤
│                                     │
│     [Google Sign-In Interface]      │
│                                     │
│     - Email input                   │
│     - Password input                │
│     - Sign in button                │
│                                     │
└─────────────────────────────────────┘
     ▲                           ▲
     │                           │
  "Done"                      SSL Lock
  button                      indicator
```

### External Safari (What We DON'T Want)

```
┌─────────────────────────────────────┐
│  [Safari Tabs]  [+]                 │ ◄── Safari UI
├─────────────────────────────────────┤
│  accounts.google.com            🔒  │
├─────────────────────────────────────┤
│                                     │
│     [Google Sign-In Interface]      │
│                                     │
└─────────────────────────────────────┘
│  [Safari Toolbar]                   │ ◄── Safari toolbar
│  ◀  ▶  📖  📋  ⋯                    │
└─────────────────────────────────────┘
```

---

**Status:** ✅ All flows compliant with Apple Guidelines
**Ready for:** App Store submission
