# NeoTunes Public SDK Specification (@neotunes/sdk)

## Quick Start
```ts
import { NeoTunesSDK } from '@/sdk';

// 1. Search canonical music providers
const searchResult = await NeoTunesSDK.search.searchAll('Arijit Singh');

// 2. Play canonical track
if (searchResult.songs.length > 0) {
  NeoTunesSDK.player.playTrack(searchResult.songs[0]);
}

// 3. Query user music intelligence summary
const tasteSummary = NeoTunesSDK.intelligence.getWeeklySummary();
console.log('Top Artist:', tasteSummary.topArtist);
```
