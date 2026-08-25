'use client';

import React from 'react';
import { Palette, Layers, Type, Sparkles, Check, Play, Heart } from 'lucide-react';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function DesignSystemGalleryPage() {
  return (
    <FeatureErrorBoundary featureName="Design System Gallery">
      <div className="p-4 sm:p-6 md:p-10 space-y-10 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Palette className="h-7 w-7 text-[#00D9FF]" /> NeoTunes Design System & Component Library
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Authoritative visual language, glassmorphism tokens, accessible touch targets, and typography hierarchy.
          </p>
        </div>

        {/* Color Palette Tokens */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Semantic Color Tokens</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#04060A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase">Background</span>
              <div className="h-6 rounded bg-[#04060A] border border-white/20" />
            </div>
            <div className="p-4 rounded-2xl bg-[#090C14] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase">Surface</span>
              <div className="h-6 rounded bg-[#090C14] border border-white/20" />
            </div>
            <div className="p-4 rounded-2xl bg-[#00D9FF]/20 border border-[#00D9FF]/40 space-y-1">
              <span className="text-[10px] font-mono text-[#00D9FF] uppercase">Accent Cyan</span>
              <div className="h-6 rounded bg-[#00D9FF]" />
            </div>
            <div className="p-4 rounded-2xl bg-[#DFFF00]/20 border border-[#DFFF00]/40 space-y-1">
              <span className="text-[10px] font-mono text-[#DFFF00] uppercase">Accent Gold</span>
              <div className="h-6 rounded bg-[#DFFF00]" />
            </div>
          </div>
        </div>

        {/* Buttons Gallery */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Button Component Suite (`NeoButton`)</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <NeoButton variant="primary" size="md">
              <Play className="h-3.5 w-3.5 fill-black" /> Primary Button
            </NeoButton>
            <NeoButton variant="secondary" size="md">
              Secondary Button
            </NeoButton>
            <NeoButton variant="glass" size="md">
              <Sparkles className="h-3.5 w-3.5 text-[#00D9FF]" /> Glass Button
            </NeoButton>
            <NeoButton variant="danger" size="md">
              Danger Action
            </NeoButton>
            <NeoButton variant="primary" isLoading size="md">
              Loading
            </NeoButton>
          </div>
        </div>

        {/* Glass Cards Gallery */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Glass Cards Suite (`NeoCard`)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoCard glass interactive className="space-y-2">
              <h4 className="text-sm font-bold text-white">Interactive Glass Surface</h4>
              <p className="text-xs text-[#A1A1A6]">Subtle background blur, border highlight on hover, and smooth scale feedback.</p>
            </NeoCard>

            <NeoCard glass={false} className="space-y-2">
              <h4 className="text-sm font-bold text-white">Solid Surface Elevated</h4>
              <p className="text-xs text-[#A1A1A6]">Opaque high-contrast card for data-dense tables or accessible low-transparency modes.</p>
            </NeoCard>
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
