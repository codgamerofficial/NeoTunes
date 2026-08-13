'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Disc, Music2, Heart, Dumbbell, Coffee, Flame, Moon, PartyPopper } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Bengali', 'Hindi', 'English']);
  const [selectedArtists, setSelectedArtists] = useState<string[]>(['Arijit Singh', 'Pritam']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Bollywood', 'Lo-Fi']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Relax', 'Focus']);

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
    <div className="min-h-screen bg-[#000000] text-[#F4F1F7] flex flex-col items-center justify-center p-6 text-center select-none font-sans relative overflow-hidden">
      
      <div className="max-w-lg w-full p-8 rounded-[36px] bg-[#121318] border border-white/10 space-y-6 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <NeoTuneLogo size="md" showText />
          <span className="text-xs font-mono font-bold text-[#AFC7FF]">Step {step} of 5</span>
        </div>

        {/* STEP 1: Languages */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-black text-white">Select Preferred Music Languages</h1>
            <p className="text-xs text-[#A8A7AF]">Personalize your home feed and daily hit mixes.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {languages.map((lang) => {
                const isSel = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, lang)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white' : 'bg-[#17181D] border-white/5 text-white/70'
                    }`}
                  >
                    <span>{lang}</span>
                    {isSel && <Check className="h-4 w-4 text-[#AFC7FF]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Favorite Artists */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-black text-white">Choose Favorite Artists</h1>
            <p className="text-xs text-[#A8A7AF]">Pick 2 or more artists to jumpstart your radio.</p>
            <div className="grid grid-cols-2 gap-2.5 pt-2 max-h-60 overflow-y-auto scrollbar-none">
              {artists.map((art) => {
                const isSel = selectedArtists.includes(art);
                return (
                  <button
                    key={art}
                    onClick={() => toggleItem(selectedArtists, setSelectedArtists, art)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white' : 'bg-[#17181D] border-white/5 text-white/70'
                    }`}
                  >
                    <span className="truncate">{art}</span>
                    {isSel && <Check className="h-3.5 w-3.5 text-[#AFC7FF] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Genres */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-black text-white">Pick Your Favorite Genres</h1>
            <p className="text-xs text-[#A8A7AF]">Customize your browse stations and chart recommendations.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {genres.map((g) => {
                const isSel = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleItem(selectedGenres, setSelectedGenres, g)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white' : 'bg-[#17181D] border-white/5 text-white/70'
                    }`}
                  >
                    <span>{g}</span>
                    {isSel && <Check className="h-4 w-4 text-[#AFC7FF]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Goals */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h1 className="text-xl font-black text-white">Listening Goals & Moods</h1>
            <p className="text-xs text-[#A8A7AF]">What do you listen to music for?</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {goals.map((gl) => {
                const isSel = selectedGoals.includes(gl.label);
                const IconComp = gl.icon;
                return (
                  <button
                    key={gl.label}
                    onClick={() => toggleItem(selectedGoals, setSelectedGoals, gl.label)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSel ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white' : 'bg-[#17181D] border-white/5 text-white/70'
                    }`}
                  >
                    <IconComp className="h-4 w-4 text-[#AFC7FF]" />
                    <span className="truncate">{gl.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 5: Final Neo Mix */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shadow-[0_0_30px_rgba(175,199,255,0.6)]">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-white">Your Neo Mix is Ready!</h1>
            <p className="text-xs text-[#A8A7AF]">
              We've tailored your daily feed for {selectedLanguages.join(', ')} music and {selectedGenres.join(', ')} vibes.
            </p>
          </motion.div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-bold hover:text-white transition-all cursor-pointer"
            >
              Back
            </button>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="text-xs text-[#A8A7AF] hover:underline cursor-pointer"
            >
              Skip Onboarding
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-full bg-[#AFC7FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(175,199,255,0.4)]"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-full bg-[#AFC7FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(175,199,255,0.4)]"
            >
              <span>Start Listening</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
