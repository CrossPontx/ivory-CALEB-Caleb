# Password Reset Feature

## Overview
Users can now reset their passwords via email using the Resend API.

## User Flow

1. **Forgot Password**
   - User clicks "Forgot password?" on login page
   - Enters their email address
   - Receives a password reset email with a secure link

2. **Reset Password**
   - User clicks the link in the email
   - Enters a new password (minimum 6 characters)
   - Confirms the new password
   - Password is updated and user can log in

## Technical Implementation

### Database Changes
Added to `users` table:
- `resetPasswordToken` - Unique token for password reset
- `resetPasswordExpires` - Expiration timestamp (1 hour)

### API Routes

#### POST `/api/auth/forgot-password`
- Accepts: `{ email: string }`
- Generates a secure reset token
- Sends email via Resend API
- Returns success message (prevents email enumeration)

#### POST `/api/auth/reset-password`
- Accepts: `{ token: string, password: string }`
- Validates token and expiration
- Updates user password
- Clears reset token

### Pages

#### `/forgot-password`
- Email input form
- Success confirmation message
- Link back to login

#### `/reset-password?token=xxx`
- New password input
- Confirm password input
- Password strength validation
- Success redirect to login

### Email Template
The password reset email includes:
- Clear call-to-action button
- 1-hour expiration notice
- Security notice if user didn't request reset
- Branded Ivory/Mirro styling

## Security Features

1. **Token Expiration**: Reset links expire after 1 hour
2. **One-time Use**: Tokens are cleared after successful reset
3. **Email Enumeration Prevention**: Same response for valid/invalid emails
4. **Secure Token Generation**: Uses crypto.randomBytes(32)
5. **OAuth Users Protected**: Only email auth users can reset passwords

## Environment Variables Required

```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
BASE_URL=https://yourdomain.com
```

## Testing

1. Go to login page
2. Click "Forgot password?"
3. Enter your email
4. Check email for reset link
5. Click link and set new password
6. Log in with new password

## Future Enhancements

- Add rate limiting to prevent abuse
- Implement bcrypt password hashing
- Add password strength meter
- Send confirmation email after successful reset
- Add 2FA support
