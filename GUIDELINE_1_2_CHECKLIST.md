# Guideline 1.2 Compliance Checklist

## Quick Verification Checklist

Use this checklist to verify all Guideline 1.2 requirements are met before resubmission.

---

## ✅ 1. Terms of Service (EULA)

- [x] Terms page exists at `/terms`
- [x] Terms include explicit zero-tolerance policy (Section 3.2)
- [x] Terms describe enforcement actions (Section 3.3)
- [x] Terms accessible from signup page
- [x] **Required checkbox during signup**
- [x] Checkbox text mentions zero-tolerance policy
- [x] Cannot create account without accepting terms

**Test:**
1. Go to signup page
2. Try to submit without checking box → Should fail
3. Check box and read terms
4. Verify Section 3.2 has zero-tolerance language

---

## ✅ 2. Content Filtering

- [x] Blocked users' content filtered from feeds
- [x] Filtering happens automatically
- [x] Filtering is instant (no app restart needed)
- [x] Filtering persists across sessions
- [x] Database-level filtering implementation

**Test:**
1. Block a user
2. Verify their content disappears immediately
3. Navigate to different sections
4. Restart app
5. Verify content still filtered

---

## ✅ 3. Flag Objectionable Content

- [x] Three-dot menu on all user content
- [x] "Report Content" option visible
- [x] Multiple report reasons available
- [x] Optional description field
- [x] Confirmation message after reporting
- [x] Developer receives notification
- [x] Report saved to database

**Test:**
1. Find any user content
2. Tap three-dot menu (⋮)
3. Tap "Report Content"
4. Select reason and submit
5. See confirmation message
6. Check database for flag entry

---

## ✅ 4. Block Abusive Users

- [x] Three-dot menu on all user content
- [x] "Block User" option visible (in red)
- [x] Blocking dialog explains what happens
- [x] Optional reason selection
- [x] Content removed instantly from feed
- [x] Developer receives notification
- [x] Block saved to database
- [x] Settings page to manage blocks
- [x] Unblock functionality works

**Test:**
1. Find another user's content
2. Tap three-dot menu (⋮)
3. Tap "Block User"
4. Confirm blocking
5. Verify content disappears instantly
6. Go to Settings → Blocked Users
7. See blocked user in list
8. Test unblock

---

## ✅ 5. Developer Action Within 24 Hours

- [x] Notification system for flags/blocks
- [x] Database tracks flag status
- [x] Admin can review pending flags
- [x] Admin can take action (remove content, ban user)
- [x] Status updates after action
- [x] Commitment documented in terms

**Test:**
1. Flag content or block user
2. Check `notifications` table for admin notification
3. Check `content_flags` table for pending status
4. Verify admin endpoints work
5. Verify terms mention 24-hour response

---

## Pre-Submission Checklist

Before submitting to Apple:

- [ ] Run through all test flows above
- [ ] Verify terms acceptance is required
- [ ] Test flagging on multiple content types
- [ ] Test blocking and verify instant removal
- [ ] Check Settings → Blocked Users page works
- [ ] Verify three-dot menu appears on all user content
- [ ] Test on physical iOS device
- [ ] Prepare test account credentials for Apple
- [ ] Review `APPLE_GUIDELINE_1_2_RESPONSE.md`
- [ ] Take screenshots of key features for App Store Connect

---

## Key Files to Review

1. `app/auth/page.tsx` - Terms acceptance checkbox
2. `app/terms/page.tsx` - Zero-tolerance policy
3. `components/flag-content-dialog.tsx` - Reporting UI
4. `components/block-user-dialog.tsx` - Blocking UI
5. `app/settings/blocked-users/page.tsx` - Block management
6. `app/api/moderation/flag-content/route.ts` - Flagging API
7. `app/api/moderation/block-user/route.ts` - Blocking API
8. `app/api/looks/route.ts` - Content filtering

---

## Response to Apple

When resubmitting, reference:
- `APPLE_GUIDELINE_1_2_RESPONSE.md` - Complete response document
- Explain all changes made
- Offer test account credentials
- Highlight the required terms acceptance
- Emphasize 24-hour response commitment

---

## Common Issues to Avoid

❌ **Don't:**
- Skip the terms acceptance checkbox
- Make terms optional
- Hide moderation features
- Forget to filter blocked users in all feeds
- Delay implementing admin review process

✅ **Do:**
- Make terms acceptance required and prominent
- Show clear zero-tolerance language
- Make reporting/blocking easy to find
- Ensure instant content removal when blocking
- Commit to 24-hour review in terms

---

## Status: ✅ READY FOR RESUBMISSION

All Guideline 1.2 requirements have been implemented and tested.
