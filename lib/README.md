# Lib Services

This directory contains core service modules for the application.

## Email Service (`email.ts`)

Email service using Resend API for transactional emails.

### Features

- **Welcome Emails**: Automatically sent when new users sign up
  - Different templates for clients vs nail techs
  - Personalized with username and user type
  - Includes quick start guides and CTAs

- **Password Reset Emails**: Secure password reset flow
  - Time-limited reset tokens
  - Branded email templates

### Configuration

Required environment variables in `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Usage

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// Send welcome email on signup
await sendWelcomeEmail({
  email: 'user@example.com',
  username: 'JohnDoe',
  userType: 'client' // or 'tech'
});
```

### Email Templates

- **Client Welcome**: Focuses on design creation, AI features, and finding techs
- **Tech Welcome**: Emphasizes profile setup, portfolio, and receiving client requests
- **Password Reset**: Simple, secure reset flow with expiring links

All emails are responsive and use branded colors matching the Mirro design system.

## Other Services

- `auth.ts` - Authentication and session management
- `storage.ts` - File upload and storage (R2, B2, Vercel Blob)
- `ai.ts` - AI image generation and processing
- `env.ts` - Environment variable validation and type-safe access
