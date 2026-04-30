require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const youtubeService = require('./services/youtube');
const spotifyService = require('./services/spotify');

const app = express();
app.use(cors());
app.use(express.json());

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

const MOOD_KEYWORDS = [
  { mood: 'focus', keywords: ['focus', 'study', 'concentration', 'deep work'] },
  { mood: 'chill', keywords: ['chill', 'relax', 'calm', 'ambient', 'lofi'] },
  { mood: 'party', keywords: ['party', 'dance', 'club', 'hype'] },
  { mood: 'workout', keywords: ['workout', 'gym', 'run', 'training'] },
  { mood: 'happy', keywords: ['happy', 'sunny', 'uplift', 'feel good'] },
  { mood: 'sad', keywords: ['sad', 'cry', 'heartbreak', 'lonely'] },
];

function inferMood(prompt = '') {
  const normalized = prompt.toLowerCase();
  const match = MOOD_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );
  return match?.mood ?? 'chill';
}

async function fetchAiRecommendations({ mood, prompt, limit }) {
  const resolvedMood = mood || inferMood(prompt || '');

  if (AI_SERVICE_URL) {
    try {
      const response = await axios.get(`${AI_SERVICE_URL.replace(/\/$/, '')}/recommendations`, {
        params: { mood: resolvedMood, limit },
      });
      if (Array.isArray(response.data?.tracks)) {
        return { mood: resolvedMood, tracks: response.data.tracks };
      }
    } catch (error) {
      console.warn('AI service unavailable, falling back to Spotify.', error?.message ?? error);
    }
  }

  const tracks = await spotifyService.getRecommendations({ mood: resolvedMood, limit, throwOnError: true });
  return { mood: resolvedMood, tracks };
}

// Main Search Endpoint — Unifies YouTube playback + Spotify metadata
app.get('/search', async (req, res) => {
  try {
    const { q, source = 'all', type = 'track' } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query parameter "q"' });

    const allowedSources = new Set(['all', 'youtube', 'spotify']);
    if (!allowedSources.has(source)) {
      return res.status(400).json({ error: 'Invalid source. Use all, youtube, or spotify.' });
    }

    const allowedTypes = new Set(['track', 'artist', 'album', 'playlist']);
    if (!allowedTypes.has(type)) {
      return res.status(400).json({ error: 'Invalid type. Use track, artist, album, or playlist.' });
    }

    const results = [];
    const providerErrors = [];

    const collectProvider = async (providerName, fetcher) => {
      try {
        const providerTracks = await fetcher();
        results.push(...providerTracks);
      } catch (error) {
        providerErrors.push({ provider: providerName, error: error.message || 'Unknown provider error' });
      }
    };

    // Fetch from Youtube
    if ((source === 'all' || source === 'youtube') && type === 'track') {
      await collectProvider('youtube', () => youtubeService.search(q, 10, { throwOnError: true }));
    }

    // Fetch from Spotify
    if (source === 'all' || source === 'spotify') {
      await collectProvider('spotify', () => spotifyService.search(q, 15, { throwOnError: true, type }));
    }
    
    // Sort to blend results or just return
    // We give high priority to Spotify data since it has real durations and cleaner titles.
    results.sort((a, b) => {
      if (a.source === 'spotify_proxy' && b.source !== 'spotify_proxy') return -1;
      if (a.source !== 'spotify_proxy' && b.source === 'spotify_proxy') return 1;
      return 0;
    });

    if (results.length === 0 && providerErrors.length > 0) {
      return res.status(502).json({
        error: 'No providers returned results',
        providerErrors,
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Resolve Proxy Audio Endpoint
// When the frontend tries to play a `spotify_proxy` track, it asks the backend to
// magically "resolve" it into a YouTube or Jamendo direct stream.
app.get('/resolve', async (req, res) => {
  try {
    const { searchQuery } = req.query;
    if (!searchQuery) return res.status(400).json({ error: 'Missing searchQuery' });
    
    // We just do a hidden background YouTube search for the exact Spotify artist + title combo
    const tracks = await youtubeService.search(searchQuery, 1);
    
    if (tracks.length > 0) {
      res.json({ url: null, id: tracks[0].id, resolvedSource: 'youtube' });
    } else {
      res.status(404).json({ error: 'Could not resolve audio for track.' });
    }
  } catch (error) {
    console.error('Resolve Error:', error);
    res.status(500).json({ error: 'Failed to resolve' });
  }
});

// Trending Endpoint (Global / India)
app.get('/trending', async (req, res) => {
  try {
    const { region = 'global' } = req.query;
    const allowedRegions = new Set(['global', 'india']);
    if (!allowedRegions.has(region)) {
      return res.status(400).json({ error: 'Invalid region. Use global or india.' });
    }

    const query = region === 'global' ? 'top hits 2024 global' : 'bollywood hits 2024 india';
    
    // For trending we'll just use youtube for now to get mainstream hits
    const results = await youtubeService.search(query, 15, { throwOnError: true });
    res.json(results);
  } catch (error) {
    const message = error.message || 'Unknown provider error';
    console.error('Trending Error:', message);
    res.status(502).json({
      error: 'Trending provider unavailable',
      providerErrors: [
        {
          provider: 'youtube',
          error: message,
        },
      ],
    });
  }
});

// AI Recommendations Endpoint (Spotify + optional AI service)
app.get('/recommendations', async (req, res) => {
  try {
    const { mood = '', prompt = '', limit = '20' } = req.query;
    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 30);

    const payload = await fetchAiRecommendations({
      mood: String(mood),
      prompt: String(prompt),
      limit: normalizedLimit,
    });

    res.json(payload);
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Featured Playlists (Spotify Browse)
app.get('/playlists', async (req, res) => {
  try {
    const { type = 'featured', limit = '12' } = req.query;
    if (type !== 'featured') {
      return res.status(400).json({ error: 'Invalid playlist type. Use featured.' });
    }

    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 20);
    const playlists = await spotifyService.getFeaturedPlaylists({ limit: normalizedLimit, throwOnError: true });
    res.json(playlists);
  } catch (error) {
    console.error('Playlists Error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 NeoTunes API running on http://localhost:${PORT}`);
});

module.exports = app;
