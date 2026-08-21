'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Disc, Music, Headphones } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';
import { Artwork } from '@/components/ui/Artwork';
import { createClientBrowser } from '@/lib/supabase-browser';

export default function WelcomePage() {
  const router = useRouter();

  // Auto-skip Welcome screen if user is already authenticated
  useEffect(() => {
    const supabase = createClientBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.push('/');
      }
    });
  }, [router]);

  // Featured canonical artwork URLs for layered composition
  const heroMainCover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
  const heroLeftCover = 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bf/25/11/bf251147-9759-994c-83b6-12a819b1f24d/24UMGIM86307.rgb.jpg/600x600bb.jpg';
  const heroRightCover = 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c3/97/35/c39735d1-9252-09fb-628d-19446d1490ee/8902894354222.jpg/600x600bb.jpg';

  return (
    <div className="relative flex flex-col justify-between min-h-screen w-full bg-[#05070B] text-[#F5F5F7] overflow-hidden select-none font-sans p-4 sm:p-8 md:p-10">
      
      {/* ── 1. CINEMATIC AMBIENT LIGHT BACKDROP ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-[#00D9FF]/15 blur-[130px] animate-pulse" />
      <div className="absolute bottom-20 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#DFFF00]/12 blur-[110px] animate-pulse" />
      <div className="absolute top-1/3 right-10 -z-10 h-80 w-80 rounded-full bg-[#7A3CFF]/15 blur-[140px] animate-pulse" />

      {/* ── 2. TOP BRAND HEADER ── */}
      <header className="flex items-center justify-between w-full max-w-4xl mx-auto pt-2 z-10">
        <NeoTuneLogo size="md" showText onClick={() => router.push('/')} />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#DFFF00] font-bold shadow-sm backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-[#DFFF00]" />
          <span className="hidden sm:inline">N/OS AUDIO ENGINE • Spatial • Intelligent • Personal</span>
          <span className="sm:hidden">N/OS AUDIO ENGINE</span>
        </div>
      </header>

      {/* ── 3. LAYERED CINEMATIC HERO ARTWORK & MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center my-auto py-6 sm:py-10 z-10 max-w-xl mx-auto w-full space-y-8">
        
        {/* Layered 3D Hero Artwork Composition */}
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-48 sm:h-56 flex items-center justify-center mx-auto my-2">
          {/* Left Secondary Floating Card */}
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -12, scale: 0.85 }}
            animate={{ opacity: 0.75, x: -60, rotate: -10, scale: 0.88 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute left-2 top-2 w-32 sm:w-40 aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-md"
          >
            <Artwork
              source={heroLeftCover}
              size="medium"
              canonicalId="welcome_hero_left"
              type="album"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Right Secondary Floating Card */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 12, scale: 0.85 }}
            animate={{ opacity: 0.75, x: 60, rotate: 10, scale: 0.88 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute right-2 top-2 w-32 sm:w-40 aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-md"
          >
            <Artwork
              source={heroRightCover}
              size="medium"
              canonicalId="welcome_hero_right"
              type="album"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Focal Central Hero Artwork Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 w-40 sm:w-48 aspect-square rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-[#DFFF00]/30"
          >
            <Artwork
              source={heroMainCover}
              size="large"
              canonicalId="welcome_hero_main"
              type="album"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
              <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                Hi-Res Audio
              </span>
            </div>
          </motion.div>
        </div>

        {/* Headline & Description */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight uppercase font-sans">
            YOUR MUSIC. YOUR MOOD. <br />
            <span className="bg-gradient-to-r from-[#DFFF00] via-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent lowercase font-sans">
              Your universe.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A6] max-w-md mx-auto leading-relaxed font-sans">
            Discover music, build your library, and listen your way with Hi-Res spatial soundscapes and intelligent recommendations.
          </p>
          <p className="text-[11px] font-mono text-[#DFFF00]/90 tracking-wide pt-1">
            Personal recommendations • Spatial audio • Smart discovery
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full space-y-3 pt-2"
        >
          <button
            onClick={() => router.push('/auth?mode=signup')}
            className="w-full h-14 rounded-2xl bg-[#DFFF00] text-black text-xs font-mono font-extrabold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(223,255,0,0.25)] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>GET STARTED</span>
            <ArrowRight className="h-4 w-4 text-black" />
          </button>

          <button
            onClick={() => router.push('/auth?mode=signin')}
            className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono font-bold text-white hover:border-white/20 transition-all cursor-pointer shadow-sm"
          >
            I already have an account
          </button>
        </motion.div>
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
