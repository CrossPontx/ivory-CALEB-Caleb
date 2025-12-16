# Content Moderation - Apple Review Testing Guide

## ✅ Compliance Summary

This app **fully complies** with App Store Review Guideline 1.2 - User-Generated Content by providing:

1. ✅ **Mechanism for users to flag objectionable content**
2. ✅ **Mechanism for users to block abusive users**
3. ✅ **Instant content removal from blocker's feed**
4. ✅ **Developer notification system**

---

## 🧪 How to Test Moderation Features

### Prerequisites
- Create at least 2 test accounts (Account A and Account B)
- Have Account B create some nail designs (user-generated content)

---

### Test 1: Flag Objectionable Content

**Steps:**
1. Log in as **Account A**
2. Navigate to the **Home** page (bottom navigation)
3. Find a design created by **Account B**
4. Look for the **three-dot menu (⋮)** in the top-right corner of the design card
5. Tap the **three-dot menu**
6. Select **"Report Content"** (with flag icon)
7. Choose a reason:
   - Inappropriate content
   - Spam
   - Harassment or bullying
   - Copyright violation
   - Other
8. Optionally add additional details
9. Tap **"Submit Report"**

**Expected Result:**
- ✅ Confirmation message: "Thank you for your report"
- ✅ Report saved to database
- ✅ Developer receives notification
- ✅ Content flagged for review

**Database Verification:**
```sql
SELECT * FROM content_flags WHERE reporter_id = [Account A ID];
```

---

### Test 2: Block Abusive User

**Steps:**
1. Log in as **Account A**
2. Navigate to the **Home** page
3. Find a design created by **Account B**
4. Tap the **three-dot menu (⋮)** on the design card
5. Select **"Block User"** (shown in red with user-x icon)
6. Review the blocking information dialog:
   - Content removed from feed instantly
   - User cannot send design requests
   - Developer notified for review
7. Optionally select a reason
8. Tap **"Block User"** to confirm

**Expected Result:**
- ✅ **INSTANT EFFECT:** All of Account B's designs disappear from Account A's feed immediately
- ✅ Developer receives notification about the block
- ✅ Account B's content is auto-flagged for review
- ✅ Block persists across app restarts

**Verification:**
1. Refresh the Home page - Account B's content should NOT appear
2. Log out and log back in - Account B's content should still be hidden
3. Check database:
```sql
SELECT * FROM blocked_users WHERE blocker_id = [Account A ID];
```

---

### Test 3: Manage Blocked Users

**Steps:**
1. Log in as **Account A** (who blocked Account B)
2. Tap **Settings** in the bottom navigation
3. Scroll to **Privacy & Security** section
4. Tap **"Blocked Users"**
5. View the list of blocked users
6. Tap **"Unblock"** next to Account B
7. Navigate back to **Home**

**Expected Result:**
- ✅ Blocked users list shows Account B
- ✅ After unblocking, Account B's content reappears in feed
- ✅ Can re-block if needed

---

## 📍 Where Moderation Features Appear

### 1. Home Page (Main Feed)
- **Location:** Bottom navigation → Home
- **Features:** Three-dot menu on each design card
- **Actions:** Report Content, Block User

### 2. Settings Page
- **Location:** Bottom navigation → Settings → Blocked Users
- **Features:** Manage blocked users list
- **Actions:** View blocked users, Unblock users

### 3. Individual Look Pages
- **Location:** Tap any design to view details
- **Features:** Three-dot menu (if not your own content)
- **Actions:** Report Content, Block User

---

## 🔍 Visual Indicators

### Three-Dot Menu (⋮)
- Appears on all user-generated content
- Only visible on OTHER users' content (not your own)
- Located in the top-right corner of design cards

### Menu Options
1. **"Report Content"** - Flag icon, normal text color
2. **"Block User"** - User-X icon, RED text color

---

## 🛡️ Safety Features

### Instant Content Removal
When a user blocks another user:
- ✅ Blocked user's content disappears **immediately** from feed
- ✅ No page refresh required
- ✅ Effect persists across sessions
- ✅ Applies to all content types

### Developer Notifications
All moderation actions create notifications:
- Content flags → Admin notified with content details
- User blocks → Admin notified with user IDs and reason
- Stored in `notifications` table for review

### Privacy Protection
- ✅ Anonymous reporting (content owner doesn't see who reported)
- ✅ No notification sent to blocked users
- ✅ Private block list management
- ✅ Cannot block yourself (validation)
- ✅ Cannot block same user twice (database constraint)

---

## 📊 Database Schema

### content_flags Table
```sql
CREATE TABLE content_flags (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id),
  content_type VARCHAR(50), -- 'look', 'review', 'profile'
  content_id INTEGER,
  content_owner_id INTEGER REFERENCES users(id),
  reason VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  action_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### blocked_users Table
```sql
CREATE TABLE blocked_users (
  id SERIAL PRIMARY KEY,
  blocker_id INTEGER REFERENCES users(id),
  blocked_id INTEGER REFERENCES users(id),
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

---

## 🔧 Technical Implementation

### API Endpoints

**Flag Content:**
```
POST /api/moderation/flag-content
Body: {
  reporterId: number,
  contentType: 'look' | 'review' | 'profile',
  contentId: number,
  contentOwnerId: number,
  reason: string,
  description?: string
}
```

**Block User:**
```
POST /api/moderation/block-user
Body: {
  blockerId: number,
  blockedId: number,
  reason?: string
}
```

**Get Blocked Users:**
```
GET /api/moderation/block-user?userId={userId}
```

**Unblock User:**
```
DELETE /api/moderation/block-user?blockerId={blockerId}&blockedId={blockedId}
```

### Feed Filtering
The `/api/looks` endpoint automatically filters blocked users:
```
GET /api/looks?userId={userId}&currentUserId={currentUserId}
```
- Returns looks with user information
- Excludes content from blocked users
- Real-time filtering

---

## 📱 User Flow Diagrams

### Reporting Flow
```
User sees inappropriate content
    ↓
Taps three-dot menu (⋮)
    ↓
Selects "Report Content"
    ↓
Chooses reason + optional details
    ↓
Submits report
    ↓
Sees confirmation message
    ↓
Developer receives notification
    ↓
Admin reviews in dashboard
```

### Blocking Flow
```
User encounters abusive user
    ↓
Taps three-dot menu (⋮)
    ↓
Selects "Block User"
    ↓
Reviews blocking information
    ↓
Confirms block
    ↓
Content disappears INSTANTLY
    ↓
Developer receives notification
    ↓
User can manage blocks in Settings
```

---

## ✨ Key Compliance Points

### ✅ Requirement 1: Flag Objectionable Content
- **Implementation:** `components/flag-content-dialog.tsx`
- **API:** `app/api/moderation/flag-content/route.ts`
- **Database:** `content_flags` table
- **Location:** Three-dot menu on all user-generated content
- **Notification:** Instant admin notification

### ✅ Requirement 2: Block Abusive Users
- **Implementation:** `components/block-user-dialog.tsx`
- **API:** `app/api/moderation/block-user/route.ts`
- **Database:** `blocked_users` table
- **Location:** Three-dot menu + Settings page
- **Effect:** Instant content removal from feed
- **Notification:** Instant admin notification

### ✅ Requirement 3: Developer Notification
- **Implementation:** Automatic notification creation
- **Database:** `notifications` table
- **Triggers:** All flags and blocks
- **Content:** User IDs, content IDs, reasons, timestamps

---

## 📞 Support

For questions during review:
- **Technical Documentation:** `CONTENT_MODERATION_IMPLEMENTATION.md`
- **Database Schema:** `db/schema.ts`
- **API Routes:** `app/api/moderation/`
- **UI Components:** `components/flag-content-dialog.tsx`, `components/block-user-dialog.tsx`

---

## 🎯 Quick Test Checklist

- [ ] Create 2 test accounts
- [ ] Account B creates nail designs
- [ ] Account A can see Account B's designs in Home feed
- [ ] Account A can tap three-dot menu on Account B's designs
- [ ] Account A can report content (flag)
- [ ] Account A can block Account B
- [ ] Account B's content disappears instantly from Account A's feed
- [ ] Account A can view blocked users in Settings
- [ ] Account A can unblock Account B
- [ ] Account B's content reappears after unblock

---

## ✅ Submission Ready

This app is **ready for Apple App Store submission** with full compliance for Guideline 1.2 - User-Generated Content.

All moderation features are:
- ✅ Implemented and tested
- ✅ Visible and accessible to users
- ✅ Functional with instant effects
- ✅ Documented for review team
- ✅ Database-backed and persistent
- ✅ Privacy-compliant
