'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListMusic, Plus, Play, Trash2, X, Sparkles, Image as ImageIcon, Music, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Playlist {
  id: string;
  title: string;
  desc: string;
  count: string;
  coverUrl: string;
  isCustom?: boolean;
}

const DEFAULT_PLAYLISTS: Playlist[] = [
  { id: 'chill-hits', title: 'Chill Hits', desc: 'Kick back with the softest pop & lo-fi beats.', count: '50 songs', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
  { id: 'workout-mix', title: 'Workout Mix', desc: '140+ BPM driving electronic & hip-hop beats.', count: '30 songs', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
  { id: 'lo-fi-vibes', title: 'Lo-Fi Vibes', desc: 'Ambient instrumental study beats for deep focus.', count: '40 songs', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
  { id: 'my-favorites', title: 'My Favorites', desc: 'Your personal top played tracks & saved jams.', count: '25 songs', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80' },
  { id: 'bollywood-classics', title: 'Bollywood Classics', desc: 'Timeless melodies from romantic Hindi cinema.', count: '65 songs', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
  { id: 'top-50-global', title: 'Top 50 Global', desc: 'The most played songs in the world right now.', count: '50 songs', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80' },
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
];

export default function PlaylistsPage() {
  const router = useRouter();

  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load custom playlists from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neotunes_playlists');
      if (saved) {
        const parsed: Playlist[] = JSON.parse(saved);
        setPlaylists([...parsed, ...DEFAULT_PLAYLISTS]);
      }
    } catch {}
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00D4FF', '#7A3CFF', '#FF2D95'],
    });
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPlaylist: Playlist = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      desc: newDesc.trim() || 'Custom user playlist on NeoTunes OS',
      count: '0 songs',
      coverUrl: selectedCover,
      isCustom: true,
    };

    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);

    // Save only custom playlists to localStorage
    try {
      const customOnly = updated.filter((p) => p.isCustom);
      localStorage.setItem('neotunes_playlists', JSON.stringify(customOnly));
    } catch {}

    triggerConfetti();
    setToastMessage(`Created playlist "${newPlaylist.title}"!`);
    setTimeout(() => setToastMessage(null), 3000);

    // Reset & Close
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  const handleDeletePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);

    try {
      const customOnly = updated.filter((p) => p.isCustom);
      localStorage.setItem('neotunes_playlists', JSON.stringify(customOnly));
    } catch {}

    setToastMessage('Playlist deleted.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none pb-36">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl bg-[#00D4FF] text-black font-bold text-xs shadow-[0_0_20px_rgba(0,212,255,0.6)] flex items-center gap-2"
          >
            <Check className="h-4 w-4" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ListMusic className="h-8 w-8 text-[#00D4FF]" /> Playlists &amp; Collections
          </h1>
          <p className="text-sm text-white/50 mt-1">Explore your curated mixes, collaborative playlists, and saved albums.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-bold text-xs shadow-[0_0_15px_#00D4FF] hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4" /> Create Playlist
        </button>
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {playlists.map((pl) => (
          <motion.div
            key={pl.id}
            onClick={() => router.push(`/playlists/${pl.id}`)}
            whileHover={{ y: -4 }}
            className="relative p-4 rounded-3xl bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img src={pl.coverUrl} alt={pl.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="p-3.5 rounded-full bg-[#00D4FF] text-black shadow-[0_0_15px_#00D4FF]">
                  <Play className="h-5 w-5 fill-black ml-0.5" />
                </div>
                {pl.isCustom && (
                  <button
                    onClick={(e) => handleDeletePlaylist(pl.id, e)}
                    className="p-2.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors shadow-lg"
                    title="Delete Playlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{pl.title}</div>
                {pl.isCustom && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#7A3CFF]/30 text-[#00D4FF] border border-[#7A3CFF]/40">Custom</span>
                )}
              </div>
              <div className="text-xs text-white/50 truncate mt-0.5">{pl.desc}</div>
              <div className="text-[11px] font-mono text-[#00D4FF] mt-1">{pl.count}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CREATE PLAYLIST MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-[#0F0F14] border border-white/10 p-6 space-y-6 shadow-[0_0_50px_rgba(0,212,255,0.2)] z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#00D4FF]" />
                  <h3 className="text-lg font-extrabold text-white">Create New Playlist</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">Playlist Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midnight Vibes 🌙"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-bold text-white placeholder-white/40 outline-none focus:border-[#00D4FF] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-1.5">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Describe your mood, genre, or vibe..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-medium text-white placeholder-white/40 outline-none focus:border-[#00D4FF] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">Cover Theme</label>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_COVERS.map((imgUrl, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedCover(imgUrl)}
                        className={`relative h-14 w-14 rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all ${
                          selectedCover === imgUrl ? 'border-[#00D4FF] scale-105 shadow-[0_0_12px_#00D4FF]' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Cover option" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-extrabold text-xs shadow-[0_0_15px_#00D4FF] hover:scale-105 transition-transform"
                  >
                    Create Playlist
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

