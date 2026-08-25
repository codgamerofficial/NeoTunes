# NeoTunes Android Background Playback Architecture

## 1. Foreground Service & MediaSession

NeoTunes utilizes native Android background playback services:

- **Manifest Service**: `android/app/src/main/AndroidManifest.xml` configures `FOREGROUND_SERVICE_MEDIA_PLAYBACK`.
- **Media Session**: `MediaSession.ts` updates notification artwork, track title, artist name, and duration.
- **Hardware Keys**: Handles Play, Pause, Next, Previous, and Seek commands from Bluetooth headsets, smartwatches, lock screens, and Android notifications.

---

## 2. App Lifecycle Safeguard

When NeoTunes moves from foreground -> background -> screen lock -> unlock:
- Audio engine continues streaming smoothly without restarting or interrupting playback.
- Track position remains synchronized across native player state and Zustand state.
