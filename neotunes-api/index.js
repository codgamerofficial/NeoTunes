require('dotenv').config();
const express = require('express');
const cors = require('cors');

const youtubeService = require('./services/youtube');
const jamendoService = require('./services/jamendo');
const spotifyService = require('./services/spotify');

const app = express();
app.use(cors());
app.use(express.json());

// Main Search Endpoint — Unifies YouTube & Jamendo
app.get('/search', async (req, res) => {
  try {
    const { q, source = 'all' } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query parameter "q"' });

    const results = [];

    // Fetch from Youtube
    if (source === 'all' || source === 'youtube') {
      const ytTracks = await youtubeService.search(q);
      results.push(...ytTracks);
    }

    // Fetch from Jamendo
    if (source === 'all' || source === 'jamendo') {
      const jmTracks = await jamendoService.search(q);
      results.push(...jmTracks);
    }

    // Fetch from Spotify
    if (source === 'all' || source === 'spotify') {
      const spTracks = await spotifyService.search(q);
      results.push(...spTracks);
    }
    
    // Sort to blend results or just return
    // We give high priority to Spotify data since it has real durations and cleaner titles.
    results.sort((a, b) => {
      if (a.source === 'spotify_proxy' && b.source !== 'spotify_proxy') return -1;
      if (a.source !== 'spotify_proxy' && b.source === 'spotify_proxy') return 1;
      return 0;
    });

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
    const results = await youtubeService.getTrending(region);
    res.json(results);
  } catch (error) {
    console.error('Trending Error:', error);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// Artist Details Endpoint
app.get('/artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    console.log('[Artist Endpoint] Received artistId:', artistId);

    // Get artist details from Spotify
    const artist = await spotifyService.getArtist(artistId);
    console.log('[Artist Endpoint] getArtist returned:', artist);

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Get artist's top tracks from Spotify
    const tracks = await spotifyService.getArtistTopTracks(artistId, 10);

    // Return combined data
    res.json({
      artist,
      tracks
    });
  } catch (error) {
    console.error('Artist Error:', error);
    res.status(500).json({ error: 'Failed to fetch artist data' });
  }
});

// Recommendations Endpoint (Mood-based)
app.get('/recommendations', async (req, res) => {
  try {
    const { mood } = req.query;
    if (!mood) return res.status(400).json({ error: 'Missing mood parameter' });

    const results = await youtubeService.getRecommendations(mood);
    res.json(results);
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 NeoTunes API running on http://localhost:${PORT}`);
});

module.exports = app;
