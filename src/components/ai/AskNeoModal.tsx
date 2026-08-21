'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  X, 
  Play, 
  Pause, 
  Plus, 
  Bookmark, 
  Check, 
  Music, 
  Radio, 
  Flame, 
  Moon, 
  Dumbbell, 
  Globe, 
  Disc,
  Compass,
  ListPlus
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassPill } from '@/components/ui/GlassPill';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';

interface AskNeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type NeoStateType = 'idle' | 'thinking' | 'responding' | 'success' | 'error';

interface ChatMessage {
  id: string;
  sender: 'user' | 'neo';
  text: string;
  intent?: string;
  tracks?: Track[];
  suggestedPrompts?: { label: string; query: string; icon: any }[];
}

const CANONICAL_QUICK_ACTIONS = [
  { label: 'Surprise me', query: 'Surprise me with trending hits', icon: Sparkles },
  { label: 'Relax', query: 'Play relaxing acoustic ambient songs', icon: Moon },
  { label: 'Workout', query: 'Make a 30-minute workout gym mix', icon: Dumbbell },
  { label: 'Bengali music', query: 'Explore Bengali hits and melodies', icon: Globe },
];

export default function AskNeoModal({ isOpen, onClose }: AskNeoModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, isPlaying, setPlaying, playTrack, addToQueue } = usePlaybackStore();

  const [input, setInput] = useState('');
  const [neoState, setNeoState] = useState<NeoStateType>('idle');
  const [savedTrackIds, setSavedTrackIds] = useState<Set<string>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial_1',
      sender: 'neo',
      text: "Good evening. What are you in the mood to listen to?",
      suggestedPrompts: CANONICAL_QUICK_ACTIONS,
    },
  ]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-scroll chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, neoState]);

  const toggleSaveTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || neoState === 'thinking') return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setNeoState('thinking');

    try {
      // Execute live search via MusicSearchService
      const searchRes = await MusicSearchService.searchAll(prompt, { limit: 6 });
      const foundTracks = searchRes.songs || [];

      let responseText = `I found ${foundTracks.length} tracks matching your request.`;
      if (prompt.toLowerCase().includes('surprise')) {
        responseText = "Here is a hand-picked mix of trending high-energy tracks for you.";
      } else if (prompt.toLowerCase().includes('relax')) {
        responseText = "Here is a calm, acoustic selection to help you unwind.";
      } else if (prompt.toLowerCase().includes('workout')) {
        responseText = "Here's a 30-minute workout mix packed with peak energy.";
      } else if (prompt.toLowerCase().includes('bengali')) {
        responseText = "Here are top Bengali melodies and hit songs.";
      }

      const neoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: responseText,
        tracks: foundTracks,
      };

      setMessages((prev) => [...prev, neoMsg]);
      setNeoState('success');
    } catch (err) {
      console.error('Neo AI error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: "I encountered an issue fetching recommendations. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
      setNeoState('error');
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:15';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-2xl bg-[#050608]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[720px] relative font-sans text-[#F5F5F7]"
        >
          {/* ── 1. HEADER (NEO Music Intelligence [SPIDER MODE]) ── */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 flex items-center justify-center text-[#DFFF00]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-wide text-white font-mono">NEO</h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-mono font-bold text-[#00D9FF] border border-[#00D9FF]/30 uppercase tracking-widest">
                    SPIDER MODE
                  </span>
                </div>
                <p className="text-xs text-[#A1A1A6]">Music Intelligence for NeoTunes</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/12 border border-white/10 flex items-center justify-center text-[#A1A1A6] hover:text-white transition-all cursor-pointer"
              aria-label="Close Neo AI"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── 2. CONVERSATION FEED & CONTENT ── */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-none">
            
            {/* COMPACT NOW PLAYING CONTEXT CARD */}
            {currentTrack && (
              <GlassCard className="p-3.5 flex items-center justify-between border-white/10 bg-white/[0.04]">
                <div className="flex items-center gap-3 min-w-0">
                  <Artwork
                    source={resolveArtwork(currentTrack)}
                    size="small"
                    canonicalId={currentTrack.id}
                    type="track"
                    className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider block">
                      NOW PLAYING
                    </span>
                    <div className="text-xs font-bold text-white truncate">
                      {currentTrack.title}
                    </div>
                    <div className="text-[11px] text-[#A1A1A6] truncate">
                      {getArtistName(currentTrack.artist || currentTrack.artists)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#DFFF00] text-white hover:text-black transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label={isPlaying ? "Pause track" : "Play track"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                </button>
              </GlassCard>
            )}

            {/* MESSAGES STREAM */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {msg.sender === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[82%] px-4 py-3 rounded-2xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 text-white text-xs sm:text-sm font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 flex items-center justify-center text-[#DFFF00] shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="p-4 rounded-2xl bg-white/[0.045] border border-white/10 text-xs sm:text-sm text-[#F5F5F7] leading-relaxed">
                        {msg.text}
                      </div>

                      {/* CANONICAL QUICK ACTIONS (Only in initial message) */}
                      {msg.suggestedPrompts && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {msg.suggestedPrompts.map((act) => {
                            const Icon = act.icon;
                            return (
                              <button
                                key={act.label}
                                onClick={() => handleSend(act.query)}
                                className="p-3 rounded-xl bg-white/[0.045] hover:bg-white/[0.09] border border-white/10 hover:border-[#DFFF00]/40 text-left transition-all group cursor-pointer"
                              >
                                <div className="p-1.5 rounded-lg bg-white/10 text-[#DFFF00] w-fit mb-1.5 group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">
                                  {act.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* MUSIC RESULT CARDS (`NeoMusicCard`) */}
                      {msg.tracks && msg.tracks.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider">
                              RECOMMENDED TRACKS ({msg.tracks.length})
                            </span>
                            <button
                              onClick={() => {
                                if (msg.tracks && msg.tracks.length > 0) {
                                  playTrack(msg.tracks[0]);
                                  msg.tracks.slice(1).forEach((t) => addToQueue(t));
                                }
                              }}
                              className="text-xs font-mono font-bold text-[#00D9FF] hover:underline cursor-pointer"
                            >
                              Play all →
                            </button>
                          </div>

                          <div className="space-y-2">
                            {msg.tracks.map((track) => {
                              const isSaved = savedTrackIds.has(track.id);
                              return (
                                <GlassCard
                                  key={track.id}
                                  onClick={() => playTrack(track)}
                                  className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Artwork
                                      source={resolveArtwork(track)}
                                      size="medium"
                                      canonicalId={track.id}
                                      type="track"
                                      className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#DFFF00] truncate transition-colors">
                                        {track.title}
                                      </div>
                                      <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                                        {getArtistName(track.artists || track.artist)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-mono text-[#A1A1A6] mr-1">
                                      {formatTime(track.duration)}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addToQueue(track);
                                      }}
                                      className="p-2 rounded-full bg-white/5 hover:bg-[#DFFF00] hover:text-black text-[#A1A1A6] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                                      title="Add to queue"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => toggleSaveTrack(track.id, e)}
                                      className={`p-2 rounded-full bg-white/5 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center ${
                                        isSaved ? 'text-[#DFFF00] bg-white/12' : 'text-[#A1A1A6] hover:text-white'
                                      }`}
                                      title={isSaved ? "Saved" : "Save track"}
                                    >
                                      {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </GlassCard>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* THINKING STATE ANIMATION */}
            {neoState === 'thinking' && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-xl bg-[#DFFF00]/10 border border-[#DFFF00]/30 flex items-center justify-center text-[#DFFF00] shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/[0.045] border border-white/10 text-xs font-mono font-bold text-[#A1A1A6] flex items-center gap-2">
                  <span>NEO is thinking...</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D9FF] animate-pulse" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. KEYBOARD-AWARE GLASS COMPOSER ── */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] shrink-0 pt-safe pb-safe">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center bg-white/[0.055] border border-white/10 focus-within:border-[#DFFF00] rounded-2xl px-4 py-2.5 transition-all duration-300"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Neo anything about your music..."
                className="w-full bg-transparent text-white placeholder-[#A1A1A6] text-xs sm:text-sm font-medium outline-none pr-10"
              />
              <button
                type="submit"
                disabled={!input.trim() || neoState === 'thinking'}
                className={`absolute right-2 p-2 rounded-xl transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center ${
                  input.trim() && neoState !== 'thinking'
                    ? 'bg-[#DFFF00] text-black shadow-md hover:scale-105'
                    : 'bg-white/5 text-[#A1A1A6] opacity-50 cursor-not-allowed'
                }`}
                aria-label="Send message to Neo AI"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
