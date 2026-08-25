# NeoTunes Synchronized Lyrics Architecture

## 1. Lyric Matching Guard

Synced lyrics in `KineticLyricsView` and `MobileLyricsSheet` enforce strict track matching rules:

1. **Exact Track Matching**: Priority is Source ID -> Verified Title + Artist.
2. **Low-Confidence Fallback**: Displays `"Lyrics unavailable for this track."` without showing mismatched lyrics from another song.

---

## 2. Interactive Line-Click Seeking

- Tapping any lyric line in classic or kinetic mode calls `onSeek(line.time)`.
- Player position updates instantly to the line timestamp.
- Opening, viewing, or dismissing lyrics sheets does not interrupt or restart audio playback.
