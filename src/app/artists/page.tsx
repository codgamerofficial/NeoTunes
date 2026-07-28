'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Users, Play, CheckCircle2 } from 'lucide-react';

const ARTISTS_DATA = [
  { id: 'arijit-singh', name: 'Arijit Singh', followers: '42.5M Listeners', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80' },
  { id: 'the-weeknd', name: 'The Weeknd', followers: '105M Listeners', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80' },
  { id: 'coldplay', name: 'Coldplay', followers: '82M Listeners', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80' },
  { id: 'billie-eilish', name: 'Billie Eilish', followers: '78M Listeners', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&q=80' },
];

export default function ArtistsPage() {
  const router = useRouter();

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#121212] text-white font-sans select-none">
      <div className="pb-6 border-b border-[#181818]">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8 text-[#29B6F6]" /> Followed Artists
        </h1>
        <p className="text-sm text-[#B3B3B3] mt-1">Your favorite musicians and producers.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {ARTISTS_DATA.map((art) => (
          <div
            key={art.id}
            onClick={() => router.push(`/search?q=${encodeURIComponent(art.name)}`)}
            className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group text-center space-y-3"
          >
            <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-lg bg-[#282828] mx-auto border-2 border-transparent group-hover:border-[#29B6F6] transition-all">
              <ImageWithFallback src={art.coverUrl} alt={art.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate flex items-center justify-center gap-1">
                {art.name} <CheckCircle2 className="h-3.5 w-3.5 text-[#29B6F6]" />
              </h3>
              <p className="text-xs text-[#B3B3B3] mt-0.5">{art.followers}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
