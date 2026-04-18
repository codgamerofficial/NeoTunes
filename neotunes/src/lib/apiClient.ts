import { Platform } from 'react-native';

// React Native Android emulator maps localhost to 10.0.2.2.
// Web and iOS simulator can use standard localhost.
const BASE_URL = Platform.OS === 'android'
  ? process.env.EXPO_PUBLIC_API_URL_ANDROID ?? 'http://10.0.2.2:4000'
  : process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchSearch(query: string, source: 'youtube' | 'jamendo' | 'all' = 'all') {
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
