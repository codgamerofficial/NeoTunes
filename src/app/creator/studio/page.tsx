'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Sliders, Sparkles, FolderPlus, Activity, FileText, Plus, Layers, ShieldCheck } from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function CreatorStudioHubPage() {
  const router = useRouter();

  return (
    <FeatureErrorBoundary featureName="Creator Studio Hub">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Layout className="h-7 w-7 text-[#00D9FF]" /> NeoTunes Creator Studio
            </h1>
            <p className="text-xs text-[#A1A1A6]">
              Personal music curation workspace for advanced playlist building, smart rules, and templates.
            </p>
          </div>

          <button
            onClick={() => router.push('/creator/playlist-builder')}
            className="px-5 py-2.5 rounded-full bg-[#00D9FF] text-black font-mono font-extrabold text-xs uppercase tracking-wider hover:scale-105 transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(0,217,255,0.3)]"
          >
            <Plus className="h-4 w-4" /> New Playlist Builder
          </button>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-[#090C14] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-[#A1A1A6] uppercase font-bold">Curated Playlists</span>
            <h3 className="text-2xl font-black text-white">12</h3>
          </div>
          <div className="p-5 rounded-3xl bg-[#090C14] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-[#00D9FF] uppercase font-bold">Smart Playlists</span>
            <h3 className="text-2xl font-black text-[#00D9FF]">4</h3>
          </div>
          <div className="p-5 rounded-3xl bg-[#090C14] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-[#DFFF00] uppercase font-bold">Saved Templates</span>
            <h3 className="text-2xl font-black text-[#DFFF00]">6</h3>
          </div>
          <div className="p-5 rounded-3xl bg-[#090C14] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Avg Playlist Health</span>
            <h3 className="text-2xl font-black text-emerald-400">96/100</h3>
          </div>
        </div>

        {/* Studio Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => router.push('/creator/playlist-builder')}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#00D9FF]/50 transition-all cursor-pointer space-y-3 group"
          >
            <div className="p-3 rounded-2xl bg-[#00D9FF]/10 text-[#00D9FF] w-fit">
              <FolderPlus className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-[#00D9FF] transition-colors">Advanced Playlist Builder</h3>
            <p className="text-xs text-[#A1A1A6]">
              Build playlists with bulk multi-select, filters, sorting, collage artwork generation, and health checks.
            </p>
          </div>

          <div
            onClick={() => router.push('/creator/playlist-builder?mode=smart')}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#00D9FF]/50 transition-all cursor-pointer space-y-3 group"
          >
            <div className="p-3 rounded-2xl bg-[#DFFF00]/10 text-[#DFFF00] w-fit">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-[#DFFF00] transition-colors">Smart Playlist Lab</h3>
            <p className="text-xs text-[#A1A1A6]">
              Create dynamic playlists that automatically update based on rules (Genre, Artist, Language, Liked state).
            </p>
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
