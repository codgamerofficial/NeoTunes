'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  RevenueCatService,
  ENTITLEMENT_NEOTUNES_PRO,
} from '@/services/revenuecat/RevenueCatService';

interface SubscriptionContextType {
  isPro: boolean;
  isLoading: boolean;
  customerInfo: any | null;
  offerings: any | null;
  purchasePackage: (packageToPurchase: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  isLoading: true,
  customerInfo: null,
  offerings: null,
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  refreshSubscription: async () => {},
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState<any | null>(null);
  const [offerings, setOfferings] = useState<any | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSubscription = async () => {
    setIsLoading(true);
    try {
      const info = await RevenueCatService.getCustomerInfo();
      setCustomerInfo(info);
      setIsPro(RevenueCatService.isProActive(info));

      const currentOfferings = await RevenueCatService.getOfferings();
      setOfferings(currentOfferings);
    } catch (err) {
      console.warn('[SubscriptionContext] Error refreshing subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    RevenueCatService.initialize().then(() => {
      refreshSubscription();
    });

    const unsubscribe = RevenueCatService.addCustomerInfoUpdateListener((updatedInfo) => {
      setCustomerInfo(updatedInfo);
      setIsPro(RevenueCatService.isProActive(updatedInfo));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
    try {
      const result = await RevenueCatService.purchasePackage(packageToPurchase);
      if (result && !result.userCancelled) {
        setCustomerInfo(result.customerInfo);
        const proActive = RevenueCatService.isProActive(result.customerInfo);
        setIsPro(proActive);
        return proActive;
      }
      return false;
    } catch (err) {
      console.error('[SubscriptionContext] Purchase failed:', err);
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const info = await RevenueCatService.restorePurchases();
      if (info) {
        setCustomerInfo(info);
        const proActive = RevenueCatService.isProActive(info);
        setIsPro(proActive);
        return proActive;
      }
      return false;
    } catch (err) {
      console.error('[SubscriptionContext] Restore failed:', err);
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        isLoading,
        customerInfo,
        offerings,
        purchasePackage,
        restorePurchases,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
