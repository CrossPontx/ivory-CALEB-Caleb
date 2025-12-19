# App Store Resubmission - Guideline 1.2 Compliance

## To: Apple App Review Team

Thank you for your feedback regarding Guideline 1.2 - User-Generated Content. We have carefully addressed all requirements and implemented comprehensive content moderation features.

---

## Summary of Changes

We have implemented all required precautions for apps with user-generated content:

### 1. ✅ Required Terms Acceptance with Zero-Tolerance Policy
- Users must explicitly accept Terms of Service during signup
- Terms clearly state zero-tolerance for objectionable content
- Checkbox includes explicit mention of zero-tolerance policy
- Cannot create account without acceptance

### 2. ✅ Content Filtering System
- Automatic filtering of blocked users' content
- Real-time, instant filtering across all feeds
- Database-level implementation for reliability
- Persists across app sessions

### 3. ✅ Content Flagging Mechanism
- Three-dot menu on all user-generated content
- Multiple report categories (inappropriate, spam, harassment, copyright, other)
- Optional detailed description field
- Instant developer notification
- Confirmation message to reporter

### 4. ✅ User Blocking Mechanism
- Block option on all user content
- **Instant content removal** from blocker's feed
- **Developer notification** for every block
- Optional reason selection
- Settings page to manage blocked users
- Unblock functionality

### 5. ✅ 24-Hour Developer Response Commitment
- All reports tracked in database with status
- Admin notification system for all flags/blocks
- Commitment documented in Terms of Service (Section 3.3)
- Database structure supports admin review workflow
- Violating users will be permanently banned

---

## How to Test

### Test 1: Terms Acceptance (Required)
1. Open app and tap "Create account"
2. Attempt to submit without checking terms box → Will show error
3. Check the terms acceptance checkbox
4. Note the text: "including our zero-tolerance policy for objectionable content and abusive behavior"
5. Tap "Terms of Service" link
6. Review Section 3.2 "Zero Tolerance for Objectionable Content"
7. Review Section 3.3 "Content Moderation and Enforcement"

### Test 2: Flag Content
1. Navigate to Home or Explore
2. Find any nail design (user-generated content)
3. Tap the three-dot menu (⋮) in top-right corner
4. Tap "Report Content"
5. Select a reason (e.g., "Inappropriate content")
6. Optionally add details
7. Tap "Submit Report"
8. See confirmation: "Thank you for your report. We'll review it within 24 hours."

### Test 3: Block User
1. View another user's content
2. Tap the three-dot menu (⋮)
3. Tap "Block User" (shown in red)
4. Review the blocking information dialog
5. Optionally select a reason
6. Tap "Block User"
7. **Observe:** Content disappears immediately from feed
8. Navigate to Settings → Privacy & Security → Blocked Users
9. View blocked users list
10. Test unblock functionality

### Test 4: Content Filtering
1. After blocking a user (Test 3)
2. Navigate to different sections (Home, Explore)
3. Verify blocked user's content does not appear anywhere
4. Close and reopen the app
5. Verify content remains filtered

---

## Key Implementation Details

### Terms of Service
- **Location:** `/terms` page
- **Section 3.2:** Zero-tolerance policy with specific examples
- **Section 3.3:** Enforcement procedures and 24-hour commitment
- **Section 6:** Prohibited activities with consequences

### Signup Flow
- **File:** `app/auth/page.tsx`
- Required checkbox with explicit zero-tolerance language
- Links to full Terms and Privacy Policy
- Cannot proceed without acceptance

### Moderation Features
- **Flagging:** `components/flag-content-dialog.tsx`
- **Blocking:** `components/block-user-dialog.tsx`
- **Menu:** `components/content-moderation-menu.tsx` (three-dot menu)
- **Settings:** `app/settings/blocked-users/page.tsx`

### API Endpoints
- `POST /api/moderation/flag-content` - Report content
- `POST /api/moderation/block-user` - Block user
- `GET /api/moderation/block-user` - Get blocked users
- `DELETE /api/moderation/block-user` - Unblock user

### Database Tables
- `content_flags` - Stores all content reports with status tracking
- `blocked_users` - Stores blocking relationships
- `notifications` - Admin notifications for all flags/blocks

---

## Documentation

We have prepared comprehensive documentation:

1. **APPLE_GUIDELINE_1_2_RESPONSE.md** - Detailed response to each requirement
2. **GUIDELINE_1_2_CHECKLIST.md** - Verification checklist
3. **CONTENT_MODERATION_IMPLEMENTATION.md** - Technical implementation details
4. **APPLE_REVIEW_MODERATION_GUIDE.md** - Testing guide for review team

---

## Test Account

We are happy to provide test account credentials through App Store Connect messaging if needed for your review.

---

## Our Commitment

We are committed to maintaining a safe, respectful community:

- **Zero tolerance** for objectionable content and abusive behavior
- **24-hour response** to all content reports
- **Immediate action** against violating users (content removal + account ban)
- **Continuous monitoring** of user-generated content
- **Regular updates** to moderation systems as needed

---

## Changes Made Since Last Submission

1. ✅ Added required Terms of Service acceptance checkbox during signup
2. ✅ Enhanced Terms with explicit zero-tolerance policy (Section 3.2)
3. ✅ Added enforcement procedures to Terms (Section 3.3)
4. ✅ Implemented content flagging system with multiple categories
5. ✅ Implemented user blocking with instant content removal
6. ✅ Added Settings page for managing blocked users
7. ✅ Implemented automatic content filtering for blocked users
8. ✅ Added developer notification system for all flags/blocks
9. ✅ Created database structure for tracking and reviewing reports
10. ✅ Documented 24-hour response commitment in Terms

---

## Contact

For any questions during review:
- **App Store Connect:** Preferred method
- **Email:** mirrosocial@gmail.com

We appreciate your thorough review and look forward to approval.

Thank you,
Ivory Development Team
