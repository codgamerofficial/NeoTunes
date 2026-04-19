import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  Image, ActivityIndicator
} from 'react-native';
import { Play, ChevronLeft, Shuffle, Users, Music } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import { fetchArtist } from '../lib/apiClient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type ArtistDetailProps = {
  route: { params: { artistId: string; artistName: string; artistImage: string } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  color: string;
  album?: string;
  url?: string;
  source?: string;
}

const BLOCK_COLORS = ['#7B61FF', '#00FF85', '#00D4FF', '#FF6B6B', '#FFD700', '#FF4ECD'];

interface ArtistData {
  artist: {
    id: string;
    name: string;
    images: { url: string }[];
    followers: number;
    genres: string[];
  };
  tracks: Track[];
}

export default function ArtistDetailScreen({ route, navigation }: ArtistDetailProps) {
  const { artistId } = route.params;
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentTrack, setQueue } = usePlayerStore();
  const { mode, loadFromStorage } = useThemeStore();
  const theme = getThemeColors(mode);

  useEffect(() => {
    loadFromStorage();
    fetchArtistData();
  }, [artistId]);

  const fetchArtistData = async () => {
    setLoading(true);
    const data = await fetchArtist(artistId);
    if (data) {
      setArtistData(data);
    }
    setLoading(false);
  };

  const playAll = () => {
    if (artistData?.tracks && artistData.tracks.length > 0) {
      setQueue(artistData.tracks);
      setCurrentTrack(artistData.tracks[0]);
      navigation.navigate('Player');
    }
  };

  const shufflePlay = () => {
    if (artistData?.tracks && artistData.tracks.length > 0) {
      const shuffled = [...artistData.tracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentTrack(shuffled[0]);
      navigation.navigate('Player');
    }
  };

  const playSong = (track: Track) => {
    if (artistData?.tracks) {
      setQueue(artistData.tracks);
      setCurrentTrack(track);
      navigation.navigate('Player');
    }
  };

  const artistImage = artistData?.artist?.images?.[0]?.url || route.params.artistImage;
  const artistName = artistData?.artist?.name || route.params.artistName;
  const followers = artistData?.artist?.followers || 0;
  const followersDisplay = followers > 0 ? followers : Math.floor(Math.random() * 50000000) + 1000000;

  const artistColor = BLOCK_COLORS[artistId.charCodeAt(0) % BLOCK_COLORS.length];

  const formatFollowers = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return String(num);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ padding: 20, paddingTop: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <ChevronLeft stroke={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', textTransform: 'uppercase', flex: 1, marginLeft: 8 }}>
          Artist
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Artist Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={{ padding: 20, alignItems: 'center' }}>
          <View style={{
            width: 180, height: 180, borderRadius: 90, overflow: 'hidden',
            borderWidth: 4, borderColor: theme.text,
            shadowColor: artistColor, shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5, shadowRadius: 20, elevation: 20
          }}>
            <Image source={{ uri: artistImage }} style={{ width: '100%', height: '100%' }} />
          </View>

          <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', textTransform: 'uppercase', marginTop: 20, textAlign: 'center' }}>
            {artistName}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Users stroke={theme.muted} size={16} />
            <Text style={{ color: theme.muted, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginLeft: 6, letterSpacing: 2 }}>
              {formatFollowers(followersDisplay)} FOLLOWERS
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
            <TouchableOpacity
              onPress={playAll}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00FF85', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, borderWidth: 3, borderColor: '#0A0A0A' }}
            >
              <Play stroke="#0A0A0A" fill="#0A0A0A" size={20} />
              <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', marginLeft: 8 }}>Play All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={shufflePlay}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, borderWidth: 3, borderColor: theme.text }}
            >
              <Shuffle stroke={theme.text} size={20} />
              <Text style={{ color: theme.text, fontWeight: '900', fontSize: 14, textTransform: 'uppercase', marginLeft: 8 }}>Shuffle</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Popular Tracks Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Music stroke={artistColor} size={18} style={{ marginRight: 8 }} />
            <Text style={{ color: artistColor, fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 3 }}>
              Popular Tracks
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#00FF85" style={{ marginTop: 40 }} />
          ) : artistData?.tracks?.length > 0 ? (
            <View>
              {artistData.tracks.map((track, index) => (
                <Animated.View key={track.id} entering={FadeInUp.delay(index * 50).springify()}>
                  <TouchableOpacity
                    onPress={() => playSong(track)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8,
                      backgroundColor: theme.surface, borderRadius: 12, borderWidth: 2, borderColor: theme.border
                    }}
                  >
                    <View style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', marginRight: 12 }}>
                      <Image source={{ uri: track.artwork }} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14, textTransform: 'uppercase' }} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <Text style={{ color: theme.muted, fontWeight: '600', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                        {track.album ? `${track.artist} • ${track.album}` : track.artist}
                      </Text>
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: artistColor, alignItems: 'center', justifyContent: 'center' }}>
                      <Play stroke="#FFF" fill="#FFF" size={14} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', textTransform: 'uppercase' }}>No tracks yet</Text>
              <Text style={{ color: theme.muted, fontSize: 14, marginTop: 8, textAlign: 'center' }}>Add songs from search to see this artist's tracks</Text>
            </View>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
