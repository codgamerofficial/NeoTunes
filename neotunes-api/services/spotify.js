const axios = require('axios');

let spotifyToken = null;
let tokenExpiration = 0;

const DEFAULT_SEED_GENRES = ['pop', 'chill'];
const SPOTIFY_COLORS = ['#FF2E63', '#6C5CE7', '#00F5FF', '#FF7AA2', '#8B5CF6', '#4FFBDF'];

const MOOD_SEEDS = {
  focus: { seed_genres: ['chill', 'ambient'], target_energy: 0.4, target_valence: 0.35 },
  chill: { seed_genres: ['chill', 'acoustic'], target_energy: 0.35, target_valence: 0.45 },
  party: { seed_genres: ['dance', 'pop', 'edm'], target_energy: 0.85, target_valence: 0.85 },
  workout: { seed_genres: ['work-out', 'hip-hop', 'dance'], target_energy: 0.9, target_valence: 0.7 },
  happy: { seed_genres: ['pop', 'dance'], target_energy: 0.7, target_valence: 0.9 },
  sad: { seed_genres: ['acoustic', 'piano', 'ambient'], target_energy: 0.25, target_valence: 0.2 },
};

const SEARCH_TYPES = new Set(['track', 'artist', 'album', 'playlist']);

const mapSpotifyTrack = (item, index = 0) => ({
  id: `spot_${item.id}`,
  title: item.name,
  artist: item.artists?.map((artist) => artist.name).join(', ') ?? item.artists?.[0]?.name ?? 'Unknown',
  artwork: item.album?.images?.[0]?.url ?? '',
  color: SPOTIFY_COLORS[index % SPOTIFY_COLORS.length],
  duration_ms: item.duration_ms,
  album: item.album?.name,
  release_date: item.album?.release_date,
  source: 'spotify_proxy',
  kind: 'track',
  searchQuery: `${item.name} ${item.artists?.[0]?.name ?? ''} Audio`,
});

const mapSpotifyArtist = (item) => ({
  id: `artist_${item.id}`,
  title: item.name,
  artist: item.name,
  artwork: item.images?.[0]?.url ?? '',
  followers: item.followers?.total ?? 0,
  source: 'spotify_meta',
  kind: 'artist',
});

const mapSpotifyAlbum = (item) => ({
  id: `album_${item.id}`,
  title: item.name,
  artist: item.artists?.map((artist) => artist.name).join(', ') ?? item.artists?.[0]?.name ?? 'Unknown',
  artwork: item.images?.[0]?.url ?? '',
  release_date: item.release_date,
  source: 'spotify_meta',
  kind: 'album',
});

const mapSpotifyPlaylist = (item) => ({
  id: `playlist_${item.id}`,
  title: item.name,
  artist: item.owner?.display_name ?? 'Spotify',
  artwork: item.images?.[0]?.url ?? '',
  tracks_total: item.tracks?.total ?? 0,
  description: item.description,
  source: 'spotify_meta',
  kind: 'playlist',
});

async function getAccessToken(options = {}) {
  const { throwOnError = false } = options;

  if (spotifyToken && Date.now() < tokenExpiration) return spotifyToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const message = 'SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET missing.';
    if (throwOnError) throw new Error(message);
    console.warn(`⚠️ ${message}`);
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
    const message = error.response?.data?.error_description || error.response?.data?.error || error.message;
    if (throwOnError) throw new Error(message);
    console.error('Spotify token error:', error.response?.data || error.message);
    return null;
  }
}

async function search(query, limit = 15, options = {}) {
  const { throwOnError = false, type = 'track' } = options;
  const token = await getAccessToken({ throwOnError });
  if (!token) return [];

  try {
    const normalizedType = SEARCH_TYPES.has(type) ? type : 'track';
    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: query, type: normalizedType, limit },
      headers: { Authorization: `Bearer ${token}` }
    });

    if (normalizedType === 'artist') {
      return (response.data?.artists?.items ?? []).map(mapSpotifyArtist);
    }
    if (normalizedType === 'album') {
      return (response.data?.albums?.items ?? []).map(mapSpotifyAlbum);
    }
    if (normalizedType === 'playlist') {
      return (response.data?.playlists?.items ?? []).map(mapSpotifyPlaylist);
    }
    const items = response.data?.tracks?.items || [];
    return items
      .filter(item => item?.id && item?.name && item?.artists?.length > 0)
      .map(mapSpotifyTrack);
  } catch (error) {
    const message = error.response?.data?.error?.message || error.response?.data?.error_description || error.message;
    if (throwOnError) throw new Error(message);
    console.error('Spotify Search Error:', error.response?.data || error.message);
    return [];
  }
}

function buildRecommendationParams({ mood, seedGenres, limit }) {
  const moodKey = mood ? String(mood).toLowerCase() : '';
  const moodConfig = MOOD_SEEDS[moodKey];
  const seeds = seedGenres?.length
    ? seedGenres
    : moodConfig?.seed_genres ?? DEFAULT_SEED_GENRES;

  return {
    seed_genres: seeds.join(','),
    limit,
    target_energy: moodConfig?.target_energy,
    target_valence: moodConfig?.target_valence,
  };
}

async function getRecommendations(options = {}) {
  const { throwOnError = false, mood, seedGenres, limit = 20 } = options;
  const token = await getAccessToken({ throwOnError });
  if (!token) return [];

  try {
    const response = await axios.get('https://api.spotify.com/v1/recommendations', {
      params: buildRecommendationParams({ mood, seedGenres, limit }),
      headers: { Authorization: `Bearer ${token}` }
    });

    return (response.data?.tracks ?? []).map(mapSpotifyTrack);
  } catch (error) {
    const message = error.response?.data?.error?.message || error.response?.data?.error_description || error.message;
    if (throwOnError) throw new Error(message);
    console.error('Spotify Recommendations Error:', error.response?.data || error.message);
    return [];
  }
}

async function getFeaturedPlaylists(options = {}) {
  const { throwOnError = false, limit = 12 } = options;
  const token = await getAccessToken({ throwOnError });
  if (!token) return [];

  try {
    const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` }
    });

    return (response.data?.playlists?.items ?? []).map(mapSpotifyPlaylist);
  } catch (error) {
    const message = error.response?.data?.error?.message || error.response?.data?.error_description || error.message;
    if (throwOnError) throw new Error(message);
    console.error('Spotify Featured Playlists Error:', error.response?.data || error.message);
    return [];
  }
}

module.exports = { search, getRecommendations, getFeaturedPlaylists };
