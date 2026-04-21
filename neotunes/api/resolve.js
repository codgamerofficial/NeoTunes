const youtubeService = require('../services/youtube');

module.exports = async (req, res) => {
  try {
    const { searchQuery } = req.query;
    if (!searchQuery) {
      return res.status(400).json({ error: 'Missing searchQuery' });
    }
    
    const tracks = await youtubeService.search(searchQuery, 1);
    
    if (tracks.length > 0) {
      return res.status(200).json({ url: null, id: tracks[0].id, resolvedSource: 'youtube' });
    } else {
      return res.status(404).json({ error: 'Could not resolve audio for track.' });
    }
  } catch (error) {
    console.error('Resolve Error:', error);
    return res.status(500).json({ error: 'Failed to resolve' });
  }
};