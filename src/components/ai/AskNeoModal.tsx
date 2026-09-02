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
  Bot
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { NeoAssistant, NeoAssistantResponse, PendingActionInfo } from '@/services/NeoAssistant';
import { likedSongsService } from '@/services/likedSongsService';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
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
  suggestedPrompts?: string[];
  modelId?: string;
}

const CANONICAL_QUICK_ACTIONS = [
  "What track is currently playing?",
  "Play Bengali acoustic melodies",
  "Play relaxing calm acoustic tracks",
  "Create a high energy workout playlist",
  "Recommend something fresh from NeoTunes",
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
      text: "Hello! I'm Neo, your music intelligence layer powered by Amazon Bedrock. Ask me to play songs, create curated playlists, inspect your queue, or query audio routes.",
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

  if (!isOpen) return null;

  const handleSendPrompt = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || neoState === 'thinking') return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setNeoState('thinking');
    setActiveToolProgress('Orchestrating tools with Amazon Bedrock...');

    try {
      const response: NeoAssistantResponse = await NeoAssistant.handleUserPrompt(query, messages as any);

      const neoMessage: ChatMessage = {
        id: `neo_${Date.now()}`,
        sender: 'neo',
        text: response.reply,
        intent: response.intent,
        tracks: response.tracks,
        executedTools: response.executedTools,
        pendingAction: response.pendingAction,
        modelId: response.modelId,
        suggestedPrompts: response.suggestedPrompts || [],
      };

      setMessages((prev) => [...prev, neoMessage]);
      setNeoState('responding');
      setTimeout(() => setNeoState('idle'), 400);
    } catch (err: any) {
      console.error('NeoAssistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'neo',
          text: "I encountered an issue processing that request with Amazon Bedrock. Please try again.",
        },
      ]);
      setNeoState('error');
      setTimeout(() => setNeoState('idle'), 1500);
    } finally {
      setActiveToolProgress(null);
    }
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };

  const handleAddToQueue = (track: Track) => {
    addToQueue(track);
    setAddedQueueTrackIds((prev) => new Set(prev).add(track.id));
  };

  const handleToggleLike = async (track: Track) => {
    const nextState = await likedSongsService.toggleLike(track);
    setLikedTrackIds((prev) => {
      const updated = new Set(prev);
      if (nextState) updated.add(track.id);
      else updated.delete(track.id);
      return updated;
    });
  };

  const handleConfirmAction = async (msgId: string, pendingAction: PendingActionInfo) => {
    try {
      const result = await NeoAssistant.confirmPendingAction(pendingAction.actionId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? { ...msg, pendingAction: null, text: `${msg.text}\n\n✓ ${result.reply}` }
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to execute pending action:', err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none font-sans">
        
        {/* Backdrop Dismissal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Window with Selective Neubrutalist & Glass Styling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl h-[85vh] max-h-[720px] rounded-3xl bg-[#0B0D12] border-2 border-[#DFFF00] shadow-[0_20px_60px_rgba(0,0,0,0.9),4px_4px_0px_#DFFF00] flex flex-col overflow-hidden text-white"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#11141A] shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#DFFF00] text-black shadow-md shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white tracking-tight">
                    Neo AI Music Copilot
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/30">
                    Bedrock Intelligence
                  </span>
                </div>
                <p className="text-xs text-[#9AA1AD]">
                  {activeToolProgress || 'Ready for natural language music requests'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
              aria-label="Close Neo AI"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-none"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                >
                  {/* Sender Badge */}
                  <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold text-[#9AA1AD]">
                    {isUser ? (
                      <span>You</span>
                    ) : (
                      <span className="text-[#DFFF00] flex items-center gap-1">
                        <Bot className="h-3.5 w-3.5" /> Neo
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl max-w-[88%] text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#171A21] text-white border border-white/10 shadow-sm'
                        : 'bg-[#11141A] text-[#F5F7FA] border border-white/[0.08] shadow-md space-y-3'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Executed Tools Telemetry Feedback */}
                    {msg.executedTools && msg.executedTools.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-[#9AA1AD] uppercase block">
                          Executed Tools:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.executedTools.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-[#00E5FF] flex items-center gap-1"
                            >
                              <Check className="h-2.5 w-2.5 text-emerald-400" />
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rich Response Track Cards */}
                    {msg.tracks && msg.tracks.length > 0 && (
                      <div className="pt-2 space-y-2">
                        {msg.tracks.map((trk) => {
                          const isAdded = addedQueueTrackIds.has(trk.id);
                          const isLiked = likedTrackIds.has(trk.id) || likedSongsService.isLiked(trk.id);
                          const isTrackPlaying = (currentTrack?.id === trk.id || currentTrack?.canonicalId === trk.canonicalId) && isPlaying;

                          return (
                            <div
                              key={trk.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Artwork
                                  source={resolveArtwork(trk)}
                                  size="small"
                                  alt={trk.title}
                                  canonicalId={trk.id}
                                  type="track"
                                  className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-white truncate">{trk.title}</h4>
                                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                                    {getArtistName(trk.artists || trk.artist)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handlePlayTrack(trk)}
                                  className="p-2 rounded-full bg-[#DFFF00] text-black hover:scale-105 transition-transform"
                                  title="Play"
                                >
                                  {isTrackPlaying ? (
                                    <Pause className="h-3.5 w-3.5 fill-black" />
                                  ) : (
                                    <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleAddToQueue(trk)}
                                  className={`p-2 rounded-full border transition-colors ${
                                    isAdded
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                      : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white'
                                  }`}
                                  title="Add to queue"
                                >
                                  {isAdded ? <Check className="h-3.5 w-3.5" /> : <ListPlus className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pending Confirmation Box */}
                    {msg.pendingAction && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                          <ShieldAlert className="h-4 w-4" />
                          <span>Confirmation Required</span>
                        </div>
                        <p className="text-xs text-white/90">{msg.pendingAction.summary}</p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <NeoButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmAction(msg.id, msg.pendingAction!)}
                          >
                            Confirm Action
                          </NeoButton>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggested Prompts */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                      {msg.suggestedPrompts.map((promptText, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendPrompt(promptText)}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#DFFF00]/40 text-xs text-[#9AA1AD] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Sparkles className="h-3 w-3 text-[#DFFF00]" />
                          <span>{promptText}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking Animation */}
            {neoState === 'thinking' && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#11141A] border border-white/10 w-fit text-xs text-[#DFFF00]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking &amp; orchestrating Bedrock tools...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#11141A] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Neo (e.g. 'Play relaxing evening tunes', 'What's in my queue?')..."
                className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-[#9AA1AD] text-xs sm:text-sm outline-none focus:border-[#DFFF00] transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || neoState === 'thinking'}
                className="h-11 w-11 rounded-full bg-[#DFFF00] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer shadow-md shrink-0"
                aria-label="Send query"
              >
                <Send className="h-4 w-4 fill-black" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
