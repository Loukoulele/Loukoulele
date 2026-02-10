import { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';
import type { CustomerInfo, PurchasesOfferings } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// Replace with your actual RevenueCat API keys from https://app.revenuecat.com
const REVENUECAT_IOS_KEY = 'appl_VBGpuHidkbdObqgbGnIryzLASwJ';
const REVENUECAT_ANDROID_KEY = 'goog_JdbEqBBsvjHgzSyQmhiHouUZxwI';

let initialized = false;

export async function initRevenueCat(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || initialized) return;

  const apiKey = Capacitor.getPlatform() === 'ios'
    ? REVENUECAT_IOS_KEY
    : REVENUECAT_ANDROID_KEY;

  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

  await Purchases.configure({
    apiKey,
    appUserID: userId || null,
  });

  initialized = true;
}

export async function identifyUser(firebaseUid: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await Purchases.logIn({ appUserID: firebaseUid });
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!Capacitor.isNativePlatform()) return null;
  return await Purchases.getOfferings();
}

export async function purchasePackage(packageToPurchase: unknown): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const result = await Purchases.purchasePackage({ aPackage: packageToPurchase as never });
    return result.customerInfo;
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return null;
    }
    throw e;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo;
}

export function isPremium(info: CustomerInfo): boolean {
  return info.entitlements.active['premium'] !== undefined;
}

export function hasEntitlement(info: CustomerInfo, entitlementId: string): boolean {
  return info.entitlements.active[entitlementId] !== undefined;
}
