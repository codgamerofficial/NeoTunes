'use client';

import React, { useState } from 'react';
import { useSpiderVerse, SpiderSuitMode } from '@/providers/SpiderVerseProvider';
import { Shield, Sparkles, Zap, ChevronDown } from 'lucide-react';

export default function SpiderSuitToggle() {
  const { suitMode, setSuitMode, suitMeta } = useSpiderVerse();
  const [isOpen, setIsOpen] = useState(false);

  const suitOptions: { id: SpiderSuitMode; name: string; icon: any; color: string; desc: string }[] = [
    {
      id: 'integrated',
      name: 'Integrated Suit',
      icon: Shield,
      color: '#E60026',
      desc: 'Peter-1 Red, Web Cyan & Tech Blue',
    },
    {
      id: 'sanctum',
      name: 'Sanctum Supreme',
      icon: Sparkles,
      color: '#FF9D00',
      desc: 'Doctor Strange Eldritch Runes & Gold',
    },
    {
      id: 'blackgold',
      name: 'Black & Gold Suit',
      icon: Zap,
      color: '#FFD700',
      desc: 'Nano-Circuit Obsidian & Gold',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111420]/90 border border-[var(--spider-accent)]/50 hover:border-[var(--spider-accent)] text-white text-xs font-bold shadow-[0_0_15px_var(--spider-glow)] transition-all cursor-pointer group"
        title="Switch Spider Suit Theme"
      >
        <span className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_var(--spider-accent)]" style={{ backgroundColor: suitMeta.primaryColor }} />
        <span className="hidden sm:inline-block font-extrabold tracking-wide uppercase text-[11px] group-hover:text-[var(--spider-cyan)] transition-colors">
          {suitMeta.name}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0C0F1A]/95 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 border-b border-white/10 mb-1">
              <div className="text-[10px] font-black tracking-widest text-[#FFD700] uppercase flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#FF9D00]" /> SPIDER-VERSE SUITS
              </div>
              <p className="text-[11px] text-white/50">Select your dimension visual vibe</p>
            </div>

            <div className="space-y-1">
              {suitOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = suitMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSuitMode(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-white/15 border border-[var(--spider-accent)] text-white shadow-[0_0_15px_var(--spider-glow)]'
                        : 'hover:bg-white/5 border border-transparent text-white/70 hover:text-white'
                    }`}
                  >
                    <div
                      className="p-2 rounded-lg text-black font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: opt.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black truncate flex items-center gap-1.5">
                        {opt.name}
                        {isSelected && <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--spider-accent)] text-white font-mono uppercase">Active</span>}
                      </div>
                      <div className="text-[10px] text-white/50 truncate">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
