'use client';

import React from 'react';
import { Sparkles, Activity, Download, Monitor, ShieldCheck, Heart, Apple, Laptop, Smartphone, Globe } from 'lucide-react';
import NeoTuneLogo from './NeoTuneLogo';

export default function PlatformFooterBar() {
  const badges = [
    { label: 'AI POWERED', desc: 'Recommendations that understand you', icon: Sparkles, color: 'text-[#00D4FF]' },
    { label: 'HI-RES AUDIO', desc: 'Crystal clear sound up to 24-bit', icon: Activity, color: 'text-[#7A3CFF]' },
    { label: 'OFFLINE MODE', desc: 'Download & listen anytime', icon: Download, color: 'text-[#FF2D95]' },
    { label: 'MULTI DEVICE', desc: 'One account. Every device.', icon: Monitor, color: 'text-[#00D4FF]' },
    { label: 'PRIVACY FIRST', desc: 'Your data. Your control.', icon: ShieldCheck, color: 'text-[#7A3CFF]' },
    { label: 'ARTIST SUPPORT', desc: 'Empowering artists globally.', icon: Heart, color: 'text-[#FF2D95]' },
  ];

  return (
    <div className="space-y-6 pt-6 border-t border-white/10 select-none">
      {/* 6 Feature Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className="glass-card-v2 p-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all"
            >
              <div className={`p-2 rounded-xl bg-white/5 ${b.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className={`text-[10px] font-black uppercase tracking-wider ${b.color}`}>{b.label}</div>
                <div className="text-[9px] text-white/50 truncate leading-tight">{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Footer Branding & Multi-Platform Badges */}
      <div className="glass-card-v2 p-5 rounded-[28px] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NeoTuneLogo size="sm" showText />
          <div className="h-4 w-px bg-white/15 hidden md:block" />
          <span className="text-xs text-white/50 font-medium">
            Next-Gen Music Platform. Built for the Future.
          </span>
        </div>

        {/* Platform Icons (Apple, Android, Windows, Web) */}
        <div className="flex items-center gap-4 text-white/40">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs font-bold">
            <Apple className="h-4 w-4" /> macOS / iOS
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs font-bold">
            <Smartphone className="h-4 w-4" /> Android
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs font-bold">
            <Laptop className="h-4 w-4" /> Windows
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs font-bold">
            <Globe className="h-4 w-4" /> Web App
          </div>
        </div>
      </div>
    </div>
  );
}
