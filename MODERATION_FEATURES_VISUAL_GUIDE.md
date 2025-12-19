# Content Moderation Features - Visual Guide

## Quick Reference: Where to Find Everything

---

## 1. Terms Acceptance (Signup Flow)

### Location: Auth/Signup Screen

```
┌─────────────────────────────────────┐
│         IVORY'S CHOICE              │
│      Begin Your Journey             │
│                                     │
│  Username: [____________]           │
│  Email:    [____________]           │
│  Password: [____________]           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ☑ I agree to the Terms of     │ │
│  │   Service and Privacy Policy, │ │
│  │   including our zero-tolerance│ │
│  │   policy for objectionable    │ │
│  │   content and abusive behavior│ │
│  └───────────────────────────────┘ │
│                                     │
│  [    CREATE ACCOUNT    ]           │
└─────────────────────────────────────┘
```

**Key Points:**
- ✅ Required checkbox (cannot submit without it)
- ✅ Explicit mention of zero-tolerance policy
- ✅ Links to full Terms and Privacy Policy
- ✅ Cannot be skipped or bypassed

---

## 2. Terms of Service Page

### Location: `/terms` (accessible from signup and settings)

```
┌─────────────────────────────────────┐
│  ← Back    Terms of Service         │
├─────────────────────────────────────┤
│                                     │
│  Last Updated: December 18, 2024    │
│                                     │
│  3. User Content and Community      │
│     Standards                       │
│                                     │
│  3.2 Zero Tolerance for             │
│      Objectionable Content          │
│                                     │
│  We maintain a strict zero-         │
│  tolerance policy for objectionable │
│  content and abusive behavior.      │
│                                     │
│  This includes:                     │
│  • Harassment, bullying, threats    │
│  • Hate speech, discrimination      │
│  • Sexually explicit content        │
│  • Spam, scams, fraud               │
│  • Copyright infringement           │
│  • Illegal content                  │
│                                     │
│  3.3 Content Moderation and         │
│      Enforcement                    │
│                                     │
│  • 24-Hour Response to reports      │
│  • Immediate Action on violations   │
│  • Content removal + user ban       │
│  • No appeals for serious violations│
│                                     │
└─────────────────────────────────────┘
```

**Key Sections:**
- ✅ Section 3.2: Zero-tolerance policy with examples
- ✅ Section 3.3: Enforcement procedures
- ✅ Section 6: Prohibited activities
- ✅ Clear consequences for violations

---

## 3. Content Flagging (Report Content)

### Location: Three-dot menu on any user content

```
┌─────────────────────────────────────┐
│  Beautiful Nail Design         ⋮    │ ← Three-dot menu
│  by @username                       │
│                                     │
│  [Nail design image]                │
│                                     │
│  ❤ 234  💬 12  🔖 Save             │
└─────────────────────────────────────┘

Tap ⋮ menu:
┌─────────────────────────────────────┐
│  🚩 Report Content                  │
│  🚫 Block User                      │
│  📋 Copy Link                       │
│  ❌ Cancel                          │
└─────────────────────────────────────┘

After tapping "Report Content":
┌─────────────────────────────────────┐
│  Report Content              ✕      │
├─────────────────────────────────────┤
│                                     │
│  Why are you reporting this?        │
│                                     │
│  ○ Inappropriate content            │
│  ○ Spam                             │
│  ○ Harassment or bullying           │
│  ○ Copyright violation              │
│  ○ Other                            │
│                                     │
│  Additional details (optional):     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [    SUBMIT REPORT    ]            │
│                                     │
└─────────────────────────────────────┘

After submission:
┌─────────────────────────────────────┐
│  ✓ Thank you for your report        │
│                                     │
│  We'll review it within 24 hours    │
│  and take appropriate action.       │
└─────────────────────────────────────┘
```

**Key Features:**
- ✅ Accessible from three-dot menu
- ✅ Multiple report categories
- ✅ Optional description field
- ✅ Confirmation message
- ✅ 24-hour response commitment

---

## 4. User Blocking

### Location: Three-dot menu on any user content

```
Tap ⋮ menu → "Block User":
┌─────────────────────────────────────┐
│  Block User                  ✕      │
├─────────────────────────────────────┤
│                                     │
│  Are you sure you want to block     │
│  @username?                         │
│                                     │
│  When you block this user:          │
│  • Their content will be removed    │
│    from your feed instantly         │
│  • They won't be able to send you   │
│    design requests                  │
│  • We'll notify our team for review │
│                                     │
│  Reason (optional):                 │
│  ○ Harassment or bullying           │
│  ○ Inappropriate content            │
│  ○ Spam                             │
│  ○ Impersonation                    │
│  ○ Other                            │
│                                     │
│  [    BLOCK USER    ]               │
│                                     │
└─────────────────────────────────────┘

After blocking:
┌─────────────────────────────────────┐
│  ✓ User blocked                     │
│                                     │
│  You won't see their content        │
│  anymore. Manage blocked users      │
│  in Settings.                       │
└─────────────────────────────────────┘
```

**Key Features:**
- ✅ Clear explanation of what happens
- ✅ Instant content removal
- ✅ Developer notification
- ✅ Optional reason selection
- ✅ Confirmation message

---

## 5. Blocked Users Management

### Location: Settings → Privacy & Security → Blocked Users

```
┌─────────────────────────────────────┐
│  ← Settings                         │
│                                     │
│  Privacy & Security                 │
├─────────────────────────────────────┤
│  Account Privacy                    │
│  Blocked Users                   >  │ ← Tap here
│  Data & Privacy                     │
└─────────────────────────────────────┘

Blocked Users Page:
┌─────────────────────────────────────┐
│  ← Back    Blocked Users            │
├─────────────────────────────────────┤
│                                     │
│  You have blocked 2 users           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ @username1                  │   │
│  │ Blocked Dec 15, 2024        │   │
│  │              [  UNBLOCK  ]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ @username2                  │   │
│  │ Blocked Dec 10, 2024        │   │
│  │              [  UNBLOCK  ]  │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Key Features:**
- ✅ List of all blocked users
- ✅ Block date shown
- ✅ Easy unblock functionality
- ✅ Accessible from Settings

---

## 6. Content Filtering (Automatic)

### How It Works:

```
BEFORE BLOCKING:
┌─────────────────────────────────────┐
│  Home Feed                          │
├─────────────────────────────────────┤
│  Design by @user1                   │
│  [Image]                            │
├─────────────────────────────────────┤
│  Design by @user2                   │ ← User you want to block
│  [Image]                            │
├─────────────────────────────────────┤
│  Design by @user3                   │
│  [Image]                            │
└─────────────────────────────────────┘

AFTER BLOCKING @user2:
┌─────────────────────────────────────┐
│  Home Feed                          │
├─────────────────────────────────────┤
│  Design by @user1                   │
│  [Image]                            │
├─────────────────────────────────────┤
│  Design by @user3                   │ ← @user2 content removed
│  [Image]                            │
├─────────────────────────────────────┤
│  Design by @user4                   │
│  [Image]                            │
└─────────────────────────────────────┘
```

**Key Features:**
- ✅ Instant removal (no refresh needed)
- ✅ Applies to all feeds (Home, Explore, Search)
- ✅ Persists across app sessions
- ✅ Database-level filtering

---

## 7. Developer Notification System

### What Happens Behind the Scenes:

```
USER ACTION:
┌─────────────────────────────────────┐
│  User flags content                 │
│         OR                          │
│  User blocks another user           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  DATABASE RECORDS:                  │
│                                     │
│  content_flags table:               │
│  - reporter_id                      │
│  - content_type                     │
│  - content_id                       │
│  - reason                           │
│  - status: "pending"                │
│  - created_at                       │
│                                     │
│  notifications table:               │
│  - admin_id                         │
│  - type: "content_flag"             │
│  - message: "User reported content" │
│  - created_at                       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ADMIN REVIEW (within 24 hours):    │
│                                     │
│  1. Review flagged content          │
│  2. Determine if violation occurred │
│  3. Take action:                    │
│     - Remove content                │
│     - Ban user                      │
│     - Update status                 │
│  4. Record action taken             │
└─────────────────────────────────────┘
```

**Key Features:**
- ✅ Instant notification to admin
- ✅ Status tracking (pending → reviewed → action_taken)
- ✅ 24-hour response commitment
- ✅ Action logging for accountability

---

## Testing Checklist

### For Apple Review Team:

1. **Terms Acceptance:**
   - [ ] Open app, go to signup
   - [ ] Try to submit without checkbox → Should fail
   - [ ] Check checkbox and review terms
   - [ ] Verify Section 3.2 zero-tolerance policy

2. **Content Flagging:**
   - [ ] Find user content
   - [ ] Tap three-dot menu (⋮)
   - [ ] Tap "Report Content"
   - [ ] Select reason and submit
   - [ ] See confirmation message

3. **User Blocking:**
   - [ ] Find user content
   - [ ] Tap three-dot menu (⋮)
   - [ ] Tap "Block User"
   - [ ] Confirm blocking
   - [ ] Verify content disappears instantly

4. **Block Management:**
   - [ ] Go to Settings
   - [ ] Tap "Blocked Users"
   - [ ] See list of blocked users
   - [ ] Test unblock functionality

5. **Content Filtering:**
   - [ ] Block a user
   - [ ] Navigate to different sections
   - [ ] Verify content stays filtered
   - [ ] Restart app
   - [ ] Verify filtering persists

---

## File Locations

### UI Components:
- `app/auth/page.tsx` - Terms acceptance checkbox
- `components/flag-content-dialog.tsx` - Report content dialog
- `components/block-user-dialog.tsx` - Block user dialog
- `components/content-moderation-menu.tsx` - Three-dot menu
- `app/settings/blocked-users/page.tsx` - Blocked users management

### API Endpoints:
- `app/api/moderation/flag-content/route.ts` - Flagging API
- `app/api/moderation/block-user/route.ts` - Blocking API
- `app/api/looks/route.ts` - Content filtering

### Legal Pages:
- `app/terms/page.tsx` - Terms of Service
- `app/privacy-policy/page.tsx` - Privacy Policy

### Database:
- `db/schema.ts` - Schema definitions
- `db/migrations/add_content_moderation.sql` - Migration

---

## Summary

All Guideline 1.2 requirements are implemented and easily accessible:

✅ **Terms:** Required acceptance with zero-tolerance policy  
✅ **Filtering:** Automatic, instant, persistent  
✅ **Flagging:** Three-dot menu on all content  
✅ **Blocking:** Instant removal + developer notification  
✅ **Management:** Settings page for blocked users  
✅ **Response:** 24-hour commitment documented  

**Status: Ready for Apple Review** ✓
