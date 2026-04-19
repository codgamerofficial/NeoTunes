import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput as RNTextInput, Modal } from 'react-native';
import { Play, Trash2, X, Music, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import Animated, { FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated';

type LibraryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  color: string;
  track_id?: string;
}

export default function LibraryScreen({ navigation }: LibraryScreenProps) {
  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { setCurrentTrack, setQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const { mode, loadFromStorage } = useThemeStore();
  const theme = getThemeColors(mode);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchLibrary = async () => {
        if (!user) return;
        setLoading(true);
        const [tracksRes, playlistsRes] = await Promise.all([
          supabase.from('saved_tracks').select('*').order('created_at', { ascending: false }),
          supabase.from('playlists').select('*').order('created_at', { ascending: false })
        ]);

        if (tracksRes.error) console.error(tracksRes.error);
        else setSavedTracks(tracksRes.data || []);

        if (playlistsRes.error) console.error(playlistsRes.error);
        else setPlaylists(playlistsRes.data || []);

        setLoading(false);
      };

      fetchLibrary();
    }, [user])
  );

  const playSong = (track: Track) => {
    // Map db schema back to generic track expected by player
    const mappedTrack = {
      id: track.track_id, 
      title: track.title, 
      artist: track.artist, 
      artwork: track.artwork, 
      color: track.color
    };
    
    // Convert all saved tracks to format for queue queue
    const mappedQueue = savedTracks.map(t => ({
      id: t.track_id ?? '', title: t.title, artist: t.artist, artwork: t.artwork, color: t.color
    }));

    setQueue(mappedQueue);
    setCurrentTrack({ ...mappedTrack, id: mappedTrack.id ?? '' });
    navigation.navigate('Player');
  };

  const removeTrack = async (id: string) => {
    const { error } = await supabase.from('saved_tracks').delete().eq('id', id);
    if (!error) {
      setSavedTracks(prev => prev.filter(t => t.id !== id));
    } else {
      Alert.alert("Error removing track", error.message);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistTitle.trim() || !user) return;
    const { data, error } = await supabase.from('playlists').insert([
      { title: newPlaylistTitle.trim(), user_id: user.id }
    ]).select().single();

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data) {
      setPlaylists(prev => [data, ...prev]);
      setNewPlaylistTitle('');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View style={{ flex: 1, padding: 24 }}>
        
        {/* Header */}
        <Text className="text-white text-4xl font-black uppercase tracking-tighter mb-8">My Library.</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* PLAYLISTS SECTION */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
                Playlists
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#00FF85', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}
              >
                <Plus stroke="#0A0A0A" size={16} />
                <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', marginLeft: 4 }}>New</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Playlist cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            {playlists.map((pl, index) => (
              <Animated.View key={pl.id} entering={FadeInUp.delay(index * 80).springify()} style={{ width: '47%' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PlaylistDetail', { playlistId: pl.id, playlistTitle: pl.title })}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: ['#7B61FF', '#00D4FF', '#00FF85', '#FF6B6B', '#FF4ECD'][index % 5],
                    padding: 20, borderRadius: 16, borderWidth: 3, borderColor: '#0A0A0A', minHeight: 120, justifyContent: 'space-between'
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
                    <Music stroke="#0A0A0A" size={20} />
                  </View>
                  <Text style={{ color: '#0A0A0A', fontSize: 16, fontWeight: '900', textTransform: 'uppercase' }} numberOfLines={2}>
                    {pl.title}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* SAVED TRACKS SECTION */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 20, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              Saved Tracks
            </Text>
          </Animated.View>
          {loading ? (
            <ActivityIndicator size="large" color="#00FF85" className="mt-8" />
          ) : savedTracks.length > 0 ? (
            <View>
              {savedTracks.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => playSong(item)}
                  activeOpacity={0.9} 
                  style={{ backgroundColor: item.color }}
                  className="flex-row items-center border-4 border-white p-4 mb-4 shadow-[4px_4px_0px_rgba(255,255,255,1)]"
                >
                  <Image source={{ uri: item.artwork }} className="w-16 h-16 border-2 border-deepBlack mr-4" />
                  <View className="flex-1">
                    <Text className="text-deepBlack font-black text-lg uppercase" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-deepBlack font-bold text-md mt-1">{item.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeTrack(item.id)} className="mr-3">
                    <Trash2 stroke="#0A0A0A" size={24} />
                  </TouchableOpacity>
                  <View className="w-10 h-10 bg-deepBlack rounded-full items-center justify-center">
                    <Play stroke="#FFF" fill="#FFF" size={16} className="ml-1" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center mt-20">
              <View className="w-24 h-24 bg-electricBlue border-4 border-white rounded-full items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,1)] mb-6">
                <Play stroke="#FFF" fill="#FFF" size={40} className="ml-2" />
              </View>
              <Text className="text-white text-2xl font-black uppercase tracking-tighter">It's quiet here.</Text>
              <Text className="text-white/60 font-bold text-center mt-2">Go to Search to find and save some tracks to your library.</Text>
            </View>
          )}
        </ScrollView>

        {/* Create Playlist Modal */}
        <Modal visible={showCreateModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Animated.View entering={SlideInUp.springify()} style={{
              width: '100%', maxWidth: 360, backgroundColor: theme.surface, borderRadius: 24, borderWidth: 4, borderColor: '#7B61FF', padding: 24
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', textTransform: 'uppercase' }}>New Playlist</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <X stroke={theme.text} size={24} />
                </TouchableOpacity>
              </View>
              
              <RNTextInput
                style={{ backgroundColor: theme.background, color: theme.text, fontSize: 16, fontWeight: '700', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: theme.border, textTransform: 'uppercase' }}
                placeholder="PLAYLIST NAME..."
                placeholderTextColor={theme.muted}
                value={newPlaylistTitle}
                onChangeText={setNewPlaylistTitle}
                autoFocus
              />
              
              <View style={{ marginTop: 20, gap: 12 }}>
                <TouchableOpacity
                  onPress={async () => {
                    await createPlaylist();
                    setShowCreateModal(false);
                  }}
                  style={{ backgroundColor: '#00FF85', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 3, borderColor: '#0A0A0A' }}
                >
                  <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' }}>Create Playlist</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowCreateModal(false)}
                  style={{ backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: theme.border }}
                >
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14, textTransform: 'uppercase' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}
