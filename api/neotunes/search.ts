import { type Request, type Response } from 'express';

// YouTube search without API key - uses public endpoints
export default async function handler(req: Request, res: Response) {
  const { q, source } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Only process YouTube requests
  if (source !== 'youtube' && source !== 'all') {
    return res.json([]);
  }

  try {
    // Use YouTube's suggest API for autocomplete-style results
    // And scrape search results page for actual video data
    const encodedQuery = encodeURIComponent(q);
    
    // Method 1: Try using Invidious instance (no API key needed)
    const invidiousInstances = [
      'https://invidious.fdn.app',
      'https://invidious.snopyta.org',
      'https://yewtu.be'
    ];
    
    let results = [];
    
    for (const instance of invidiousInstances) {
      try {
        const response = await fetch(`${instance}/api/v1/search?q=${encodedQuery}&type=video&limit=15`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          results = data.map((item: any, index: number) => ({
            id: item.videoId || item.id,
            title: item.title,
            artist: item.author || item.channelId,
            artwork: item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            color: getColorForIndex(index),
            source: 'youtube',
            url: `https://www.youtube.com/watch?v=${item.videoId || item.id}`
          }));
          break;
        }
      } catch (e) {
        console.log(`Invidious instance ${instance} failed, trying next...`);
        continue;
      }
    }
    
    // Method 2: Fallback to YouTube Search via scraping if Invidious fails
    if (results.length === 0) {
      // Use YouTube's mobile search endpoint
      const mobileUrl = `https://m.youtube.com/results?search_query=${encodedQuery}`;
      const html = await fetch(mobileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        }
      }).then(r => r.text());
      
      // Extract JSON data from the HTML
      const jsonMatch = html.match(/var ytInitialData = (.+?);/);
      if (jsonMatch) {
        const ytData = JSON.parse(jsonMatch[1]);
        const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        
        if (contents && contents[0]?.itemSectionRenderer?.contents) {
          const items = contents[0].itemSectionRenderer.contents;
          results = items
            .filter((item: any) => item.videoRenderer)
            .slice(0, 15)
            .map((item: any, index: number) => ({
              id: item.videoRenderer.videoId,
              title: item.videoRenderer.title?.runs?.[0]?.text || 'Unknown',
              artist: item.videoRenderer.shortBylineText?.runs?.[0]?.text || 'Unknown',
              artwork: item.videoRenderer.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoRenderer.videoId}/hqdefault.jpg`,
              color: getColorForIndex(index),
              source: 'youtube',
              url: `https://www.youtube.com/watch?v=${item.videoRenderer.videoId}`
            }));
        }
      }
    }

    res.json(results);
  } catch (error) {
    console.error('YouTube search error:', error);
    res.json([]);
  }
}

function getColorForIndex(index: number): string {
  const colors = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];
  return colors[index % colors.length];
}