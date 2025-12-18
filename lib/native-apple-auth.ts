import { SignInWithApple, SignInWithAppleOptions, SignInWithAppleResponse } from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';

export interface AppleAuthResult {
  success: boolean;
  user?: {
    identityToken: string;
    authorizationCode: string;
    email?: string;
    givenName?: string;
    familyName?: string;
  };
  error?: string;
}

/**
 * Native Sign in with Apple for iOS
 * Uses Apple's native SDK instead of web OAuth flow
 */
export async function signInWithAppleNative(): Promise<AppleAuthResult> {
  // Only works on iOS
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return {
      success: false,
      error: 'Native Apple Sign In only available on iOS'
    };
  }

  try {
    const options: SignInWithAppleOptions = {
      clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
      redirectURI: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/apple`,
      scopes: 'email name',
      state: '12345',
      nonce: 'nonce',
    };

    const result: SignInWithAppleResponse = await SignInWithApple.authorize(options);

    if (result.response && result.response.identityToken) {
      return {
        success: true,
        user: {
          identityToken: result.response.identityToken,
          authorizationCode: result.response.authorizationCode || '',
          email: result.response.email || undefined,
          givenName: result.response.givenName || undefined,
          familyName: result.response.familyName || undefined,
        }
      };
    }

    return {
      success: false,
      error: 'No identity token received'
    };
  } catch (error: any) {
    console.error('Native Apple Sign In error:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
}
