'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Menu, Search, Sparkles, Settings, Command } from 'lucide-react';
import NeoTuneLogo from './NeoTuneLogo';

export interface NeoHeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenAskNeo: () => void;
  onOpenCmdK: () => void;
}

export function NeoHeader({
  onOpenMobileMenu,
  onOpenAskNeo,
  onOpenCmdK,
}: NeoHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isPlayerView = pathname === '/player';
  if (isPlayerView) return null;

  const showBackButton = pathname !== '/' && !['/search', '/browse', '/library', '/profile'].includes(pathname);

  const getPageTitle = () => {
    if (pathname === '/') return 'NeoTunes';
    if (pathname.startsWith('/search')) return 'Search';
    if (pathname.startsWith('/browse')) return 'Browse';
    if (pathname.startsWith('/library')) return 'Your Library';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/history')) return 'Listening History';
    if (pathname.startsWith('/downloads')) return 'Downloads';
    if (pathname.startsWith('/liked')) return 'Liked Songs';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/playlist') || pathname.startsWith('/playlists')) return 'Playlist';
    if (pathname.startsWith('/album') || pathname.startsWith('/albums')) return 'Album';
    if (pathname.startsWith('/artist') || pathname.startsWith('/artists')) return 'Artist';
    if (pathname.startsWith('/lyrics')) return 'Lyrics';
    if (pathname.startsWith('/queue')) return 'Queue';
    return 'NeoTunes';
  };

  return (
    <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between bg-[#050608]/85 backdrop-blur-2xl border-b border-white/[0.06] z-30 shrink-0 sticky top-0">
      <div className="flex items-center gap-3 min-w-0">
        {showBackButton ? (
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white md:hidden transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <span className="text-base font-bold text-white md:hidden truncate">
          {getPageTitle()}
        </span>

        {/* Desktop Quick Universal Search Trigger */}
        {pathname !== '/search' && (
          <button
            onClick={onOpenCmdK}
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-[#11141A] border border-white/10 hover:border-[#DFFF00]/40 text-[#9AA1AD] hover:text-white text-xs font-medium transition-all w-64 lg:w-80 cursor-pointer shadow-sm"
          >
            <Search className="h-3.5 w-3.5 text-[#DFFF00] shrink-0" />
            <span className="flex-1 text-left truncate">Search songs, artists, albums...</span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-sans font-semibold bg-white/10 rounded text-white/70">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          onClick={onOpenAskNeo}
          className="flex items-center gap-1.5 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-[#DFFF00] text-black text-xs font-bold hover:scale-105 transition-all cursor-pointer shadow-md"
        >
          <Sparkles className="h-3.5 w-3.5 fill-black" />
          <span className="hidden sm:inline">Ask Neo</span>
          <span className="sm:hidden">Neo</span>
        </button>

        <button
          onClick={() => router.push('/settings')}
          className="p-2 md:p-2.5 rounded-full bg-[#11141A] border border-white/10 text-[#9AA1AD] hover:text-white hover:border-white/20 transition-all cursor-pointer"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export default NeoHeader;
