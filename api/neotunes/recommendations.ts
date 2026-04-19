import { type Request, type Response } from 'express';

// Mood-based recommendations without API key
export default async function handler(req: Request, res: Response) {
  const { mood } = req.query;

  if (!mood || typeof mood !== 'string') {
    return res.json([]);
  }

  try {
    const moodQueries: Record<string, string> = {
      'Focus': 'lofi study music chill',
      'Chill': 'chill vibes playlist relax',
      'Gym': 'workout music high energy',
      'Party': 'party hits dance',
      'Happy': 'happy upbeat songs',
      'Sad': 'emotional sad songs',
      'Energy': 'high energy workout',
      'Relax': 'relaxing music calm'
    };

    const searchQuery = moodQueries[mood] || mood;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    const results = [];
    
    // Try Invidious
    const invidiousInstances = ['https://invidious.fdn.app', 'https://yewtu.be'];
    
    for (const instance of invidiousInstances) {
      try {
        const response = await fetch(`${instance}/api/v1/search?q=${encodedQuery}&type=video&limit=10`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          results.push(...data.map((item: any, index: number) => ({
            id: item.videoId || item.id,
            title: item.title,
            artist: item.author || 'Unknown',
            artwork: item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            color: getColorForIndex(index),
            source: 'youtube',
            url: `https://www.youtube.com/watch?v=${item.videoId || item.id}`
          })));
          break;
        }
      } catch (e) {
        continue;
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.json([]);
  }
}

function getColorForIndex(index: number): string {
  const colors = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];
  return colors[index % colors.length];
}