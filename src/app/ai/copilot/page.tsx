'use client';

import React, { useState } from 'react';
import { Bot, Send, Play, ShieldAlert, Check, X, ListPlus, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { NeoAssistant, NeoAssistantResponse, PendingActionInfo } from '@/services/NeoAssistant';
import { AICopilotMessage } from '@/types/ai-copilot';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
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
  const { playTrack, addToQueue, isPlaying, currentTrack } = usePlaybackStore();

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

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
      const res: NeoAssistantResponse = await NeoAssistant.handleUserPrompt(query, messages);
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
        text: "I encountered an issue processing that request. Please try again.",
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

  return (
    <FeatureErrorBoundary featureName="AI Copilot">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-3xl mx-auto min-h-screen flex flex-col justify-between">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Bot className="h-7 w-7 text-[#00D9FF]" /> Neo AI Copilot
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Bedrock Production
            </span>
          </div>
          <p className="text-xs text-[#A1A1A6]">
            Music-focused intelligence operating over verified NeoTunes player and catalog services.
          </p>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 my-4 flex-1 overflow-y-auto max-h-[60vh]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div
                className={`p-4 rounded-3xl max-w-md text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#00D9FF] text-black font-bold rounded-tr-none'
                    : 'bg-[#090C14] border border-white/10 text-white rounded-tl-none shadow-xl'
                }`}
              >
                <p>{msg.text}</p>

                {/* Attached Track Card */}
                {msg.attachedTrack && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <Artwork
                          source={resolveArtwork(msg.attachedTrack)}
                          size="small"
                          alt={msg.attachedTrack.title}
                          type="track"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold truncate">{msg.attachedTrack.title}</h5>
                        <p className="text-[10px] text-[#A1A1A6] truncate">
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
                            : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                        }`}
                        title="Add to queue"
                      >
                        {addedQueueIds.has(msg.attachedTrack.id) ? <Check className="h-3 w-3" /> : <ListPlus className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => playTrack(msg.attachedTrack!)}
                        className="p-2 rounded-full bg-[#00D9FF] text-black hover:scale-105 transition-all cursor-pointer"
                        title="Play track"
                      >
                        <Play className="h-3.5 w-3.5 fill-black" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmation Prompt */}
                {msg.requiresConfirmation && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-amber-300">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="font-mono text-[10px] uppercase font-bold">Confirmation Required</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendPrompt('Confirm action')}
                        className="px-3 py-1 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" /> Confirm & Execute
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
            <div className="flex items-center gap-2.5 text-xs text-[#00D9FF] font-mono py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{activeProgress}</span>
            </div>
          )}
        </div>

        {/* Quick Actions Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            'Play Kesariya',
            'What am I listening to?',
            'Show my queue',
            'How much offline storage am I using?',
            'What speaker am I connected to?',
          ].map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSendPrompt(chip)}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#00D9FF] text-xs font-mono text-[#00D9FF] shrink-0 transition-all cursor-pointer"
            >
              {chip}
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
            className="flex-1 p-3.5 rounded-2xl bg-[#090C14] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#00D9FF]"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={!inputPrompt.trim() || isLoading}
            className="p-3.5 rounded-2xl bg-[#00D9FF] disabled:bg-white/10 text-black disabled:text-white/40 hover:scale-105 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,217,255,0.3)]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
