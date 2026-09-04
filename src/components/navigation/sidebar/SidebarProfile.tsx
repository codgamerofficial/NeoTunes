'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { Artwork } from '@/components/ui/Artwork';

interface SidebarProfileProps {
  isOpen: boolean;
  user: any;
  onProfileClick: () => void;
  onSignOut: () => void;
}

export default function SidebarProfile({
  isOpen,
  user,
  onProfileClick,
  onSignOut,
}: SidebarProfileProps) {

  const userName =
    user?.user_metadata?.full_name ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Music Listener');

  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.avatar_url ||
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80';

  if (!isOpen) {
    return (
      <div className="relative flex items-center justify-center py-1.5 shrink-0 select-none group">
        <button
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:ring-2 hover:ring-[#DFFF00]/60 transition-all cursor-pointer overflow-hidden border border-white/10"
          aria-label={`${userName} - View Profile`}
        >
          <Artwork
            source={userAvatar}
            size="small"
            aspectRatio="circle"
            alt={userName}
            type="artist"
            className="w-full h-full object-cover"
          />
        </button>

        {/* Floating Tooltip in Collapsed Mode */}
        <div
          role="tooltip"
          className="absolute left-full ml-3 bottom-0 px-3 py-2 rounded-xl bg-[#11141A]/95 text-xs text-white whitespace-nowrap shadow-2xl border border-white/12 pointer-events-none z-50 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 ease-out"
        >
          <span className="font-bold text-white">{userName}</span>
          <span className="text-[10px] text-[#DFFF00]">View Profile</span>
          {/* Arrow */}
          <span className="absolute -left-1 bottom-3 border-y-4 border-y-transparent border-r-4 border-r-[#11141A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 pb-1 shrink-0 select-none">
      <div
        onClick={onProfileClick}
        className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/12 transition-all duration-150 flex items-center justify-between group cursor-pointer shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Artwork
            source={userAvatar}
            size="small"
            aspectRatio="circle"
            alt={userName}
            type="artist"
            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0 group-hover:ring-1 group-hover:ring-[#DFFF00]/50 transition-all"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white/90 group-hover:text-[#DFFF00] transition-colors truncate">
              {userName}
            </div>
            <div className="text-[10px] text-white/45 font-medium">View Profile</div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSignOut();
          }}
          className="p-1.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
