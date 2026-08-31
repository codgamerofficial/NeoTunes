'use client';

import React from 'react';
import Link from 'next/link';
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
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
} from 'lucide-react';
import NeoTuneLogo from './NeoTuneLogo';
import { Artwork } from '@/components/ui/Artwork';

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

  const userName = user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Music Listener');
  const userAvatar = user?.user_metadata?.avatar_url || user?.avatar_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80';

  const primaryNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
  ];

  const secondaryNavItems = [
    { label: 'Liked Songs', href: '/liked', icon: Heart },
    { label: 'Downloads', href: '/downloads', icon: Download },
    { label: 'History', href: '/history', icon: History },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } hidden md:flex flex-col justify-between bg-[#0B0D12] border-r border-white/[0.06] p-4 transition-all duration-300 ease-in-out z-30 select-none shrink-0`}
    >
      <div className="space-y-6">
        {/* Header Branding & Collapse Toggle */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <NeoTuneLogo size="md" showText={isOpen} onClick={() => router.push('/')} />
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            aria-label="Toggle Sidebar"
          >
            {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1 pt-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#DFFF00] text-black shadow-sm font-extrabold'
                    : 'text-[#9AA1AD] hover:text-white hover:bg-white/[0.04]'
                }`}
                title={item.label}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-black' : 'text-[#9AA1AD] group-hover:text-white'}`} />
                {isOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] my-2" />

        {/* Secondary Shortcuts */}
        {isOpen ? (
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-[#9AA1AD] uppercase tracking-wider">
              Your Sound
            </span>
            <div className="space-y-0.5 pt-1">
              <button
                onClick={onOpenAskNeo}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#9AA1AD] hover:text-[#DFFF00] hover:bg-white/[0.04] transition-all text-left cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[#DFFF00]" />
                <span>Ask Neo AI</span>
              </button>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive ? 'text-[#DFFF00] bg-white/[0.06]' : 'text-[#9AA1AD] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 flex flex-col items-center">
            <button
              onClick={onOpenAskNeo}
              className="p-2.5 rounded-xl text-[#DFFF00] hover:bg-white/[0.04] transition-all cursor-pointer"
              title="Ask Neo AI"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <Link
              href="/liked"
              className="p-2.5 rounded-xl text-[#9AA1AD] hover:text-white hover:bg-white/[0.04] transition-all"
              title="Liked Songs"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              href="/downloads"
              className="p-2.5 rounded-xl text-[#9AA1AD] hover:text-white hover:bg-white/[0.04] transition-all"
              title="Downloads"
            >
              <Download className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* User Footer / Profile Summary */}
      {isOpen ? (
        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <div
            onClick={() => router.push('/profile')}
            className="p-2.5 rounded-xl bg-[#11141A] border border-white/5 hover:border-white/15 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Artwork
                source={userAvatar}
                size="small"
                aspectRatio="circle"
                alt={userName}
                type="artist"
                className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#DFFF00] transition-colors truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-[#9AA1AD]">View Profile</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignOut();
              }}
              className="p-1.5 rounded-lg text-[#9AA1AD] hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => router.push('/profile')}
            className="p-1.5 rounded-full hover:ring-2 hover:ring-[#DFFF00] transition-all cursor-pointer"
            title="Profile"
          >
            <Artwork
              source={userAvatar}
              size="small"
              aspectRatio="circle"
              alt={userName}
              type="artist"
              className="h-7 w-7 rounded-full object-cover"
            />
          </button>
        </div>
      )}
    </aside>
  );
}

export default NeoSidebar;
