import { MusicSearchService } from '../MusicSearchService';

async function testSearchSuite() {
  console.log('=== RUNNING NEOTUNES SEARCH TEST SUITE ===');

  const testQueries = ['Naal Nachna', 'Arijit Singh', 'Shakira', 'Blinding Lights', 'Kesariya'];

  for (const q of testQueries) {
    console.log(`\nTesting query: "${q}"...`);
    try {
      const res = await MusicSearchService.searchAll(q);
      console.log(`✓ Result count for "${q}":`);
      console.log(`  - Songs: ${res.songs.length}`);
      console.log(`  - Artists: ${res.artists.length}`);
      console.log(`  - Albums: ${res.albums.length}`);
      console.log(`  - Playlists: ${res.playlists.length}`);

      if (res.songs.length > 0) {
        const topSong = res.songs[0];
        console.log(`  Top Song: "${topSong.title}" by ${Array.isArray(topSong.artists) ? topSong.artists.join(', ') : topSong.artist} [Album: ${topSong.album}]`);
        console.log(`  CanonicalId: ${topSong.canonicalId}`);
        console.log(`  Artwork URL: ${topSong.artworkUrl || 'N/A'}`);
      }

      if (res.artists.length > 0) {
        const topArtist = res.artists[0];
        console.log(`  Top Artist: "${topArtist.name}" (Genres: ${topArtist.genres?.join(', ') || 'N/A'})`);
      }
    } catch (err: any) {
      console.error(`❌ Search failed for "${q}":`, err.message || err);
    }
  }

  console.log('\n=== SEARCH TEST SUITE COMPLETED ===');
}

testSearchSuite();
