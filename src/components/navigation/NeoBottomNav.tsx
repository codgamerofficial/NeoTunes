'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Compass, Library, User } from 'lucide-react';

export function NeoBottomNav() {
  const pathname = usePathname();

  const isPlayerView = pathname === '/player';
  if (isPlayerView) return null;

  const tabItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B0D12]/95 backdrop-blur-2xl border-t border-white/[0.08] z-40 flex items-center justify-around px-2 shadow-2xl select-none">
      {tabItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 transition-all relative ${
              isActive ? 'text-[#DFFF00] font-bold' : 'text-[#9AA1AD] hover:text-white'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-[#DFFF00]' : 'text-[#9AA1AD]'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#DFFF00] absolute bottom-1" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default NeoBottomNav;
