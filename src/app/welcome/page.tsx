'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';

export default function WelcomePage() {
  const router = useRouter();

  const featuredArtworks = [
    { title: 'DON\'T TAP THE GLASS', artist: 'Tyler, The Creator', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bf/25/11/bf251147-9759-994c-83b6-12a819b1f24d/24UMGIM86307.rgb.jpg/600x600bb.jpg' },
    { title: 'Nain Bengali', artist: 'Guru Randhawa', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c3/97/35/c39735d1-9252-09fb-628d-19446d1490ee/8902894354222.jpg/600x600bb.jpg' },
    { title: 'Porijayee Prem', artist: 'Anupam Roy', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80' },
    { title: 'Lemonade', artist: 'Diljit Dosanjh', url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/36/45/413645b2-bc08-b0a6-96ec-c5d0f6225b68/8902894354222.jpg/600x600bb.jpg' },
  ];

  return (
    <div className="relative flex flex-col justify-between min-h-screen w-full bg-[#05070B] text-[#F5F5F7] overflow-hidden select-none font-sans p-6 sm:p-10">
      
      {/* ── 1. CINEMATIC AMBIENT LIGHT BACKDROP ── */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-[#00D9FF]/15 blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-1/3 -z-10 h-72 w-72 rounded-full bg-[#DFFF00]/10 blur-[100px] animate-pulse" />
      <div className="absolute top-1/3 right-10 -z-10 h-80 w-80 rounded-full bg-[#7A3CFF]/15 blur-[130px] animate-pulse" />

      {/* ── 2. TOP BRAND HEADER ── */}
      <header className="flex items-center justify-between w-full max-w-4xl mx-auto pt-2 z-10">
        <NeoTuneLogo size="md" showText onClick={() => router.push('/')} />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#DFFF00] font-bold">
          <Sparkles className="h-3 w-3" /> N/OS AUDIO ENGINE 2.4
        </div>
      </header>

      {/* ── 3. FLOATING ALBUM ART TILES & CINEMATIC HERO ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8 z-10 max-w-xl mx-auto w-full space-y-8">
        
        {/* Floating Album Tiles Grid */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 w-full max-w-sm mx-auto">
          {featuredArtworks.map((art, idx) => (
            <motion.div
              key={art.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] group cursor-pointer"
            >
              <img src={art.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-2.5 flex flex-col justify-end text-left">
                <span className="text-[10px] font-bold text-white truncate">{art.title}</span>
                <span className="text-[9px] text-[#A1A1A6] truncate">{art.artist}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Headline & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your music. Your mood. <br />
            <span className="bg-gradient-to-r from-[#DFFF00] via-[#00D9FF] to-[#7A3CFF] bg-clip-text text-transparent">
              Your universe.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A6] max-w-md mx-auto leading-relaxed">
            Discover music, build your library, and listen your way with Hi-Res spatial soundscapes and intelligent recommendations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => router.push('/auth?mode=signup')}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => router.push('/auth?mode=signin')}
            className="w-full py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono font-bold text-white hover:border-white/20 transition-all cursor-pointer"
          >
            I already have an account
          </button>
        </div>
      </main>

      {/* ── 4. FOOTER TERMS & PRIVACY ── */}
      <footer className="text-center text-[11px] text-[#A1A1A6] pt-4 border-t border-white/5 max-w-4xl mx-auto w-full z-10">
        By continuing, you agree to our{' '}
        <span onClick={() => router.push('/terms')} className="text-white underline cursor-pointer hover:text-[#DFFF00]">
          Terms of Service
        </span>{' '}
        and{' '}
        <span onClick={() => router.push('/privacy')} className="text-white underline cursor-pointer hover:text-[#DFFF00]">
          Privacy Policy
        </span>.
      </footer>

    </div>
  );
}
