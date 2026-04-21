const youtubeService = require('../services/youtube');

module.exports = async (req, res) => {
  try {
    const { region = 'global' } = req.query;
    const allowedRegions = new Set(['global', 'india']);
    if (!allowedRegions.has(region)) {
      return res.status(400).json({ error: 'Invalid region. Use global or india.' });
    }

    const query = region === 'global' ? 'top hits 2024 global' : 'bollywood hits 2024 india';
    
    const results = await youtubeService.search(query, 15, { throwOnError: true });
    return res.status(200).json(results);
  } catch (error) {
    const message = error.message || 'Unknown provider error';
    console.error('Trending Error:', message);
    return res.status(502).json({
      error: 'Trending provider unavailable',
      providerErrors: [
        {
          provider: 'youtube',
          error: message,
        },
      ],
    });
  }
};