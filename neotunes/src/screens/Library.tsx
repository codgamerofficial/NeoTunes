import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Play, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerStore } from '../store/playerStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { useJamStore } from '../store/jamStore';

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

interface Playlist {
  id: string;
  title: string;
  user_id?: string;
  created_at?: string;
}

const LOCAL_PLAYLISTS_KEY = 'neotunes_local_playlists_v1';
const PLAYLISTS_BACKEND_DISABLED_KEY = 'neotunes_playlists_backend_disabled_v1';

function isPlaylistsTableMissing(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  return /public\.playlists/i.test(error.message ?? '');
}

async function getLocalPlaylists(): Promise<Playlist[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PLAYLISTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveLocalPlaylists(playlists: Playlist[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch {
    // Ignore local cache write errors to avoid breaking playback/library UX.
  }
}

async function getPlaylistsBackendDisabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PLAYLISTS_BACKEND_DISABLED_KEY)) === '1';
  } catch {
    return false;
  }
}

async function setPlaylistsBackendDisabled(disabled: boolean): Promise<void> {
  try {
    if (disabled) {
      await AsyncStorage.setItem(PLAYLISTS_BACKEND_DISABLED_KEY, '1');
    } else {
      await AsyncStorage.removeItem(PLAYLISTS_BACKEND_DISABLED_KEY);
    }
  } catch {
    // Ignore local flag persistence errors.
  }
}

function createLocalPlaylist(title: string, userId: string): Playlist {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    user_id: userId,
    created_at: new Date().toISOString(),
  };
}

export default function LibraryScreen({ navigation }: LibraryScreenProps) {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const palette = getThemePalette(themeMode);
  const jamConnected = useJamStore((state) => state.isConnected);
  const jamRole = useJamStore((state) => state.role);

  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistSource, setPlaylistSource] = useState<'remote' | 'local'>('remote');
  const [retryingPlaylists, setRetryingPlaylists] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);
  const { user } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      const fetchLibrary = async () => {
        if (!user) return;
        setLoading(true);

        const tracksRes = await supabase.from('saved_tracks').select('*').order('created_at', { ascending: false });

        if (tracksRes.error) console.error(tracksRes.error);
        else setSavedTracks(tracksRes.data || []);

        const backendDisabled = await getPlaylistsBackendDisabled();
        if (backendDisabled) {
          setPlaylistSource('local');
          setPlaylists(await getLocalPlaylists());
          setLoading(false);
          return;
        }

        const playlistsRes = await supabase.from('playlists').select('*').order('created_at', { ascending: false });
        if (playlistsRes.error) {
          if (isPlaylistsTableMissing(playlistsRes.error)) {
            await setPlaylistsBackendDisabled(true);
            setPlaylistSource('local');
            setPlaylists(await getLocalPlaylists());
          } else {
            console.error(playlistsRes.error);
            setPlaylists([]);
          }
        } else {
          setPlaylistSource('remote');
          setPlaylists((playlistsRes.data as Playlist[]) || []);
          await setPlaylistsBackendDisabled(false);
        }

        setLoading(false);
      };

      fetchLibrary();
    }, [user])
  );

  const playSong = (track: Track) => {
    if (jamConnected && jamRole === 'guest') {
      Alert.alert('Jam Mode Active', 'Only the host can change queue and tracks during a Jam session.');
      return;
    }

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
    const title = newPlaylistTitle.trim();
    if (!title || !user) return;

    if (playlistSource === 'local') {
      const localPlaylist = createLocalPlaylist(title, user.id);
      const nextPlaylists = [localPlaylist, ...playlists];
      setPlaylists(nextPlaylists);
      await saveLocalPlaylists(nextPlaylists);
      setNewPlaylistTitle('');
      return;
    }

    const { data, error } = await supabase.from('playlists').insert([
      { title, user_id: user.id }
    ]).select().single();

    if (error) {
      if (isPlaylistsTableMissing(error)) {
        await setPlaylistsBackendDisabled(true);
        setPlaylistSource('local');

        const existingLocal = await getLocalPlaylists();
        const localPlaylist = createLocalPlaylist(title, user.id);
        const nextPlaylists = [localPlaylist, ...existingLocal];
        setPlaylists(nextPlaylists);
        await saveLocalPlaylists(nextPlaylists);
        setNewPlaylistTitle('');

        Alert.alert(
          'Playlists in Local Mode',
          'Supabase table public.playlists is missing. New playlists are being saved locally until backend schema is applied.',
        );
        return;
      }

      Alert.alert("Error", error.message);
    } else if (data) {
      setPlaylists(prev => [data, ...prev]);
      setNewPlaylistTitle('');
    }
  };

  const retryPlaylistBackend = async () => {
    if (!user || retryingPlaylists) return;
    setRetryingPlaylists(true);

    const playlistsRes = await supabase.from('playlists').select('*').order('created_at', { ascending: false });
    if (playlistsRes.error) {
      if (isPlaylistsTableMissing(playlistsRes.error)) {
        await setPlaylistsBackendDisabled(true);
        setPlaylistSource('local');
        setPlaylists(await getLocalPlaylists());
        Alert.alert('Backend Not Ready', 'public.playlists is still missing. Apply the SQL patch and retry.');
      } else {
        Alert.alert('Backend Error', playlistsRes.error.message);
      }
    } else {
      await setPlaylistsBackendDisabled(false);
      setPlaylistSource('remote');
      setPlaylists((playlistsRes.data as Playlist[]) || []);
      Alert.alert('Backend Connected', 'Playlists are now using Supabase.');
    }

    setRetryingPlaylists(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ flex: 1, padding: 24 }}>
        
        {/* Header */}
        <Text style={{ color: palette.text, fontSize: 36, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1, marginBottom: 32 }}>
          My Library.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* PLAYLISTS SECTION */}
          <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 20, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Playlists</Text>

          {playlistSource === 'local' && (
            <View style={{ backgroundColor: '#2A1A00', borderWidth: 2, borderColor: '#FF9933', padding: 10, marginBottom: 12 }}>
              <Text style={{ color: '#FFB366', fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Backend playlists table missing. Saving playlists locally until schema fix is applied.
              </Text>
              <TouchableOpacity
                onPress={retryPlaylistBackend}
                disabled={retryingPlaylists}
                style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#FF9933', paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 11, textTransform: 'uppercase' }}>
                  {retryingPlaylists ? 'Checking...' : 'Retry Backend'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={{ flexDirection: 'row', marginBottom: 24 }}>
            <TextInput 
              style={{ flex: 1, backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12, fontWeight: 'bold', color: '#0A0A0A', fontSize: 16 }}
              placeholder="NEW PLAYLIST NAME..."
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={newPlaylistTitle}
              onChangeText={setNewPlaylistTitle}
              onSubmitEditing={createPlaylist}
            />
            <TouchableOpacity 
              onPress={createPlaylist}
              style={{ backgroundColor: '#00FF85', justifyContent: 'center', paddingHorizontal: 24, borderLeftWidth: 4, borderLeftColor: '#0A0A0A' }}>
              <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 16 }}>CREATE</Text>
            </TouchableOpacity>
          </View>

          {playlists.map((pl) => (
            <View key={pl.id} style={{ backgroundColor: palette.surface, borderWidth: 2, borderColor: palette.border, padding: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: palette.text, fontSize: 18, fontWeight: '800' }}>{pl.title}</Text>
            </View>
          ))}

          <View style={{ height: 40 }} />

          {/* SAVED TRACKS SECTION */}
          <Text style={{ color: '#7B61FF', fontWeight: 'bold', fontSize: 20, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Saved Tracks</Text>
          {loading ? (
            <ActivityIndicator size="large" color={palette.accentStrong} className="mt-8" />
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
                    <Play stroke="#FFF" fill="#FFF" size={16} style={{ marginLeft: 4 }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center mt-20">
              <View className="w-24 h-24 bg-electricBlue border-4 border-white rounded-full items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,1)] mb-6">
                <Play stroke="#FFF" fill="#FFF" size={40} style={{ marginLeft: 8 }} />
              </View>
              <Text style={{ color: palette.text, fontSize: 24, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 }}>It's quiet here.</Text>
              <Text style={{ color: palette.textMuted, fontWeight: '700', textAlign: 'center', marginTop: 8 }}>
                Go to Search to find and save some tracks to your library.
              </Text>
            </View>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
