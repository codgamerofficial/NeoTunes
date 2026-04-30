const spotifyService = require('./services/spotify');

module.exports = async (req, res) => {
  try {
    const { type = 'featured', limit = '12' } = req.query;
    if (type !== 'featured') {
      return res.status(400).json({ error: 'Invalid playlist type. Use featured.' });
    }

    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 20);
    const playlists = await spotifyService.getFeaturedPlaylists({
      limit: normalizedLimit,
      throwOnError: true,
    });
    return res.status(200).json(playlists);
  } catch (error) {
    console.error('Playlists Error:', error);
    return res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};
