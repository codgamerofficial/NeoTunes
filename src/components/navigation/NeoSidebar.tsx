'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  Compass,
  Library,
  Heart,
  Download,
  History,
  Sparkles,
} from 'lucide-react';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarNavItem from './sidebar/SidebarNavItem';
import SidebarProfile from './sidebar/SidebarProfile';
import { usePlaybackStore } from '@/store/playback-store';

export interface NeoSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenAskNeo: () => void;
  user: any;
  onSignOut: () => void;
}

export function NeoSidebar({
  isOpen,
  onToggle,
  onOpenAskNeo,
  user,
  onSignOut,
}: NeoSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTrack, isPlaying } = usePlaybackStore();

  const isRouteActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const primaryNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
  ];

  const yourSoundItems = [
    { label: 'Liked Songs', href: '/liked', icon: Heart },
    { label: 'Downloads', href: '/downloads', icon: Download },
    { label: 'History', href: '/history', icon: History },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-full bg-[#090A0F] border-r border-white/[0.06] select-none shrink-0 relative z-30 transition-[width] duration-[240ms] ease-out ${
        isOpen ? 'w-[260px]' : 'w-[76px]'
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Subtle ambient music energy along the right edge when playing */}
      {currentTrack && (
        <div
          aria-hidden="true"
          className={`absolute right-0 top-0 bottom-0 w-[1px] pointer-events-none transition-opacity duration-700 z-10 ${
            isPlaying ? 'opacity-100' : 'opacity-30'
          }`}
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(223, 255, 0, 0.4) 25%, rgba(0, 229, 255, 0.3) 75%, transparent 100%)',
            boxShadow: isPlaying ? '0 0 12px rgba(223, 255, 0, 0.2)' : 'none',
          }}
        />
      )}

      {/* 1. Header: Branding & Toggle */}
      <SidebarHeader
        isOpen={isOpen}
        onToggle={onToggle}
        onLogoClick={() => router.push('/')}
      />

      {/* 2. Middle Navigation (Independent Scroll) */}
      <div
        className={`flex-1 py-3 px-3 flex flex-col gap-4 ${
          isOpen ? 'overflow-y-auto scrollbar-none' : 'overflow-visible'
        }`}
      >
        {/* Primary Navigation Section */}
        <nav className="flex flex-col gap-1" aria-label="Primary Navigation">
          {primaryNavItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isOpen={isOpen}
              isActive={isRouteActive(item.href)}
            />
          ))}
        </nav>

        {/* Section Divider & "YOUR SOUND" Header */}
        <div className="pt-2">
          {isOpen ? (
            <div className="px-3 pb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.18em]">
                Your Sound
              </span>
            </div>
          ) : (
            <div className="mx-auto w-6 h-[1px] bg-white/[0.08] mb-2" />
          )}

          {/* Sound & Utility Navigation */}
          <div className="flex flex-col gap-1" aria-label="Your Sound Navigation">
            {/* Signature "Ask Neo AI" Button */}
            <SidebarNavItem
              onClick={onOpenAskNeo}
              icon={Sparkles}
              label="Ask Neo AI"
              isOpen={isOpen}
              isSpecial={true}
              badge="AI"
            />

            {yourSoundItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isOpen={isOpen}
                isActive={isRouteActive(item.href)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Profile Card */}
      <div className="px-3 pb-3 pt-1 border-t border-white/[0.06] shrink-0">
        <SidebarProfile
          isOpen={isOpen}
          user={user}
          onProfileClick={() => router.push('/profile')}
          onSignOut={onSignOut}
        />
      </div>
    </aside>
  );
}

export default NeoSidebar;
