'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Music2 } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';

export default function MusicPreferencesPage() {
  const router = useRouter();

  const genres = [
    { id: 'bollywood', label: 'Bollywood' },
    { id: 'punjabi', label: 'Punjabi' },
    { id: 'bengali', label: 'Bengali' },
    { id: 'hiphop', label: 'Hip-Hop / Rap' },
    { id: 'pop', label: 'Pop' },
    { id: 'electronic', label: 'Electronic / EDM' },
    { id: 'rock', label: 'Rock & Alt' },
    { id: 'lofi', label: 'Lo-fi & Chill' },
    { id: 'classical', label: 'Classical' },
    { id: 'international', label: 'International' },
  ];

  const vibes = [
    { id: 'chill', label: 'Chill' },
    { id: 'focus', label: 'Focus / Study' },
    { id: 'workout', label: 'Workout Energy' },
    { id: 'party', label: 'Party Nights' },
    { id: 'romantic', label: 'Romantic' },
    { id: 'night', label: 'Late Night Drives' },
    { id: 'travel', label: 'Travel & Roadtrip' },
  ];

  const [selectedGenres, setSelectedGenres] = useState<string[]>(['bollywood', 'pop']);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['chill', 'focus']);

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleVibe = (id: string) => {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    localStorage.setItem('neotunes_genres', JSON.stringify(selectedGenres));
    localStorage.setItem('neotunes_vibes', JSON.stringify(selectedVibes));
    router.push('/');
  };

  return (
    <div className="relative flex flex-col justify-between min-h-screen w-full bg-[#05070B] text-[#F5F5F7] overflow-y-auto font-sans select-none p-6 sm:p-10">
      
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 h-96 w-96 rounded-full bg-[#00D9FF]/15 blur-[120px] animate-pulse" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-80 w-80 rounded-full bg-[#DFFF00]/10 blur-[100px] animate-pulse" />

      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-3xl mx-auto pt-2 z-10">
        <NeoTuneLogo size="md" showText onClick={() => router.push('/')} />
        <button
          onClick={handleFinish}
          className="text-xs font-mono font-bold text-[#A1A1A6] hover:text-white transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-2xl mx-auto w-full my-auto py-8 space-y-8 z-10">
        
        {/* Title */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#DFFF00] font-bold">
            <Sparkles className="h-3 w-3" /> PERSONALIZATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            What do you listen to?
          </h1>
          <p className="text-xs text-[#A1A1A6] max-w-md mx-auto">
            Select your favorite genres and moods so NeoTunes can tune recommendations specifically for you.
          </p>
        </div>

        {/* Genres Selection Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider">
            GENRES &amp; STYLES
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {genres.map((g) => {
              const isSelected = selectedGenres.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGenre(g.id)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:text-white hover:border-white/20'
                  }`}
                >
                  <span>{g.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#DFFF00]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vibes Selection Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider">
            CHOOSE YOUR VIBE
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {vibes.map((v) => {
              const isSelected = selectedVibes.includes(v.id);
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVibe(v.id)}
                  className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00D9FF]/15 border-[#00D9FF] text-white shadow-md'
                      : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:text-white hover:border-white/20'
                  }`}
                >
                  <span>{v.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#00D9FF]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-2xl bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Finish &amp; Start Listening</span>
          <ArrowRight className="h-4 w-4" />
        </button>

      </main>

    </div>
  );
}
