'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isOpen: boolean;
  isSpecial?: boolean;
  badge?: string | number;
  className?: string;
}

export default function SidebarNavItem({
  href,
  onClick,
  icon: Icon,
  label,
  isActive = false,
  isOpen,
  isSpecial = false,
  badge,
  className = '',
}: SidebarNavItemProps) {
  const baseClasses = `relative flex items-center h-11 rounded-2xl text-xs font-semibold select-none transition-all duration-150 ease-out group outline-none focus-visible:ring-2 focus-visible:ring-[#DFFF00]/60 ${
    isOpen ? 'px-3.5 gap-3 w-full' : 'justify-center w-11 mx-auto'
  } ${
    isActive
      ? isSpecial
        ? 'bg-gradient-to-r from-[#DFFF00]/15 to-transparent text-white font-extrabold border border-[#DFFF00]/25 shadow-[inset_0_0_12px_rgba(223,255,0,0.08)]'
        : 'bg-[#DFFF00]/[0.08] text-white font-extrabold border border-[#DFFF00]/20 shadow-[inset_0_0_12px_rgba(223,255,0,0.05)]'
      : isSpecial
      ? 'text-white/80 hover:text-white hover:bg-white/[0.05] border border-transparent'
      : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
  } ${className}`;

  const content = (
    <>
      {/* Active Left Indicator Bar */}
      {isActive && (
        <span
          className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#DFFF00] shadow-[0_0_8px_rgba(223,255,0,0.6)] ${
            !isOpen ? 'left-[-4px]' : ''
          }`}
        />
      )}

      {/* Icon */}
      <Icon
        className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
          isActive
            ? isSpecial
              ? 'text-[#DFFF00] drop-shadow-[0_0_8px_rgba(223,255,0,0.5)]'
              : 'text-[#DFFF00]'
            : isSpecial
            ? 'text-[#DFFF00]/90 group-hover:scale-110 group-hover:rotate-6'
            : 'text-white/60 group-hover:text-white group-hover:translate-x-0.5'
        }`}
      />

      {/* Label (expanded state) */}
      {isOpen && (
        <span
          className={`truncate flex-1 tracking-tight ${
            isActive ? 'font-bold text-white' : 'font-medium'
          }`}
        >
          {label}
        </span>
      )}

      {/* Badge / Indicator (expanded state) */}
      {isOpen && badge && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/80 shrink-0">
          {badge}
        </span>
      )}

      {/* Floating Tooltip (collapsed state) */}
      {!isOpen && (
        <div
          role="tooltip"
          className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#11141A]/95 text-xs font-semibold text-white whitespace-nowrap shadow-2xl border border-white/12 pointer-events-none z-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 ease-out"
        >
          <span>{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-[#DFFF00]/20 text-[#DFFF00]">
              {badge}
            </span>
          )}
          {/* Tooltip arrow */}
          <span className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-[#11141A]" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={baseClasses}
        aria-label={label}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClasses}
      aria-label={label}
    >
      {content}
    </button>
  );
}
