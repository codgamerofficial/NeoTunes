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
  Crown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
} from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';
import MiniPlayer from '@/components/player/MiniPlayer';
import SpotlightSearchModal from '@/components/navigation/SpotlightSearchModal';
import AskNeoModal from '@/components/ai/AskNeoModal';
import CommandPaletteModal from '@/components/navigation/CommandPaletteModal';
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
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAskNeoOpen, setIsAskNeoOpen] = useState(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Keyboard shortcut listener for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdKOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Streamlined 4 Primary Navigation Items
  const primaryNavItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
  ];

  // Mobile Bottom Navigation Bar (5 Items)
  const mobileTabItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === '/auth') {
    return <div className="h-screen w-full bg-[#000000]">{children}</div>;
  }

  const isPlayerView = pathname === '/player';
  const userName = user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Saswata Dey');
  const userAvatar = user?.user_metadata?.avatar_url || user?.avatar_url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80";

  return (
    <div className="flex h-screen w-full bg-[#000000] text-[#F4F1F7] overflow-hidden font-sans select-none">
      
      {/* ── 1. STREAMLINED DESKTOP SIDEBAR ── */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col justify-between bg-[#0E1017] border-r border-white/10 transition-all duration-300 ease-in-out z-30`}
      >
        <div className="flex flex-col">
          {/* Logo Header (Height: 76px, Horizontal Padding: 24px) */}
          <div
            className={`h-[76px] ${
              isSidebarOpen ? 'px-6 justify-between' : 'px-3 justify-center'
            } flex items-center border-b border-white/5 transition-all duration-300`}
          >
            <NeoTuneLogo
              size="md"
              variant={isSidebarOpen ? 'full' : 'mark'}
              animated={true}
              onClick={() => router.push('/')}
            />
            {isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>
          {!isSidebarOpen && (
            <div className="flex justify-center py-2">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Primary Nav Items */}
          <nav className="space-y-1.5 p-4">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-[#AFC7FF]/15 border border-[#AFC7FF] text-[#AFC7FF]'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <div className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-[#AFC7FF] text-black shadow-[0_0_12px_rgba(175,199,255,0.5)]' : 'bg-white/5 group-hover:bg-white/10 text-white/80'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card */}
        {isSidebarOpen && (
          <div
            onClick={() => router.push('/profile')}
            className="p-3 rounded-2xl bg-[#17181D] border border-white/10 hover:border-[#AFC7FF]/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-9 w-9 rounded-full object-cover border border-[#AFC7FF]/40 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-[#AFC7FF] transition-colors truncate">{userName}</div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-[#FF2D95]">
                    <Crown className="h-3 w-3" /> Listener
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignOut();
                }}
                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── 2. MOBILE SLIDE-OUT MENU OVERLAY ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#121318] border-r border-white/10 p-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <NeoTuneLogo size="md" showText onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }} />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-all">
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-[#AFC7FF]/15 border border-[#AFC7FF] text-[#AFC7FF]'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-[#AFC7FF] text-black' : 'bg-white/5 text-white/80'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={() => { setIsAskNeoOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#AFC7FF]/15 border border-[#AFC7FF]/40 text-sm font-bold text-[#AFC7FF]"
              >
                <Sparkles className="h-4 w-4" /> Ask Neo AI
              </button>
            </div>

            <div
              onClick={() => { router.push('/profile'); setIsMobileMenuOpen(false); }}
              className="p-3 rounded-2xl bg-[#17181D] border border-white/10 flex items-center gap-3 cursor-pointer"
            >
              <img src={userAvatar} alt={userName} className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{userName}</div>
                <div className="text-[10px] text-[#A8A7AF]">View Profile</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        {!isPlayerView && (
          <header className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between bg-[#000000]/80 backdrop-blur-xl border-b border-white/10 z-20 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-full bg-[#17181D] border border-white/10 text-white/70 hover:text-white md:hidden transition-all"
              >
                <Menu className="h-4 w-4" />
              </button>

              {pathname !== '/search' && (
                <button
                  onClick={() => setIsCmdKOpen(true)}
                  className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#17181D] border border-white/10 hover:border-[#AFC7FF]/40 text-white/60 hover:text-white text-xs font-medium transition-all w-48 sm:w-64 md:w-80 cursor-pointer"
                >
                  <Search className="h-4 w-4 text-[#AFC7FF]" />
                  <span className="flex-1 text-left truncate">Search songs, artists, vibes...</span>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded border border-white/10 text-white/70">
                    <Command className="h-3 w-3" /> K
                  </kbd>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setIsAskNeoOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#AFC7FF] text-black text-xs font-bold shadow-[0_0_15px_rgba(175,199,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> Ask Neo
              </button>

              <button
                onClick={() => router.push('/settings')}
                className="p-2.5 rounded-full bg-[#17181D] border border-white/10 text-white/70 hover:text-white hover:border-[#AFC7FF]/40 transition-all cursor-pointer"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </header>
        )}

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto relative scrollbar-none pb-24 md:pb-28">
          {children}
        </main>

        {/* Mini Player */}
        {!isPlayerView && <MiniPlayer />}
      </div>

      {/* ── 4. MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121318]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around z-30 px-2">
        {mobileTabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-[#AFC7FF]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Modals */}
      <SpotlightSearchModal isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />
      <AskNeoModal isOpen={isAskNeoOpen} onClose={() => setIsAskNeoOpen(false)} />
      <CommandPaletteModal isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />

    </div>
  );
}
