# Changelog

All notable changes to NeoTunes will be documented in this file.

## [1.0.0-rc] - 2026-08-25

### Added
- **Audio Core & Background Playback**: Single ExoPlayer / MediaSession source of truth with 3-second restart rule and Wrong-Song Protection.
- **Canonical Search Engine**: 10-tier ranking algorithm with provider abstraction.
- **Interactive Lyrics & Downloads**: Line-by-line synced lyrics and byte-accurate local storage.
- **Spatial Audio & DSP**: Dolby Atmos hardware detection guard and 8 Sound Signature presets.
- **Recommendation & Intelligence Engine**: Time-decayed user taste profiles, 20% novelty budget, and dynamic Smart Mixes.
- **NeoAssistant AI Layer**: 0ms deterministic intent router and structured tool execution.
- **Social Platform**: Glassmorphism user profiles, follow requests, collaborative playlists, HTML-escaped comments, and deep links (`neotunes://track/<id>`).
- **Platform Engineering & DevOps**: Centralized feature flags (`featureFlags.ts`), Provider Registry, Health Diagnostics runner (`HealthCheck.ts`), and CI workflows.
