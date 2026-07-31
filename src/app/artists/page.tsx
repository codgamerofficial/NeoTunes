'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle2, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const ARTISTS_DATA = [
  { id: 'arijit-singh', name: 'Arijit Singh', listeners: '42.5M Monthly Listeners', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
  { id: 'the-weeknd', name: 'The Weeknd', listeners: '105M Monthly Listeners', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
  { id: 'coldplay', name: 'Coldplay', listeners: '82M Monthly Listeners', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
  { id: 'billie-eilish', name: 'Billie Eilish', listeners: '78M Monthly Listeners', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80' },
  { id: 'ed-sheeran', name: 'Ed Sheeran', listeners: '89M Monthly Listeners', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80' },
];

export default function ArtistsPage() {
  const router = useRouter();

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none pb-36">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8 text-[#00D4FF]" /> Followed Artists
        </h1>
        <p className="text-sm text-white/50 mt-1">Your favorite musicians, producers, and bands.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {ARTISTS_DATA.map((art) => (
          <motion.div
            key={art.id}
            onClick={() => router.push(`/artists/${art.id}`)}
            whileHover={{ y: -4 }}
            className="p-5 rounded-3xl bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all text-center space-y-3 group"
          >
            <div className="relative aspect-square w-full rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#00D4FF] transition-all shadow-lg mx-auto">
              <img src={art.coverUrl} alt={art.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-[#00D4FF] transition-colors truncate flex items-center justify-center gap-1">
                {art.name} <CheckCircle2 className="h-4 w-4 text-[#00D4FF]" />
              </h3>
              <p className="text-xs text-white/50 mt-0.5">{art.listeners}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
