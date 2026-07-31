import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RightPanelTab = 'queue' | 'lyrics' | 'friends' | 'visualizer' | 'effects';

interface LayoutState {
  isSidebarOpen: boolean;
  isRightPanelOpen: boolean;
  activeTab: 'lyrics' | 'visualizer' | 'effects';
  rightPanelTab: RightPanelTab;
  eqBass: number; // 0 to 100
  eqMid: number; // 0 to 100
  eqTreble: number; // 0 to 100
  reverb: number; // 0 to 100
  isVisualizerEnabled: boolean;
  visualizerStyle: 'bars' | 'wave' | 'retro' | 'nebula';
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
  setActiveTab: (tab: 'lyrics' | 'visualizer' | 'effects') => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setEq: (band: 'bass' | 'mid' | 'treble', value: number) => void;
  setReverb: (value: number) => void;
  setVisualizerEnabled: (enabled: boolean) => void;
  setVisualizerStyle: (style: 'bars' | 'wave' | 'retro' | 'nebula') => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isRightPanelOpen: false,
      activeTab: 'lyrics',
      rightPanelTab: 'queue',
      eqBass: 50,
      eqMid: 50,
      eqTreble: 50,
      reverb: 0,
      isVisualizerEnabled: true,
      visualizerStyle: 'bars',

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
      setRightPanelOpen: (open) => set({ isRightPanelOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab, activeTab: tab as any }),
      setEq: (band, value) => {
        if (band === 'bass') set({ eqBass: value });
        else if (band === 'mid') set({ eqMid: value });
        else if (band === 'treble') set({ eqTreble: value });
      },
      setReverb: (value) => set({ reverb: value }),
      setVisualizerEnabled: (enabled) => set({ isVisualizerEnabled: enabled }),
      setVisualizerStyle: (style) => set({ visualizerStyle: style }),
    }),
    {
      name: 'neotunes-layout-storage',
    }
  )
);
