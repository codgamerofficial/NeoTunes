const axios = require('axios');

let spotifyToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
  if (spotifyToken && Date.now() < tokenExpiration) return spotifyToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('[Spotify] Client ID present:', !!clientId);
  console.log('[Spotify] Client Secret present:', !!clientSecret);

  if (!clientId || !clientSecret) {
    console.warn('⚠️ SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET missing.');
    return null;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    });
    
    spotifyToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;
    return spotifyToken;
  } catch (error) {
    console.error('Spotify token error:', error.response?.data || error.message);
    return null;
  }
}

async function search(query, limit = 15) {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: query, type: 'track', limit },
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.tracks.items.map(item => ({
      id: `spot_${item.id}`,
      title: item.name,
      artist: item.artists[0].name,
      artwork: item.album.images[0]?.url || '',
      duration_ms: item.duration_ms,
      source: 'spotify_proxy',
      searchQuery: `${item.name} ${item.artists[0].name} Audio`
    }));
  } catch (error) {
    console.error('Spotify Search Error:', error.response?.data || error.message);
    return [];
  }
}

async function getArtist(artistId) {
  const token = await getAccessToken();
  console.log('[Spotify getArtist] Token obtained:', token ? 'yes' : 'NO TOKEN');
  if (!token) return null;

  try {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const artist = response.data;
    return {
      id: artist.id,
      name: artist.name,
      images: artist.images,
      followers: artist.followers.total,
      genres: artist.genres,
      popularity: artist.popularity
    };
  } catch (error) {
    console.error('Spotify Artist Error:', error.response?.data || error.message);
    return null;
  }
}

async function getArtistTopTracks(artistId, limit = 10) {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    // Note: Spotify API requires market parameter for top tracks
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
      params: { market: 'US' },
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.tracks.map(track => ({
      id: `spot_${track.id}`,
      title: track.name,
      artist: track.artists[0].name,
      artwork: track.album.images[0]?.url || '',
      duration_ms: track.duration_ms,
      album: track.album.name,
      source: 'spotify_proxy',
      searchQuery: `${track.name} ${track.artists[0].name} Audio`
    }));
  } catch (error) {
    console.error('Spotify Top Tracks Error:', error.response?.data || error.message);
    return [];
  }
}

module.exports = { search, getArtist, getArtistTopTracks };
