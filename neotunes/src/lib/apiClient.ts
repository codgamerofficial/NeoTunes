import { Platform } from 'react-native';

// React Native Android emulator maps localhost to 10.0.2.2.
// For web, connect directly to the API server on localhost:4000
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:4000'
  : Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000';

export async function fetchSearch(query: string, source: 'youtube' | 'jamendo' | 'spotify' | 'all' = 'all') {
  try {
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&source=${source}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('API Error (Search):', err);
    return [];
  }
}

export async function fetchTrending(region: 'global' | 'india' = 'global') {
  try {
    const res = await fetch(`${BASE_URL}/trending?region=${region}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('API Error (Trending):', err);
    return [];
  }
}

export async function fetchRecommendations(mood: string) {
  try {
    const res = await fetch(`${BASE_URL}/recommendations?mood=${encodeURIComponent(mood)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('API Error (Recommendations):', err);
    return [];
  }
}

export async function fetchResolve(searchQuery: string) {
  try {
    const res = await fetch(`${BASE_URL}/resolve?searchQuery=${encodeURIComponent(searchQuery)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('API Error (Resolve):', err);
    return null;
  }
}

export async function fetchArtist(artistId: string) {
  try {
    const res = await fetch(`${BASE_URL}/artist/${encodeURIComponent(artistId)}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('API Error (Artist):', err);
    return null;
  }
}
