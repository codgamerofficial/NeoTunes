'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
} from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';
import MiniPlayer from '@/components/player/MiniPlayer';
import { createClientBrowser } from '@/lib/supabase-browser';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientBrowser();

  const [userProfile, setUserProfile] = useState<{ displayName: string; avatarUrl: string } | null>(null);

  useEffect(() => {
    // Check saved local profile first
    const savedName = localStorage.getItem('neotunes_user_name');
    const savedAvatar = localStorage.getItem('neotunes_user_avatar');

    if (savedName || savedAvatar) {
      setUserProfile({
        displayName: savedName || 'Saswata Dey',
        avatarUrl: savedAvatar || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
      });
    }

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserProfile({
            displayName: data.display_name || user.email?.split('@')[0] || 'Saswata Dey',
            avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
          });
        }
      }
    };
    fetchProfile();
  }, []);

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

  const mobileNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  if (pathname === '/auth') {
    return <div className="h-screen w-full bg-[#0B0E14]">{children}</div>;
  }

  const isPlayerView = pathname === '/player';

  return (
    <div className="flex h-screen w-full bg-[#0B0E14] text-white overflow-hidden font-sans select-none">
      
      {/* ── 1. DESKTOP SIDEBAR (240px Fixed, Hidden on Mobile) ── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-[#000000] border-r border-[#181818] p-4 flex-col justify-between overflow-y-auto scrollbar-none z-30">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="px-2 cursor-pointer pt-1" onClick={() => router.push('/')}>
            <NeoTuneLogo size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#181818] text-[#18D8FF] font-bold shadow-sm'
                      : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#18D8FF]' : 'text-[#B3B3B3]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile at Bottom (Clickable to /profile) */}
        <div
          onClick={() => router.push('/profile')}
          className="pt-4 border-t border-[#181818] flex items-center justify-between cursor-pointer group hover:bg-[#181818]/50 p-2 rounded-xl transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0 border border-[#18D8FF]">
              <Image
                src={userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80'}
                alt={userProfile?.displayName || 'User'}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white group-hover:text-[#18D8FF] truncate transition-colors">
                {userProfile?.displayName || 'Saswata Dey'}
              </p>
              <span className="text-[9px] font-bold text-[#FF4FD8]">Pro Member</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#B3B3B3] group-hover:text-white" />
        </div>
      </aside>

      {/* ── 2. CENTER CONTENT & TOP BAR (WITH SAFE AREA TOP PADDING FOR SMARTPHONES) ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0B0E14]">
        
        {/* Top Header Bar with Notch/Status Bar Protection */}
        {!isPlayerView && (
          <header className="h-auto min-h-[56px] pt-[max(12px,env(safe-area-inset-top,12px))] pb-2 md:py-3 bg-[#0B0E14] border-b border-[#181818] px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-20">
            
            {/* Desktop Back/Forward or Mobile Logo */}
            <div className="flex items-center gap-3">
              <div className="md:hidden cursor-pointer" onClick={() => router.push('/')}>
                <NeoTuneLogo size="sm" />
              </div>

              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => router.back()} className="p-1.5 rounded-full bg-[#181818] hover:bg-[#282828] text-[#B3B3B3] hover:text-white transition-all">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => router.forward()} className="p-1.5 rounded-full bg-[#181818] hover:bg-[#282828] text-[#B3B3B3] hover:text-white transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Desktop Search Trigger */}
              <div
                onClick={() => router.push('/search')}
                className="hidden md:flex items-center gap-2 bg-[#181818] hover:bg-[#282828] rounded-full px-4 py-1.5 w-72 sm:w-96 cursor-pointer transition-all border border-transparent hover:border-[#282828]"
              >
                <Search className="h-4 w-4 text-[#B3B3B3]" />
                <span className="text-xs text-[#B3B3B3] flex-1 truncate">What do you want to play?</span>
                <span className="text-[10px] font-mono text-[#B3B3B3] bg-[#282828] px-1.5 py-0.5 rounded">⌘K</span>
              </div>
            </div>

            {/* Mobile Actions / Top Right Clickable Profile Pill */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/search')}
                className="md:hidden p-2 rounded-full bg-[#181818] text-[#B3B3B3] hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>

              <button className="p-2 rounded-full hover:bg-[#282828] text-[#B3B3B3] hover:text-white transition-all">
                <Bell className="h-4.5 w-4.5" />
              </button>

              {/* CLICKABLE USER PROFILE PILL */}
              <div
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-[#181818] hover:bg-[#282828] hover:border-[#18D8FF]/40 border border-transparent cursor-pointer transition-all active:scale-95"
              >
                <div className="relative h-7 w-7 rounded-full overflow-hidden border border-[#18D8FF]">
                  <Image
                    src={userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80'}
                    alt={userProfile?.displayName || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="hidden sm:inline text-xs font-bold text-white hover:text-[#18D8FF] transition-colors">
                  {userProfile?.displayName || 'Saswata Dey'}
                </span>
              </div>
            </div>
          </header>
        )}

        {/* Page Children Content */}
        <main className={`flex-1 overflow-y-auto scrollbar-none ${!isPlayerView ? 'pb-44 md:pb-24' : ''}`}>
          {children}
        </main>

        {/* Global Persistent Bottom Player */}
        {!isPlayerView && <MiniPlayer />}

        {/* ── 3. MOBILE BOTTOM NAVIGATION BAR (WITH SAFE AREA BOTTOM PADDING FOR SMARTPHONES) ── */}
        {!isPlayerView && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000]/95 backdrop-blur-2xl border-t border-[#181818] pt-2 pb-[calc(8px+env(safe-area-inset-bottom,12px))] px-4 flex items-center justify-around">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-1 transition-all ${
                    isActive ? 'text-[#18D8FF] font-bold' : 'text-[#B3B3B3]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
