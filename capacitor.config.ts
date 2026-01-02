import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ivory.app',
  appName: "Ivory's Choice",
  webDir: 'out',
  server: {
    // Production URL
    url: 'https://ivory-blond.vercel.app',
    // For local development, uncomment below:
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app needs camera access to capture photos of your hands',
        photos: 'This app needs photo library access to save and load nail designs'
      }
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '87680335444-6arbuilc8506recr49muu0lvol5hrs7a.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    IAPPlugin: {
      // Apple In-App Purchase plugin for subscriptions and credits
      // Auto-finish transactions after validation
      autoFinish: false,
      // Enable detailed logging for debugging
      verboseLogging: true,
      // Product IDs for validation
      products: [
        'com.ivory.credits.10',
        'com.ivory.credits.25',
        'com.ivory.credits.50',
        'com.ivory.credits.100',
        'com.ivory.subscription.monthly',
        'com.ivory.subscription.yearly'
      ]
    }
  }
};

export default config;
