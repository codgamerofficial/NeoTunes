'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Compass,
  Library,
  ListMusic,
  Heart,
  Disc,
  Users,
  FolderDown,
  Settings,
  Bell,
  User,
  Sparkles,
  Mic,
  Command,
  PanelRight,
  HardDrive,
  ChevronRight,
  Crown,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';
import MiniPlayer from '@/components/player/MiniPlayer';
import RightContextPanel from '@/components/navigation/RightContextPanel';
import SpotlightSearchModal from '@/components/navigation/SpotlightSearchModal';
import AskNeoModal from '@/components/ai/AskNeoModal';
import { useLayoutStore } from '@/store/layout-store';
import { createClientBrowser } from '@/lib/supabase-browser';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar, toggleRightPanel } = useLayoutStore();

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAskNeoOpen, setIsAskNeoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Playlists', href: '/playlists', icon: ListMusic },
    { label: 'Liked Songs', href: '/liked', icon: Heart },
    { label: 'Albums', href: '/albums', icon: Disc },
    { label: 'Artists', href: '/artists', icon: Users },
    { label: 'Downloads', href: '/downloads', icon: FolderDown },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // Mobile bottom tab items (only the most important ones)
  const mobileTabItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === '/auth') {
    return <div className="h-screen w-full bg-[#050505]">{children}</div>;
  }

  const isPlayerView = pathname === '/player';
  const userName = user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Saswata Dey');
  const userAvatar = user?.user_metadata?.avatar_url || user?.avatar_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80";

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans select-none">
      
      {/* ── 1. DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col justify-between bg-[#0A0A0A] border-r border-white/10 p-4 transition-all duration-300 ease-in-out z-30`}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <NeoTuneLogo size="md" showText={isSidebarOpen} onClick={() => router.push('/')} />
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7A3CFF]/20 border border-[#00D4FF]/40 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.25)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <div className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-[#00D4FF] text-black shadow-[0_0_10px_#00D4FF]' : 'bg-white/5 group-hover:bg-white/10 text-white/80'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card */}
        {isSidebarOpen && (
          <div
            onClick={() => router.push('/profile')}
            className="p-3 rounded-2xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-9 w-9 rounded-full object-cover border border-[#00D4FF]/40 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-[#00D4FF] transition-colors truncate">{userName}</div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-[#FF2D95]">
                    <Crown className="h-3 w-3" /> Pro Member
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/40 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </div>

            {/* Storage Indicator */}
            <div className="space-y-1 pt-1 border-t border-white/10">
              <div className="flex justify-between text-[9px] font-mono text-white/40">
                <span>Storage</span>
                <span>4.2 GB / 10 GB</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[42%] bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] rounded-full" />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MOBILE SLIDE-OUT MENU OVERLAY ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0A0A0A] border-r border-white/10 p-5 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <NeoTuneLogo size="md" showText onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }} />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-all">
                <X className="h-5 w-5 text-white/60" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7A3CFF]/20 border border-[#00D4FF]/40 text-[#00D4FF]'
                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all ${
                      isActive ? 'bg-[#00D4FF] text-black' : 'bg-white/5 text-white/80'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Ask Neo Button */}
            <button
              onClick={() => { setIsAskNeoOpen(true); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#00D4FF]/20 to-[#7A3CFF]/20 border border-[#7A3CFF]/40 text-sm font-bold text-[#00D4FF]"
            >
              <Sparkles className="h-4 w-4" /> Ask Neo AI
            </button>
          </div>
        </div>
      )}

      {/* ── 2. MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        {!isPlayerView && (
          <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 z-20 shrink-0">
            {/* Left: Mobile hamburger + Spotlight */}
            <div className="flex items-center gap-2">
              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-full bg-[#101015] border border-white/10 text-white/70 hover:text-white md:hidden transition-all"
              >
                <Menu className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsSpotlightOpen(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#00D4FF]/40 text-white/60 hover:text-white text-xs font-medium transition-all w-48 sm:w-64 md:w-80"
              >
                <Search className="h-4 w-4 text-[#00D4FF]" />
                <span className="flex-1 text-left truncate">Search songs, artists, vibes...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded border border-white/10 text-white/70">
                  <Command className="h-3 w-3" /> K
                </kbd>
              </button>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setIsAskNeoOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black text-xs font-bold shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:scale-105 transition-transform"
              >
                <Sparkles className="h-4 w-4" /> Ask Neo
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#00D4FF]/40 text-xs font-bold transition-all group"
                  >
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="h-6 w-6 rounded-full object-cover border border-[#00D4FF]"
                    />
                    <span className="hidden sm:inline text-white group-hover:text-[#00D4FF] truncate max-w-[110px] transition-colors">
                      {userName}
                    </span>
                  </Link>

                  <button
                    onClick={async () => {
                      const supabase = createClientBrowser();
                      await supabase.auth.signOut();
                      localStorage.removeItem('neotunes_user');
                      setUser(null);
                      router.push('/auth');
                    }}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-[#FF2D95] hover:border-[#FF2D95]/40 transition-all flex items-center justify-center"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/auth')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black text-xs font-bold shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:scale-105 transition-transform"
                  title="Sign In / Create Account"
                >
                  <User className="h-3.5 w-3.5" /> <span className="inline">Sign In</span>
                </button>
              )}

              <button
                onClick={() => router.push('/settings')}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hidden sm:flex"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>

              <button
                onClick={toggleRightPanel}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hidden md:flex"
                title="Toggle Right Panel"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-32 scrollbar-none">
          {children}
        </main>

        {/* Floating Glass Mini Player */}
        {!isPlayerView && <MiniPlayer />}
      </div>

      {/* ── 3. RIGHT CONTEXT PANEL (desktop only) ── */}
      {!isPlayerView && <RightContextPanel />}

      {/* ── 4. MOBILE BOTTOM TAB BAR ── */}
      {!isPlayerView && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-16">
            {mobileTabItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
                    isActive ? 'text-[#00D4FF]' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'drop-shadow-[0_0_6px_#00D4FF]' : ''}`} />
                  <span className={`text-[10px] font-bold ${isActive ? 'text-[#00D4FF]' : 'text-white/40'}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Modals */}
      <SpotlightSearchModal isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />
      <AskNeoModal isOpen={isAskNeoOpen} onClose={() => setIsAskNeoOpen(false)} />
    </div>
  );
}

