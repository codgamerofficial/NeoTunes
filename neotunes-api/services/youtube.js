const axios = require('axios');

const BLOCK_COLORS = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];

// Free Invidious instances (no API key needed)
const INVIDIOUS_INSTANCES = [
  'https://invidious.fdn.app',
  'https://yewtu.be', 
  'https://invidious.snopyta.org'
];

// Try each instance until one works
async function fetchFromInvidious(endpoint) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await axios.get(`${instance}${endpoint}`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      if (response.status === 200) return response.data;
    } catch (error) {
      console.log(`Invidious instance ${instance} failed, trying next...`);
      continue;
    }
  }
  return null;
}

async function search(query, maxResults = 15) {
  // First try Invidious (no API key needed)
  const data = await fetchFromInvidious(`/api/v1/search?q=${encodeURIComponent(query)}&type=video&limit=${maxResults}`);
  
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item, index) => ({
      id: item.videoId || item.id,
      title: item.title || 'Unknown',
      artist: item.author || 'Unknown Artist',
      artwork: item.thumbnails?.[0]?.url || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : ''),
      color: BLOCK_COLORS[index % BLOCK_COLORS.length],
      source: 'youtube'
    }));
  }

  // Fallback: Try YouTube Data API if key exists
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('No YouTube API key and Invidious failed');
    return getMockResults(query, maxResults);
  }

  try {
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const response = await axios.get(url, {
      params: {
        part: 'snippet',
        maxResults,
        q: query,
        type: 'video',
        videoCategoryId: '10',
        key: apiKey
      }
    });

    if (!response.data || !response.data.items) return [];

    return response.data.items.map((item, index) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      artwork: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      color: BLOCK_COLORS[index % BLOCK_COLORS.length],
      source: 'youtube'
    }));
  } catch (error) {
    console.error('YouTube search error:', error.message);
    return getMockResults(query, maxResults);
  }
}

// Mock results for offline/demo mode
function getMockResults(query, maxResults) {
  const mockTracks = [
    { title: `${query} - Top Hit`, artist: 'Various Artists' },
    { title: `Best of ${query} 2024`, artist: 'Music Hub' },
    { title: `${query} Radio`, artist: 'YouTube Music' },
    { title: `Trending ${query}`, artist: 'Vibe Channel' },
    { title: `${query} Hits Mix`, artist: 'MixTape' }
  ];
  
  return mockTracks.slice(0, maxResults).map((track, index) => ({
    id: `mock_${index}_${Date.now()}`,
    title: track.title,
    artist: track.artist,
    artwork: `https://picsum.photos/seed/${query}${index}/300/300`,
    color: BLOCK_COLORS[index % BLOCK_COLORS.length],
    source: 'youtube'
  }));
}

async function getTrending(region = 'global') {
  const queries = region === 'india' 
    ? ['hindi songs 2024', 'bollywood hits']
    : ['top 50 songs 2024', 'trending music'];
  
  let allResults = [];
  
  for (const query of queries) {
    const results = await search(query, 10);
    allResults.push(...results);
  }
  
  // Remove duplicates
  const unique = allResults.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  return unique.slice(0, 20);
}

async function getRecommendations(mood) {
  const moodQueries = {
    'Focus': 'lofi study music',
    'Chill': 'chill vibes playlist',
    'Gym': 'workout music',
    'Party': 'party dance hits'
  };
  
  const query = moodQueries[mood] || mood;
  return search(query, 10);
}

module.exports = {
  search,
  getTrending,
  getRecommendations
};
