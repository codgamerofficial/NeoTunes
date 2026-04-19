import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  Image, ActivityIndicator
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp, FadeIn, Layout, BounceIn, SlideInRight } from 'react-native-reanimated';

import { Play, Globe, MapPin, ChevronRight, Sparkles, TrendingUp, Clock } from 'lucide-react-native';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useRecentStore } from '../store/recentStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import { TrackCardSkeleton, TrackRowSkeleton } from '../components/Skeleton';
import { getCached, setCached } from '../lib/cache';
import { fetchRecommendations, fetchTrending as fetchApiTrending } from '../lib/apiClient';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  color: string;
  source?: 'youtube' | 'jamendo' | 'spotify_metadata';
  url?: string;
  album?: string;
  metadataProvider?: 'spotify';
}

const BLOCK_COLORS = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];

const MOOD_QUERIES: Record<string, string> = {
  Focus: 'lofi study music',
  Chill: 'chill vibes playlist',
  Gym: 'workout gym music 2024',
  Party: 'party hits 2024',
};

async function getMoodTracks(query: string): Promise<Track[]> {
  const cacheKey = `mood:${query}`;
  const cached = await getCached<Track[]>(cacheKey);
  if (cached) return cached;
  
  const mood = Object.entries(MOOD_QUERIES).find(([, moodQuery]) => moodQuery === query)?.[0] ?? query;
  const tracks = await fetchRecommendations(mood);
  await setCached(cacheKey, tracks);
  return tracks;
}

function getGreeting(email: string): string {
  const hour = new Date().getHours();
  const name = email?.split('@')[0] ?? 'Listener';
  const capitalised = name.length > 0 
    ? name.charAt(0).toUpperCase() + name.slice(1) 
    : 'Listener';
  if (hour < 12) return `Good morning, ${capitalised} ☀️`;
  if (hour < 17) return `Good afternoon, ${capitalised} 🎵`;
  return `Good evening, ${capitalised} 🌙`;
}


export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { setCurrentTrack, setQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const { recentTracks, loadFromStorage } = useRecentStore();
  const [trending, setTrending] = useState<Track[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingRegion, setTrendingRegion] = useState<'global' | 'india'>('global');
  const [moodTracks, setMoodTracks] = useState<Track[]>([]);
  const [loadingMood, setLoadingMood] = useState(false);
  const [activeMood, setActiveMood] = useState('');

  const { mode, loadFromStorage: loadTheme } = useThemeStore();
  const theme = getThemeColors(mode);

  useEffect(() => {
    loadTheme();
  }, []);

  const greeting = getGreeting(user?.email ?? '');
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'NT';

  const fetchTrending = async (region: 'global' | 'india') => {
    setLoadingTrending(true);
    const cacheKey = `trending:${region}`;
    const cached = await getCached<Track[]>(cacheKey);
    if (cached) {
      setTrending(cached);
      setLoadingTrending(false);
      return;
    }

    fetchApiTrending(region).then(tracks => {
      setTrending(tracks);
      setCached(cacheKey, tracks);
      setLoadingTrending(false);
    }).catch(() => setLoadingTrending(false));
  };

  useEffect(() => {
    loadFromStorage();
    fetchTrending(trendingRegion);
  }, [trendingRegion]);

  const handleMood = async (mood: string) => {
    setMoodTracks([]);
    setActiveMood(mood);
    setLoadingMood(true);
    const tracks = await getMoodTracks(MOOD_QUERIES[mood]).catch(() => []);
    setMoodTracks(tracks);
    setLoadingMood(false);
  };

  const playSong = (track: Track, queue: Track[]) => {
    setQueue(queue);
    setCurrentTrack(track);
    navigation.navigate('Player');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1, padding: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: theme.background }}>

        {/* Header with greeting */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="flex-row justify-between items-center mt-4 mb-2">
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: theme.text, fontSize: 36, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1 }}>
                NeoTunes<Text style={{ color: '#00FF85' }}>.</Text>
              </Text>
              <Text style={{ color: theme.muted, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }} numberOfLines={1}>
                {greeting}
              </Text>
            </View>
            {/* Avatar */}
            <TouchableOpacity style={{ width: 48, height: 48, backgroundColor: '#00FF85', borderWidth: 4, borderColor: theme.text, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 18 }}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── JUMP BACK IN ── */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Clock stroke="#00FF85" size={18} style={{ marginRight: 8 }} />
              <Text style={{ color: '#00FF85', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 3 }}>
                Jump Back In
              </Text>
            </View>
            <ChevronRight stroke="#FFF" size={18} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {recentTracks.slice(0, 5).map((item) => (
              <TouchableOpacity key={item.id} activeOpacity={0.9} style={{ marginRight: 12, width: 140 }}>
                <View style={{ width: 140, height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 3, borderColor: item.color }}>
                  <Image source={{ uri: item.artwork }} style={{ width: '100%', height: '100%' }} />
                </View>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 12, marginTop: 8, textTransform: 'uppercase' }} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── TODAY'S BIGGEST HITS ── */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp stroke="#FF4ECD" size={18} style={{ marginRight: 8 }} />
              <Text style={{ color: '#FF4ECD', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 3 }}>
                Today's Biggest Hits
              </Text>
            </View>
            <ChevronRight stroke="#FFF" size={18} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {trending.slice(0, 6).map((item, index) => (
              <Animated.View key={item.id} entering={BounceIn.delay(index * 50)}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => playSong(item, trending)} style={{ marginRight: 12, width: 100 }}>
                  <View style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#FF4ECD' }}>
                    <Image source={{ uri: item.artwork }} style={{ width: '100%', height: '100%' }} />
                  </View>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 11, marginTop: 6, textTransform: 'uppercase' }} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── NEW RELEASES ── */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Sparkles stroke="#FFD700" size={18} style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFD700', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 3 }}>
                New Releases
              </Text>
            </View>
            <ChevronRight stroke="#FFF" size={18} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {trending.slice(3, 9).map((item, index) => (
              <Animated.View key={item.id} entering={SlideInRight.delay(index * 80).springify()}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => playSong(item, trending)} style={{ marginRight: 12, width: 120 }}>
                  <View style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 3, borderColor: '#FFD700', backgroundColor: item.color }}>
                    <Image source={{ uri: item.artwork }} style={{ width: '100%', height: '100%' }} />
                  </View>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 11, marginTop: 6, textTransform: 'uppercase' }} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── RECENTLY PLAYED ── */}
        {recentTracks.length > 0 && (
          <>
            <Text style={{ color: '#7B61FF', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 10, marginTop: 16 }}>
              Recently Played
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {recentTracks.slice(0, 8).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  onPress={() => playSong(item as any, recentTracks as any)}
                  style={{ marginRight: 12, alignItems: 'center', width: 80 }}
                >
                  <Image
                    source={{ uri: item.artwork }}
                    style={{ width: 72, height: 72, borderWidth: 3, borderColor: item.color, marginBottom: 6 }}
                    resizeMode="cover"
                  />
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', textAlign: 'center' }} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── TRENDING NOW ── */}
        <View className="flex-row justify-between items-center mb-4 mt-2">
          <Text className="text-electricBlue font-bold text-xl uppercase tracking-widest">
            🔥 Trending
          </Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 20, padding: 4 }}>
            <TouchableOpacity
              onPress={() => setTrendingRegion('global')}
              style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                backgroundColor: trendingRegion === 'global' ? '#00D4FF' : 'transparent'
              }}
            >
              <Text style={{
                color: trendingRegion === 'global' ? '#0A0A0A' : '#FFF',
                fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1
              }}>Global</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTrendingRegion('india')}
              style={{
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                backgroundColor: trendingRegion === 'india' ? '#00D4FF' : 'transparent'
              }}
            >
              <Text style={{
                color: trendingRegion === 'india' ? '#0A0A0A' : '#FFF',
                fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1
              }}>India</Text>
            </TouchableOpacity>
          </View>
        </View>
        {loadingTrending ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {[1,2,3].map(i => <TrackCardSkeleton key={i} />)}
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10">
            {trending.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(index * 100).springify()}
                layout={Layout.springify()}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => playSong(item, trending)}
                  className="mr-5 border-4 border-white p-3 w-56 h-68 justify-between shadow-[4px_4px_0px_rgba(255,255,255,1)]"
                  style={{ backgroundColor: item.color, height: 260 }}
                >
                  <Image
                    source={{ uri: item.artwork }}
                    className="w-full border-4 border-deepBlack"
                    style={{ height: 140 }}
                    resizeMode="cover"
                  />
                  <View className="mt-3 flex-1 justify-end">
                    <Text className="text-deepBlack text-lg font-black uppercase tracking-tight" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="text-deepBlack font-bold text-xs mt-1" numberOfLines={1}>
                      {item.artist}
                    </Text>
                    {item.metadataProvider === 'spotify' && (
                      <Text className="text-deepBlack font-black text-[10px] mt-2 uppercase" numberOfLines={1}>
                        Spotify metadata
                      </Text>
                    )}
                  </View>
                  <View className="absolute bottom-3 right-3 w-12 h-12 bg-deepBlack rounded-full items-center justify-center">
                    <Play stroke="#FFF" fill="#FFF" size={18} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        )}

        {/* ── MOOD SELECTOR ── */}
        <Text className="text-acidGreen font-bold text-xl uppercase tracking-widest mb-4">
          Your Mood
        </Text>
        <View className="flex-row flex-wrap justify-between mb-6">
          {Object.keys(MOOD_QUERIES).map((mood, i) => {
            const moodColors = ['#7B61FF', '#1C1C1E', '#00FF85', '#00D4FF'];
            const textColors = ['#FFF', '#FFF', '#0A0A0A', '#0A0A0A'];
            const borderColors = ['#FFF', '#00D4FF', '#0A0A0A', '#0A0A0A'];
            const isActive = activeMood === mood;
            return (
              <TouchableOpacity
                key={mood}
                activeOpacity={0.8}
                onPress={() => handleMood(mood)}
                className="w-[47%] p-6 my-2 border-4"
                style={{
                  backgroundColor: moodColors[i],
                  borderColor: isActive ? '#00FF85' : borderColors[i],
                  shadowColor: isActive ? '#00FF85' : '#FFF',
                  elevation: 4,
                }}
              >
                <Text
                  className="font-black text-xl uppercase"
                  style={{ color: textColors[i] }}
                >
                  {mood}
                </Text>
                {isActive && (
                  <Text style={{ color: textColors[i], opacity: 0.7, fontSize: 11, fontWeight: '700', marginTop: 4 }}>
                    PLAYING ›
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── MOOD RESULTS ── */}
        {activeMood !== '' && (
          <>
            <Text className="text-white font-bold text-lg uppercase tracking-widest mb-4">
              {activeMood} Picks
            </Text>
            {loadingMood ? (
              <ActivityIndicator size="large" color="#7B61FF" className="mb-10" />
            ) : (
              <View className="mb-10">
                {moodTracks.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => playSong(item, moodTracks)}
                    activeOpacity={0.9}
                    className="flex-row items-center border-4 border-white p-4 mb-4 shadow-[4px_4px_0px_rgba(255,255,255,1)]"
                    style={{ backgroundColor: item.color }}
                  >
                    <Image
                      source={{ uri: item.artwork }}
                      className="w-16 h-16 border-2 border-deepBlack mr-4"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-deepBlack font-black text-base uppercase" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text className="text-deepBlack font-bold text-xs mt-1" numberOfLines={1}>
                        {item.album ? `${item.artist} - ${item.album}` : item.artist}
                      </Text>
                      {item.metadataProvider === 'spotify' && (
                        <Text className="text-deepBlack font-black text-[10px] mt-1 uppercase" numberOfLines={1}>
                          Spotify metadata
                        </Text>
                      )}
                    </View>
                    <View className="w-10 h-10 bg-deepBlack rounded-full items-center justify-center ml-2">
                      <Play stroke="#FFF" fill="#FFF" size={16} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Bottom padding: tab bar (80px) + MiniPlayer (72px) + buffer */}
        <View style={{ height: 170 }} />

      </ScrollView>
    </SafeAreaView>
  );
}
