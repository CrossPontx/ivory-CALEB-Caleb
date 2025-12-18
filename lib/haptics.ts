import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Haptic feedback utilities for native iOS experience
 */

export const hapticImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await Haptics.impact({ style });
  } catch (error) {
    // Haptics not available, silently fail
  }
};

export const hapticNotification = async (type: NotificationType = NotificationType.Success) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await Haptics.notification({ type });
  } catch (error) {
    // Haptics not available, silently fail
  }
};

export const hapticSelection = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch (error) {
    // Haptics not available, silently fail
  }
};

// Convenience functions for common interactions
export const haptics = {
  light: () => hapticImpact(ImpactStyle.Light),
  medium: () => hapticImpact(ImpactStyle.Medium),
  heavy: () => hapticImpact(ImpactStyle.Heavy),
  success: () => hapticNotification(NotificationType.Success),
  warning: () => hapticNotification(NotificationType.Warning),
  error: () => hapticNotification(NotificationType.Error),
  selection: () => hapticSelection(),
};
