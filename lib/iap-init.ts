import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { iapManager } from './iap';

/**
 * Initialize IAP and hide splash screen when ready
 * Call this in your root layout or app initialization
 */
export async function initializeApp(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Only initialize IAP on native platforms
      if (Capacitor.isNativePlatform()) {
        console.log(`🔵 Initializing IAP (attempt ${attempt}/${retries})...`);
        console.log(`🔵 Platform: ${Capacitor.getPlatform()}`);
        
        // Load IAP products
        const products = await iapManager.loadProducts();
        console.log(`✅ IAP initialized with ${products.length} products`);
        
        if (products.length === 0) {
          throw new Error('No products loaded from App Store');
        }
        
        // Log available products for debugging
        products.forEach(product => {
          console.log(`📦 ${product.productId}: ${product.title} - ${product.priceString}`);
        });
        
        return; // Success - exit retry loop
      } else {
        console.log('ℹ️ Running on web - IAP not available');
        return;
      }
    } catch (error) {
      console.error(`❌ Failed to initialize IAP (attempt ${attempt}/${retries}):`, error);
      
      if (attempt < retries) {
        const waitTime = attempt * 1000; // 1s, 2s, 3s
        console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('❌ All IAP initialization attempts failed');
        console.error('❌ Users will see an error message when trying to subscribe');
      }
    }
  }
  
  // Always hide splash screen, even if IAP fails
  if (Capacitor.isNativePlatform()) {
    await SplashScreen.hide();
    console.log('✅ Splash screen hidden');
  }
}

/**
 * Setup IAP purchase listeners
 * Call this in your root component
 */
export function setupIAPListeners() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // Listen for successful purchases
  iapManager.onPurchaseComplete(async (result) => {
    console.log('✅ Purchase completed:', result.productId);
    
    try {
      // Send receipt to backend for validation
      const response = await fetch('/api/iap/validate-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt: result.receipt,
          productId: result.productId,
          transactionId: result.transactionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Receipt validated successfully');
        
        // Finish the transaction
        await iapManager.finishTransaction(result.transactionId);
        console.log('✅ Transaction finished');
        
        // Notify user of success
        alert('Purchase successful! Your credits have been added.');
        
        // Reload page to update credits display
        window.location.reload();
      } else {
        console.error('❌ Receipt validation failed:', data.error);
        alert('Purchase verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('❌ Failed to validate receipt:', error);
      alert('Failed to verify purchase. Please contact support.');
    }
  });

  // Listen for purchase errors
  iapManager.onPurchaseError((error) => {
    console.error('❌ Purchase failed:', error);
    
    // Show user-friendly error message
    if (error.errorMessage.includes('cancelled')) {
      console.log('ℹ️ User cancelled purchase');
    } else {
      alert(`Purchase failed: ${error.errorMessage}`);
    }
  });
}
