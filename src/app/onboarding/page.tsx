'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Download, ArrowRight, CheckCircle2, Music, Disc } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to NeoTunes',
      subtitle: 'Your world of music, reimagined.',
      icon: Sparkles,
      color: 'from-[#00D4FF] to-[#7A3CFF]',
      features: [
        { title: 'Personalized for You', desc: 'AI powered recommendations that adapt to your taste', icon: Sparkles },
        { title: 'High Quality Sound', desc: 'Lossless & Hi-Res audio up to 24-bit / 96kHz', icon: Activity },
        { title: 'Sync Everywhere', desc: 'Your library, synced seamlessly across all your devices', icon: CheckCircle2 },
      ],
    },
    {
      title: 'Spatial 3D Audio & EQ',
      subtitle: 'Immersive soundstage for audiophiles.',
      icon: Activity,
      color: 'from-[#7A3CFF] to-[#FF2D95]',
      features: [
        { title: 'Hardware DSP & 10-Band EQ', desc: 'Studio grade equalizer with sub-bass boost', icon: Activity },
        { title: 'Dolby Atmos & 3D Stage', desc: 'Concert Hall, Studio, and Surround soundstage modes', icon: Disc },
        { title: 'Synced Karaoke Lyrics', desc: 'Real-time word-by-word animated lyrics', icon: Music },
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/auth');
    }
  };

  const activeData = steps[currentStep];
  const Icon = activeData.icon;

  return (
    <div className="min-h-screen bg-[#070512] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans relative overflow-hidden">
      {/* Background Neon Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#7A3CFF]/30 via-[#00D4FF]/20 to-[#FF2D95]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card-v2 max-w-md w-full p-8 rounded-[36px] border border-white/15 space-y-6 shadow-2xl relative z-10 bg-[#0F0B1E]/90">
        
        {/* Brand Logo Header */}
        <div className="flex justify-center pb-2">
          <NeoTuneLogo size="lg" showText />
        </div>

        {/* Dynamic 3D Hero Graphic */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`h-28 w-28 rounded-3xl bg-gradient-to-tr ${activeData.color} p-1 flex items-center justify-center shadow-[0_0_40px_rgba(122,60,255,0.6)]`}
          >
            <div className="h-full w-full rounded-[22px] bg-[#0F0B1E] flex items-center justify-center">
              <Icon className="h-12 w-12 text-[#00D4FF] animate-pulse" />
            </div>
          </motion.div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">{activeData.title}</h1>
          <p className="text-xs text-white/50">{activeData.subtitle}</p>
        </div>

        {/* Feature Highlights List */}
        <div className="space-y-3 text-left pt-2">
          {activeData.features.map((feat) => {
            const FeatIcon = feat.icon;
            return (
              <div key={feat.title} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#7A3CFF]/20 text-[#00D4FF] shrink-0 mt-0.5">
                  <FeatIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{feat.title}</div>
                  <div className="text-[10px] text-white/50 leading-relaxed">{feat.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Indicator Dots & Next Button */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  currentStep === idx ? 'w-6 bg-[#00D4FF] shadow-[0_0_10px_#00D4FF]' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="btn-neo-primary w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
