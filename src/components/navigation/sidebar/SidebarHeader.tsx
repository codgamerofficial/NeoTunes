'use client';

import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import NeoTuneLogo, { NeoTunesMark } from '../NeoTuneLogo';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogoClick: () => void;
}

export default function SidebarHeader({
  isOpen,
  onToggle,
  onLogoClick,
}: SidebarHeaderProps) {
  return (
    <div
      className={`h-14 flex items-center border-b border-white/[0.05] select-none shrink-0 transition-all duration-200 ${
        isOpen ? 'px-4 justify-between' : 'px-2 justify-center'
      }`}
    >
      {isOpen ? (
        <>
          {/* Logo with Text */}
          <div
            onClick={onLogoClick}
            className="cursor-pointer group flex items-center min-w-0"
            title="NeoTunes Home"
          >
            <NeoTuneLogo size="md" showText={true} />
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </>
      ) : (
        /* Collapsed: Centered Mark + Hover expand tooltip */
        <button
          onClick={onToggle}
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-white/[0.08] transition-all cursor-pointer relative group"
          title="Expand Sidebar"
          aria-label="Expand Sidebar"
        >
          <NeoTunesMark size="sm" className="group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
