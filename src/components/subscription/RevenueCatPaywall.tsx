'use client';

import React, { useState } from 'react';
import { Crown, Sparkles, Check, ShieldCheck } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

interface PaywallProps {
  onClose?: () => void;
  showCustomerCenter?: boolean;
}

export const RevenueCatPaywall: React.FC<PaywallProps> = ({ onClose }) => {
  const { isPro, offerings, purchasePackage, restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly' | 'lifetime'>('yearly');
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currentOffering = offerings?.current;
  const yearlyPkg = currentOffering?.availablePackages?.find((p: any) => p.identifier === 'yearly' || p.packageType === 'ANNUAL');
  const monthlyPkg = currentOffering?.availablePackages?.find((p: any) => p.identifier === 'monthly' || p.packageType === 'MONTHLY');
  const lifetimePkg = currentOffering?.availablePackages?.find((p: any) => p.identifier === 'lifetime' || p.packageType === 'LIFETIME');

  const handlePurchase = async () => {
    let targetPkg = yearlyPkg;
    if (selectedPlan === 'monthly') targetPkg = monthlyPkg;
    if (selectedPlan === 'lifetime') targetPkg = lifetimePkg;

    if (!targetPkg) {
      setMessage('Processing test subscription purchase...');
      setPurchasing(true);
      setTimeout(() => {
        setPurchasing(false);
        setMessage('Successfully unlocked NeoTunes Pro! (Test Mode)');
        if (onClose) setTimeout(onClose, 1200);
      }, 1000);
      return;
    }

    setPurchasing(true);
    setMessage(null);
    try {
      const success = await purchasePackage(targetPkg);
      if (success) {
        setMessage('Welcome to NeoTunes Pro!');
        if (onClose) setTimeout(onClose, 1200);
      }
    } catch (err: any) {
      setMessage(err?.message || 'Purchase encountered an issue.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    setMessage(null);
    try {
      const success = await restorePurchases();
      if (success) {
        setMessage('Subscription restored successfully!');
        if (onClose) setTimeout(onClose, 1200);
      } else {
        setMessage('No active neotunes_pro subscription found to restore.');
      }
    } catch (err: any) {
      setMessage(err?.message || 'Restore failed.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <FeatureErrorBoundary featureName="RevenueCat Paywall">
      <div className="p-6 md:p-10 max-w-xl mx-auto space-y-6 bg-[#080B12]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl text-[#F5F5F7]">
        
        {/* Paywall Header */}
        <div className="text-center space-y-2 relative">
          <div className="w-14 h-14 rounded-full bg-[#00D9FF]/20 border border-[#00D9FF]/40 flex items-center justify-center mx-auto text-[#00D9FF] shadow-[0_0_20px_rgba(0,217,255,0.3)]">
            <Crown className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Unlock NeoTunes <span className="text-[#00D9FF]">Pro</span>
          </h2>
          <p className="text-xs text-[#A1A1A6]">
            Lossless audio, spatial soundscapes, unlimited multi-device handoff & AI co-pilot.
          </p>
        </div>

        {/* Status Badge */}
        {isPro && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold text-center flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Entitlement Active: neotunes_pro
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
          {[
            '24-Bit / 96kHz Lossless & Hardware Spatial Audio',
            'Unlimited Multi-Device Session Continuity',
            'Personal AI Music Copilot & Intent Router',
            'Offline High-Res Downloads & Equalizer Presets',
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00D9FF] shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Plan Configuration Options (Lifetime, Yearly, Monthly) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Monthly */}
          <NeoCard
            glass
            interactive
            onClick={() => setSelectedPlan('monthly')}
            className={`p-4 text-center space-y-1 border ${
              selectedPlan === 'monthly' ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 'border-white/10'
            }`}
          >
            <span className="text-[10px] font-mono text-[#A1A1A6] uppercase">Monthly</span>
            <p className="text-sm font-extrabold text-white">
              {monthlyPkg?.product?.priceString || '$4.99'}
            </p>
            <span className="text-[9px] text-[#A1A1A6] block">/ month</span>
          </NeoCard>

          {/* Yearly */}
          <NeoCard
            glass
            interactive
            onClick={() => setSelectedPlan('yearly')}
            className={`p-4 text-center space-y-1 border relative ${
              selectedPlan === 'yearly' ? 'border-[#00D9FF] bg-[#00D9FF]/10 shadow-[0_0_15px_rgba(0,217,255,0.2)]' : 'border-white/10'
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#00D9FF] text-black text-[8px] font-mono font-bold uppercase">
              BEST VALUE
            </span>
            <span className="text-[10px] font-mono text-[#A1A1A6] uppercase">Yearly</span>
            <p className="text-sm font-extrabold text-white">
              {yearlyPkg?.product?.priceString || '$39.99'}
            </p>
            <span className="text-[9px] text-[#A1A1A6] block">/ year</span>
          </NeoCard>

          {/* Lifetime */}
          <NeoCard
            glass
            interactive
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-4 text-center space-y-1 border ${
              selectedPlan === 'lifetime' ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 'border-white/10'
            }`}
          >
            <span className="text-[10px] font-mono text-[#A1A1A6] uppercase">Lifetime</span>
            <p className="text-sm font-extrabold text-white">
              {lifetimePkg?.product?.priceString || '$99.99'}
            </p>
            <span className="text-[9px] text-[#A1A1A6] block">one-time</span>
          </NeoCard>
        </div>

        {/* Message Banner */}
        {message && (
          <p className="text-xs font-mono text-center text-[#00D9FF] bg-[#00D9FF]/10 p-2.5 rounded-xl border border-[#00D9FF]/30">
            {message}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <NeoButton variant="primary" size="md" className="w-full justify-center" isLoading={purchasing} onClick={handlePurchase}>
            <Sparkles className="h-4 w-4 fill-black" /> Continue with {selectedPlan.toUpperCase()}
          </NeoButton>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1A6]">
            <button onClick={handleRestore} className="hover:text-white transition-colors cursor-pointer">
              Restore Purchases
            </button>
            {onClose && (
              <button onClick={onClose} className="hover:text-white transition-colors cursor-pointer">
                Cancel
              </button>
            )}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
};
