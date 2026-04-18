const axios = require('axios');

// Default client ID if none provided (from Jamendo community)
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'b6747d04';

const BLOCK_COLORS = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];

async function search(query, limit = 10) {
  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: limit,
        search: query,
        include: 'musicinfo',
        audioformat: 'mp32'
      }
    });

    if (!response.data || !response.data.results) return [];

    return response.data.results.map((item, index) => ({
      id: item.id.toString(),
      title: item.name,
      artist: item.artist_name,
      artwork: item.image,
      color: BLOCK_COLORS[index % BLOCK_COLORS.length],
      source: 'jamendo',
      url: item.audio // DIRECT MP3 STREAM URL 🥳
    }));
  } catch (error) {
    console.error('Jamendo API Error:', error.message);
    return [];
  }
}

module.exports = {
  search
};
