'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Disc, Play } from 'lucide-react';

const ALBUMS_DATA = [
  { id: 'love-aaj-kal', title: 'Love Aaj Kal', artist: 'Pritam & Arijit Singh', year: '2020', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
  { id: 'after-hours', title: 'After Hours', artist: 'The Weeknd', year: '2020', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
  { id: 'endless-summer', title: 'Endless Summer Vacation', artist: 'Miley Cyrus', year: '2023', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
  { id: 'harry-house', title: "Harry's House", artist: 'Harry Styles', year: '2022', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80' },
];

export default function AlbumsPage() {
  const router = useRouter();

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#121212] text-white font-sans select-none">
      <div className="pb-6 border-b border-[#181818]">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Disc className="h-8 w-8 text-[#29B6F6]" /> Albums
        </h1>
        <p className="text-sm text-[#B3B3B3] mt-1">Saved full albums and discography releases.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {ALBUMS_DATA.map((alb) => (
          <div
            key={alb.id}
            onClick={() => router.push(`/search?q=${encodeURIComponent(alb.title)}`)}
            className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group space-y-3"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg bg-[#282828]">
              <ImageWithFallback src={alb.coverUrl} alt={alb.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#29B6F6] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4 fill-black translate-x-0.5" />
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate">{alb.title}</h3>
              <p className="text-xs text-[#B3B3B3] truncate">{alb.artist}</p>
              <span className="text-[10px] font-mono text-[#B3B3B3] mt-1 block">{alb.year} • Album</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
