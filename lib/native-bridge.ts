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
  // Notification functions
  requestNotificationPermission: () => Promise<{ granted: boolean }>;
  getNotificationPermissionStatus: () => Promise<{ authorized: boolean }>;
  scheduleLocalNotification: (options: LocalNotificationOptions) => Promise<{ success: boolean; identifier: string }>;
  cancelNotification: (identifier: string) => Promise<{ success: boolean }>;
  setBadgeCount: (count: number) => Promise<{ success: boolean }>;
  clearBadge: () => Promise<{ success: boolean }>;
  getDeviceToken: () => Promise<{ token: string }>;
  // Permission functions
  requestCameraPermission: () => Promise<{ granted: boolean }>;
  getCameraPermissionStatus: () => Promise<{ authorized: boolean }>;
  requestPhotosPermission: () => Promise<{ granted: boolean }>;
  getPhotosPermissionStatus: () => Promise<{ authorized: boolean }>;
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

interface LocalNotificationOptions {
  title: string;
  body: string;
  identifier?: string;
  delay?: number;
  userInfo?: Record<string, any>;
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
 * - notificationReceived: { title, body, data }
 * - navigateTo: { path }
 */

/**
 * Notification Functions
 */
export async function requestNotificationPermission(): Promise<{ granted: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Fallback to Web Notification API
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted' };
    }
    return { granted: false };
  }
  return bridge.requestNotificationPermission();
}

export async function getNotificationPermissionStatus(): Promise<{ authorized: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    if ('Notification' in window) {
      return { authorized: Notification.permission === 'granted' };
    }
    return { authorized: false };
  }
  return bridge.getNotificationPermissionStatus();
}

export async function scheduleLocalNotification(options: LocalNotificationOptions): Promise<{ success: boolean; identifier: string }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Fallback to Web Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      const identifier = options.identifier || `notif-${Date.now()}`;
      if (options.delay && options.delay > 0) {
        setTimeout(() => {
          new Notification(options.title, { body: options.body });
        }, options.delay * 1000);
      } else {
        new Notification(options.title, { body: options.body });
      }
      return { success: true, identifier };
    }
    return { success: false, identifier: '' };
  }
  return bridge.scheduleLocalNotification(options);
}

export async function cancelNotification(identifier: string): Promise<{ success: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    return { success: false };
  }
  return bridge.cancelNotification(identifier);
}

export async function setBadgeCount(count: number): Promise<{ success: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Try navigator.setAppBadge for PWA
    if ('setAppBadge' in navigator) {
      try {
        await (navigator as any).setAppBadge(count);
        return { success: true };
      } catch {
        return { success: false };
      }
    }
    return { success: false };
  }
  return bridge.setBadgeCount(count);
}

export async function clearBadge(): Promise<{ success: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    if ('clearAppBadge' in navigator) {
      try {
        await (navigator as any).clearAppBadge();
        return { success: true };
      } catch {
        return { success: false };
      }
    }
    return { success: false };
  }
  return bridge.clearBadge();
}

export async function getDeviceToken(): Promise<string | null> {
  const bridge = getNativeBridge();
  if (!bridge) return null;
  const result = await bridge.getDeviceToken();
  return result.token || null;
}

/**
 * Camera Permission Functions
 */
export async function requestCameraPermission(): Promise<{ granted: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Fallback to web camera API
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      return { granted: true };
    } catch (error) {
      return { granted: false };
    }
  }
  return bridge.requestCameraPermission();
}

export async function getCameraPermissionStatus(): Promise<{ authorized: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Check if camera is available in web
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      return { authorized: hasCamera };
    } catch {
      return { authorized: false };
    }
  }
  return bridge.getCameraPermissionStatus();
}

/**
 * Photos Permission Functions
 */
export async function requestPhotosPermission(): Promise<{ granted: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Web doesn't need explicit photo library permission
    return { granted: true };
  }
  return bridge.requestPhotosPermission();
}

export async function getPhotosPermissionStatus(): Promise<{ authorized: boolean }> {
  const bridge = getNativeBridge();
  if (!bridge) {
    // Web doesn't need explicit photo library permission
    return { authorized: true };
  }
  return bridge.getPhotosPermissionStatus();
}

export type { LocalNotificationOptions };
