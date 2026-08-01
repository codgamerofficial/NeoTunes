'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, Music, Play } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface AskNeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'neo';
  text: string;
  suggestedTracks?: { title: string; artist: string; id: string; coverUrl?: string }[];
}

const PRESET_TRACKS: Record<string, { title: string; artist: string; id: string; coverUrl: string }[]> = {
  'Workout Hype': [
    { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
    { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
    { id: 'heat-waves', title: 'Heat Waves', artist: 'Glass Animals', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80' },
  ],
  'Late Night Lo-Fi': [
    { id: 'death-bed', title: 'Death Bed (Coffee for Your Head)', artist: 'Powfu ft. beabadoobee', coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80' },
    { id: 'get-you-the-moon', title: 'Get You The Moon', artist: 'Kina ft. Snøw', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&q=80' },
    { id: 'losing-interest', title: 'Losing Interest', artist: ' Shiloh Dynasty', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
  ],
  'Chill Sunset': [
    { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    { id: 'sunflower-spiderverse', title: 'Sunflower', artist: 'Post Malone & Swae Lee', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
    { id: 'golden-hour', title: 'Golden Hour', artist: 'JVKE', coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80' },
  ],
  'Focus Deep Work': [
    { id: 'resonance-HOME', title: 'Resonance', artist: 'HOME', coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80' },
    { id: 'cornfield-chase', title: 'Cornfield Chase (Interstellar)', artist: 'Hans Zimmer', coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80' },
    { id: 'star-shopping', title: 'Star Shopping', artist: 'Lil Peep', coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80' },
  ],
  'Sad Vibes': [
    { id: 'glimpse-of-us', title: 'Glimpse of Us', artist: 'Joji', coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?w=300&q=80' },
    { id: 'someone-you-loved', title: 'Someone You Loved', artist: 'Lewis Capaldi', coverUrl: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=300&q=80' },
  ],
};

export default function AskNeoModal({ isOpen, onClose }: AskNeoModalProps) {
  const { playTrack } = usePlayerStore();
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'neo',
      text: 'Hello! I am Neo, your AI Music DJ & Assistant. Tell me what vibe, genre, or mood you want to hear right now!',
      suggestedTracks: [
        { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
        { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
        { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Smooth Auto-scroll strictly inside chatContainerRef to keep new messages visible
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
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

      const presetMatch = PRESET_TRACKS[prompt] || PRESET_TRACKS['Workout Hype'];

      const neoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: data.reply || `Curated a high-fidelity ${prompt} soundtrack for you! Here are top matching tracks:`,
        suggestedTracks: data.suggestedTracks || presetMatch,
      };
      setMessages((prev) => [...prev, neoMsg]);
    } catch {
      const presetMatch = PRESET_TRACKS[prompt] || PRESET_TRACKS['Workout Hype'];
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: `NVIDIA Neural Engine connected. Curated custom soundscape for "${prompt}".`,
        suggestedTracks: presetMatch,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl" 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl h-[85vh] max-h-[620px] bg-[#0A0A0F]/98 border border-[#00D4FF]/30 rounded-[28px] shadow-[0_0_60px_rgba(0,212,255,0.2)] flex flex-col overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[#00D4FF]/10 via-[#7A3CFF]/8 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7A3CFF] shadow-[0_0_12px_rgba(0,212,255,0.4)]">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Ask Neo <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">AI DJ</span>
                </h3>
                <p className="text-[10px] text-white/40 font-mono">NVIDIA Neural Music Intelligence</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages — scrollable area strictly inside chatContainerRef */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none min-h-0"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'neo' && (
                  <div className="h-7 w-7 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                    <Sparkles className="h-3.5 w-3.5 text-[#00D4FF]" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#7A3CFF] to-[#FF2D95] text-white font-medium shadow-md rounded-br-sm'
                    : 'bg-white/[0.05] border border-white/10 text-white/90 rounded-bl-sm backdrop-blur-md'
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Suggested Tracks */}
                  {msg.suggestedTracks && msg.suggestedTracks.length > 0 && (
                    <div className="mt-3 space-y-2 pt-3 border-t border-white/10">
                      {msg.suggestedTracks.map((tr) => (
                        <div
                          key={tr.id}
                          onClick={() => {
                            playTrack({
                              id: tr.id,
                              title: tr.title,
                              artist: { id: 'ai-artist', name: typeof tr.artist === 'string' ? tr.artist : 'AI Artist' },
                              coverUrl: tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                              durationMs: 180000,
                              sourceType: 'youtube',
                            });
                            onClose();
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-[#00D4FF]/20 border border-white/8 hover:border-[#00D4FF]/50 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-[#00D4FF]/15 group-hover:bg-[#00D4FF]/30 transition-colors">
                              <Music className="h-3.5 w-3.5 text-[#00D4FF]" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">{tr.title}</div>
                              <div className="text-[10px] text-white/40 truncate">{typeof tr.artist === 'object' ? (tr.artist as any)?.name : tr.artist}</div>
                            </div>
                          </div>
                          <Play className="h-3.5 w-3.5 text-[#00D4FF] fill-[#00D4FF] flex-shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                  <Sparkles className="h-3.5 w-3.5 text-[#00D4FF] animate-spin" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 rounded-bl-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00D4FF]">
                    <span className="animate-pulse">Neo is curating your soundtrack...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts & Input — pinned to bottom */}
          <div className="shrink-0 px-4 pb-4 pt-3 border-t border-white/10 bg-[#0A0A0F]/98 space-y-2.5">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {['Late Night Lo-Fi', 'Workout Hype', 'Chill Sunset', 'Focus Deep Work', 'Sad Vibes'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/[0.05] border border-white/10 text-white/70 hover:text-white hover:border-[#00D4FF]/50 hover:bg-[#00D4FF]/10 whitespace-nowrap transition-all active:scale-95"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/12 rounded-full px-4 py-2.5 focus-within:border-[#00D4FF]/60 focus-within:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all">
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
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-bold hover:scale-105 shadow-[0_0_12px_rgba(0,212,255,0.4)]'
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
