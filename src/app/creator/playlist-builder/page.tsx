'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FolderPlus, Play, Plus, Trash2, ShieldCheck, Check, Sparkles, Sliders } from 'lucide-react';
import { PlaylistHealthAnalyzer } from '@/services/creator/PlaylistHealthAnalyzer';
import { SmartPlaylistEngine } from '@/services/creator/SmartPlaylistEngine';
import { PlaylistHealthReport } from '@/types/creator';
import { Track, getArtistName } from '@/types';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getTrackArtwork } from '@/utils/artwork';

const MOCK_BUILDER_TRACKS: Track[] = [
  {
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
  {
    id: 'spotify:track:blinding_lights',
    canonicalId: 'spotify:track:blinding_lights',
    source: 'spotify',
    sourceId: 'blinding_lights',
    title: 'Blinding Lights',
    artists: ['The Weeknd'],
    album: { name: 'After Hours' },
    duration: 200,
    durationMs: 200000,
    playable: true,
  },
];

function PlaylistBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSmartMode = searchParams?.get('mode') === 'smart';

  const { playTrack } = usePlaybackStore();
  const [title, setTitle] = useState(isSmartMode ? 'Bengali Liked Smart Mix' : 'My New Master Playlist');
  const [description, setDescription] = useState('Curated inside NeoTunes Creator Studio.');
  const [tracks, setTracks] = useState<Track[]>(MOCK_BUILDER_TRACKS);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [health, setHealth] = useState<PlaylistHealthReport | null>(null);

  useEffect(() => {
    setHealth(PlaylistHealthAnalyzer.analyze(tracks));
  }, [tracks]);

  const handleToggleSelect = (id: string) => {
    if (selectedTrackIds.includes(id)) {
      setSelectedTrackIds(selectedTrackIds.filter((t) => t !== id));
    } else {
      setSelectedTrackIds([...selectedTrackIds, id]);
    }
  };

  const handleBulkRemove = () => {
    setTracks(tracks.filter((t) => !selectedTrackIds.includes(t.id || t.canonicalId)));
    setSelectedTrackIds([]);
  };

  const handleGenerateSmart = async () => {
    const smartTracks = await SmartPlaylistEngine.generateSmartPlaylist([{ field: 'genre', operator: 'CONTAINS', value: 'Bengali' }]);
    if (smartTracks.length > 0) {
      setTracks(smartTracks);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FolderPlus className="h-7 w-7 text-[#00D9FF]" /> {isSmartMode ? 'Smart Playlist Lab' : 'Playlist Builder & Editor'}
        </h1>
        <p className="text-xs text-[#A1A1A6]">
          Organize canonical tracks, run health checks, and manage playlist metadata.
        </p>
      </div>

      {/* Metadata Inputs */}
      <div className="p-6 rounded-3xl bg-[#090C12] border border-white/10 space-y-4 shadow-xl">
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-white uppercase">Playlist Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-[#00D9FF]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-white uppercase">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-white/80 focus:outline-none focus:border-[#00D9FF]"
          />
        </div>

        {isSmartMode && (
          <button
            onClick={handleGenerateSmart}
            className="px-5 py-2.5 rounded-full bg-[#DFFF00] text-black font-mono font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Run Smart Rule Generator
          </button>
        )}
      </div>

      {/* Playlist Health Summary (Section 45 & 49) */}
      {health && (
        <div className="p-6 rounded-3xl bg-[#0A0D14] border border-white/10 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Playlist Health</span>
              <h3 className="text-xl font-black text-white">{health.healthScore} / 100</h3>
            </div>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <span className="block font-bold text-white">{health.totalTracks} Tracks • {Math.floor(health.totalDuration / 60)} mins</span>
            <span className="text-[10px] font-mono text-[#A1A1A6] block">{health.duplicatesCount} Duplicates • {health.artistDiversityScore}% Artist Diversity</span>
          </div>
        </div>
      )}

      {/* Toolbar & Tracks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Tracks ({tracks.length})</h3>
          {selectedTrackIds.length > 0 && (
            <button
              onClick={handleBulkRemove}
              className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold hover:bg-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove Selected ({selectedTrackIds.length})
            </button>
          )}
        </div>

        <div className="space-y-2">
          {tracks.map((t) => {
            const isSelected = selectedTrackIds.includes(t.id || t.canonicalId);
            const coverUrl = getTrackArtwork(t);
            const artistStr = getArtistName(t.artists || t.artist);

            return (
              <div
                key={t.id || t.canonicalId}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected ? 'bg-[#00D9FF]/10 border-[#00D9FF]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(t.id || t.canonicalId)}
                    className="w-4 h-4 rounded accent-[#00D9FF] cursor-pointer"
                  />
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <Artwork source={coverUrl} size="small" alt={t.title} type="track" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>
                    <p className="text-[11px] text-[#A1A1A6] truncate">{artistStr}</p>
                  </div>
                </div>

                <button
                  onClick={() => playTrack(t, tracks)}
                  className="p-2 rounded-full bg-white/5 hover:bg-[#00D9FF] hover:text-black text-white/70 transition-all cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default function PlaylistBuilderPage() {
  return (
    <FeatureErrorBoundary featureName="Playlist Builder">
      <Suspense fallback={<div className="p-10 text-white text-xs font-mono">Loading Playlist Builder...</div>}>
        <PlaylistBuilderContent />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
