'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles, Play, ShieldAlert, Check, X, Music, Radio, FileText } from 'lucide-react';
import { MusicIntentEngine } from '@/services/ai/MusicIntentEngine';
import { AIToolRegistry } from '@/services/ai/AIToolRegistry';
import { AICopilotMessage } from '@/types/ai-copilot';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getTrackArtwork } from '@/utils/artwork';
import { getArtistName } from '@/types';

const INITIAL_MESSAGES: AICopilotMessage[] = [
  {
    id: 'msg_1',
    sender: 'assistant',
    text: "Hello! I am NeoAssistant, your personal AI music copilot. How can I help with your listening session today?",
    createdAt: Date.now(),
  },
];

export default function AICopilotPage() {
  const [messages, setMessages] = useState<AICopilotMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const { playTrack } = usePlaybackStore();

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: AICopilotMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');

    const intent = MusicIntentEngine.parseIntent(query);

    if (intent.type === 'PLAY_TRACK' && intent.parameters.query) {
      const res = await AIToolRegistry.executePlayTrack(intent.parameters.query);
      const assistantMsg: AICopilotMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        attachedTrack: res.track,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } else if (intent.requiresConfirmation) {
      const assistantMsg: AICopilotMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: intent.confirmationMessage || 'This action requires confirmation.',
        attachedIntent: intent,
        requiresConfirmation: true,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } else {
      const assistantMsg: AICopilotMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: `Executing ${intent.type} for "${query}".`,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }
  };

  return (
    <FeatureErrorBoundary featureName="AI Copilot">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-3xl mx-auto min-h-screen flex flex-col justify-between">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bot className="h-7 w-7 text-[#00D9FF]" /> NeoAssistant AI Copilot
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Music-focused natural language intelligence powered by validated NeoTunes canonical services.
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

                {/* Attached Track Card (Section 88) */}
                {msg.attachedTrack && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <Artwork source={getTrackArtwork(msg.attachedTrack)} size="small" alt={msg.attachedTrack.title} type="track" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold truncate">{msg.attachedTrack.title}</h5>
                        <p className="text-[10px] text-[#A1A1A6] truncate">{getArtistName(msg.attachedTrack.artists || msg.attachedTrack.artist)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => playTrack(msg.attachedTrack!)}
                      className="p-2 rounded-full bg-[#00D9FF] text-black hover:scale-105 transition-all cursor-pointer shrink-0"
                    >
                      <Play className="h-3.5 w-3.5 fill-black" />
                    </button>
                  </div>
                )}

                {/* Confirmation Prompt (Section 15 & 40) */}
                {msg.requiresConfirmation && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-amber-300">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="font-mono text-[10px] uppercase font-bold">Confirmation Required</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer">
                        <Check className="h-3 w-3" /> Confirm Delete
                      </button>
                      <button className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer">
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['Play Shayad', 'Start Bengali Radio', 'Show Lyrics', 'Delete Playlist Test'].map((chip, i) => (
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
            placeholder="Ask NeoAssistant..."
            className="flex-1 p-3.5 rounded-2xl bg-[#090C14] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#00D9FF]"
          />
          <button
            onClick={() => handleSendPrompt()}
            className="p-3.5 rounded-2xl bg-[#00D9FF] text-black hover:scale-105 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,217,255,0.3)]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
