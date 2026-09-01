'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  X, 
  Play, 
  Pause, 
  Check, 
  Music, 
  Moon, 
  Dumbbell, 
  Globe, 
  ListPlus,
  ShieldAlert,
  Loader2,
  Volume2,
  CheckCircle2,
  Heart,
  Headphones,
  Radio,
  Clock,
  Layers
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { NeoAssistant, NeoAssistantResponse, PendingActionInfo } from '@/services/NeoAssistant';
import { likedSongsService } from '@/services/likedSongsService';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
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
  executedTools?: Array<{ name: string; source: string; success: boolean }>;
  pendingAction?: PendingActionInfo | null;
  suggestedPrompts?: { label: string; query: string; icon: any }[];
  modelId?: string;
}

const CANONICAL_QUICK_ACTIONS = [
  { label: 'Bengali acoustic', query: 'Play Bengali acoustic melodies', icon: Globe },
  { label: 'Relaxing evening', query: 'Play relaxing calm acoustic tracks', icon: Moon },
  { label: 'Workout mix (45m)', query: 'Create a 45 minute workout playlist', icon: Dumbbell },
  { label: 'Surprise me', query: 'Recommend something fresh from NeoTunes', icon: Sparkles },
];

export default function AskNeoModal({ isOpen, onClose }: AskNeoModalProps) {
  const { currentTrack, isPlaying, setPlaying, playTrack, addToQueue } = usePlaybackStore();

  const [input, setInput] = useState('');
  const [neoState, setNeoState] = useState<NeoStateType>('idle');
  const [activeToolProgress, setActiveToolProgress] = useState<string | null>(null);
  const [addedQueueTrackIds, setAddedQueueTrackIds] = useState<Set<string>>(new Set());
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial_1',
      sender: 'neo',
      text: "Hello! I'm Neo, your music intelligence assistant powered by Amazon Bedrock. Ask me to play music, create timed playlists, check your queue, or inspect your connected speakers.",
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
  }, [messages, neoState, activeToolProgress]);

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

    // Dynamic progress state for tool orchestration
    if (prompt.toLowerCase().includes('play') || prompt.toLowerCase().includes('find') || prompt.toLowerCase().includes('search')) {
      setActiveToolProgress('Searching NeoTunes catalog...');
    } else if (prompt.toLowerCase().includes('playlist') || prompt.toLowerCase().includes('minute')) {
      setActiveToolProgress('Building timed playlist with verified durations...');
    } else if (prompt.toLowerCase().includes('device') || prompt.toLowerCase().includes('speaker')) {
      setActiveToolProgress('Checking real audio output route...');
    } else if (prompt.toLowerCase().includes('queue')) {
      setActiveToolProgress('Checking current queue...');
    } else if (prompt.toLowerCase().includes('download') || prompt.toLowerCase().includes('storage')) {
      setActiveToolProgress('Calculating storage stats...');
    } else {
      setActiveToolProgress('Orchestrating tools with Amazon Bedrock...');
    }

    try {
      const assistantRes = await NeoAssistant.handleUserPrompt(prompt, messages);

      const neoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: assistantRes.reply,
        intent: assistantRes.intent,
        tracks: assistantRes.tracks,
        executedTools: assistantRes.executedTools,
        pendingAction: assistantRes.pendingAction,
        modelId: assistantRes.modelId,
      };

      setMessages((prev) => [...prev, neoMsg]);
      setNeoState('success');
    } catch (err) {
      console.error('Neo AI error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: "I couldn't process that request with Amazon Bedrock right now. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
      setNeoState('error');
    } finally {
      setActiveToolProgress(null);
    }
  };

  const handleConfirmPendingAction = async (actionId: string) => {
    setActiveToolProgress('Executing confirmed action...');
    try {
      const res = await NeoAssistant.confirmPendingAction(actionId);
      const confirmMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'neo',
        text: res.reply,
        executedTools: res.executedTools,
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch {
      // fallback
    } finally {
      setActiveToolProgress(null);
    }
  };

  const handleCancelPendingAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, pendingAction: null, text: 'Action cancelled.' } : m))
    );
  };

  const handleAddTrackToQueue = (track: Track) => {
    addToQueue(track);
    setAddedQueueTrackIds((prev) => new Set(prev).add(track.id));
  };

  const handleToggleLike = (track: Track) => {
    likedSongsService.toggleLike(track);
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(track.id)) next.delete(track.id);
      else next.add(track.id);
      return next;
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:30';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
          {/* ── 1. HEADER (NEO Music Assistant — Amazon Bedrock) ── */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold tracking-wide text-white font-mono">NEO</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> BEDROCK RUNTIME
                  </span>
                </div>
                <p className="text-xs text-[#A1A1A6]">Music Intelligence & Tool Orchestrator</p>
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
            
            {/* NOW PLAYING CONTEXT CARD */}
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
                    <span className="text-[10px] font-mono font-bold text-[#00D9FF] uppercase tracking-wider block">
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
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#00D9FF] text-white hover:text-black transition-colors flex items-center justify-center shrink-0 cursor-pointer"
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
                    <div className="max-w-[82%] px-4 py-3 rounded-2xl bg-[#00D9FF] text-black font-semibold text-xs sm:text-sm leading-relaxed rounded-tr-none">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF] shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      
                      {/* Message Text */}
                      <div className="p-4 rounded-2xl bg-white/[0.045] border border-white/10 text-xs sm:text-sm text-[#F5F5F7] leading-relaxed rounded-tl-none">
                        {msg.text}

                        {/* Executed Tools Provenance Badges */}
                        {msg.executedTools && msg.executedTools.length > 0 && (
                          <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
                            {msg.executedTools.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-[#00D9FF] flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                {t.name} ({t.source})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ── RICH TRACK CARDS: VERIFIED TRACK RESULTS (PHASE 15) ── */}
                      {msg.tracks && msg.tracks.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-[#00D9FF]" />
                              Verified Tracks ({msg.tracks.length})
                            </span>
                            {msg.tracks.length > 1 && (
                              <button
                                onClick={() => playTrack(msg.tracks![0], msg.tracks)}
                                className="px-2.5 py-1 rounded-lg bg-[#00D9FF]/10 hover:bg-[#00D9FF] text-[#00D9FF] hover:text-black text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" /> PLAY ALL
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.tracks.map((trk) => {
                              const isThisTrackPlaying = isPlaying && currentTrack?.id === trk.id;
                              const isAdded = addedQueueTrackIds.has(trk.id);
                              const isLiked = likedTrackIds.has(trk.id);

                              return (
                                <div
                                  key={trk.id}
                                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Artwork
                                      source={resolveArtwork(trk)}
                                      size="small"
                                      canonicalId={trk.id}
                                      type="track"
                                      className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-white truncate">{trk.title}</h4>
                                      <p className="text-[11px] text-[#A1A1A6] truncate">
                                        {getArtistName(trk.artists || trk.artist)}
                                      </p>
                                      <span className="text-[9px] font-mono text-[#00D9FF]/80 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-2.5 h-2.5" /> {formatDuration(trk.duration)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleToggleLike(trk)}
                                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                        isLiked
                                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white'
                                      }`}
                                      title={isLiked ? "Unlike" : "Like song"}
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>

                                    <button
                                      onClick={() => handleAddTrackToQueue(trk)}
                                      disabled={isAdded}
                                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                        isAdded
                                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                                      }`}
                                      title="Add to queue"
                                    >
                                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <ListPlus className="w-3.5 h-3.5" />}
                                    </button>

                                    <button
                                      onClick={() => playTrack(trk, msg.tracks)}
                                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                        isThisTrackPlaying
                                          ? 'bg-[#00D9FF] text-black border-[#00D9FF]'
                                          : 'bg-white/10 hover:bg-[#00D9FF] hover:text-black border-white/10 text-white'
                                      }`}
                                      title="Play track"
                                    >
                                      {isThisTrackPlaying ? (
                                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                                      ) : (
                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CONFIRMATION CARD FOR DESTRUCTIVE ACTIONS (PHASE 13) */}
                      {msg.pendingAction && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-amber-200">
                          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            CONFIRMATION REQUIRED
                          </div>
                          <p className="text-xs text-amber-100">
                            {msg.pendingAction.summary || 'This action cannot be undone. Do you want to proceed?'}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleConfirmPendingAction(msg.pendingAction!.actionId)}
                              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                            >
                              <Check className="w-3.5 h-3.5" /> Confirm & Execute
                            </button>
                            <button
                              onClick={() => handleCancelPendingAction(msg.id)}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CANONICAL QUICK ACTIONS */}
                      {msg.suggestedPrompts && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {msg.suggestedPrompts.map((act) => {
                            const Icon = act.icon || Sparkles;
                            return (
                              <button
                                key={act.label}
                                onClick={() => handleSend(act.query)}
                                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-[#00D9FF]/10 border border-white/10 hover:border-[#00D9FF]/30 transition-all flex flex-col items-start gap-1.5 text-left cursor-pointer group"
                              >
                                <Icon className="w-4 h-4 text-[#00D9FF]" />
                                <span className="text-xs font-bold text-white group-hover:text-[#00D9FF] transition-colors">
                                  {act.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* REAL-TIME TOOL EXECUTION PROGRESS STATE (PHASE 22) */}
            {activeToolProgress && (
              <div className="flex items-center gap-3 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF] shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00D9FF] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-ping" />
                  {activeToolProgress}
                </div>
              </div>
            )}

          </div>

          {/* ── 3. INPUT COMPOSER BAR ── */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-2 bg-[#090C14] border border-white/10 rounded-2xl p-1.5 focus-within:border-[#00D9FF] transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Neo: 'Play Bengali acoustic melodies', 'Create a 45 min mix', 'What am I listening to?'..."
                className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || neoState === 'thinking'}
                className="p-3 rounded-xl bg-[#00D9FF] disabled:bg-white/10 text-black disabled:text-white/40 font-bold transition-all cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,217,255,0.2)]"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
