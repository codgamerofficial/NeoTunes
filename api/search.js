const youtubeService = require('./services/youtube');
const jamendoService = require('./services/jamendo');
const spotifyService = require('./services/spotify');

module.exports = async (req, res) => {
  try {
    const { q, source = 'all' } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing query parameter "q"' });
    }

    const allowedSources = new Set(['all', 'youtube', 'jamendo', 'spotify']);
    if (!allowedSources.has(source)) {
      return res.status(400).json({ error: 'Invalid source. Use all, youtube, jamendo, or spotify.' });
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

    if (source === 'all' || source === 'youtube') {
      await collectProvider('youtube', () => youtubeService.search(q, 10, { throwOnError: true }));
    }

    if (source === 'all' || source === 'jamendo') {
      await collectProvider('jamendo', () => jamendoService.search(q, 10, { throwOnError: true }));
    }

    if (source === 'all' || source === 'spotify') {
      await collectProvider('spotify', () => spotifyService.search(q, 15, { throwOnError: true }));
    }
    
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

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search Error:', error);
    return res.status(500).json({ error: 'Failed to fetch tracks' });
  }
};
