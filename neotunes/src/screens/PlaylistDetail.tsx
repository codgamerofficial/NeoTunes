import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  Image, ActivityIndicator
} from 'react-native';
import { Play, ChevronLeft, MoreHorizontal, Shuffle } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type PlaylistDetailProps = {
  route: { params: { playlistId: string; playlistTitle: string } };
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

interface PlaylistTrack {
  id: string;
  track_id: string;
  title: string;
  artist: string;
  artwork: string;
  color: string;
}

const BLOCK_COLORS = ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FFD700', '#FF4ECD'];

export default function PlaylistDetailScreen({ route, navigation }: PlaylistDetailProps) {
  const { playlistId, playlistTitle } = route.params;
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentTrack, setQueue, currentTrack, isPlaying } = usePlayerStore();
  const { user } = useAuthStore();
  const { mode, loadFromStorage } = useThemeStore();
  const theme = getThemeColors(mode);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    const fetchPlaylistTracks = async () => {
      setLoading(true);
      // For now, fetch saved tracks - in full implementation, fetch from playlist_tracks table
      const { data } = await supabase
        .from('saved_tracks')
        .select('*')
        .eq('user_id', user?.id)
        .limit(20);
      setTracks(data || []);
      setLoading(false);
    };
    fetchPlaylistTracks();
  }, [user, playlistId]);

  const playAll = () => {
    if (tracks.length > 0) {
      setQueue(tracks);
      setCurrentTrack(tracks[0]);
      navigation.navigate('Player');
    }
  };

  const shufflePlay = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentTrack(shuffled[0]);
      navigation.navigate('Player');
    }
  };

  const playSong = (track: PlaylistTrack, index: number) => {
    setQueue(tracks);
    setCurrentTrack(track);
    navigation.navigate('Player');
  };

  const playlistColor = BLOCK_COLORS[playlistId.charCodeAt(0) % BLOCK_COLORS.length];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ padding: 20, paddingTop: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <ChevronLeft stroke={theme.text} size={28} />
        </TouchableOpacity>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', textTransform: 'uppercase', flex: 1, marginLeft: 8 }}>
          {playlistTitle}
        </Text>
        <TouchableOpacity style={{ padding: 8 }}>
          <MoreHorizontal stroke={theme.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Playlist Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={{ padding: 20, alignItems: 'center' }}>
          <View style={{
            width: 180, height: 180, borderRadius: 16, backgroundColor: playlistColor,
            borderWidth: 4, borderColor: theme.text, alignItems: 'center', justifyContent: 'center',
            shadowColor: playlistColor, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20
          }}>
            <Text style={{ color: '#0A0A0A', fontSize: 48, fontWeight: '900', textTransform: 'uppercase' }}>
              {playlistTitle.charAt(0)}
            </Text>
          </View>
          
          <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', textTransform: 'uppercase', marginTop: 20, textAlign: 'center' }}>
            {playlistTitle}
          </Text>
          
          <Text style={{ color: theme.muted, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
            {tracks.length} Tracks
          </Text>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
            <TouchableOpacity
              onPress={playAll}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00FF85', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, borderWidth: 3, borderColor: '#0A0A0A' }}
            >
              <Play stroke="#0A0A0A" fill="#0A0A0A" size={20} />
              <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', marginLeft: 8 }}>Play</Text>
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

        {/* Track List */}
        {loading ? (
          <ActivityIndicator size="large" color="#00FF85" style={{ marginTop: 40 }} />
        ) : tracks.length > 0 ? (
          <View style={{ paddingHorizontal: 16 }}>
            {tracks.map((track, index) => (
              <Animated.View key={track.id} entering={FadeInUp.delay(index * 50).springify()}>
                <TouchableOpacity
                  onPress={() => playSong(track, index)}
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
                      {track.artist}
                    </Text>
                  </View>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: playlistColor, alignItems: 'center', justifyContent: 'center' }}>
                    <Play stroke="#FFF" fill="#FFF" size={14} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', textTransform: 'uppercase' }}>No tracks yet</Text>
            <Text style={{ color: theme.muted, fontSize: 14, marginTop: 8, textAlign: 'center' }}>Add songs from search to build your playlist</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
