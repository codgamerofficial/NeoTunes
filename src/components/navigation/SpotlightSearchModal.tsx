'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Sparkles, X, Music, User, Disc, Flame, ArrowRight, History } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotlightSearchModal({ isOpen, onClose }: SpotlightSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const recentSearches = ['Arijit Singh', 'The Weeknd', 'Kesariya', 'Coldplay', 'Lo-Fi Coding Beats'];
  const trendingSearches = ['Punjabi Hits', 'Hip Hop 2026', 'Lo-Fi Chill', 'Pop Hits', 'Trending India'];
  const genreChips = ['Pop', 'R&B', 'Bollywood', 'EDM', 'Lo-Fi', 'Rock', 'Classical', 'Hip-Hop'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearchSubmit = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setQuery('Trending Beats 2026');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="spotlight-search-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-2xl cursor-pointer"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#101010]/90 border border-white/10 rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden cursor-default"
          >
          {/* Top Glass Search Header */}
          <div className="relative flex items-center px-5 py-4 border-b border-white/10 bg-white/[0.02]">
            <Search className="h-6 w-6 text-[#00D4FF] mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
              placeholder="Search songs, artists, albums, or ask AI..."
              className="w-full bg-transparent text-white placeholder-white/40 text-lg font-medium outline-none"
              autoFocus
            />
            
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all mr-2"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full transition-all mr-2 ${
                isListening
                  ? 'bg-[#FF2D95] text-white animate-pulse shadow-[0_0_15px_#FF2D95]'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Voice Search"
            >
              <Mic className="h-5 w-5" />
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-semibold text-white/40 bg-white/5 rounded-lg border border-white/10"
            >
              ESC
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 scrollbar-none">
            {/* Direct Query Preview */}
            {query.trim() && (
              <div
                onClick={() => handleSearchSubmit(query)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#00D4FF]/15 to-[#7A3CFF]/15 border border-[#00D4FF]/30 cursor-pointer hover:border-[#00D4FF] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#00D4FF] animate-spin-slow" />
                  <span className="text-white font-medium">Search for <strong className="text-[#00D4FF]">&quot;{query}&quot;</strong></span>
                </div>
                <ArrowRight className="h-5 w-5 text-[#00D4FF] group-hover:translate-x-1 transition-transform" />
              </div>
            )}

            {/* Genre & Vibe Chips */}
            <div>
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Explore Vibes &amp; Genres</h4>
              <div className="flex flex-wrap gap-2">
                {genreChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSearchSubmit(chip)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/80 hover:text-white hover:border-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <History className="h-3.5 w-3.5" /> Recent Searches
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    onClick={() => handleSearchSubmit(item)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/20 cursor-pointer transition-all text-sm text-white/90"
                  >
                    <Music className="h-4 w-4 text-[#7A3CFF]" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div>
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-[#FF2D95]" /> Trending Searches
              </h4>
              <div className="space-y-1">
                {trendingSearches.map((trend, idx) => (
                  <div
                    key={trend}
                    onClick={() => handleSearchSubmit(trend)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#FF2D95] w-4">{idx + 1}</span>
                      <span className="text-sm font-medium text-white group-hover:text-[#00D4FF] transition-colors">{trend}</span>
                    </div>
                    <span className="text-xs text-white/40 group-hover:text-white/70">12.4k searches</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
