'use client';

import { useEffect } from 'react';
import { initializeApp, setupIAPListeners } from '@/lib/iap-init';

/**
 * Initializes IAP and splash screen on app load
 * Must be a client component to use useEffect
 */
export function IAPInitializer() {
  useEffect(() => {
    console.log('🔵 IAPInitializer: Starting initialization...');
    
    // Initialize IAP and hide splash screen
    initializeApp().then(() => {
      console.log('✅ IAPInitializer: App initialization complete');
    }).catch((error) => {
      console.error('❌ IAPInitializer: Initialization failed:', error);
    });
    
    // Setup purchase listeners
    setupIAPListeners();
    console.log('✅ IAPInitializer: Purchase listeners setup complete');
  }, []);

  // This component doesn't render anything
  return null;
}
