import { Capacitor, registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface IAPPlugin {
  getProducts(options: { productIds: string[] }): Promise<{
    products: IAPProduct[];
    invalidProductIds: string[];
  }>;
  purchase(options: { productId: string }): Promise<void>;
  restorePurchases(): Promise<void>;
  finishTransaction(options: { transactionId: string }): Promise<void>;
  addListener(
    eventName: 'purchaseCompleted',
    listenerFunc: (result: PurchaseResult) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'purchaseFailed',
    listenerFunc: (error: { productId: string; errorCode: number; errorMessage: string }) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'purchaseRestored',
    listenerFunc: (result: PurchaseResult) => void
  ): Promise<PluginListenerHandle>;
}

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currency: string;
}

export interface PurchaseResult {
  transactionId: string;
  productId: string;
  receipt: string;
  transactionDate: number;
}

const IAP = registerPlugin<IAPPlugin>('IAPPlugin');

// Product IDs - these must match what you configure in App Store Connect
// Bundle ID: com.ivory.app
export const IAP_PRODUCT_IDS = {
  // Client Subscription
  PRO_MONTHLY: 'com.ivory.app.subscription.pro.monthly', // $19.99/month for 15 credits
  
  // Tech Subscription
  BUSINESS_MONTHLY: 'com.ivory.app.subscription.business.monthly', // $59.99/month for 40 credits + unlimited bookings
  
  // Auto-Recharge Credit Packages (when credits hit 0)
  CREDITS_5: 'com.ivory.app.credits5',   // $7.50 ($1.50/credit) - NO DOT
  CREDITS_10: 'com.ivory.app.credits10', // $15.00 ($1.50/credit) - NO DOT
  
  // NOTE: Booking payments use Stripe (not IAP) because they are for real-world services
  // Apple allows external payment processors for physical goods/services consumed outside the app
  // See: https://developer.apple.com/app-store/review/guidelines/#payments
};

// Map product IDs to credit amounts (for auto-recharge)
export const PRODUCT_CREDITS: Record<string, number> = {
  [IAP_PRODUCT_IDS.CREDITS_5]: 5,   // $7.50
  [IAP_PRODUCT_IDS.CREDITS_10]: 10, // $15.00
};

// Map product IDs to subscription tiers and user types
export const PRODUCT_TIERS: Record<string, { tier: string; userType: string; credits?: number }> = {
  [IAP_PRODUCT_IDS.PRO_MONTHLY]: { tier: 'pro', userType: 'client', credits: 15 },         // $20/month = 15 credits
  [IAP_PRODUCT_IDS.BUSINESS_MONTHLY]: { tier: 'business', userType: 'tech', credits: 40 }, // $60/month = 40 credits + unlimited bookings
};

class IAPManager {
  private products: IAPProduct[] = [];
  private purchaseListeners: ((result: PurchaseResult) => void)[] = [];
  private errorListeners: ((error: { productId: string; errorMessage: string }) => void)[] = [];

  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.setupListeners();
    }
  }

  private setupListeners() {
    // Listen for purchase completion
    IAP.addListener('purchaseCompleted', (result: PurchaseResult) => {
      this.purchaseListeners.forEach(listener => listener(result));
    });

    // Listen for purchase failures
    IAP.addListener('purchaseFailed', (error: any) => {
      this.errorListeners.forEach(listener => listener(error));
    });

    // Listen for restored purchases
    IAP.addListener('purchaseRestored', (result: PurchaseResult) => {
      this.purchaseListeners.forEach(listener => listener(result));
    });
  }

  async loadProducts(): Promise<IAPProduct[]> {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    try {
      const result = await IAP.getProducts({
        productIds: Object.values(IAP_PRODUCT_IDS),
      });

      this.products = result.products;
      return result.products;
    } catch (error) {
      console.error('Failed to load IAP products:', error);
      return [];
    }
  }

  async purchase(productId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('IAP only available on native platforms');
    }

    return IAP.purchase({ productId });
  }

  async restorePurchases(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('IAP only available on native platforms');
    }

    return IAP.restorePurchases();
  }

  async finishTransaction(transactionId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    return IAP.finishTransaction({ transactionId });
  }

  onPurchaseComplete(callback: (result: PurchaseResult) => void) {
    this.purchaseListeners.push(callback);
  }

  onPurchaseError(callback: (error: { productId: string; errorMessage: string }) => void) {
    this.errorListeners.push(callback);
  }

  getProduct(productId: string): IAPProduct | undefined {
    return this.products.find(p => p.productId === productId);
  }

  getAllProducts(): IAPProduct[] {
    return this.products;
  }

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }
}

export const iapManager = new IAPManager();
