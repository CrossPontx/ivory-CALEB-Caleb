import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ivory.app',
  appName: "Ivory's Choice",
  webDir: 'out',
  // server: {
  //   // Production URL - COMMENT OUT for native builds with IAP
  //   url: 'https://ivory-blond.vercel.app',
  //   // For local development, uncomment below:
  //   // url: 'http://localhost:3000',
  //   // cleartext: true
  // },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#FFFFFF',
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app needs camera access to capture photos of your hands',
        photos: 'This app needs photo library access to save and load nail designs'
      }
    },
    SplashScreen: {
      launchShowDuration: 0, // Set to 0 and call hide() manually when ready
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
    // Custom IAP Plugin - configuration is handled in Swift
    // Product IDs are defined in lib/iap.ts and App Store Connect
  }
};

export default config;
