# NeoTunes System Architecture Specification

## 1. System Overview

NeoTunes is a continuous, production-grade open-source music platform built with Next.js, React Native / Expo / Capacitor Android, and TypeScript.

```text
+-------------------------------------------------------------------+
|                        PRESENTATION LAYER                         |
|   (Next.js App Router, Desktop Sidebar, Mobile Glass MiniPlayer)  |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                         STATE LAYER                               |
|   usePlaybackStore | useSpatialAudioStore | useLayoutStore        |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     AUDIO HARDWARE CORE LAYER                     |
|   AudioEngine.ts | MediaSession.ts | audioDspEngine.ts            |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     HYBRID PROVIDER & SEARCH                      |
|   MusicSearchService.ts | Spotify | Deezer | YouTube Fallback    |
+-------------------------------------------------------------------+
```

---

## 2. Layer Definitions

### Presentation Layer
- **Components**: `AppLayout`, `MiniPlayer`, `MobilePlayerView`, `Artwork`, `KineticLyricsView`, `AudioOutputSheet`, `NOSAudioDebug`.
- **Rules**: Components consume state via Zustand selectors and delegate actions (e.g. `playTrack`, `togglePlayPause`, `seek`) to `usePlaybackStore`. Components do NOT instantiate native players.

### State Layer
- **Stores**:
  - `usePlaybackStore`: Single source of truth for queue, current track, play state, position, buffer, and stream history.
  - `useSpatialAudioStore`: Hardware spatializer capability, EQ presets, and active output routing.
  - `useLayoutStore`: Desktop sidebar state, mobile drawer open state.

### Audio Core Layer
- **Engine**: `AudioEngine.ts` (HTML5 / Web Audio API / ExoPlayer bridge) handles hardware playback.
- **Media Session**: `MediaSession.ts` handles OS notification controls, lock screen metadata, and hardware media keys.
- **DSP Engine**: `audioDspEngine.ts` applies 5-band EQ filters, dynamics compression, and soundstage presets.

### Provider & Search Pipeline
- **Hybrid Resolution**: Spotify metadata -> Deezer fallback -> YouTube stream playback.
- **Track Transaction Guard**: `trackTransaction.ts` enforces `requestedTrack.sourceId === resolvedSource.sourceId` (Wrong Song Protection).
