'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Play, Heart, Disc, Sparkles, Flame, Clock, Loader2 } from 'lucide-react';

const QUICK_CARDS = [
  { title: 'Liked Songs', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', href: '/liked' },
  { title: 'Bollywood Hits 2026', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80', href: '/search?q=Bollywood%20Hits' },
  { title: 'Lo-Fi Coding Beats', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', href: '/search?q=Lofi%20Beats' },
  { title: 'Top 50 Global', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80', href: '/search?q=Top%2050' },
  { title: 'Chill Sunset Acoustics', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80', href: '/browse' },
  { title: 'Ed Sheeran & Friends', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', href: '/search?q=Ed%20Sheeran' },
];

export default function HomePage() {
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying } = usePlaybackStore();

  // Fetch real trending tracks dynamically from API
  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['home-trending-tracks'],
    queryFn: async () => {
      const res = await fetch('/api/search?q=Bollywood%20Hits%20Arijit%20Pritam');
      if (!res.ok) return { songs: [] };
      return res.json();
    },
  });

  const trendingSongs = trendingData?.songs?.length ? trendingData.songs : (trendingData?.tracks || []);

  const cleanTitle = (title: string) => {
    if (!title) return 'Track';
    return title.split('_')[0].split('ft.')[0].split('|')[0].trim();
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#0B0E14] text-white font-sans select-none pb-28">
      
      {/* Greeting Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Good evening, Saswata</h1>
        <p className="text-sm text-[#B3B3B3] mt-1">Here is your personal music dashboard for today.</p>
      </div>

      {/* Quick Access 6-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_CARDS.map((card, idx) => (
          <div
            key={idx}
            onClick={() => router.push(card.href)}
            className="flex items-center gap-4 rounded-xl bg-[#181818] hover:bg-[#282828] cursor-pointer group transition-all overflow-hidden border border-transparent hover:border-[#282828] pr-4 shadow-sm"
          >
            <div className="relative h-16 w-16 flex-shrink-0">
              <ImageWithFallback src={card.cover} alt={card.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-[#00D6FF] transition-colors truncate">
                {card.title}
              </span>
              <button className="h-9 w-9 rounded-full bg-[#00D6FF] text-black flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4 fill-black translate-x-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Real Trending Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#FF4DDB]" /> Trending Hits Right Now
          </h2>
          <span onClick={() => router.push('/search')} className="text-xs font-bold text-[#B3B3B3] hover:text-white cursor-pointer">
            Explore catalog ↗
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-[#B3B3B3]">
            <Loader2 className="h-6 w-6 animate-spin text-[#00D6FF]" />
            <span className="ml-3 text-xs font-mono">Fetching live recommendations...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {trendingSongs.slice(0, 5).map((track: any) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, trendingSongs)}
                className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group space-y-3"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg bg-[#282828]">
                  <ImageWithFallback src={track.coverUrl || '/images/default-cover.png'} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#00D6FF] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4 fill-black translate-x-0.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00D6FF] transition-colors truncate">
                    {cleanTitle(track.title)}
                  </h3>
                  <p className="text-xs text-[#B3B3B3] truncate mt-0.5">{track.artist?.name || 'Artist'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
