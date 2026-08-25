# NeoTunes Offline Downloads & Storage Architecture

## 1. Local Storage File Engine

Offline downloads in NeoTunes represent verified local track objects stored on device:

- **Storage Key**: `neotunes_downloads` in device local storage / filesystem.
- **Downloaded Item Model**:
  ```ts
  interface DownloadedTrackItem {
    id: string;
    track: Track;
    sizeBytes: number;
    downloadedAt: string;
  }
  ```

---

## 2. Smart Cleanup & Analytics

- **Real Storage Analytics**: Computed from actual file sizes (`sizeBytes`). Storage usage is presented as `MB / GB Used`.
- **Smart Cleanup**: Deletes local files, database records, and cache references atomically.
- **Offline Playback Guard**: Offline player verifies local file existence before initializing playback.
