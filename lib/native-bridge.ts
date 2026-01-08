/**
 * Native Bridge for iOS
 * Replaces Capacitor with direct WKWebView communication
 */

// Extend window interface
declare global {
  interface Window {
    NativeBridge?: NativeBridge;
    webkit?: {
      messageHandlers?: {
        nativeHandler?: {
          postMessage: (message: any) => void;
        };
      };
    };
  }
}

interface NativeBridge {
  call: (action: string, data: any) => void;
  getProducts: (productIds: string[]) => Promise<ProductsResponse>;
  purchase: (productId: string) => Promise<PurchaseResponse>;
  restorePurchases: () => Promise<{ success: boolean }>;
  finishTransaction: (transactionId: string) => Promise<{ success: boolean }>;
  sendToWatch: (data: any) => void;
  isWatchReachable: () => Promise<{ reachable: boolean }>;
  takePicture: (options?: CameraOptions) => Promise<PhotoResponse>;
  share: (options: ShareOptions) => Promise<{ completed: boolean }>;
  hapticImpact: (style?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid') => void;
  getDeviceInfo: () => Promise<DeviceInfo>;
  onEvent?: (event: string, data: any) => void;
}

interface ProductsResponse {
  products: Product[];
  invalidProductIds: string[];
}

interface Product {
  productId: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currency: string;
}

interface PurchaseResponse {
  transactionId: string;
  productId: string;
  receipt: string;
  transactionDate: number;
}

interface CameraOptions {
  source?: 'camera' | 'photos' | 'prompt';
  allowEditing?: boolean;
}

interface PhotoResponse {
  dataUrl: string;
  format: string;
}

interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

interface DeviceInfo {
  platform: string;
  model: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  screenWidth: number;
  screenHeight: number;
  appVersion: string;
  appBuild: string;
}

/**
 * Check if running in native iOS app
 */
export function isNativeIOS(): boolean {
  return typeof window !== 'undefined' && !!window.NativeBridge;
}

/**
 * Check if running in any native environment
 */
export function isNative(): boolean {
  return isNativeIOS();
}

/**
 * Get the native bridge (iOS only)
 */
export function getNativeBridge(): NativeBridge | null {
  if (typeof window === 'undefined') return null;
  return window.NativeBridge || null;
}

/**
 * IAP Functions
 */
export async function getProducts(productIds: string[]): Promise<ProductsResponse> {
  const bridge = getNativeBridge();
  if (!bridge) {
    throw new Error('Native bridge not available');
  }
  return bridge.getProducts(productIds);
}

export async function purchaseProduct(productId: string): Promise<PurchaseResponse> {
  const bridge = getNativeBridge();
  if (!bridge) {
    throw new Error('Native bridge not available');
  }
  return bridge.purchase(productId);
}

export async function restorePurchases(): Promise<{ success: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    throw new Error('Native bridge not available');
  }
  return bridge.restorePurchases();
}

export async function finishTransaction(transactionId: string): Promise<{ success: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    throw new Error('Native bridge not available');
  }
  return bridge.finishTransaction(transactionId);
}

/**
 * Watch Functions
 */
export function sendToWatch(data: any): void {
  const bridge = getNativeBridge();
  if (bridge) {
    bridge.sendToWatch(data);
  }
}

export async function isWatchReachable(): Promise<boolean> {
  const bridge = getNativeBridge();
  if (!bridge) return false;
  const result = await bridge.isWatchReachable();
  return result.reachable;
}

/**
 * Camera Functions
 */
export async function takePicture(options?: CameraOptions): Promise<PhotoResponse> {
  const bridge = getNativeBridge();
  if (!bridge) {
    throw new Error('Native bridge not available');
  }
  return bridge.takePicture(options);
}

/**
 * Share Functions
 */
export async function share(options: ShareOptions): Promise<{ completed: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share(options);
        return { completed: true };
      } catch (error) {
        return { completed: false };
      }
    }
    throw new Error('Share not available');
  }
  return bridge.share(options);
}

/**
 * Haptics Functions
 */
export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid' = 'medium'): void {
  const bridge = getNativeBridge();
  if (bridge) {
    bridge.hapticImpact(style);
  }
}

/**
 * Device Info Functions
 */
export async function getDeviceInfo(): Promise<DeviceInfo | null> {
  const bridge = getNativeBridge();
  if (!bridge) return null;
  return bridge.getDeviceInfo();
}

/**
 * Event Listeners
 */
type EventCallback = (data: any) => void;
const eventListeners: { [event: string]: EventCallback[] } = {};

export function addEventListener(event: string, callback: EventCallback): void {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);
  
  // Set up bridge event handler if not already set
  const bridge = getNativeBridge();
  if (bridge && !bridge.onEvent) {
    bridge.onEvent = (eventName: string, data: any) => {
      const listeners = eventListeners[eventName] || [];
      listeners.forEach(cb => cb(data));
    };
  }
}

export function removeEventListener(event: string, callback: EventCallback): void {
  if (eventListeners[event]) {
    eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
  }
}

/**
 * Common Events:
 * - purchaseCompleted: { transactionId, productId, receipt, transactionDate }
 * - purchaseFailed: { productId, errorCode, errorMessage }
 * - purchaseRestored: { transactionId, productId, receipt }
 * - watchMessage: { ...data from watch }
 */
