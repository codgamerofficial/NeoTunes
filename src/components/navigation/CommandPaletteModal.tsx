'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  Compass, 
  Library, 
  User, 
  Settings, 
  Sparkles, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Radio, 
  X,
  ListPlus,
  Heart,
  Download,
  History,
  Trash2,
  Disc,
  Music,
  ArrowRight,
  Command
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  type: 'song' | 'artist' | 'album' | 'playlist' | 'action' | 'navigation' | 'recent' | 'neo';
  title: string;
  subtitle?: string;
  category?: string;
  coverUrl?: string;
  icon?: React.ComponentType<{ className?: string }>;
  run: () => void;
  trackData?: any;
}

export default function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const { currentTrack, isPlaying, setPlaying, nextTrack, prevTrack, playTrack } = usePlaybackStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Arijit Singh',
    'Bengali romance',
    'After Hours',
    'Lo-fi chill'
  ]);
  const [liveResults, setLiveResults] = useState<{
    songs: any[];
    artists: any[];
    albums: any[];
    playlists: any[];
  }>({ songs: [], artists: [], albums: [], playlists: [] });
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim()) {
      setLiveResults({ songs: [], artists: [], albums: [], playlists: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveResults({
            songs: data.songs || data.tracks || [],
            artists: data.artists || [],
            albums: data.albums || [],
            playlists: data.playlists || [],
          });
        }
      } catch (e) {
        console.warn('Search API error in Command Center:', e);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(handler);
  }, [query]);

  // Construct flat list of actionable items for keyboard navigation
  const buildItems = (): { category: string; items: CommandItem[] }[] => {
    if (!query.trim()) {
      // DEFAULT EMPTY STATE (Spec 5)
      return [
        {
          category: 'RECENT SEARCHES',
          items: recentSearches.map((s) => ({
            id: `rec-${s}`,
            type: 'recent',
            title: s,
            icon: History,
            run: () => {
              setQuery(s);
            },
          })),
        },
        {
          category: 'QUICK ACTIONS',
          items: [
            {
              id: 'qa-continue',
              type: 'action',
              title: isPlaying ? 'Pause Playback' : 'Continue Listening',
              subtitle: currentTrack ? `${currentTrack.title} · ${typeof currentTrack.artist === 'object' ? currentTrack.artist.name : currentTrack.artist}` : 'Resume player',
              icon: isPlaying ? Pause : Play,
              run: () => {
                setPlaying(!isPlaying);
                onClose();
              },
            },
            {
              id: 'qa-surprise',
              type: 'action',
              title: '✨ Surprise Me',
              subtitle: 'Step outside your usual listening patterns',
              icon: Sparkles,
              run: () => {
                router.push('/?surprise=true');
                onClose();
              },
            },
            {
              id: 'qa-liked',
              type: 'action',
              title: '❤️ Liked Songs',
              subtitle: 'Open your saved favorites',
              icon: Heart,
              run: () => {
                router.push('/library?tab=liked');
                onClose();
              },
            },
            {
              id: 'qa-downloads',
              type: 'action',
              title: '📥 Offline Downloads',
              subtitle: 'Access downloaded tracks',
              icon: Download,
              run: () => {
                router.push('/library?tab=downloads');
                onClose();
              },
            },
            {
              id: 'qa-create-playlist',
              type: 'action',
              title: '🎵 Create Playlist',
              subtitle: 'Build a new playlist mix',
              icon: ListPlus,
              run: () => {
                router.push('/library');
                onClose();
              },
            },
            {
              id: 'qa-jam',
              type: 'action',
              title: '📻 Start a Jam',
              subtitle: 'Create a live social listening room',
              icon: Radio,
              run: () => {
                router.push('/jam/ROOM123');
                onClose();
              },
            },
          ],
        },
        {
          category: 'NAVIGATION',
          items: [
            { id: 'nav-home', type: 'navigation', title: 'Home', subtitle: 'Personalized dashboard', icon: Home, run: () => { router.push('/'); onClose(); } },
            { id: 'nav-browse', type: 'navigation', title: 'Browse', subtitle: 'Genres, charts & new releases', icon: Compass, run: () => { router.push('/browse'); onClose(); } },
            { id: 'nav-library', type: 'navigation', title: 'Library', subtitle: 'Your music collection', icon: Library, run: () => { router.push('/library'); onClose(); } },
            { id: 'nav-profile', type: 'navigation', title: 'Profile', subtitle: 'Account settings & history', icon: User, run: () => { router.push('/profile'); onClose(); } },
            { id: 'nav-settings', type: 'navigation', title: 'Settings', subtitle: 'Audio quality & Soundstage', icon: Settings, run: () => { router.push('/settings'); onClose(); } },
          ],
        },
      ];
    }

    // LIVE SEARCH RESULTS GROUPING (Spec 4 & 19 - Music Wins over Navigation)
    const sections: { category: string; items: CommandItem[] }[] = [];

    // 1. Natural Language Intent -> Ask Neo
    if (query.length > 5 || /relax|workout|chill|happy|sad|rainy|drive|vibes|like|similar/i.test(query)) {
      sections.push({
        category: 'ASK NEO MUSIC INTELLIGENCE',
        items: [{
          id: 'neo-prompt',
          type: 'neo',
          title: `✨ Ask Neo — "${query}"`,
          subtitle: 'Generate AI curated playlist matching this vibe',
          icon: Sparkles,
          run: () => {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            onClose();
          },
        }],
      });
    }

    // 2. Songs
    if (liveResults.songs.length > 0) {
      sections.push({
        category: 'SONGS',
        items: liveResults.songs.slice(0, 4).map((s) => ({
          id: `song-${s.id}`,
          type: 'song',
          title: s.title,
          subtitle: `${typeof s.artist === 'object' && s.artist ? s.artist.name : (s.artist || 'Artist')} · ${typeof s.album === 'object' && s.album ? (s.album.name || s.album.title) : (s.album || 'Single')}`,
          coverUrl: s.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
          trackData: s,
          run: () => {
            const artistStr = typeof s.artist === 'object' && s.artist ? (s.artist as any)?.name || 'Artist' : s.artist || 'Artist';
            playTrack({
              id: s.canonicalId || `spotify:track:${s.id}`,
              canonicalId: s.canonicalId || `spotify:track:${s.id}`,
              source: s.source || 'spotify',
              sourceId: s.sourceId || s.id,
              title: s.title,
              artists: s.artists || [artistStr],
              artist: artistStr,
              album: s.album || 'Single',
              artworkUrl: s.artworkUrl || s.coverUrl,
              coverUrl: s.artworkUrl || s.coverUrl,
              duration: s.duration || 210,
              durationMs: s.durationMs || 210000,
              playable: true,
            });
            onClose();
          },
        })),
      });
    }

    // 3. Artists
    if (liveResults.artists.length > 0) {
      sections.push({
        category: 'ARTISTS',
        items: liveResults.artists.slice(0, 3).map((a) => ({
          id: `artist-${a.id}`,
          type: 'artist',
          title: a.name,
          subtitle: 'Artist',
          coverUrl: a.imageUrl || a.avatar || 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&q=80',
          run: () => {
            router.push(`/search?q=${encodeURIComponent(a.name)}`);
            onClose();
          },
        })),
      });
    }

    // 4. Albums / Playlists
    if (liveResults.albums.length > 0 || liveResults.playlists.length > 0) {
      const combined = [
        ...liveResults.albums.map((al) => ({
          id: `album-${al.id}`,
          type: 'album' as const,
          title: al.name || al.title,
          subtitle: `Album · ${typeof al.artist === 'object' && al.artist ? al.artist.name : (al.artist || 'NeoTunes')}`,
          coverUrl: al.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
          run: () => {
            router.push(`/search?q=${encodeURIComponent(al.name || al.title)}`);
            onClose();
          },
        })),
        ...liveResults.playlists.map((pl) => ({
          id: `playlist-${pl.id}`,
          type: 'playlist' as const,
          title: pl.name || pl.title,
          subtitle: `Playlist · ${pl.trackCount || 24} songs`,
          coverUrl: pl.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
          run: () => {
            router.push(`/search?q=${encodeURIComponent(pl.name || pl.title)}`);
            onClose();
          },
        })),
      ];

      sections.push({
        category: 'ALBUMS & PLAYLISTS',
        items: combined.slice(0, 3),
      });
    }

    // 5. Actions / Navigation Matching Query
    const matchedActions: CommandItem[] = [];
    const qLower = query.toLowerCase();

    if ('pause'.includes(qLower) || 'stop'.includes(qLower)) {
      matchedActions.push({ id: 'act-pause', type: 'action', title: 'Pause Playback', icon: Pause, run: () => { setPlaying(false); onClose(); } });
    }
    if ('play'.includes(qLower) || 'resume'.includes(qLower)) {
      matchedActions.push({ id: 'act-play', type: 'action', title: 'Play / Resume', icon: Play, run: () => { setPlaying(true); onClose(); } });
    }
    if ('next'.includes(qLower) || 'skip'.includes(qLower)) {
      matchedActions.push({ id: 'act-next', type: 'action', title: 'Next Track', icon: SkipForward, run: () => { nextTrack(); onClose(); } });
    }
    if ('previous'.includes(qLower) || 'prev'.includes(qLower)) {
      matchedActions.push({ id: 'act-prev', type: 'action', title: 'Previous Track', icon: SkipBack, run: () => { prevTrack(); onClose(); } });
    }
    if ('settings'.includes(qLower)) {
      matchedActions.push({ id: 'act-settings', type: 'navigation', title: 'Open Settings', icon: Settings, run: () => { router.push('/settings'); onClose(); } });
    }
    if ('library'.includes(qLower)) {
      matchedActions.push({ id: 'act-library', type: 'navigation', title: 'Open Library', icon: Library, run: () => { router.push('/library'); onClose(); } });
    }
    if ('jam'.includes(qLower)) {
      matchedActions.push({ id: 'act-jam', type: 'action', title: 'Start a Jam Room', icon: Radio, run: () => { router.push('/jam/ROOM123'); onClose(); } });
    }

    if (matchedActions.length > 0) {
      sections.push({
        category: 'ACTIONS & COMMANDS',
        items: matchedActions,
      });
    }

    return sections;
  };

  const sections = buildItems();
  const allFlatItems = sections.flatMap((s) => s.items);

  // Keyboard navigation & selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (!isOpen || allFlatItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allFlatItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allFlatItems.length) % allFlatItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allFlatItems[selectedIndex]) {
          // Save search query to recent searches if typed
          if (query.trim() && !recentSearches.includes(query.trim())) {
            setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)]);
          }
          allFlatItems[selectedIndex].run();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allFlatItems, selectedIndex, query, onClose, recentSearches]);

  let currentItemCounter = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="command-palette-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl sm:max-w-3xl md:w-[720px] max-h-[75vh] bg-[#121318] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto select-none font-sans"
        >
          {/* ── 1. HEADER INPUT BAR ── */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#17181D]">
            <Search className="h-5 w-5 text-[#AFC7FF] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search music, artists, playlists, or ask Neo..."
              className="flex-1 bg-transparent text-white text-sm md:text-base focus:outline-none placeholder-[#A8A7AF]"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-[#A8A7AF] hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded border border-white/10 text-white/70">
              ESC
            </kbd>
          </div>

          {/* ── 2. LIVE RESULTS & DYNAMIC CATEGORIES ── */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-none min-h-0"
          >
            {sections.map((sec) => (
              <div key={sec.category} className="space-y-1">
                <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-[#A8A7AF] uppercase tracking-wider">
                  <span>{sec.category}</span>
                  {sec.category === 'RECENT SEARCHES' && recentSearches.length > 0 && (
                    <button
                      onClick={() => setRecentSearches([])}
                      className="text-[10px] text-[#AFC7FF] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const itemIndex = currentItemCounter++;
                    const isSelected = selectedIndex === itemIndex;
                    const IconComp = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (query.trim() && !recentSearches.includes(query.trim())) {
                            setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)]);
                          }
                          item.run();
                        }}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white shadow-sm'
                            : 'bg-[#17181D]/60 hover:bg-[#17181D] border-transparent text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Image or Icon */}
                          {item.coverUrl ? (
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className={`h-10 w-10 object-cover flex-shrink-0 border border-white/10 ${
                                item.type === 'artist' ? 'rounded-full' : 'rounded-xl'
                              }`}
                            />
                          ) : IconComp ? (
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-[#AFC7FF] text-black' : 'bg-white/5 text-[#AFC7FF]'
                            }`}>
                              <IconComp className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-[#AFC7FF]">
                              <Music className="h-5 w-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-bold truncate ${isSelected ? 'text-[#AFC7FF]' : 'text-white'}`}>
                              {item.title}
                            </div>
                            {item.subtitle && (
                              <div className="text-[11px] text-[#A8A7AF] truncate">{item.subtitle}</div>
                            )}
                          </div>
                        </div>

                        {/* Action Hint Indicator */}
                        {item.type === 'song' ? (
                          <button className="h-8 w-8 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shrink-0 ml-2 shadow-md">
                            <Play className="h-4 w-4 fill-black ml-0.5" />
                          </button>
                        ) : (
                          <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-[#AFC7FF] translate-x-1' : 'text-white/30'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {isSearching && (
              <div className="p-4 text-center text-xs text-[#AFC7FF] font-bold animate-pulse">
                Searching music, artists &amp; catalog...
              </div>
            )}
          </div>

          {/* ── 3. SHORTCUT FOOTER BAR (Spec 9) ── */}
          <div className="px-5 py-3 bg-[#17181D] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#A8A7AF]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">↵</kbd>
                <span>Open</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Esc</kbd>
                <span>Close</span>
              </span>
            </div>

            <span className="hidden sm:inline-block font-sans text-xs text-[#AFC7FF] font-bold">
              NeoTunes Universal Command Center
            </span>
          </div>

        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
