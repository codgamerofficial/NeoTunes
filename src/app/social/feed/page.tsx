'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Heart, MessageSquare, Play, Sparkles, Users, Music } from 'lucide-react';
import { SocialPost } from '@/types/social-ecosystem';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getTrackArtwork } from '@/utils/artwork';
import { getArtistName, Track } from '@/types';

const INITIAL_POSTS: SocialPost[] = [
  {
    postId: 'post_1',
    userId: 'user_1',
    username: 'alex_vibes',
    caption: 'This track has been on repeat all evening! Incredible production.',
    postType: 'TRACK_SHARE',
    reactionsCount: 24,
    commentsCount: 5,
    createdAt: Date.now() - 3600000,
    attachedTrack: {
      id: 'spotify:track:shayad',
      canonicalId: 'spotify:track:shayad',
      source: 'spotify',
      sourceId: 'shayad',
      title: 'Shayad',
      artists: ['Arijit Singh', 'Pritam'],
      album: { name: 'Love Aaj Kal' },
      duration: 247,
      durationMs: 247000,
      playable: true,
    },
  },
];

export default function MusicSocialFeedPage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();
  const [posts, setPosts] = useState<SocialPost[]>(INITIAL_POSTS);

  const handlePlaySharedTrack = (track?: Track) => {
    if (track) {
      playTrack(track);
    }
  };

  return (
    <FeatureErrorBoundary featureName="Music Social Feed">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-2xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Share2 className="h-7 w-7 text-[#00D9FF]" /> Music Community Feed
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Discover music shared by friends and collaborators across the NeoTunes network.
          </p>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => {
            const track = post.attachedTrack;
            const coverUrl = track ? getTrackArtwork(track) : '';
            const artistStr = track ? getArtistName(track.artists || track.artist) : '';

            return (
              <div key={post.postId} className="p-5 rounded-3xl bg-[#090C14] border border-white/10 space-y-4 shadow-xl">
                {/* User Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D9FF]/20 text-[#00D9FF] font-mono font-bold text-sm flex items-center justify-center border border-[#00D9FF]/30 uppercase">
                    {post.username.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">@{post.username}</h4>
                    <span className="text-[10px] text-[#A1A1A6] font-mono">Shared a track • 1h ago</span>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-xs text-white/90 leading-relaxed">{post.caption}</p>

                {/* Attached Music Card */}
                {track && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <Artwork source={coverUrl} size="small" alt={track.title} type="track" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
                        <p className="text-[11px] text-[#A1A1A6] truncate">{artistStr}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlaySharedTrack(track)}
                      className="px-4 py-2 rounded-full bg-[#00D9FF] text-black font-mono font-extrabold text-xs uppercase tracking-wider hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(0,217,255,0.3)]"
                    >
                      <Play className="h-3.5 w-3.5 fill-black" /> Play
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
