import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { ChevronDown, Heart, Share2 } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { fetchTrending } from '../lib/apiClient';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { useJamStore } from '../store/jamStore';
import { shadow } from '../lib/shadow';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';

type ReelsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reels'>;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  color: string;
  source?: string;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReelsScreen({ navigation }: ReelsScreenProps) {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const palette = getThemePalette(themeMode);
  const jamConnected = useJamStore((state) => state.isConnected);
  const jamRole = useJamStore((state) => state.role);

  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView | null>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const loadReels = async () => {
      setLoading(true);
      try {
        const trending = await fetchTrending('global');
        setTracks(trending);
        if (trending.length > 0 && !(jamConnected && jamRole === 'guest')) {
          setQueue(trending);
          setCurrentTrack(trending[0]);
        }
      } catch {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadReels();
  }, [jamConnected, jamRole, setCurrentTrack, setQueue]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / SCREEN_HEIGHT);
    if (index === currentIndexRef.current || !tracks[index]) return;

    if (jamConnected && jamRole === 'guest') {
      return;
    }

    currentIndexRef.current = index;
    setQueue(tracks);
    setCurrentTrack(tracks[index]);
  };

  const handleShare = async (track: Track) => {
    try {
      await Share.share({
        message: `Listening to ${track.title} by ${track.artist} on NeoTune Reels.`,
      });
    } catch {
      Alert.alert('Share Failed', 'Could not share this reel right now.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ position: 'absolute', top: 24, left: 16, zIndex: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(20,20,26,0.75)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronDown stroke={palette.text} size={20} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={palette.accentGlow} />
        </View>
      )}

      {!loading && (
        <ScrollView
          ref={scrollRef}
          pagingEnabled
          onMomentumScrollEnd={handleScroll}
          showsVerticalScrollIndicator={false}
        >
          {tracks.map((track) => (
            <View key={track.id} style={{ height: SCREEN_HEIGHT, padding: 24 }}>
              <View style={{ flex: 1, borderRadius: 24, overflow: 'hidden' }}>
                <Image
                  source={{ uri: track.artwork }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(11,11,15,0.45)',
                  }}
                />
                <View
                  style={[
                    {
                      position: 'absolute',
                      bottom: 32,
                      left: 20,
                      right: 20,
                    },
                    shadow('0px 12px 32px rgba(0,0,0,0.35)'),
                  ]}
                >
                  <Text style={{ color: palette.textMuted, fontSize: 12, letterSpacing: 2 }}>
                    MUSIC REELS
                  </Text>
                  <Text style={{ color: palette.text, fontSize: 28, fontWeight: '800', marginTop: 6 }}>
                    {track.title}
                  </Text>
                  <Text style={{ color: palette.textMuted, fontSize: 16, marginTop: 4 }}>
                    {track.artist}
                  </Text>
                </View>

                <View
                  style={{
                    position: 'absolute',
                    right: 20,
                    bottom: 40,
                    alignItems: 'center',
                    gap: 18,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: 'rgba(20,20,26,0.75)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: palette.border,
                    }}
                  >
                    <Heart stroke={palette.accent} size={22} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShare(track)}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: 'rgba(20,20,26,0.75)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: palette.border,
                    }}
                  >
                    <Share2 stroke={palette.accentGlow} size={22} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
