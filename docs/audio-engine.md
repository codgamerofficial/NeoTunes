# NeoTunes Audio Engine Architecture

## 1. Single Global Player Core

NeoTunes maintains exactly **ONE** active audio engine instance throughout the entire application lifecycle.

- **Singleton Engine**: `AudioEngine.getInstance()` in `src/player/AudioEngine.ts`.
- **State Store**: `usePlaybackStore` in `src/store/playback-store.ts`.
- **Media Session**: `MediaSession.ts` in `src/player/MediaSession.ts`.

---

## 2. Playback Rules & Safeguards

1. **3-Second Restart Rule**:
   - Calling `prevTrack()` when current position is greater than 3 seconds restarts the current track from 0:00 instead of jumping to the previous queue item.

2. **Headphone Disconnect Auto-Pause**:
   - AudioEngine monitors `devicechange` hardware events. When headphones or Bluetooth audio output disconnects during playback, audio auto-pauses immediately to prevent sound leakage to phone speakers.

3. **Wrong Song Protection**:
   - `trackTransaction.ts` validates `requestedTrack.sourceId === resolvedSource.sourceId` before starting audio stream playback. If the resolved stream ID does not match the requested source ID, playback aborts immediately.

4. **Background Media Controls**:
   - `navigator.mediaSession` handlers bind hardware media keys (Play, Pause, Next, Previous, Seek) directly to `usePlaybackStore` actions.
