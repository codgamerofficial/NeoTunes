# NeoTunes Search & Track Resolution Architecture

## 1. Hybrid Search Pipeline

NeoTunes uses a multi-tier search engine in `src/services/MusicSearchService.ts`:

1. **Spotify API Search**: Queries official Spotify catalog for high-precision metadata.
2. **Deezer Fallback**: If Spotify API returns 403 / Forbidden or zero items, automatically queries Deezer API.
3. **YouTube Resolution**: Stream URLs are resolved on-demand via `/api/youtube/search` for playback.

---

## 2. 10-Tier Relevance Scoring Engine

Search results are scored and sorted according to 10 weighted rules:

- **Tier 1**: Exact Title & Exact Artist match (Score +100)
- **Tier 2**: Exact Title match (Score +80)
- **Tier 3**: Title Starts-With query (Score +60)
- **Tier 4**: Title Contains query (Score +40)
- **Tier 5**: Artist Starts-With query (Score +30)
- **Tier 6**: Popularity boost (Scale 0-15)
- **Tier 7**: Original recording boost vs Live/Remix (Score +10)
- **Tier 8**: High-res audio availability (Score +5)
- **Tier 9**: Canonical ID match (Score +50)
- **Tier 10**: Exact Source ID match (Score +100)
