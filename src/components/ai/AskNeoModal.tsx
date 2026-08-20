'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, X, Play, ListPlus, Radio,
  Maximize2, Minimize2, Disc, Bookmark, Check
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artwork } from '@/components/ui/Artwork';
import { Track, getArtistName } from '@/types';

interface AskNeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type NeoState = '● READY' | '● SEARCHING MUSIC' | '● BUILDING YOUR MIX' | '● PLAYING' | '● ERROR';

interface ChatMessage {
  id: string;
  sender: 'user' | 'neo';
  text: string;
  intent?: string;
  playlistTitle?: string | null;
  playlistDescription?: string | null;
  tags?: string[];
  tracks?: Track[];
  suggestedPrompts?: string[];
}

export default function AskNeoModal({ isOpen, onClose }: AskNeoModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, playTrack, addToQueue } = usePlaybackStore();

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [neoState, setNeoState] = useState<NeoState>('● READY');
  const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'neo',
      text: "Good evening. What are you in the mood to listen to?",
      tags: ['✨ Music Intelligence', '🎧 Context-Aware'],
      suggestedPrompts: ['Surprise me', 'Play something relaxing', 'Make a workout mix', 'Explore Bengali music'],
    },
  ]);

  // Context bar label
  const activeContextLabel = currentTrack 
    ? `Playing: ${currentTrack.title} · ${getArtistName(currentTrack.artist || currentTrack.artists)}`
    : pathname === '/browse' 
    ? 'Context: Browse Dimensions'
    : pathname === '/library'
    ? 'Context: Your Library'
    : 'Context: Home Feed';

  const placeholderExamples = [
    "Ask Neo anything about your music...",
    "Play Arijit Singh romantic hits...",
    "Make a 30-minute workout mix...",
    "Play something like I Feel It Coming...",
    "Explore Bengali music..."
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholderExamples.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // ESC key listener to close drawer
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

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || neoState !== '● READY') return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setNeoState('● SEARCHING MUSIC');

    try {
      // Deterministic tool lookup via MusicSearchService
      const searchRes = await MusicSearchService.searchAll(prompt);
      const foundTracks = searchRes.songs || [];

      setNeoState('● BUILDING YOUR MIX');

      let replyText = `I resolved canonical tracks for "${prompt}".`;
      let intent = 'RECOMMEND';

      if (foundTracks.length > 0) {
        const topTrack = foundTracks[0];
        replyText = `Playing "${topTrack.title}" by ${getArtistName(topTrack.artist || topTrack.artists)}.`;
        intent = 'PLAY';
        
        // Auto-play top resolved match
        playTrack(topTrack);
        setNeoState('● PLAYING');
      }

      const neoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: replyText,
        intent,
        playlistTitle: foundTracks.length > 1 ? `Neo Mix: ${prompt}` : undefined,
        playlistDescription: foundTracks.length > 1 ? `Curated Multiverse mix based on "${prompt}"` : undefined,
        tags: ['✨ Verified Canonical Track', '🎧 Source Resolved'],
        tracks: foundTracks.slice(0, 5),
        suggestedPrompts: ['Play something like this', 'Surprise me', 'Add top song to library'],
      };

      setMessages((prev) => [...prev, neoMsg]);

      setTimeout(() => setNeoState('● READY'), 2500);

    } catch (err) {
      setNeoState('● ERROR');
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: "I couldn't resolve that specific search right now, but here are top recommended tracks.",
        tags: ['✨ Discovery Pick'],
        suggestedPrompts: ['Try another search', 'Surprise me'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setTimeout(() => setNeoState('● READY'), 2000);
    }
  };

  const handleSavePlaylist = (title: string) => {
    if (!savedPlaylists.includes(title)) {
      setSavedPlaylists([...savedPlaylists, title]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="ask-neo-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-md" 
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${
              isExpanded ? 'h-[92vh] max-w-5xl my-auto mr-auto ml-auto rounded-[32px]' : 'h-full max-w-[500px]'
            } bg-[#0D101C]/98 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden font-sans transition-all duration-300`}
          >
            
            {/* ── 1. MODAL HEADER (Spec 4) ── */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#111524]/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-[#00D4FF]/20 border border-[#00D4FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,214,255,0.4)]">
                  <Sparkles className="h-4 w-4 text-[#00D4FF]" />
                </div>

                <div>
                  <h3 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                    NEO <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00D4FF] text-black font-bold uppercase">Spider AI</span>
                  </h3>
                  <p className="text-[10px] text-white/60 font-medium">Multiverse Audio Intelligence for NeoTunes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden md:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  title={isExpanded ? "Collapse Panel" : "Full-Screen Workspace"}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close (ESC)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* ── 2. NEO CONTEXT BAR (Specs 6, 8) ── */}
            <div className="px-5 py-2.5 bg-[#111524] border-b border-white/5 flex items-center justify-between text-xs text-white/70">
              <span className="flex items-center gap-2 font-medium truncate">
                <span className="h-2 w-2 rounded-full bg-[#00D4FF] animate-pulse" />
                <span className="truncate">{activeContextLabel}</span>
              </span>
              <span className="text-[10px] font-mono uppercase text-[#00D4FF] bg-[#00D4FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D4FF]/30 font-bold">
                {neoState}
              </span>
            </div>

            {/* ── 3. CONVERSATION & RESPONSE CARDS (Specs 22, 23) ── */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 scrollbar-none min-h-0"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'neo' && (
                    <div className="h-7 w-7 rounded-xl bg-[#00D4FF]/15 border border-[#00D4FF]/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-[#00D4FF]" />
                    </div>
                  )}

                  <div className={`max-w-[90%] rounded-2xl p-4 text-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#00D4FF] text-black font-bold shadow-md rounded-br-none'
                      : 'bg-[#111524] border border-white/10 text-white rounded-bl-none space-y-3'
                  }`}>
                    
                    {/* Message Text */}
                    <div className="leading-relaxed whitespace-pre-line text-xs font-medium">{msg.text}</div>

                    {/* HERO AI PLAYLIST CARD */}
                    {msg.playlistTitle && (
                      <div className="p-4 rounded-2xl bg-[#0D101C] border border-white/10 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-black text-white">{msg.playlistTitle}</div>
                            <div className="text-[10px] text-white/60">{msg.playlistDescription}</div>
                            <div className="text-[10px] font-mono font-bold text-[#00D4FF] pt-1">
                              {msg.tracks?.length || 5} songs · Verified Candidates
                            </div>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-[#00D4FF]/15 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/30">
                            <Disc className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              if (msg.tracks && msg.tracks.length > 0) {
                                playTrack(msg.tracks[0]);
                              }
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#00D4FF] text-black text-[11px] font-black uppercase flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 fill-black" /> Play Mix
                          </button>
                          <button
                            onClick={() => msg.playlistTitle && handleSavePlaylist(msg.playlistTitle)}
                            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {savedPlaylists.includes(msg.playlistTitle || '') ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[#00D4FF]" /> Saved
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-3.5 w-3.5" /> Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              (msg.tracks || []).forEach(t => addToQueue(t));
                            }}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                            title="Add all to Queue"
                          >
                            <ListPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* REASONING TAGS */}
                    {msg.tags && msg.tags.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Why this selection:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-[#00D4FF]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CANONICAL MUSIC RESULT CARDS */}
                    {msg.tracks && msg.tracks.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="text-[10px] font-mono text-[#00D4FF] font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Top Matches ({msg.tracks.length})</span>
                        </div>
                        <div className="space-y-2">
                          {msg.tracks.map((tr) => (
                            <div
                              key={tr.canonicalId || tr.id}
                              className="flex items-center justify-between p-2 rounded-xl bg-[#0D101C] border border-white/5 hover:border-[#00D4FF]/40 transition-all group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <Artwork
                                  track={tr}
                                  source={tr.artworkUrl || tr.coverUrl}
                                  size="small"
                                  canonicalId={tr.canonicalId || tr.id}
                                  type="track"
                                  className="h-10 w-10 rounded-lg flex-shrink-0 border border-white/15 object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">{tr.title}</div>
                                  <div className="text-[10px] text-white/60 truncate">
                                    {getArtistName(tr.artist || tr.artists)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                <button
                                  onClick={() => addToQueue(tr)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer"
                                  title="Add to Queue"
                                >
                                  <ListPlus className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => playTrack(tr)}
                                  className="p-1.5 rounded-lg bg-[#00D4FF] text-black hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,214,255,0.4)] cursor-pointer"
                                  title="Play Now"
                                >
                                  <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUGGESTED ACTION PROMPTS */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {msg.suggestedPrompts.map((p) => (
                          <button
                            key={p}
                            onClick={() => handleSend(p)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0D101C] border border-white/10 text-white/80 hover:text-[#00D4FF] hover:border-[#00D4FF]/40 transition-all cursor-pointer"
                          >
                            + {p}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {neoState !== '● READY' && neoState !== '● PLAYING' && (
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-xl bg-[#00D4FF]/15 border border-[#00D4FF]/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#00D4FF] animate-spin" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#111524] border border-white/10 text-xs text-[#00D4FF] font-medium animate-pulse">
                    Neo is resolving music and curating canonical tracks...
                  </div>
                </div>
              )}
            </div>

            {/* ── 4. QUICK DYNAMIC SUGGESTIONS & INPUT FOOTER (Specs 16, 17) ── */}
            <div className="shrink-0 p-4 border-t border-white/10 bg-[#111524] space-y-3">
              
              {/* Quick Action Suggestion Chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
                {[
                  '🎲 Surprise me', 
                  '🌧 Play something relaxing', 
                  '🏋️ Make a workout mix', 
                  '🌙 Explore Bengali music', 
                  '📻 Start a Jam'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip.replace(/^[^\w\s]+/, '').trim())}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#0D101C] border border-white/10 text-white/70 hover:text-white hover:border-[#00D4FF]/50 whitespace-nowrap transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-2 bg-[#0D101C] border border-white/10 rounded-full px-4 py-2.5 focus-within:border-[#00D4FF]/60 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={placeholderExamples[placeholderIdx]}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || neoState !== '● READY'}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    input.trim()
                      ? 'bg-[#00D4FF] text-black font-bold hover:scale-105 shadow-[0_0_12px_rgba(0,214,255,0.4)]'
                      : 'bg-white/10 text-white/30'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
