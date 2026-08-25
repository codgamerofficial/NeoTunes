'use client';

// Authoritative API Key provided by User
export const REVENUECAT_API_KEY = 'test_FvjUlPNsdvXLbjtTooAzhEdbhyi';

// Authoritative Entitlement Identifier
export const ENTITLEMENT_NEOTUNES_PRO = 'neotunes_pro';

// Product Package Identifiers
export const PACKAGE_IDS = {
  LIFETIME: 'lifetime',
  YEARLY: 'yearly',
  MONTHLY: 'monthly',
} as const;

export class RevenueCatService {
  private static isInitialized = false;
  private static purchasesModule: any = null;

  private static async getPurchasesModule() {
    if (RevenueCatService.purchasesModule) return RevenueCatService.purchasesModule;
    if (typeof window === 'undefined') return null;

    try {
      const mod = await import('react-native-purchases');
      RevenueCatService.purchasesModule = mod.default || mod;
      return RevenueCatService.purchasesModule;
    } catch (err) {
      console.warn('[RevenueCat] Purchases module not available in current web runtime');
      return null;
    }
  }

  /**
   * Initialize RevenueCat SDK with API key and verbose logging for development/testing
   */
  public static async initialize(appUserId?: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const Purchases = await RevenueCatService.getPurchasesModule();
      if (!Purchases) return;

      if (process.env.NODE_ENV === 'development' && Purchases.LOG_LEVEL) {
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
      }

      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: appUserId || null,
      });

      RevenueCatService.isInitialized = true;
      console.log('[RevenueCat] SDK Initialized Successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization failed:', error);
    }
  }

  /**
   * Log in user with unique App User ID (e.g. Supabase user.id)
   */
  public static async logIn(appUserId: string): Promise<any | null> {
    try {
      const Purchases = await RevenueCatService.getPurchasesModule();
      if (!Purchases) return null;
      const { customerInfo } = await Purchases.logIn(appUserId);
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Login error:', error);
      return null;
    }
  }

  /**
   * Log out user and reset to anonymous RevenueCat ID
   */
  public static async logOut(): Promise<any | null> {
    try {
      const Purchases = await RevenueCatService.getPurchasesModule();
      if (!Purchases) return null;
      const customerInfo = await Purchases.logOut();
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Logout error:', error);
      return null;
    }
  }

  /**
   * Fetch current CustomerInfo from RevenueCat
   */
  public static async getCustomerInfo(): Promise<any | null> {
    try {
      const Purchases = await RevenueCatService.getPurchasesModule();
      if (!Purchases) return null;
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('[RevenueCat] Error fetching customer info:', error);
      return null;
    }
  }

  /**
   * Check if 'neotunes_pro' entitlement is active
   */
  public static isProActive(customerInfo: any | null): boolean {
    if (!customerInfo || !customerInfo.entitlements) return false;
    const entitlement = customerInfo.entitlements.active?.[ENTITLEMENT_NEOTUNES_PRO];
    return entitlement !== undefined && entitlement.isActive;
  }

  /**
   * Fetch configured offerings (Lifetime, Yearly, Monthly)
   */
  public static async getOfferings(): Promise<any | null> {
    try {
      const Purchases = await RevenueCatService.getPurchasesModule();
      if (!Purchases) return null;
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('[RevenueCat] Error fetching offerings:', error);
      return null;
    }
  }

  /**
   * Execute purchase for a selected package (Lifetime, Yearly, Monthly)
   */
  public static async purchasePackage(
    packageToPurchase: any
  ): Promise<{ customerInfo: any; userCancelled: boolean } | null> {
    try {
      const Purchases = await RevenueCatService.getPurchasesModule();
      if (!Purchases) return null;
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(packageToPurchase);
      console.log(`[RevenueCat] Purchased product ${productIdentifier} successfully.`);
      return { customerInfo, userCancelled: false };
    } catch (error: any) {
      if (error?.userCancelled) {
        console.log('[RevenueCat] User cancelled purchase');
        return { customerInfo: (await RevenueCatService.getCustomerInfo())!, userCancelled: true };
      }
      console.error('[RevenueCat] Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore previous purchases
   */
  public static async restorePurchases(): Promise<any | null> {
    try {
      const Purchases = await RevenueCatService.getPurchasesModule();
      if (!Purchases) return null;
      const customerInfo = await Purchases.restorePurchases();
      console.log('[RevenueCat] Purchases restored successfully');
      return customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Restore purchases error:', error);
      throw error;
    }
  }

  /**
   * Add listener for real-time customer info updates
   */
  public static addCustomerInfoUpdateListener(
    listener: (customerInfo: any) => void
  ): () => void {
    RevenueCatService.getPurchasesModule().then((Purchases) => {
      if (Purchases && Purchases.addCustomerInfoUpdateListener) {
        Purchases.addCustomerInfoUpdateListener(listener);
      }
    });

    return () => {};
  }
}
