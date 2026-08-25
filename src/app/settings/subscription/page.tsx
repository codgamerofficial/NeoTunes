'use client';

import React, { useState } from 'react';
import { Crown, ShieldCheck, RefreshCw, CreditCard, CheckCircle, ExternalLink } from 'lucide-react';
import { RevenueCatPaywall } from '@/components/subscription/RevenueCatPaywall';
import { useSubscription } from '@/context/SubscriptionContext';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';

export default function SubscriptionSettingsPage() {
  const { isPro, customerInfo, restorePurchases, refreshSubscription } = useSubscription();
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);

  return (
    <FeatureErrorBoundary featureName="Subscription Settings">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-3xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Crown className="h-7 w-7 text-[#00D9FF]" /> Subscription & RevenueCat Entitlements
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Manage your NeoTunes Pro subscription status, entitlements, and Customer Center.
          </p>
        </div>

        {/* Pro Entitlement Status Card */}
        <NeoCard glass className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isPro ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'}`}>
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isPro ? 'NeoTunes Pro Active' : 'NeoTunes Free Plan'}
                </h3>
                <p className="text-xs text-[#A1A1A6]">
                  Entitlement: <code className="font-mono text-[#00D9FF]">neotunes_pro</code>
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                isPro ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/10 text-white/60'
              }`}
            >
              {isPro ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          {!isPro ? (
            <NeoButton variant="primary" size="md" onClick={() => setShowPaywallModal(true)}>
              Upgrade to NeoTunes Pro
            </NeoButton>
          ) : (
            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-3">
              <NeoButton variant="glass" size="sm" onClick={() => setShowCustomerCenter(!showCustomerCenter)}>
                <CreditCard className="h-4 w-4" /> RevenueCat Customer Center
              </NeoButton>
              <NeoButton variant="glass" size="sm" onClick={() => refreshSubscription()}>
                <RefreshCw className="h-4 w-4" /> Refresh Status
              </NeoButton>
            </div>
          )}
        </NeoCard>

        {/* RevenueCat Customer Center Self-Service Management (Section 5 & 6) */}
        {showCustomerCenter && isPro && (
          <NeoCard glass className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#00D9FF]" /> Customer Center Self-Service
            </h4>
            <p className="text-xs text-[#A1A1A6]">
              Manage or modify your active subscription, view billing history, or update store payment details.
            </p>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono space-y-2">
              <div className="flex justify-between"><span>Management API:</span> <span className="text-emerald-400">RevenueCat Customer Center SDK</span></div>
              <div className="flex justify-between"><span>App User ID:</span> <span className="text-white">{customerInfo?.originalAppUserId || 'Anonymous'}</span></div>
              <div className="flex justify-between"><span>Active Entitlement:</span> <span className="text-[#00D9FF]">neotunes_pro</span></div>
            </div>
          </NeoCard>
        )}

        {/* Inline RevenueCat Paywall */}
        {showPaywallModal && (
          <div className="pt-4">
            <RevenueCatPaywall onClose={() => setShowPaywallModal(false)} />
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
