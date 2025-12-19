# Response to Apple Review - Guideline 1.2 User-Generated Content

## Summary of Changes

We have implemented comprehensive content moderation features that fully comply with App Store Review Guideline 1.2. All required precautions are now in place and functional.

---

## ✅ Requirement 1: Terms of Service (EULA) with Zero-Tolerance Policy

### Implementation:
- **Location:** `/terms` page accessible from signup and settings
- **Required Acceptance:** Users must check a box during signup explicitly agreeing to terms
- **Zero-Tolerance Language:** Section 3.2 clearly states our zero-tolerance policy

### Key Terms Language:
> "We maintain a strict zero-tolerance policy for objectionable content and abusive behavior. This includes but is not limited to:
> - Harassment, bullying, or threats toward other users
> - Hate speech, discrimination, or content promoting violence
> - Sexually explicit, pornographic, or inappropriate content
> - Spam, scams, or fraudulent activity
> - Content that infringes on intellectual property rights
> - Illegal content or content promoting illegal activities"

### Enforcement Policy (Section 3.3):
> "We actively moderate user-generated content and take swift action against violations:
> - **24-Hour Response:** We review all reported content within 24 hours
> - **Immediate Action:** Objectionable content is removed and violating users are banned from the platform
> - **No Appeals for Serious Violations:** Users who post illegal, harmful, or abusive content will be permanently banned"

### How to Verify:
1. Open the app
2. Tap "Create account" on the auth screen
3. Scroll down to see the required checkbox
4. Note the explicit language: "including our zero-tolerance policy for objectionable content and abusive behavior"
5. Tap "Terms of Service" link to view full terms
6. See Section 3.2 "Zero Tolerance for Objectionable Content"
7. See Section 3.3 "Content Moderation and Enforcement"

**Files:**
- `app/auth/page.tsx` - Required checkbox during signup (lines 150-175)
- `app/terms/page.tsx` - Complete Terms of Service with zero-tolerance policy

---

## ✅ Requirement 2: Method for Filtering Objectionable Content

### Implementation:
- **Automatic Filtering:** Content from blocked users is automatically filtered from all feeds
- **Real-time Filtering:** Blocking takes effect immediately without app restart
- **Database-Level Filtering:** All content queries exclude blocked users

### How It Works:
1. When a user blocks another user, the relationship is stored in `blocked_users` table
2. All feed queries (looks, designs, profiles) automatically filter out blocked users
3. The blocked user's content disappears instantly from the blocker's feed
4. Filter persists across app sessions and devices

### Technical Implementation:
```typescript
// Example from app/api/looks/route.ts
const blockedUserIds = blockedUsers.map(b => b.blockedId)
const looks = await db.query.looks.findMany({
  where: and(
    eq(looks.userId, userId),
    blockedUserIds.length > 0 
      ? not(inArray(looks.userId, blockedUserIds))
      : undefined
  )
})
```

### How to Verify:
1. Log in as User A
2. View another user's (User B) content in the feed
3. Block User B using the three-dot menu → "Block User"
4. Observe User B's content immediately disappears from feed
5. Navigate to different sections - content remains filtered
6. Restart app - content still filtered

**Files:**
- `app/api/looks/route.ts` - Feed filtering implementation
- `app/api/moderation/block-user/route.ts` - Blocking API
- `db/schema.ts` - `blocked_users` table schema

---

## ✅ Requirement 3: Mechanism for Users to Flag Objectionable Content

### Implementation:
- **Universal Reporting:** Three-dot menu (⋮) on all user-generated content
- **Multiple Report Reasons:** Inappropriate content, spam, harassment, copyright violation, other
- **Optional Details:** Users can provide additional context
- **Instant Notification:** Developers receive immediate notification of all reports

### Report Categories:
1. Inappropriate content
2. Spam
3. Harassment or bullying
4. Copyright violation
5. Other (with description field)

### What Happens When Content is Flagged:
1. Report saved to `content_flags` table with timestamp
2. Status set to "pending"
3. Developer/admin receives instant notification
4. Report includes: reporter ID, content type, content ID, reason, description
5. Admin can review and take action within 24 hours

### How to Verify:
1. Navigate to any user-generated content (nail design, profile, review)
2. Tap the three-dot menu (⋮) in the top-right corner
3. Tap "Report Content"
4. Select a reason from the list
5. Optionally add additional details
6. Tap "Submit Report"
7. See confirmation: "Thank you for your report. We'll review it within 24 hours."

**Files:**
- `components/flag-content-dialog.tsx` - Reporting UI component
- `app/api/moderation/flag-content/route.ts` - Reporting API endpoint
- `components/content-moderation-menu.tsx` - Three-dot menu integration
- `db/schema.ts` - `content_flags` table schema

---

## ✅ Requirement 4: Mechanism for Users to Block Abusive Users

### Implementation:
- **Universal Blocking:** Available on all user content via three-dot menu
- **Instant Effect:** Blocked user's content removed from feed immediately
- **Developer Notification:** All blocks notify developers for review
- **Block Management:** Users can view and manage blocked users in Settings

### What Happens When a User is Blocked:
1. ✅ **Instant Feed Removal:** All content from blocked user disappears immediately
2. ✅ **Developer Notification:** Admin receives alert about the block with context
3. ✅ **Auto-Flagging:** All content from blocked user is automatically flagged for review
4. ✅ **Persistent:** Block remains until user manually unblocks
5. ✅ **Privacy:** Blocked user is not notified

### Block Reasons (Optional):
- Harassment or bullying
- Inappropriate content
- Spam
- Impersonation
- Other

### How to Verify:
1. Navigate to another user's content or profile
2. Tap the three-dot menu (⋮)
3. Tap "Block User" (shown in red)
4. Review the blocking information dialog
5. Optionally select a reason
6. Tap "Block User" to confirm
7. **Observe:** All content from that user disappears instantly
8. Go to Settings → Privacy & Security → Blocked Users
9. See list of blocked users with unblock option

**Files:**
- `components/block-user-dialog.tsx` - Blocking UI component
- `app/api/moderation/block-user/route.ts` - Blocking API endpoint
- `app/settings/blocked-users/page.tsx` - Block management page
- `components/content-moderation-menu.tsx` - Three-dot menu integration
- `db/schema.ts` - `blocked_users` table schema

---

## ✅ Requirement 5: Developer Action Within 24 Hours

### Implementation:
- **Notification System:** All flags and blocks create admin notifications
- **Status Tracking:** Content flags have status field (pending, reviewed, action_taken, dismissed)
- **Admin Dashboard Ready:** Database structure supports admin review interface
- **Commitment:** We commit to reviewing all reports within 24 hours and taking appropriate action

### Review Process:
1. **Notification Received:** Admin receives instant notification of flag/block
2. **Review Content:** Admin reviews flagged content and context
3. **Take Action:** Within 24 hours, admin either:
   - Removes content and bans user (for violations)
   - Dismisses report (if no violation found)
4. **Update Status:** Flag status updated to reflect action taken
5. **User Ejection:** Violating users are permanently banned

### Database Structure:
```sql
content_flags table:
- status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
- reviewed_by: Admin user ID
- reviewed_at: Timestamp of review
- action_taken: Description of action (e.g., "User banned, content removed")
```

### Admin Endpoints (Ready for Admin Dashboard):
- `GET /api/moderation/flag-content?status=pending` - View pending reports
- `PATCH /api/moderation/flag-content/[id]` - Update flag status and action
- `DELETE /api/users/[id]` - Ban user account
- `DELETE /api/looks/[id]` - Remove objectionable content

### How to Verify:
1. Flag content as described in Requirement 3
2. Check database `content_flags` table for new entry with status "pending"
3. Check `notifications` table for admin notification
4. Admin can query pending flags and take action
5. Status updates to "action_taken" or "dismissed" after review

**Files:**
- `app/api/moderation/flag-content/route.ts` - Flag management API
- `db/schema.ts` - `content_flags` and `notifications` tables
- Database migration: `db/migrations/add_content_moderation.sql`

---

## Testing Instructions for Apple Review Team

### Test Account Credentials
We can provide test accounts upon request through App Store Connect.

### Complete Test Flow:

#### 1. Test Terms Acceptance (New Users)
1. Open app
2. Tap "Create account"
3. Try to submit without checking terms box → Should show error
4. Check the terms acceptance box
5. Note the explicit zero-tolerance language
6. Tap "Terms of Service" link to view full terms
7. Complete signup

#### 2. Test Content Flagging
1. Log in to the app
2. Navigate to Home or Explore
3. Find any user-generated content (nail design)
4. Tap the three-dot menu (⋮) in top-right
5. Tap "Report Content"
6. Select a reason (e.g., "Inappropriate content")
7. Add optional details
8. Tap "Submit Report"
9. See confirmation message

#### 3. Test User Blocking
1. While viewing another user's content
2. Tap the three-dot menu (⋮)
3. Tap "Block User" (red text)
4. Review the blocking information
5. Optionally select a reason
6. Tap "Block User"
7. **Verify:** Content disappears immediately from feed
8. Navigate to Settings → Privacy & Security → Blocked Users
9. See blocked user in list
10. Tap "Unblock" to test unblock functionality

#### 4. Test Content Filtering
1. Block a user (as above)
2. Navigate to different sections (Home, Explore)
3. Verify blocked user's content does not appear
4. Close and reopen app
5. Verify content still filtered

#### 5. Verify Developer Notification
1. After flagging content or blocking user
2. Check database `notifications` table
3. Verify admin notification was created
4. Check `content_flags` or `blocked_users` table for entry

---

## Database Schema

### content_flags Table
```sql
CREATE TABLE content_flags (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  content_type VARCHAR(50) NOT NULL, -- 'look', 'review', 'profile'
  content_id INTEGER NOT NULL,
  content_owner_id INTEGER NOT NULL REFERENCES users(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'action_taken', 'dismissed'
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### blocked_users Table
```sql
CREATE TABLE blocked_users (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER NOT NULL REFERENCES users(id),
  blocked_id INTEGER NOT NULL REFERENCES users(id),
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

---

## File Reference

### Core Implementation Files:
1. **Terms & Policy:**
   - `app/terms/page.tsx` - Terms of Service with zero-tolerance policy
   - `app/privacy-policy/page.tsx` - Privacy Policy
   - `app/auth/page.tsx` - Required terms acceptance during signup

2. **Content Flagging:**
   - `components/flag-content-dialog.tsx` - Reporting UI
   - `app/api/moderation/flag-content/route.ts` - Reporting API
   - `components/content-moderation-menu.tsx` - Three-dot menu

3. **User Blocking:**
   - `components/block-user-dialog.tsx` - Blocking UI
   - `app/api/moderation/block-user/route.ts` - Blocking API
   - `app/settings/blocked-users/page.tsx` - Block management

4. **Content Filtering:**
   - `app/api/looks/route.ts` - Feed filtering implementation
   - All content APIs filter blocked users

5. **Database:**
   - `db/schema.ts` - Schema definitions
   - `db/migrations/add_content_moderation.sql` - Migration script

6. **Documentation:**
   - `CONTENT_MODERATION_IMPLEMENTATION.md` - Technical documentation
   - `APPLE_REVIEW_MODERATION_GUIDE.md` - Review team guide

---

## Summary

We have fully implemented all requirements for Guideline 1.2:

✅ **Terms with Zero-Tolerance Policy:** Required acceptance during signup with explicit language  
✅ **Content Filtering:** Automatic filtering of blocked users' content  
✅ **Content Flagging:** Comprehensive reporting system with multiple categories  
✅ **User Blocking:** Instant blocking with feed removal and developer notification  
✅ **24-Hour Response:** Database structure and commitment to review within 24 hours  

All features are live, tested, and ready for review. We are committed to maintaining a safe, respectful community and will take swift action against any violations.

---

## Contact

For questions during review or to request test accounts:
- App Store Connect messaging
- Email: mirrosocial@gmail.com

Thank you for your thorough review. We look forward to approval.
