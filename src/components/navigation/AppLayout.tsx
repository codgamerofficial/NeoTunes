'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Compass,
  Library,
  User,
  Settings,
  Sparkles,
  Command,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ArrowLeft,
  Download,
  History,
  Heart,
  ListMusic
} from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';
import MiniPlayer from '@/components/player/MiniPlayer';
import SpotlightSearchModal from '@/components/navigation/SpotlightSearchModal';
import AskNeoModal from '@/components/ai/AskNeoModal';
import CommandPaletteModal from '@/components/navigation/CommandPaletteModal';
import { useLayoutStore } from '@/store/layout-store';
import { usePlaybackStore } from '@/store/playback-store';
import { createClientBrowser } from '@/lib/supabase-browser';
import dynamic from 'next/dynamic';
import { Artwork } from '@/components/ui/Artwork';

const YouTubePlayer = dynamic(() => import('@/components/player/YouTubePlayer'), { ssr: false });

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();
  const { currentTrack } = usePlaybackStore();

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAskNeoOpen, setIsAskNeoOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Keyboard shortcut listener for Cmd/Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdKOpen(true);
      }
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isCmdKOpen) setIsCmdKOpen(false);
        if (isAskNeoOpen) setIsAskNeoOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isCmdKOpen, isAskNeoOpen]);

  // Subscribe to live auth state
  useEffect(() => {
    const supabase = createClientBrowser();

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        const localUser = localStorage.getItem('neotunes_user');
        if (localUser) {
          try { setUser(JSON.parse(localUser)); } catch {}
        } else {
          setUser(null);
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
      const supabase = createClientBrowser();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout error:', e);
    }
    localStorage.removeItem('neotunes_user');
    setUser(null);
    router.push('/auth');
  };

  const primaryNavItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
  ];

  const mobileTabItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const drawerMainItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isOnboardingRoute = ['/welcome', '/auth', '/auth/preferences', '/auth/forgot-password'].some((r) => pathname === r || pathname.startsWith(r));

  if (isOnboardingRoute) {
    return <div className="min-h-screen w-full bg-[#05070B]">{children}</div>;
  }

  const isPlayerView = pathname === '/player';
  const userName = user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Saswata Dey');
  const userAvatar = user?.user_metadata?.avatar_url || user?.avatar_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80";

  // Contextual Header Title for Mobile
  const getMobileHeaderTitle = () => {
    if (pathname === '/') return 'NeoTunes';
    if (pathname.startsWith('/search')) return 'Search';
    if (pathname.startsWith('/browse')) return 'Browse';
    if (pathname.startsWith('/library')) return 'Your Library';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/history')) return 'Listening History';
    if (pathname.startsWith('/downloads')) return 'Downloads';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'NeoTunes';
  };

  const showBackButton = pathname !== '/' && !['/search', '/browse', '/library', '/profile'].includes(pathname);

  return (
    <div className="flex h-screen w-full bg-[#050608] text-[#F5F5F7] overflow-hidden font-sans select-none relative">
      
      {/* ── 1. DESKTOP SIDEBAR ── */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col justify-between bg-[#08090C] border-r border-white/10 p-4 transition-all duration-300 ease-in-out z-30`}
      >
        <div className="space-y-6">
          <div className="px-2 pt-1 flex items-center justify-between">
            <NeoTuneLogo size="md" showText={isSidebarOpen} onClick={() => router.push('/')} />
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          </div>

          {/* Primary Navigation Items */}
          <nav className="space-y-1.5 pt-2">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all relative group ${
                    isActive
                      ? 'bg-[#DFFF00] text-black shadow-sm font-extrabold'
                      : 'text-[#A1A1A6] hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                  title={item.label}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-black' : 'text-[#A1A1A6] group-hover:text-white'} transition-colors`} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 my-3" />

          {/* Secondary Navigation Items */}
          {isSidebarOpen && (
            <div className="space-y-1">
              <button
                onClick={() => setIsAskNeoOpen(true)}
                className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-[#A1A1A6] hover:text-[#DFFF00] hover:bg-white/[0.04] transition-all text-left"
              >
                <Sparkles className="h-4 w-4 text-[#DFFF00]" />
                <span>Neo AI</span>
              </button>
              <Link
                href="/downloads"
                className={`flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  pathname === '/downloads' ? 'text-[#DFFF00] bg-white/[0.08]' : 'text-[#A1A1A6] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Download className="h-4 w-4" />
                <span>Downloads</span>
              </Link>
              <Link
                href="/history"
                className={`flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  pathname === '/history' ? 'text-[#DFFF00] bg-white/[0.08]' : 'text-[#A1A1A6] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Listening History</span>
              </Link>
              <Link
                href="/settings"
                className={`flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  pathname === '/settings' ? 'text-[#DFFF00] bg-white/[0.08]' : 'text-[#A1A1A6] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Card at Bottom */}
        {isSidebarOpen && (
          <div
            onClick={() => router.push('/profile')}
            className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Artwork
                  source={userAvatar}
                  size="small"
                  aspectRatio="circle"
                  alt={userName}
                  type="artist"
                  className="h-8 w-8 rounded-full object-cover border border-white/10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#DFFF00] transition-colors truncate">{userName}</div>
                  <div className="text-[10px] text-[#A1A1A6]">View Profile</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignOut();
                }}
                className="p-1.5 rounded-lg text-[#A1A1A6] hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── 2. MOBILE NAVIGATION DRAWER SHEET ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[84vw] max-w-xs bg-[#0A0D16] border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl overflow-y-auto scrollbar-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <NeoTuneLogo size="md" showText onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }} />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-all text-white/60 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MAIN */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-3">MAIN</span>
                <nav className="space-y-1 pt-1">
                  {drawerMainItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                          isActive
                            ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                            : 'text-[#A1A1A6] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-[#A1A1A6]'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* YOUR MUSIC */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-3">YOUR MUSIC</span>
                <nav className="space-y-1 pt-1">
                  <Link
                    href="/liked"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-[#A1A1A6] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Liked Songs</span>
                  </Link>
                  <Link
                    href="/library?tab=playlists"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-[#A1A1A6] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <ListMusic className="h-4 w-4" />
                    <span>Playlists</span>
                  </Link>
                  <Link
                    href="/downloads"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-[#A1A1A6] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Downloads</span>
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-[#A1A1A6] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <History className="h-4 w-4" />
                    <span>Listening History</span>
                  </Link>
                </nav>
              </div>

              {/* TOOLS */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-3">TOOLS</span>
                <nav className="space-y-1 pt-1">
                  <button
                    onClick={() => { setIsAskNeoOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-[#DFFF00] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
                  >
                    <Sparkles className="h-4 w-4 text-[#DFFF00]" /> Ask Neo AI
                  </button>
                  <Link
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold text-[#A1A1A6] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* USER FOOTER */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div
                onClick={() => { router.push('/profile'); setIsMobileMenuOpen(false); }}
                className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 cursor-pointer"
              >
                <img src={userAvatar} alt={userName} className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{userName}</div>
                  <div className="text-[10px] text-[#A1A1A6]">View Profile</div>
                </div>
              </div>

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

      {/* ── 3. MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Adaptive Header */}
        {!isPlayerView && (
          <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between bg-[#050608]/80 backdrop-blur-2xl border-b border-white/10 z-20 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {showBackButton ? (
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white md:hidden transition-all"
                  title="Open Navigation Menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              )}

              <span className="text-base font-extrabold text-white md:hidden truncate">
                {getMobileHeaderTitle()}
              </span>

              {/* Desktop Universal Search Trigger */}
              {pathname !== '/search' && (
                <button
                  onClick={() => setIsCmdKOpen(true)}
                  className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#DFFF00]/50 text-[#A1A1A6] hover:text-white text-xs font-medium transition-all w-64 md:w-80 cursor-pointer"
                >
                  <Search className="h-4 w-4 text-[#DFFF00]" />
                  <span className="flex-1 text-left truncate">Search songs, artists, albums, playlists...</span>
                  <kbd className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded border border-white/10 text-white/70">
                    <Command className="h-3 w-3" /> K
                  </kbd>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setIsAskNeoOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold hover:scale-105 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 fill-black" /> <span className="hidden sm:inline">Ask Neo</span><span className="sm:hidden">Neo</span>
              </button>

              <button
                onClick={() => router.push('/settings')}
                className="p-2 md:p-2.5 rounded-full bg-white/5 border border-white/10 text-[#A1A1A6] hover:text-white hover:border-[#DFFF00]/50 transition-all cursor-pointer"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </header>
        )}

        {/* Page Content Container */}
        <main className={`flex-1 overflow-y-auto relative scrollbar-none ${isPlayerView ? 'pb-0' : 'pb-44 md:pb-28'}`}>
          {children}
        </main>

        {/* PERSISTENT GLOBAL MINI PLAYER */}
        {!isPlayerView && <MiniPlayer />}

        {/* MOBILE FIXED BOTTOM NAVIGATION DOCK (Content → Mini Player → Bottom Nav) */}
        {!isPlayerView && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#08090C]/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-2 shadow-2xl">
            {mobileTabItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
                    isActive ? 'text-[#DFFF00] font-bold' : 'text-[#A1A1A6] hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#DFFF00]' : 'text-[#A1A1A6]'}`} />
                  <span className="text-[10px] font-mono tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Floating Modals */}
        <SpotlightSearchModal isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />
        <AskNeoModal isOpen={isAskNeoOpen} onClose={() => setIsAskNeoOpen(false)} />
        <CommandPaletteModal isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />

        {/* Audio Engine Backing Player */}
        <YouTubePlayer />
      </div>
    </div>
  );
}
