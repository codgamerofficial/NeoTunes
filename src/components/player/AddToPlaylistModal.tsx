'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Check, ListMusic, Music, X, Sparkles } from 'lucide-react';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { likedSongsService, UserPlaylist } from '@/services/likedSongsService';
import { useToast } from '@/components/ui/NeoToast';
import { Artwork } from '@/components/ui/Artwork';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  track,
}: AddToPlaylistModalProps) {
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  
  // Inline Create Playlist State
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !track) return;

    let isMounted = true;
    setLoading(true);

    likedSongsService.getPlaylists().then((list) => {
      if (!isMounted) return;
      setPlaylists(list);

      // Check existing presence
      const initialMap: Record<string, boolean> = {};
      list.forEach((pl) => {
        initialMap[pl.id] = likedSongsService.isTrackInPlaylist(pl.id, track.id);
      });
      setAddedMap(initialMap);
      setLoading(false);
    });

    const handlePlaylistChange = () => {
      likedSongsService.getPlaylists().then((list) => {
        if (isMounted) setPlaylists(list);
      });
    };

    window.addEventListener('neotunes_playlist_change', handlePlaylistChange);
    return () => {
      isMounted = false;
      window.removeEventListener('neotunes_playlist_change', handlePlaylistChange);
    };
  }, [isOpen, track]);

  if (!isOpen || !track) return null;

  const artworkUrl = resolveArtwork(track);
  const artistName = getArtistName(track.artists || track.artist);

  const handleAddToPlaylist = async (playlist: UserPlaylist) => {
    if (addedMap[playlist.id]) {
      showToast(`Already in "${playlist.name}"`);
      return;
    }

    setAddedMap((prev) => ({ ...prev, [playlist.id]: true }));

    const res = await likedSongsService.addTrackToPlaylist(playlist.id, track);
    if (res.success) {
      showToast(`Added to "${playlist.name}"`);
    } else {
      showToast(`Failed to add to playlist`, 'error');
      setAddedMap((prev) => ({ ...prev, [playlist.id]: false }));
    }
  };

  const handleCreateNewPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreateLoading(true);
    try {
      const created = await likedSongsService.createPlaylist(newPlaylistName.trim());
      await likedSongsService.addTrackToPlaylist(created.id, track);
      setAddedMap((prev) => ({ ...prev, [created.id]: true }));
      setPlaylists((prev) => [created, ...prev]);
      showToast(`Created & added to "${created.name}"`);
      setNewPlaylistName('');
      setIsCreating(false);
    } catch {
      showToast('Error creating playlist', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Sheet Container */}
      <div className="relative z-10 w-full sm:max-w-md bg-[#0C0E14] border-t sm:border border-white/10 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] text-[#F5F7FA] font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-[#DFFF00]/15 border border-[#DFFF00]/30 flex items-center justify-center text-[#DFFF00] shrink-0">
              <ListMusic className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Add to Playlist
              </h2>
              <p className="text-xs text-[#9AA1AD] truncate">
                {track.title} • {artistName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Create New Playlist Inline Toggle */}
        <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#DFFF00] hover:bg-[#cbe600] text-black font-extrabold text-xs transition-all cursor-pointer shadow-[0_4px_20px_rgba(223,255,0,0.2)]"
            >
              <Plus className="h-4 w-4" />
              <span>New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateNewPlaylist} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 focus:border-[#DFFF00] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || createLoading}
                  className="px-4 py-2 rounded-xl bg-[#DFFF00] disabled:opacity-50 text-black font-extrabold text-xs shrink-0 cursor-pointer"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewPlaylistName('');
                  }}
                  className="px-2.5 py-2 rounded-xl bg-white/5 text-[#9AA1AD] hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Playlists List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 scrollbar-none">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#9AA1AD] animate-pulse">
              Loading playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-white/5 mx-auto flex items-center justify-center text-[#9AA1AD]">
                <Music className="h-5 w-5" />
              </div>
              <p className="text-xs text-[#9AA1AD]">No playlists found</p>
            </div>
          ) : (
            playlists.map((playlist) => {
              const isAdded = !!addedMap[playlist.id];
              return (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                    isAdded
                      ? 'bg-[#DFFF00]/10 border-[#DFFF00]/30'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {playlist.coverUrl ? (
                        <Artwork
                          source={playlist.coverUrl}
                          size="full"
                          alt={playlist.name}
                          type="playlist"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ListMusic className="h-5 w-5 text-[#9AA1AD]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-[10px] text-[#9AA1AD] truncate mt-0.5">
                        {playlist.trackCount || 0} {playlist.trackCount === 1 ? 'track' : 'tracks'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isAdded ? (
                      <div className="h-7 w-7 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-[0_0_12px_rgba(223,255,0,0.4)]">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-white/70 flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-[#0C0E14] text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
