import { type Request, type Response } from 'express';

// YouTube trending without API key
export default async function handler(req: Request, res: Response) {
  const { region = 'global' } = req.query;

  try {
    const queries = region === 'india' 
      ? ['hindi songs 2024', 'bollywood hits', 'trending india']
      : ['top 50 songs 2024', 'trending music', 'popular songs'];
    
    // Get trending from multiple queries
    const allResults = [];
    
    for (const query of queries) {
      const encodedQuery = encodeURIComponent(query);
      
      // Try Invidious instances
      const invidiousInstances = [
        'https://invidious.fdn.app',
        'https://yewtu.be'
      ];
      
      for (const instance of invidiousInstances) {
        try {
          const response = await fetch(`${instance}/api/v1/search?q=${encodedQuery}&type=video&limit=5`, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            const data = await response.json();
            allResults.push(...data.map((item: any, index: number) => ({
              id: item.videoId || item.id,
              title: item.title,
              artist: item.author || 'Unknown',
              artwork: item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
              color: getColorForIndex(allResults.length + index),
              source: 'youtube',
              url: `https://www.youtube.com/watch?v=${item.videoId || item.id}`
            })));
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Remove duplicates and limit
    const uniqueResults = allResults.filter((v: any, i: number, a: any[]) => 
      a.findIndex((t: any) => t.id === v.id) === i
    ).slice(0, 20);

    res.json(uniqueResults);
  } catch (error) {
    console.error('Trending error:', error);
    res.json([]);
  }
}

function getColorForIndex(index: number): string {
  const colors = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];
  return colors[index % colors.length];
}