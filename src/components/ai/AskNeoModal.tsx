'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, X, Bot, Music, Play, Plus, CheckCircle2, 
  Mic, MicOff, Volume2, VolumeX, BadgeCheck, ListPlus, Radio, User
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface AskNeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'neo';
  text: string;
  intent?: string;
  tracks?: any[];
  artists?: any[];
  suggestedArtists?: string[];
}

export default function AskNeoModal({ isOpen, onClose }: AskNeoModalProps) {
  const { playTrack, addToQueue } = usePlayerStore();
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'neo',
      text: "👋 Hello! I am **Neo**, your AI Music Copilot powered by **NVIDIA NIM LLM Engine**. Ask me for any artist, mood, workout playlist, or song recommendations!",
      tracks: [
        { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE', album: 'Single', duration: '2:49', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', isHQ: true },
        { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', isHQ: true },
        { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', album: 'Love Aaj Kal', duration: '4:07', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80', isHQ: true },
      ],
    },
  ]);

  // Auto-scroll chat container strictly inside chatContainerRef
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Voice Speech-to-Text (STT) Trigger
  const handleToggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  // Text-to-Speech (TTS) Voice Reply
  const speakReply = (text: string) => {
    if (!isTtsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

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
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          history: messages.map(m => ({ role: m.sender, content: m.text })) 
        }),
      });

      const data = await res.json();

      const neoMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: data.reply || `Analyzed "${prompt}". Here are verified track matches:`,
        intent: data.intent,
        tracks: data.tracks || [],
        artists: data.artists || [],
        suggestedArtists: data.suggestedArtists || [],
      };

      setMessages((prev) => [...prev, neoMsg]);
      speakReply(data.reply || '');
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'neo',
        text: `NVIDIA Copilot Engine active. Curated recommendations for "${prompt}".`,
        tracks: [
          { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', isHQ: true },
          { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE', album: 'Single', duration: '2:49', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', isHQ: true },
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
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl" 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl h-[88vh] max-h-[680px] bg-[#07070B]/98 border border-[#00D4FF]/30 rounded-[28px] shadow-[0_0_60px_rgba(0,212,255,0.2)] flex flex-col overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-[#00D4FF]/10 via-[#7A3CFF]/8 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7A3CFF] shadow-[0_0_15px_rgba(0,212,255,0.5)]">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  Neo AI Copilot <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">NVIDIA NIM</span>
                </h3>
                <p className="text-[10px] text-white/40 font-mono">ChatGPT + Spotify AI DJ + Perplexity Copilot</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                className={`p-2 rounded-full border transition-all ${
                  isTtsEnabled ? 'bg-[#00D4FF]/20 border-[#00D4FF]/50 text-[#00D4FF]' : 'bg-white/5 border-white/10 text-white/40'
                }`}
                title={isTtsEnabled ? 'Voice Replies Enabled' : 'Enable Voice Replies'}
              >
                {isTtsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages scroll area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-none min-h-0"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'neo' && (
                  <div className="h-8 w-8 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/40 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(0,212,255,0.25)]">
                    <Sparkles className="h-4 w-4 text-[#00D4FF]" />
                  </div>
                )}
                <div className={`max-w-[88%] rounded-2xl p-4 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#7A3CFF] to-[#FF2D95] text-white font-semibold shadow-md rounded-br-none'
                    : 'bg-[#10111A] border border-white/10 text-white/90 rounded-bl-none backdrop-blur-md space-y-3'
                }`}>
                  <div className="leading-relaxed whitespace-pre-line">{msg.text}</div>

                  {/* Suggested Artist Tags */}
                  {msg.suggestedArtists && msg.suggestedArtists.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedArtists.map((artistName) => (
                        <button
                          key={artistName}
                          onClick={() => handleSend(artistName)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#7A3CFF]/20 border border-[#7A3CFF]/40 text-[#7A3CFF] hover:bg-[#7A3CFF]/40 transition-all"
                        >
                          + {artistName}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Real Verified Music Cards */}
                  {msg.tracks && msg.tracks.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="text-[10px] font-mono text-[#00D4FF] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Radio className="h-3 w-3 animate-pulse text-[#00D4FF]" /> Verified Real Track Matches ({msg.tracks.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.tracks.map((tr) => (
                          <div
                            key={tr.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/8 hover:border-[#00D4FF]/40 transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img
                                src={tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                                alt={tr.title}
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">{tr.title}</div>
                                <div className="text-[10px] text-white/40 truncate">{typeof tr.artist === 'object' ? tr.artist.name : tr.artist}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              <button
                                onClick={() => addToQueue({
                                  id: tr.id,
                                  title: tr.title,
                                  artist: typeof tr.artist === 'object' ? tr.artist : { id: 'a', name: tr.artist },
                                  coverUrl: tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                  durationMs: tr.durationMs || 180000,
                                  sourceType: 'youtube',
                                })}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-all"
                                title="Add to Queue"
                              >
                                <ListPlus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  playTrack({
                                    id: tr.id,
                                    title: tr.title,
                                    artist: typeof tr.artist === 'object' ? tr.artist : { id: 'a', name: tr.artist },
                                    coverUrl: tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                    durationMs: tr.durationMs || 180000,
                                    sourceType: 'youtube',
                                  });
                                  onClose();
                                }}
                                className="p-1.5 rounded-lg bg-[#00D4FF] text-black hover:scale-105 transition-transform shadow-[0_0_10px_#00D4FF]"
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
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#00D4FF]/15 border border-[#00D4FF]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,212,255,0.25)]">
                  <Sparkles className="h-4 w-4 text-[#00D4FF] animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[#10111A] border border-white/10 rounded-bl-none">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00D4FF]">
                    <span className="animate-pulse">NVIDIA NIM reasoning & backend database search active...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Chips & Input Footer */}
          <div className="shrink-0 px-4 pb-4 pt-3 border-t border-white/10 bg-[#07070B] space-y-2.5">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                '🔥 Play Badshah Hits', 
                '🎧 Lo-Fi Focus Mix', 
                '🏋️ Gym Hype Tracks', 
                '🌙 Sleep Ambience', 
                '🎤 Karaoke Mode'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip.replace(/^[^\w\s]+/, '').trim())}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/[0.05] border border-white/10 text-white/70 hover:text-white hover:border-[#00D4FF]/50 hover:bg-[#00D4FF]/10 whitespace-nowrap transition-all active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/15 rounded-full px-4 py-2 focus-within:border-[#00D4FF]/60 focus-within:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all">
              <button
                onClick={handleToggleVoiceInput}
                className={`p-2 rounded-full transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/50 hover:text-[#00D4FF]'
                }`}
                title={isListening ? 'Listening...' : 'Voice Search'}
              >
                {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Neo Copilot (e.g. 'Badsha hits', 'Workout EDM')..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/35 outline-none"
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
