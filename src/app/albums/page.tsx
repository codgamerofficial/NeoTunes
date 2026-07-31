'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Disc, Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ALBUMS_DATA = [
  { id: 'love-aaj-kal', title: 'Love Aaj Kal', artist: 'Pritam & Arijit Singh', year: '2020', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
  { id: 'after-hours', title: 'After Hours', artist: 'The Weeknd', year: '2020', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
  { id: 'endless-summer', title: 'Endless Summer Vacation', artist: 'Miley Cyrus', year: '2023', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
  { id: 'harry-house', title: "Harry's House", artist: 'Harry Styles', year: '2022', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80' },
];

export default function AlbumsPage() {
  const router = useRouter();

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none pb-36">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Disc className="h-8 w-8 text-[#00D4FF]" /> Saved Albums
        </h1>
        <p className="text-sm text-white/50 mt-1">Full studio albums and discography releases.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {ALBUMS_DATA.map((alb) => (
          <motion.div
            key={alb.id}
            onClick={() => router.push(`/albums/${alb.id}`)}
            whileHover={{ y: -4 }}
            className="p-4 rounded-3xl bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-3 group"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img src={alb.coverUrl} alt={alb.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-3.5 rounded-full bg-[#00D4FF] text-black shadow-[0_0_15px_#00D4FF]">
                  <Play className="h-5 w-5 fill-black ml-0.5" />
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{alb.title}</div>
              <div className="text-xs text-white/50 truncate mt-0.5">{alb.artist}</div>
              <div className="text-[10px] font-mono text-[#00D4FF] mt-1">{alb.year} • DOLBY ATMOS</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
