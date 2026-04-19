import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  Image, ActivityIndicator
} from 'react-native';
import { Search, UserPlus, UserCheck, Play, ChevronRight, Users } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { fetchArtist } from '../lib/apiClient';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';

type ArtistsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

interface Artist {
  id: string;
  name: string;
  image: string;
  followers: number;
  genres?: string[];
  isFollowing: boolean;
}

const BLOCK_COLORS = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];

// Popular Spotify artist IDs for discovery
const POPULAR_ARTIST_IDS = [
  '06HL4z0CvFAxyc27PXpf04', // Taylor Swift
  '6eUKZXaKkcviH0Ku9w2n3V', // Ed Sheeran
  '3Nrfpe0t9Ji4M1OxyxBEQC', // BTS
  '3TVXtAsR1Inumwj472S9r4', // Drake
  '66CXWjxzNUsdJxJ2JdwvnR', // Ariana Grande
  '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
  '4q3ewBCX7sTwdn101HH05g', // Bad Bunny
  '6M2wZ9GZgrQXHCFfjv46we', // Dua Lipa
  '6qqNVTkY8uBg9cP3Jd7DAH', // Billie Eilish
  '1uNFoZAHBGtllmzznpCI3s', // Justin Bieber
  '2nwWs7gGMY89FZJZDfYRtm', // Shreya Ghoshal
  '4ZAcnRtjSQz5m0AI4tey9K', // Armaan Malik
];

export default function ArtistsScreen({ navigation }: ArtistsScreenProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentTrack, setQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const { mode, loadFromStorage } = useThemeStore();
  const theme = getThemeColors(mode);

  useEffect(() => {
    loadFromStorage();
    fetchPopularArtists();
  }, []);

  const fetchPopularArtists = async () => {
    setLoading(true);
    const artistData: Artist[] = [];

    // Fetch artist details for each popular artist ID
    for (const artistId of POPULAR_ARTIST_IDS) {
      const data = await fetchArtist(artistId);
      if (data?.artist) {
        const spotifyArtist = data.artist;
        // Get best image from Spotify images array
        const imageUrl = spotifyArtist.images?.[0]?.url || spotifyArtist.images?.[spotifyArtist.images.length - 1]?.url || '';
        artistData.push({
          id: spotifyArtist.id,
          name: spotifyArtist.name,
          image: imageUrl,
          followers: spotifyArtist.followers,
          genres: spotifyArtist.genres,
          isFollowing: false
        });
      }
    }

    setArtists(artistData);
    setLoading(false);
  };

  const toggleFollow = (artistId: string) => {
    setArtists(prev => prev.map(artist => 
      artist.id === artistId 
        ? { ...artist, isFollowing: !artist.isFollowing }
        : artist
    ));
  };

  const playTopSongs = (artist: Artist) => {
    navigation.navigate('ArtistDetail', {
      artistId: artist.id,
      artistName: artist.name,
      artistImage: artist.image,
    });
  };

  const followingCount = artists.filter(a => a.isFollowing).length;
  const followedArtists = artists.filter(a => a.isFollowing);

  const formatFollowers = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return String(num);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 24 }}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={{ color: theme.text, fontSize: 36, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1 }}>
            Artists
            <Text style={{ color: '#FF4ECD' }}>.</Text>
          </Text>
          <Text style={{ color: theme.muted, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
            {followingCount} Following
          </Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          {/* Following Section */}
          {followedArtists.length > 0 && (
            <Animated.View entering={FadeInUp.delay(100).duration(400)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <UserCheck stroke="#00FF85" size={18} style={{ marginRight: 8 }} />
                  <Text style={{ color: '#00FF85', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 3 }}>
                    Following
                  </Text>
                </View>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                {followedArtists.map((artist) => (
                  <TouchableOpacity
                    key={artist.id}
                    onPress={() => playTopSongs(artist)}
                    activeOpacity={0.9}
                    style={{ marginRight: 16, alignItems: 'center', width: 100 }}
                  >
                    <View style={{ 
                      width: 80, height: 80, borderRadius: 40, overflow: 'hidden', 
                      borderWidth: 3, borderColor: '#00FF85' 
                    }}>
                      <Image source={{ uri: artist.image }} style={{ width: '100%', height: '100%' }} />
                    </View>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 12, marginTop: 8, textAlign: 'center' }} numberOfLines={1}>
                      {artist.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Popular Artists Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Users stroke="#7B61FF" size={18} style={{ marginRight: 8 }} />
              <Text style={{ color: '#7B61FF', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 3 }}>
                Popular Artists
              </Text>
            </View>
          </Animated.View>

          {loading ? (
            <ActivityIndicator size="large" color="#00FF85" style={{ marginTop: 40 }} />
          ) : (
            <View>
              {artists.map((artist, index) => (
                <Animated.View key={artist.id} entering={FadeInUp.delay(index * 50).springify()}>
                  <TouchableOpacity
                    onPress={() => playTopSongs(artist)}
                    activeOpacity={0.85}
                    style={{
                      flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 12,
                      backgroundColor: theme.surface, borderRadius: 16, borderWidth: 2, borderColor: theme.border
                    }}
                  >
                    <View style={{ 
                      width: 60, height: 60, borderRadius: 30, overflow: 'hidden', 
                      borderWidth: 2, borderColor: BLOCK_COLORS[index % BLOCK_COLORS.length] 
                    }}>
                      <Image source={{ uri: artist.image }} style={{ width: '100%', height: '100%' }} />
                    </View>
                    
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: theme.text, fontWeight: '800', fontSize: 15, textTransform: 'uppercase' }} numberOfLines={1}>
                        {artist.name}
                      </Text>
                      <Text style={{ color: theme.muted, fontWeight: '600', fontSize: 12, marginTop: 2 }}>
                        {formatFollowers(artist.followers)} followers
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => toggleFollow(artist.id)}
                      style={{
                        width: 40, height: 40, borderRadius: 20, 
                        backgroundColor: artist.isFollowing ? '#00FF85' : 'transparent',
                        borderWidth: 2, borderColor: '#00FF85', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {artist.isFollowing ? (
                        <UserCheck stroke="#0A0A0A" size={18} />
                      ) : (
                        <UserPlus stroke="#00FF85" size={18} />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}