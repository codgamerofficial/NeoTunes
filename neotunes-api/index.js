require('dotenv').config();
const express = require('express');
const cors = require('cors');

const youtubeService = require('./services/youtube');
const jamendoService = require('./services/jamendo');

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

    // Sort to blend results or just return
    // For now we'll put Jamendo first as they have real MP3 streams without restrictions
    results.sort((a, b) => {
      if (a.source === 'jamendo' && b.source !== 'jamendo') return -1;
      if (a.source !== 'jamendo' && b.source === 'jamendo') return 1;
      return 0;
    });

    res.json(results);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Trending Endpoint (Global / India)
app.get('/trending', async (req, res) => {
  try {
    const { region = 'global' } = req.query;
    const query = region === 'global' ? 'top hits 2024 global' : 'bollywood hits 2024 india';
    
    // For trending we'll just use youtube for now to get mainstream hits
    const results = await youtubeService.search(query, 15);
    res.json(results);
  } catch (error) {
    console.error('Trending Error:', error);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 NeoTunes API running on http://localhost:${PORT}`);
});
