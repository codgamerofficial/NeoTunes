const axios = require('axios');
const spotifyService = require('./services/spotify');

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

module.exports = async (req, res) => {
  try {
    const { mood = '', prompt = '', limit = '20' } = req.query;
    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 30);
    const resolvedMood = mood || inferMood(prompt);

    if (AI_SERVICE_URL) {
      try {
        const response = await axios.get(`${AI_SERVICE_URL.replace(/\/$/, '')}/recommendations`, {
          params: { mood: resolvedMood, limit: normalizedLimit },
        });
        if (Array.isArray(response.data?.tracks)) {
          return res.status(200).json({ mood: resolvedMood, tracks: response.data.tracks });
        }
      } catch (error) {
        console.warn('AI service unavailable, falling back to Spotify.', error?.message ?? error);
      }
    }

    const tracks = await spotifyService.getRecommendations({
      mood: resolvedMood,
      limit: normalizedLimit,
      throwOnError: true,
    });

    return res.status(200).json({ mood: resolvedMood, tracks });
  } catch (error) {
    console.error('Recommendations Error:', error);
    return res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};
