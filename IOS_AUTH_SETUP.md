# iOS Authentication & Permissions Setup Guide

## Info.plist Configuration Complete ✅

The Info.plist file has been updated with all necessary permissions and configurations for:
- ✅ Camera access
- ✅ Photo library read/write access
- ✅ Push notifications
- ✅ Sign in with Apple
- ✅ Google Sign-In

## Next Steps to Complete Setup

### 1. Sign in with Apple

Sign in with Apple is already configured in the Info.plist. You need to:

1. **Enable in Apple Developer Portal:**
   - Go to [Apple Developer Portal](https://developer.apple.com)
   - Select your app identifier (`com.ivory.app`)
   - Enable "Sign in with Apple" capability
   - Save and regenerate your provisioning profiles

2. **Enable in Xcode:**
   - Open `ios/App/App.xcworkspace` in Xcode
   - Select your project target
   - Go to "Signing & Capabilities"
   - Click "+ Capability"
   - Add "Sign in with Apple"

### 2. Google Sign-In Configuration

#### A. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select your project
3. Enable "Google+ API" or "Google Sign-In API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"

#### B. Create iOS OAuth Client

1. Select "iOS" as application type
2. Enter bundle ID: `com.ivory.app`
3. Download the configuration or copy the Client ID
4. You'll get a Client ID like: `123456789-abcdefg.apps.googleusercontent.com`

#### C. Create Web OAuth Client (for your Next.js app)

1. Create another OAuth Client ID
2. Select "Web application"
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
4. Copy both Client ID and Client Secret

#### D. Update Info.plist with Your Google Client ID

Open `ios/App/App/Info.plist` and replace these placeholders:

```xml
<!-- Replace this line -->
<string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
<!-- With your reversed client ID, for example: -->
<string>com.googleusercontent.apps.123456789-abcdefg</string>

<!-- Replace this line -->
<string>YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com</string>
<!-- With your full client ID, for example: -->
<string>123456789-abcdefg.apps.googleusercontent.com</string>
```

**To get the reversed client ID:**
- Take your iOS Client ID: `123456789-abcdefg.apps.googleusercontent.com`
- Reverse it: `com.googleusercontent.apps.123456789-abcdefg`

#### E. Update Environment Variables

Add to your `.env.local` file:

```bash
# Google OAuth (Web Client credentials)
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-web-client-secret

# Apple OAuth
APPLE_CLIENT_ID=com.ivory.app
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

### 3. Install Required Capacitor Plugins

```bash
# For Google Sign-In
yarn add @codetrix-studio/capacitor-google-auth

# For Apple Sign-In
yarn add @capacitor/sign-in-with-apple

# For Push Notifications
yarn add @capacitor/push-notifications
```

### 4. Update Capacitor Configuration

Add to `capacitor.config.ts`:

```typescript
plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email'],
    serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    forceCodeForRefreshToken: true,
  },
  PushNotifications: {
    presentationOptions: ['badge', 'sound', 'alert'],
  },
  // ... existing plugins
}
```

### 5. Enable Push Notifications in Xcode

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your project target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and check "Remote notifications"

### 6. Configure Apple Push Notification Service (APNs)

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Go to "Certificates, Identifiers & Profiles"
3. Select "Keys" and create a new key
4. Enable "Apple Push Notifications service (APNs)"
5. Download the key file (.p8) and note the Key ID
6. You'll need this for your backend push notification service

### 7. Sync Changes to iOS

```bash
npx cap sync ios
```

### 8. Testing

1. Open the app in Xcode: `npx cap open ios`
2. Build and run on a real device (Sign in with Apple requires a real device)
3. Test both Google and Apple sign-in flows

## Troubleshooting

### Google Sign-In Issues

- **Error: "Invalid client ID"** - Make sure you're using the iOS Client ID in Info.plist and Web Client ID in your environment variables
- **Redirect issues** - Verify your bundle ID matches exactly: `com.ivory.app`
- **Not working on simulator** - Some OAuth features work better on real devices

### Sign in with Apple Issues

- **Not showing up** - Ensure capability is enabled in both Xcode and Apple Developer Portal
- **Invalid credentials** - Regenerate provisioning profiles after enabling the capability
- **Only works on device** - Sign in with Apple requires a real iOS device for testing

## Security Notes

- Never commit your Google Client Secret or Apple Private Key to version control
- Use environment variables for all sensitive credentials
- The reversed client ID in Info.plist is safe to commit (it's not a secret)
- Keep your `.env.local` file in `.gitignore`

## Additional Resources

- [Google Sign-In iOS Setup](https://developers.google.com/identity/sign-in/ios/start)
- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Capacitor Google Auth Plugin](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Capacitor Apple Sign-In](https://capacitorjs.com/docs/apis/sign-in-with-apple)
