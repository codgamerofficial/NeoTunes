'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Disc, Music2, Heart, Dumbbell, Coffee, Flame, Moon, PartyPopper } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';
import { NeoButton } from '@/components/ui/NeoButton';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Bengali', 'Hindi', 'English']);
  const [selectedArtists, setSelectedArtists] = useState<string[]>(['Arijit Singh', 'Pritam']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Bollywood', 'Lo-Fi Chill']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Relax & Chill', 'Focus & Study']);

  const languages = ['Bengali', 'Hindi', 'English', 'Punjabi', 'Tamil', 'Telugu'];
  const artists = [
    'Arijit Singh', 'Pritam', 'Shreya Ghoshal', 'The Weeknd', 
    'Diljit Dosanjh', 'Coldplay', 'Ed Sheeran', 'Billie Eilish', 
    'AP Dhillon', 'Anupam Roy', 'Jasleen Royal', 'Karan Aujla'
  ];
  const genres = ['Bollywood', 'Punjabi Hip-Hop', 'Lo-Fi Chill', 'Global Pop', 'EDM & Party', 'Acoustic', 'Rock', 'K-Pop'];
  const goals = [
    { label: 'Focus & Study', icon: Coffee },
    { label: 'Workout & Gym', icon: Dumbbell },
    { label: 'Relax & Chill', icon: Moon },
    { label: 'Party Vibes', icon: PartyPopper },
    { label: 'Romance & Love', icon: Heart },
    { label: 'Discover New Music', icon: Sparkles },
  ];

  const toggleItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('neotunes_preferences', JSON.stringify({
        languages: selectedLanguages,
        artists: selectedArtists,
        genres: selectedGenres,
        goals: selectedGoals,
      }));
    } catch {}
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F5F7FA] flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none font-sans relative overflow-hidden">
      
      {/* Atmosphere Glow */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-80 w-80 rounded-full bg-[#DFFF00]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-[#11141A] border border-white/10 space-y-6 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <NeoTuneLogo size="md" showText />
          <span className="text-xs font-mono font-bold text-[#DFFF00]">Step {step} of 4</span>
        </div>

        {/* STEP 1: Languages */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Select Preferred Music Languages</h1>
            <p className="text-xs text-[#9AA1AD]">Personalize your home feed and daily hit mixes.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {languages.map((lang) => {
                const isSel = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, lang)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-white' : 'bg-white/5 border-white/5 text-[#9AA1AD] hover:text-white'
                    }`}
                  >
                    <span>{lang}</span>
                    {isSel && <Check className="h-4 w-4 text-[#DFFF00]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Favorite Artists */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Choose Favorite Artists</h1>
            <p className="text-xs text-[#9AA1AD]">Pick 2 or more artists to jumpstart your recommendations.</p>
            <div className="grid grid-cols-2 gap-2.5 pt-2 max-h-60 overflow-y-auto scrollbar-none">
              {artists.map((art) => {
                const isSel = selectedArtists.includes(art);
                return (
                  <button
                    key={art}
                    onClick={() => toggleItem(selectedArtists, setSelectedArtists, art)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-white' : 'bg-white/5 border-white/5 text-[#9AA1AD] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{art}</span>
                    {isSel && <Check className="h-4 w-4 text-[#DFFF00] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Favorite Genres */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Favorite Genres</h1>
            <p className="text-xs text-[#9AA1AD]">Select soundscapes you frequently listen to.</p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {genres.map((g) => {
                const isSel = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleItem(selectedGenres, setSelectedGenres, g)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white' : 'bg-white/5 border-white/5 text-[#9AA1AD] hover:text-white'
                    }`}
                  >
                    <span>{g}</span>
                    {isSel && <Check className="h-4 w-4 text-[#00E5FF]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Listening Goals */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Listening Mindsets</h1>
            <p className="text-xs text-[#9AA1AD]">How do you mostly use NeoTunes?</p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {goals.map((goal) => {
                const isSel = selectedGoals.includes(goal.label);
                const Icon = goal.icon;
                return (
                  <button
                    key={goal.label}
                    onClick={() => toggleItem(selectedGoals, setSelectedGoals, goal.label)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSel ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-white' : 'bg-white/5 border-white/5 text-[#9AA1AD] hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSel ? 'text-[#DFFF00]' : 'text-[#9AA1AD]'}`} />
                    <span className="truncate">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <NeoButton variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              Back
            </NeoButton>
          ) : (
            <NeoButton variant="ghost" size="sm" onClick={() => router.push('/')}>
              Skip
            </NeoButton>
          )}

          {step < 4 ? (
            <NeoButton variant="primary" size="sm" onClick={() => setStep(step + 1)}>
              Next Step
            </NeoButton>
          ) : (
            <NeoButton variant="primary" size="sm" onClick={handleFinish}>
              Start Listening <ArrowRight className="h-4 w-4 ml-1 fill-black" />
            </NeoButton>
          )}
        </div>

      </div>
    </div>
  );
}
