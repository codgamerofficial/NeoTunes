'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Play, 
  Pause, 
  ShieldAlert, 
  Check, 
  X, 
  ListPlus, 
  Loader2, 
  Sparkles, 
  Volume2, 
  Heart,
  Globe,
  Moon,
  Dumbbell
} from 'lucide-react';
import { NeoAssistant, NeoAssistantResponse, PendingActionInfo } from '@/services/NeoAssistant';
import { AICopilotMessage } from '@/types/ai-copilot';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { likedSongsService } from '@/services/likedSongsService';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { resolveArtwork } from '@/utils/artwork';
import { getArtistName, Track } from '@/types';

const INITIAL_MESSAGES: AICopilotMessage[] = [
  {
    id: 'msg_1',
    sender: 'assistant',
    text: "Hello! I am Neo, your personal AI music copilot powered by Amazon Bedrock. How can I assist with your listening session today?",
    createdAt: Date.now(),
  },
];

export default function AICopilotPage() {
  const [messages, setMessages] = useState<AICopilotMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProgress, setActiveProgress] = useState<string | null>(null);
  const [addedQueueIds, setAddedQueueIds] = useState<Set<string>>(new Set());
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const { playTrack, addToQueue, isPlaying, currentTrack, setPlaying } = usePlaybackStore();

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading, activeProgress]);

  const handleSendPrompt = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsg: AICopilotMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setActiveProgress('Orchestrating tools with Amazon Bedrock...');

    try {
      const res: NeoAssistantResponse = await NeoAssistant.handleUserPrompt(query, messages as any);
      const assistantMsg: AICopilotMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        attachedTrack: res.tracks?.[0],
        requiresConfirmation: !!res.pendingAction,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: AICopilotMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an issue processing that request with Amazon Bedrock. Please try again.",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setActiveProgress(null);
    }
  };

  const handleAddTrackToQueue = (track: Track) => {
    addToQueue(track);
    setAddedQueueIds((prev) => new Set(prev).add(track.id));
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

  return (
    <FeatureErrorBoundary featureName="AI Copilot">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen flex flex-col justify-between">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="h-7 w-7 text-[#DFFF00]" /> Neo AI Copilot
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#DFFF00]/10 text-xs font-mono font-bold text-[#DFFF00] border border-[#DFFF00]/30 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" /> Bedrock Production
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9AA1AD]">
            Natural-language music copilot operating over verified NeoTunes player and catalog services.
          </p>
        </div>

        {/* Message Thread */}
        <div ref={chatScrollRef} className="space-y-4 my-4 flex-1 overflow-y-auto max-h-[60vh] scrollbar-none pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div
                className={`p-4 rounded-3xl max-w-lg text-xs sm:text-sm leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#171A21] border border-white/10 text-white rounded-tr-none'
                    : 'bg-[#11141A] border border-white/10 text-[#F5F7FA] rounded-tl-none shadow-xl'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Attached Track Card */}
                {msg.attachedTrack && (
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <Artwork
                          source={resolveArtwork(msg.attachedTrack)}
                          size="small"
                          alt={msg.attachedTrack.title}
                          canonicalId={msg.attachedTrack.id}
                          type="track"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold truncate">{msg.attachedTrack.title}</h5>
                        <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                          {getArtistName(msg.attachedTrack.artists || msg.attachedTrack.artist)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAddTrackToQueue(msg.attachedTrack!)}
                        className={`p-2 rounded-full border transition-all cursor-pointer ${
                          addedQueueIds.has(msg.attachedTrack.id)
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-white/10 text-[#9AA1AD] hover:text-white border-white/10'
                        }`}
                        title="Add to queue"
                      >
                        {addedQueueIds.has(msg.attachedTrack.id) ? <Check className="h-3.5 w-3.5" /> : <ListPlus className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => playTrack(msg.attachedTrack!)}
                        className="p-2 rounded-full bg-[#DFFF00] text-black hover:scale-105 transition-all cursor-pointer"
                        title="Play track"
                      >
                        <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmation Prompt */}
                {msg.requiresConfirmation && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-amber-300">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="font-mono text-[10px] uppercase font-bold">Confirmation Required</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendPrompt('Confirm action')}
                        className="px-3 py-1 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" /> Confirm &amp; Execute
                      </button>
                      <button
                        onClick={() => setMessages((prev) => prev.filter((m) => m.id !== msg.id))}
                        className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active Progress */}
          {activeProgress && (
            <div className="flex items-center gap-2.5 text-xs text-[#DFFF00] font-mono py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{activeProgress}</span>
            </div>
          )}
        </div>

        {/* Quick Actions Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { label: 'Play Kesariya', query: 'Play Kesariya' },
            { label: 'What is playing?', query: 'What track is currently playing?' },
            { label: 'Show my queue', query: 'Show playback queue' },
            { label: 'Bengali acoustic', query: 'Play Bengali acoustic tracks' },
            { label: 'Surprise me', query: 'Recommend high energy tracks' },
          ].map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendPrompt(chip.query)}
              className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#DFFF00] text-xs font-semibold text-[#9AA1AD] hover:text-white shrink-0 transition-all cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            placeholder="Ask Neo Copilot: 'Play Kesariya', 'What's playing?', 'Show my queue'..."
            className="flex-1 px-4 py-3.5 rounded-2xl bg-[#11141A] border border-white/10 text-xs sm:text-sm text-white placeholder-[#9AA1AD] focus:outline-none focus:border-[#DFFF00] transition-colors"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={!inputPrompt.trim() || isLoading}
            className="p-3.5 rounded-2xl bg-[#DFFF00] disabled:bg-white/10 text-black disabled:text-white/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
            aria-label="Send query"
          >
            <Send className="h-4 w-4 fill-black" />
          </button>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
