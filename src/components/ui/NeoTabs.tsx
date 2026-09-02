'use client';

import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface NeoTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  variant?: 'pills' | 'segmented' | 'underline';
}

export function NeoTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'segmented',
}: NeoTabsProps<T>) {
  if (variant === 'underline') {
    return (
      <div className={`flex items-center gap-6 border-b border-white/[0.08] overflow-x-auto scrollbar-none ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all relative shrink-0 ${
                isActive ? 'text-[#DFFF00]' : 'text-[#9AA1AD] hover:text-white'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-[#DFFF00]/20 text-[#DFFF00]' : 'bg-white/5 text-[#9AA1AD]'
                }`}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DFFF00] rounded-full shadow-[0_0_8px_rgba(223,255,0,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Segmented control / Pills
  return (
    <div className={`flex items-center gap-1.5 p-1 rounded-2xl bg-[#11141A] border border-white/[0.08] overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-150 shrink-0 select-none ${
              isActive
                ? 'bg-[#171A21] text-white shadow-md border border-white/10'
                : 'text-[#9AA1AD] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab.icon && <span className={isActive ? 'text-[#DFFF00]' : 'text-[#9AA1AD]'}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/5 text-[#9AA1AD]">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default NeoTabs;
