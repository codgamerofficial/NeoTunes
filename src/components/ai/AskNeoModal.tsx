'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, X, Play, Plus, ListPlus, Radio,
  Maximize2, Minimize2, Radio as RadioIcon, Disc, Volume2, Bookmark, Check, Users, Shuffle
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface AskNeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type NeoState = 'IDLE' | 'THINKING' | 'SEARCHING' | 'CURATING' | 'PLAYING' | 'ERROR';

interface ChatMessage {
  id: string;
  sender: 'user' | 'neo';
  text: string;
  intent?: string;
  playlistTitle?: string | null;
  playlistDescription?: string | null;
  tags?: string[];
  tracks?: any[];
  suggestedPrompts?: string[];
}

export default function AskNeoModal({ isOpen, onClose }: AskNeoModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, addToQueue, setPlaying } = usePlaybackStore();

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [neoState, setNeoState] = useState<NeoState>('IDLE');
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
    ? `Listening to: ${currentTrack.title}`
    : pathname === '/browse' 
    ? 'Browsing Genres & Charts'
    : pathname === '/library'
    ? 'Organizing Library'
    : 'Home Feed';

  // Input placeholder rotation examples
  const placeholderExamples = [
    "Ask Neo anything about your music...",
    "Make me a 30-minute workout mix...",
    "Give me Arijit Singh songs for a rainy night...",
    "Play something like this but more energetic...",
    "Surprise me with something unexpected..."
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholderExamples.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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
    if (!prompt.trim() || neoState !== 'IDLE') return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setNeoState('THINKING');

    try {
      setTimeout(() => setNeoState('SEARCHING'), 400);

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          history: messages.map(m => ({ role: m.sender, content: m.text })),
          currentTrack,
          activeContext: activeContextLabel
        }),
      });

      setNeoState('CURATING');
      const data = await res.json();

      const neoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: data.reply || `I've put together a playlist matching "${prompt}".`,
        intent: data.intent,
        playlistTitle: data.playlistTitle,
        playlistDescription: data.playlistDescription,
        tags: data.tags || ['✨ Curated Pick'],
        tracks: data.tracks || [],
        suggestedPrompts: data.suggestedPrompts || ['Play something like this', 'Surprise me'],
      };

      setMessages((prev) => [...prev, neoMsg]);

      // Direct Action Execution for "PLAY" or "START_JAM"
      if (data.intent === 'PLAY' && data.tracks && data.tracks.length > 0) {
        setNeoState('PLAYING');
        playTrack(data.tracks[0]);
      } else if (data.intent === 'START_JAM') {
        router.push('/jam/ROOM123');
        onClose();
      } else {
        setNeoState('IDLE');
      }

    } catch (err) {
      setNeoState('ERROR');
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: "I couldn't complete that specific request, but here are recommended tracks matching your style.",
        tracks: [
          { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', album: 'Love Aaj Kal', durationMs: 247000, duration: '4:07', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80', sourceType: 'youtube' },
          { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', durationMs: 200000, duration: '3:20', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', sourceType: 'youtube' },
        ],
        tags: ['✨ Recommended'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setTimeout(() => setNeoState('IDLE'), 2000);
    }
  };

  const handleSavePlaylist = (title: string) => {
    if (!savedPlaylists.includes(title)) {
      setSavedPlaylists([...savedPlaylists, title]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Container - Desktop Right-Side Workspace Panel / Fullscreen Workspace */}
      <div 
        className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative h-full bg-[#0B0C10] border-l border-white/10 flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
            isExpanded ? 'w-full' : 'w-full md:w-[440px]'
          }`}
        >
          
          {/* ── 1. HEADER & BRANDING ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#121318] shrink-0">
            <div className="flex items-center gap-3">
              {/* Distinctive Abstract Neo Symbol & State Indicator */}
              <div className="relative h-9 w-9 rounded-2xl bg-[#AFC7FF]/15 border border-[#AFC7FF]/40 flex items-center justify-center shadow-[0_0_15px_rgba(175,199,255,0.3)]">
                {neoState === 'THINKING' ? (
                  <Sparkles className="h-5 w-5 text-[#AFC7FF] animate-spin" />
                ) : neoState === 'SEARCHING' || neoState === 'CURATING' ? (
                  <Disc className="h-5 w-5 text-[#7A3CFF] animate-spin" />
                ) : neoState === 'PLAYING' ? (
                  <Volume2 className="h-5 w-5 text-[#10B981] animate-pulse" />
                ) : (
                  <Sparkles className="h-5 w-5 text-[#AFC7FF]" />
                )}
              </div>

              <div>
                <h3 className="text-base font-black text-white tracking-wide">NEO</h3>
                <p className="text-[10px] text-[#A8A7AF] font-medium">Music intelligence for NeoTunes</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title={isExpanded ? "Collapse Panel" : "Full-Screen Workspace"}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── 2. NEO CONTEXT BAR ── */}
          <div className="px-5 py-2.5 bg-[#17181D] border-b border-white/5 flex items-center justify-between text-xs text-[#A8A7AF]">
            <span className="flex items-center gap-2 font-medium truncate">
              <span className="h-2 w-2 rounded-full bg-[#AFC7FF] animate-pulse" />
              <span className="truncate">{activeContextLabel}</span>
            </span>
            <span className="text-[10px] font-mono uppercase text-[#AFC7FF] bg-[#AFC7FF]/10 px-2 py-0.5 rounded-full border border-[#AFC7FF]/20">
              {neoState}
            </span>
          </div>

          {/* ── 3. CONVERSATION & RESPONSE CARDS ── */}
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
                  <div className="h-7 w-7 rounded-xl bg-[#AFC7FF]/15 border border-[#AFC7FF]/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[#AFC7FF]" />
                  </div>
                )}

                <div className={`max-w-[90%] rounded-2xl p-4 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#AFC7FF] text-black font-bold shadow-md rounded-br-none'
                    : 'bg-[#121318] border border-white/10 text-white rounded-bl-none space-y-3'
                }`}>
                  
                  {/* Message Text */}
                  <div className="leading-relaxed whitespace-pre-line text-xs">{msg.text}</div>

                  {/* HERO AI PLAYLIST CARD */}
                  {msg.playlistTitle && (
                    <div className="p-4 rounded-2xl bg-[#17181D] border border-white/10 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-white">{msg.playlistTitle}</div>
                          <div className="text-[10px] text-[#A8A7AF]">{msg.playlistDescription}</div>
                          <div className="text-[10px] font-mono font-bold text-[#AFC7FF] pt-1">
                            {msg.tracks?.length || 12} songs · ~42 min
                          </div>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-[#AFC7FF]/15 text-[#AFC7FF] flex items-center justify-center border border-[#AFC7FF]/30">
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
                          className="px-3 py-1.5 rounded-full bg-[#AFC7FF] text-black text-[11px] font-black uppercase flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-black" /> Play Mix
                        </button>
                        <button
                          onClick={() => msg.playlistTitle && handleSavePlaylist(msg.playlistTitle)}
                          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {savedPlaylists.includes(msg.playlistTitle || '') ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#AFC7FF]" /> Saved
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

                  {/* WHY THIS MIX / REASONING TAGS */}
                  {msg.tags && msg.tags.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-[#A8A7AF] uppercase tracking-wider">Why this selection:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-[#AFC7FF]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMPACT MUSIC RESULT CARDS (3-5 CARDS MAX) */}
                  {msg.tracks && msg.tracks.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="text-[10px] font-mono text-[#AFC7FF] font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>Top Matches ({msg.tracks.length})</span>
                      </div>
                      <div className="space-y-2">
                        {msg.tracks.map((tr) => (
                          <div
                            key={tr.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-[#17181D] border border-white/5 hover:border-[#AFC7FF]/40 transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img
                                src={tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                                alt={tr.title}
                                className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-white group-hover:text-[#AFC7FF] transition-colors truncate">{tr.title}</div>
                                <div className="text-[10px] text-[#A8A7AF] truncate">
                                  {typeof tr.artist === 'object' ? tr.artist.name : tr.artist}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              <button
                                onClick={() => {
                                  const artistStr = typeof tr.artist === 'object' ? (tr.artist as any)?.name || 'Artist' : tr.artist || 'Artist';
                                  addToQueue({
                                    id: `spotify:track:${tr.id}`,
                                    canonicalId: `spotify:track:${tr.id}`,
                                    source: 'spotify',
                                    sourceId: tr.id,
                                    title: tr.title,
                                    artists: [artistStr],
                                    artist: artistStr,
                                    album: 'Single',
                                    artworkUrl: tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                    coverUrl: tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                    duration: 180,
                                    durationMs: tr.durationMs || 180000,
                                    playable: true,
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all cursor-pointer"
                                title="Add to Queue"
                              >
                                <ListPlus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const artistStr = typeof tr.artist === 'object' ? (tr.artist as any)?.name || 'Artist' : tr.artist || 'Artist';
                                  playTrack({
                                    id: `spotify:track:${tr.id}`,
                                    canonicalId: `spotify:track:${tr.id}`,
                                    source: 'spotify',
                                    sourceId: tr.id,
                                    title: tr.title,
                                    artists: [artistStr],
                                    artist: artistStr,
                                    album: 'Single',
                                    artworkUrl: tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                    coverUrl: tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                    duration: 180,
                                    durationMs: tr.durationMs || 180000,
                                    playable: true,
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-[#AFC7FF] text-black hover:scale-105 transition-transform shadow-[0_0_10px_rgba(175,199,255,0.4)] cursor-pointer"
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
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#17181D] border border-white/10 text-white/80 hover:text-[#AFC7FF] hover:border-[#AFC7FF]/40 transition-all cursor-pointer"
                        >
                          + {p}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}

            {neoState !== 'IDLE' && (
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-xl bg-[#AFC7FF]/15 border border-[#AFC7FF]/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-[#AFC7FF] animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[#121318] border border-white/10 rounded-bl-none text-xs text-[#AFC7FF] font-medium animate-pulse">
                  Neo is understanding your request and curating music...
                </div>
              </div>
            )}
          </div>

          {/* ── 4. QUICK DYNAMIC SUGGESTIONS & INPUT FOOTER ── */}
          <div className="shrink-0 p-4 border-t border-white/10 bg-[#121318] space-y-3">
            
            {/* Quick Action Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {[
                '🎲 Surprise me', 
                '🌧 Rainy night mix', 
                '🏋️ Workout energy', 
                '🌙 Late-night Bengali', 
                '📻 Start a Jam'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip.replace(/^[^\w\s]+/, '').trim())}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#17181D] border border-white/10 text-white/70 hover:text-white hover:border-[#AFC7FF]/50 whitespace-nowrap transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 bg-[#17181D] border border-white/10 rounded-full px-4 py-2.5 focus-within:border-[#AFC7FF]/60 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={placeholderExamples[placeholderIdx]}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/40 outline-none"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || neoState !== 'IDLE'}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  input.trim()
                    ? 'bg-[#AFC7FF] text-black font-bold hover:scale-105 shadow-[0_0_12px_rgba(175,199,255,0.4)]'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
