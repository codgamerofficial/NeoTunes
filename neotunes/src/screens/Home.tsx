import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

import { Play, Bell, Settings, Sparkles, ChevronRight } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useRecentStore } from '../store/recentStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import { TrackCardSkeleton } from '../components/Skeleton';
import { getCached, setCached } from '../lib/cache';
import {
  fetchSearch,
  fetchTrending as fetchApiTrending,
  fetchRecommendations,
  fetchFeaturedPlaylists,
  extractApiError,
} from '../lib/apiClient';
import { shadow } from '../lib/shadow';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { useJamStore } from '../store/jamStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_CARD_WIDTH = Math.min(300, SCREEN_WIDTH - 72);

const BLOCK_COLORS = ['#FF2E63', '#6C5CE7', '#00F5FF', '#FF7AA2', '#8B5CF6', '#4FFBDF'];

const MOOD_QUERIES: Record<string, string> = {
  Focus: 'focus study playlist',
  Chill: 'chill evening vibes',
  Energy: 'high energy workout music',
  Romance: 'romantic chill songs',
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  color: string;
  source?: string;
  url?: string;
}

interface FeaturedPlaylist {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  description?: string;
  tracks_total?: number;
}

type TrendingRegion = 'global' | 'india' | 'fusion';

function blendGlobalIndiaTracks(globalTracks: Track[], indiaTracks: Track[], limit = 16): Track[] {
  const output: Track[] = [];
  const seen = new Set<string>();
  const maxLength = Math.max(globalTracks.length, indiaTracks.length);

  for (let i = 0; i < maxLength && output.length < limit; i += 1) {
    const globalTrack = globalTracks[i];
    if (globalTrack && !seen.has(globalTrack.id)) {
      seen.add(globalTrack.id);
      output.push({
        ...globalTrack,
        color: i % 2 === 0 ? '#00F5FF' : globalTrack.color,
      });
    }

    const indiaTrack = indiaTracks[i];
    if (indiaTrack && !seen.has(indiaTrack.id) && output.length < limit) {
      seen.add(indiaTrack.id);
      output.push({
        ...indiaTrack,
        color: i % 2 === 0 ? '#FF2E63' : '#4FFBDF',
      });
    }
  }

  return output;
}

function getGreeting(email: string): string {
  const hour = new Date().getHours();
  const name = email.split('@')[0] ?? 'Listener';
  const capitalised = name.charAt(0).toUpperCase() + name.slice(1);
  if (hour < 12) return `Good morning, ${capitalised} ☀️`;
  if (hour < 17) return `Good afternoon, ${capitalised} 🎵`;
  return `Good evening, ${capitalised} 🌙`;
}

function stripHtml(text = ''): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

async function getMoodTracks(mood: string): Promise<Track[]> {
  const cacheKey = `mood:${mood}`;
  const cached = await getCached<Track[]>(cacheKey);
  if (cached) return cached;

  const response = await fetchRecommendations({ mood: mood.toLowerCase(), prompt: MOOD_QUERIES[mood] ?? mood, limit: 12 });
  const tracks = (response?.tracks ?? response ?? []) as Track[];
  await setCached(cacheKey, tracks);
  return tracks;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const palette = getThemePalette(themeMode);
  const jamConnected = useJamStore((state) => state.isConnected);
  const jamRole = useJamStore((state) => state.role);

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const { user } = useAuthStore();
  const { recentTracks, loadFromStorage } = useRecentStore();

  const [trending, setTrending] = useState<Track[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingRegion, setTrendingRegion] = useState<TrendingRegion>('global');
  const [trendingError, setTrendingError] = useState<string | null>(null);

  const [featuredPlaylists, setFeaturedPlaylists] = useState<FeaturedPlaylist[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const [moodTracks, setMoodTracks] = useState<Track[]>([]);
  const [loadingMood, setLoadingMood] = useState(false);
  const [activeMood, setActiveMood] = useState('');

  const [dailyRecommendations, setDailyRecommendations] = useState<Track[]>([]);
  const [loadingDailyRecommendations, setLoadingDailyRecommendations] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);

  const greeting = getGreeting(user?.email ?? '');
  const heroScrollRef = React.useRef<ScrollView | null>(null);
  const heroIndexRef = React.useRef(0);

  const fetchTrending = async (region: TrendingRegion) => {
    setLoadingTrending(true);
    setTrendingError(null);
    try {
      const cacheKey = `trending:${region}`;
      const cached = await getCached<Track[]>(cacheKey);
      if (cached && cached.length > 0) {
        setTrending(cached);
        return;
      }

      if (region === 'fusion') {
        const [globalTracks, indiaTracks] = await Promise.all([
          fetchApiTrending('global'),
          fetchApiTrending('india'),
        ]);
        const blended = blendGlobalIndiaTracks(globalTracks, indiaTracks);
        setTrending(blended);
        await setCached(cacheKey, blended);
        return;
      }

      const tracks = await fetchApiTrending(region);
      setTrending(tracks);
      await setCached(cacheKey, tracks);
    } catch (error) {
      const apiError = extractApiError(error, 'Unable to load trending right now.');
      setTrendingError(apiError.message);
      setTrending([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  const loadFeaturedPlaylists = async () => {
    setLoadingFeatured(true);
    setFeaturedError(null);
    try {
      const cacheKey = 'featured:playlists';
      const cached = await getCached<FeaturedPlaylist[]>(cacheKey);
      if (cached && cached.length > 0) {
        setFeaturedPlaylists(cached);
        return;
      }

      const playlists = await fetchFeaturedPlaylists(10);
      const normalized = playlists.map((playlist: FeaturedPlaylist) => ({
        ...playlist,
        description: stripHtml(playlist.description ?? ''),
      }));
      setFeaturedPlaylists(normalized);
      await setCached(cacheKey, normalized);
    } catch (error) {
      const apiError = extractApiError(error, 'Unable to load featured playlists right now.');
      setFeaturedError(apiError.message);
      setFeaturedPlaylists([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const loadDailyRecommendations = async () => {
    const email = user?.email ?? 'listener@neotunes.app';
    const dateKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `daily:recs:${email}:${dateKey}`;

    setLoadingDailyRecommendations(true);
    setDailyError(null);

    try {
      const cached = await getCached<Track[]>(cacheKey);
      if (cached && cached.length > 0) {
        setDailyRecommendations(cached);
        return;
      }

      const response = await fetchRecommendations({ prompt: 'daily mix', limit: 12 });
      const tracks = (response?.tracks ?? response ?? []) as Track[];
      const picks = tracks.slice(0, 8).map((track: Track, index: number) => ({
        ...track,
        color: track.color ?? BLOCK_COLORS[index % BLOCK_COLORS.length],
      }));

      setDailyRecommendations(picks);
      await setCached(cacheKey, picks);
    } catch (error) {
      const apiError = extractApiError(error, 'Unable to load AI recommendations right now.');
      setDailyError(apiError.message);
      setDailyRecommendations([]);
    } finally {
      setLoadingDailyRecommendations(false);
    }
  };

  useEffect(() => {
    loadFromStorage();
    fetchTrending(trendingRegion);
  }, [trendingRegion]);

  useEffect(() => {
    loadFeaturedPlaylists();
  }, []);

  useEffect(() => {
    loadDailyRecommendations();
  }, [user?.email]);

  useEffect(() => {
    if (!featuredPlaylists.length) return;
    const interval = setInterval(() => {
      heroIndexRef.current = (heroIndexRef.current + 1) % featuredPlaylists.length;
      heroScrollRef.current?.scrollTo({
        x: heroIndexRef.current * (HERO_CARD_WIDTH + 16),
        animated: true,
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [featuredPlaylists.length]);

  const handleMood = async (mood: string) => {
    setActiveMood(mood);
    setLoadingMood(true);
    const tracks = await getMoodTracks(mood).catch(() => []);
    setMoodTracks(tracks);
    setLoadingMood(false);
  };

  const playSong = (track: Track, queue: Track[]) => {
    if (jamConnected && jamRole === 'guest') {
      Alert.alert('Jam Mode Active', 'Only the host can change queue and tracks during a Jam session.');
      return;
    }

    setQueue(queue);
    setCurrentTrack(track);
    navigation.navigate('Player');
  };

  const handlePlaylistPlay = async (playlist: FeaturedPlaylist) => {
    if (jamConnected && jamRole === 'guest') {
      Alert.alert('Jam Mode Active', 'Only the host can change queue and tracks during a Jam session.');
      return;
    }

    try {
      const tracks = await fetchSearch(`${playlist.title} playlist`, 'youtube');
      if (!tracks.length) {
        Alert.alert('Playback Unavailable', 'No playable tracks found for this playlist yet.');
        return;
      }
      setQueue(tracks);
      setCurrentTrack(tracks[0]);
      navigation.navigate('Player');
    } catch (error) {
      const apiError = extractApiError(error, 'Unable to load playlist right now.');
      Alert.alert('Playlist Error', apiError.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView style={{ flex: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: palette.text, fontSize: 28, fontWeight: '700' }}>
              {greeting}
            </Text>
            <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 4 }}>
              Discover something fresh for your night.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: palette.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              <Bell stroke={palette.textMuted} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: palette.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              <Settings stroke={palette.textMuted} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured playlists */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: palette.text, fontWeight: '600', fontSize: 18, marginBottom: 12 }}>
            Featured Playlists
          </Text>
          {featuredError && (
            <Text style={{ color: palette.textMuted, marginBottom: 12 }}>{featuredError}</Text>
          )}
          {loadingFeatured ? (
            <ActivityIndicator size="small" color={palette.accentGlow} />
          ) : (
            <ScrollView
              ref={heroScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={HERO_CARD_WIDTH + 16}
              decelerationRate="fast"
            >
              {featuredPlaylists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  onPress={() => handlePlaylistPlay(playlist)}
                  activeOpacity={0.9}
                  style={{ marginRight: 16, width: HERO_CARD_WIDTH }}
                >
                  <View
                    style={[
                      {
                        borderRadius: 24,
                        overflow: 'hidden',
                        backgroundColor: palette.surfaceAlt,
                      },
                      shadow('0px 16px 32px rgba(0,0,0,0.3)'),
                    ]}
                  >
                    <Image
                      source={{ uri: playlist.artwork }}
                      style={{ width: '100%', height: 180 }}
                      resizeMode="cover"
                    />
                    <View style={{ padding: 14 }}>
                      <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }} numberOfLines={1}>
                        {playlist.title}
                      </Text>
                      <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }} numberOfLines={2}>
                        {playlist.description || 'Curated by Spotify'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Trending Now */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: palette.text, fontWeight: '600', fontSize: 18 }}>
              Trending Now
            </Text>
            <View style={{ flexDirection: 'row', backgroundColor: palette.surfaceAlt, borderRadius: 18, padding: 4 }}>
              {(['global', 'india', 'fusion'] as TrendingRegion[]).map((region) => (
                <TouchableOpacity
                  key={region}
                  onPress={() => setTrendingRegion(region)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: trendingRegion === region ? palette.accentGlow : 'transparent',
                  }}
                >
                  <Text style={{ color: trendingRegion === region ? '#0B0B0F' : palette.textMuted, fontSize: 11 }}>
                    {region === 'fusion' ? 'Fusion' : region.charAt(0).toUpperCase() + region.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {trendingError && (
            <Text style={{ color: palette.textMuted, marginBottom: 8 }}>{trendingError}</Text>
          )}
          {loadingTrending ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((item) => (
                <TrackCardSkeleton key={item} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trending.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(index * 80).springify()}
                  layout={Layout.springify()}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => playSong(item, trending)}
                    style={{
                      marginRight: 14,
                      width: 190,
                      borderRadius: 20,
                      overflow: 'hidden',
                      backgroundColor: palette.surface,
                      borderWidth: 1,
                      borderColor: palette.border,
                    }}
                  >
                    <Image
                      source={{ uri: item.artwork }}
                      style={{ width: '100%', height: 120 }}
                      resizeMode="cover"
                    />
                    <View style={{ padding: 12 }}>
                      <Text style={{ color: palette.text, fontWeight: '700', fontSize: 14 }} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                        {item.artist}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Made For You (AI) */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Sparkles stroke={palette.accentGlow} size={18} />
            <Text style={{ color: palette.text, fontWeight: '600', fontSize: 18, marginLeft: 8 }}>
              Made For You (AI)
            </Text>
          </View>
          {dailyError && (
            <Text style={{ color: palette.textMuted, marginBottom: 8 }}>{dailyError}</Text>
          )}
          {loadingDailyRecommendations ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((item) => (
                <TrackCardSkeleton key={item} />
              ))}
            </ScrollView>
          ) : dailyRecommendations.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dailyRecommendations.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => playSong(item, dailyRecommendations)}
                  activeOpacity={0.9}
                  style={{
                    marginRight: 14,
                    width: 180,
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: palette.surface,
                    borderWidth: 1,
                    borderColor: palette.border,
                  }}
                >
                  <Image
                    source={{ uri: item.artwork }}
                    style={{ width: '100%', height: 120 }}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 12 }}>
                    <Text style={{ color: palette.text, fontWeight: '700', fontSize: 14 }} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: palette.textMuted, fontSize: 12 }}>
              We are curating your next AI mix.
            </Text>
          )}
        </View>

        {/* Recently Played */}
        {recentTracks.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: palette.text, fontWeight: '600', fontSize: 18, marginBottom: 12 }}>
              Recently Played
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentTracks.slice(0, 8).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  onPress={() => playSong(item as Track, recentTracks as Track[])}
                  style={{ marginRight: 14, alignItems: 'center', width: 90 }}
                >
                  <Image
                    source={{ uri: item.artwork }}
                    style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 6 }}
                    resizeMode="cover"
                  />
                  <Text style={{ color: palette.textMuted, fontSize: 10, textAlign: 'center' }} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Mood Picks */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: palette.text, fontWeight: '600', fontSize: 18, marginBottom: 12 }}>
            Mood Picks
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {Object.keys(MOOD_QUERIES).map((mood) => (
              <TouchableOpacity
                key={mood}
                onPress={() => handleMood(mood)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: activeMood === mood ? palette.accentGlow : palette.border,
                  backgroundColor: activeMood === mood ? 'rgba(0,245,255,0.12)' : palette.surfaceAlt,
                }}
              >
                <Text style={{ color: activeMood === mood ? palette.accentGlow : palette.textMuted, fontSize: 12 }}>
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {loadingMood && <ActivityIndicator size="small" color={palette.accentGlow} />}
          {!loadingMood && moodTracks.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {moodTracks.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => playSong(item, moodTracks)}
                  activeOpacity={0.9}
                  style={{
                    marginRight: 14,
                    width: 170,
                    borderRadius: 18,
                    overflow: 'hidden',
                    backgroundColor: palette.surface,
                    borderWidth: 1,
                    borderColor: palette.border,
                  }}
                >
                  <Image
                    source={{ uri: item.artwork }}
                    style={{ width: '100%', height: 110 }}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 10 }}>
                    <Text style={{ color: palette.text, fontWeight: '700', fontSize: 13 }} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Music Reels */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Reels')}
          activeOpacity={0.9}
          style={{
            borderWidth: 1,
            borderColor: palette.border,
            borderRadius: 20,
            padding: 16,
            backgroundColor: palette.surfaceAlt,
            marginBottom: 40,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: palette.text, fontWeight: '700', fontSize: 16 }}>
                Music Reels
              </Text>
              <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 6 }}>
                Swipe through auto-playing tracks and discover your next obsession.
              </Text>
            </View>
            <ChevronRight stroke={palette.accentGlow} size={20} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
