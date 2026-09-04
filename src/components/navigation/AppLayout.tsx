'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NeoHeader from './NeoHeader';
import NeoSidebar from './NeoSidebar';
import NeoBottomNav from './NeoBottomNav';
import MiniPlayer from '@/components/player/MiniPlayer';
import SpotlightSearchModal from '@/components/navigation/SpotlightSearchModal';
import AskNeoModal from '@/components/ai/AskNeoModal';
import CommandPaletteModal from '@/components/navigation/CommandPaletteModal';
import ToastProvider from '@/components/ui/NeoToast';
import { useLayoutStore } from '@/store/layout-store';
import { usePlaybackStore } from '@/store/playback-store';
import { createClientBrowser } from '@/lib/supabase-browser';
import dynamic from 'next/dynamic';
import { setupPlayer } from '@/audio/setupPlayer';
import { registerAudioEvents } from '@/audio/audioEvents';
import { X, Home, Search, Compass, Library, User, Heart, Download, History, Settings, Sparkles, LogOut } from 'lucide-react';
import NeoTuneLogo from './NeoTuneLogo';
import Link from 'next/link';

const YouTubePlayer = dynamic(() => import('@/components/player/YouTubePlayer'), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAskNeoOpen, setIsAskNeoOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Initialize single global audio listeners once
  useEffect(() => {
    setupPlayer();
    const cleanupEvents = registerAudioEvents();
    return () => cleanupEvents();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdKOpen(true);
      }
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isCmdKOpen) setIsCmdKOpen(false);
        if (isAskNeoOpen) setIsAskNeoOpen(false);
      }

      // Safe media playback shortcuts
      if (!isInput && !e.metaKey && !e.ctrlKey) {
        const store = usePlaybackStore.getState();
        if (e.code === 'Space') {
          e.preventDefault();
          store.setPlaying(!store.isPlaying);
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          store.setProgress(Math.min(store.duration, store.progress + 10));
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          store.setProgress(Math.max(0, store.progress - 10));
        } else if (e.key === 'n' || e.key === 'N') {
          store.nextTrack();
        } else if (e.key === 'p' || e.key === 'P') {
          store.prevTrack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isCmdKOpen, isAskNeoOpen]);

  // Auth state listener
  useEffect(() => {
    const supabase = createClientBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        const localUser = localStorage.getItem('neotunes_user');
        if (localUser) {
          try { setUser(JSON.parse(localUser)); } catch {}
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        const localUser = localStorage.getItem('neotunes_user');
        if (localUser) {
          try { setUser(JSON.parse(localUser)); } catch {}
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      const { setPlaying } = usePlaybackStore.getState();
      setPlaying(false);
      const supabase = createClientBrowser();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout error:', e);
    }
    localStorage.removeItem('neotunes_user');
    setUser(null);
    router.push('/welcome');
  };

  const isOnboardingRoute = ['/welcome', '/auth', '/onboarding'].some((r) => pathname === r || pathname.startsWith(r));

  if (isOnboardingRoute) {
    return (
      <ToastProvider>
        <div className="min-h-screen w-full bg-[#050608] text-[#F5F7FA]">
          {children}
        </div>
      </ToastProvider>
    );
  }

  const isPlayerView = pathname === '/player';

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-[#050608] text-[#F5F7FA] overflow-hidden font-sans select-none relative">
        {/* Desktop Sidebar */}
        <NeoSidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          onOpenAskNeo={() => setIsAskNeoOpen(true)}
          user={user}
          onSignOut={handleSignOut}
        />

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-[82vw] max-w-xs bg-[#0B0D12] border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl overflow-y-auto scrollbar-none z-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <NeoTuneLogo size="md" showText onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }} />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 text-[#9AA1AD] hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Main Links */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider px-3">MAIN</span>
                  <nav className="space-y-1 pt-1">
                    {[
                      { label: 'Home', href: '/', icon: Home },
                      { label: 'Search', href: '/search', icon: Search },
                      { label: 'Browse', href: '/browse', icon: Compass },
                      { label: 'Library', href: '/library', icon: Library },
                      { label: 'Profile', href: '/profile', icon: User },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-[#DFFF00] text-black shadow-sm font-extrabold'
                              : 'text-[#9AA1AD] hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-[#9AA1AD]'}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Library Shortcuts */}
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider px-3">YOUR SOUND</span>
                  <nav className="space-y-1 pt-1">
                    <Link
                      href="/liked"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#9AA1AD] hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Liked Songs</span>
                    </Link>
                    <Link
                      href="/downloads"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#9AA1AD] hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>Downloads</span>
                    </Link>
                    <Link
                      href="/history"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#9AA1AD] hover:text-white hover:bg-white/5 transition-all"
                    >
                      <History className="h-4 w-4" />
                      <span>Listening History</span>
                    </Link>
                  </nav>
                </div>

                {/* Tools */}
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider px-3">TOOLS</span>
                  <nav className="space-y-1 pt-1">
                    <button
                      onClick={() => { setIsAskNeoOpen(true); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-[#DFFF00] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
                    >
                      <Sparkles className="h-4 w-4 text-[#DFFF00]" /> Ask Neo AI
                    </button>
                    <Link
                      href="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#9AA1AD] hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </nav>
                </div>
              </div>

              {/* Drawer Sign Out */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500 hover:text-black transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          {!isPlayerView && (
            <NeoHeader
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              onOpenAskNeo={() => setIsAskNeoOpen(true)}
              onOpenCmdK={() => setIsCmdKOpen(true)}
            />
          )}

          <main className={`flex-1 relative ${isPlayerView ? 'h-full min-h-0 overflow-hidden pb-0' : 'overflow-y-auto scrollbar-none pb-44 md:pb-28'}`}>
            {children}
          </main>

          {/* Persistent Mini Player */}
          {!isPlayerView && <MiniPlayer />}

          {/* Mobile Bottom Navigation */}
          {!isPlayerView && <NeoBottomNav />}

          {/* Modals */}
          <SpotlightSearchModal isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />
          <AskNeoModal isOpen={isAskNeoOpen} onClose={() => setIsAskNeoOpen(false)} />
          <CommandPaletteModal isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />

          {/* Backing audio stream */}
          <YouTubePlayer />
        </div>

        {/* Global Isolated Overlay Root for Drawers, Sheets, and Modals */}
        <div id="neotunes-overlay-root" className="relative z-[9999]" />
      </div>
    </ToastProvider>
  );
}
