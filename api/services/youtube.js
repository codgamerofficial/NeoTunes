const axios = require('axios');

const BLOCK_COLORS = ['#FF2E63', '#6C5CE7', '#00F5FF', '#FF7AA2', '#8B5CF6', '#4FFBDF'];

async function search(query, maxResults = 10, options = {}) {
  const { throwOnError = false } = options;

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      const message = 'YOUTUBE_API_KEY not found in backend .env';
      if (throwOnError) throw new Error(message);
      console.warn(`⚠️ ${message}`);
      return [];
    }

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
    const message = error.response?.data?.error?.message || error.message;
    if (throwOnError) throw new Error(message);
    console.error('YouTube API Error:', message);
    return [];
  }
}

module.exports = {
  search
};
