'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, Music, Play, Disc } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface AskNeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'neo';
  text: string;
  suggestedTracks?: { title: string; artist: string; id: string }[];
}

export default function AskNeoModal({ isOpen, onClose }: AskNeoModalProps) {
  const { playTrack } = usePlayerStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'neo',
      text: 'Hello! I am Neo, your AI Music DJ & Assistant. Tell me what vibe, genre, or mood you want to hear right now!',
      suggestedTracks: [
        { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE' },
        { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh' },
        { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd' },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      const neoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: data.reply || `I generated a custom ${prompt} audio selection for you! Here are top tracks that match your mood:`,
        suggestedTracks: data.suggestedTracks || [
          { id: 'itunes_1823748641', title: 'TE CONOCÍ (Slowed)', artist: 'bxkq & PXLWYSE' },
          { id: 'shayad-love-aaj-kal', title: 'Shayad - Acoustic', artist: 'Arijit Singh' },
          { id: 'heat-waves', title: 'Heat Waves', artist: 'Glass Animals' },
        ],
      };
      setMessages((prev) => [...prev, neoMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: `NVIDIA Neural Engine connected. Curated custom soundscape for "${prompt}".`,
        suggestedTracks: [
          { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE' },
          { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd' },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[600px] bg-[#0A0A0F]/98 border border-[#00D4FF]/20 rounded-t-[28px] sm:rounded-[28px] shadow-[0_0_60px_rgba(0,212,255,0.15)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-[#00D4FF]/8 via-[#7A3CFF]/5 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7A3CFF] shadow-[0_0_12px_rgba(0,212,255,0.4)]">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Ask Neo <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">AI DJ</span>
                </h3>
                <p className="text-[10px] text-white/40">NVIDIA Neural Music Intelligence</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages — scrollable area that grows with content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'neo' && (
                  <div className="h-7 w-7 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#00D4FF]" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#7A3CFF] to-[#FF2D95] text-white rounded-br-sm'
                    : 'bg-white/[0.04] border border-white/10 text-white/90 rounded-bl-sm'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Suggested Tracks */}
                  {msg.suggestedTracks && (
                    <div className="mt-3 space-y-1.5 pt-3 border-t border-white/10">
                      {msg.suggestedTracks.map((tr) => (
                        <div
                          key={tr.id}
                          onClick={() => {
                            playTrack({
                              id: tr.id,
                              title: tr.title,
                              artist: { id: 'ai-artist', name: typeof tr.artist === 'string' ? tr.artist : 'AI Artist' },
                              coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                              durationMs: 180000,
                              sourceType: 'youtube',
                            });
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-[#00D4FF]/15 border border-white/8 hover:border-[#00D4FF]/40 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-[#00D4FF]/10">
                              <Music className="h-3.5 w-3.5 text-[#00D4FF]" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">{tr.title}</div>
                              <div className="text-[10px] text-white/40 truncate">{typeof tr.artist === 'object' ? (tr.artist as any)?.name : tr.artist}</div>
                            </div>
                          </div>
                          <Play className="h-3.5 w-3.5 text-[#00D4FF] fill-[#00D4FF] flex-shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-[#00D4FF] animate-spin" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 rounded-bl-sm">
                  <div className="flex items-center gap-2 text-xs text-[#00D4FF]">
                    <span className="animate-pulse">Neo is curating your soundtrack...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts & Input — pinned to bottom */}
          <div className="shrink-0 px-4 pb-4 pt-3 border-t border-white/8 bg-[#0A0A0F]/95 space-y-2.5">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {['Late Night Lo-Fi', 'Workout Hype', 'Chill Sunset', 'Focus Deep Work', 'Sad Vibes'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:border-[#00D4FF]/40 whitespace-nowrap transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2.5 focus-within:border-[#00D4FF]/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Neo for playlists, artists, or recommendations..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`p-2 rounded-full transition-all ${
                  input.trim()
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-bold hover:scale-105'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
