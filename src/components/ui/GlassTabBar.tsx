'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Compass, Library, User } from 'lucide-react';

export function GlassTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide tab bar on full-screen player page
  if (pathname === '/player') return null;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'search', label: 'Search', icon: Search, href: '/search' },
    { id: 'browse', label: 'Browse', icon: Compass, href: '/browse' },
    { id: 'library', label: 'Library', icon: Library, href: '/library' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[calc(100%-32px)] max-w-md">
      <div className="h-16 px-3 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-around font-sans">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center justify-center p-2 rounded-full transition-all cursor-pointer min-w-[44px] min-h-[44px] ${
                isActive
                  ? 'text-[#DFFF00] scale-105'
                  : 'text-[#A1A1A6] hover:text-white'
              }`}
              aria-label={tab.label}
            >
              <div className={`p-2 rounded-full transition-all ${
                isActive ? 'bg-[#DFFF00]/15 border border-[#DFFF00]/40' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GlassTabBar;
