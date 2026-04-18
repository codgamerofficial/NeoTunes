import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Play, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';

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
  const [loading, setLoading] = useState(true);
  const { setCurrentTrack, setQueue } = usePlayerStore();
  const { user } = useAuthStore();

  useFocusEffect(
    useCallback(() => {
      const fetchLibrary = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
          .from('saved_tracks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error(error);
        } else {
          setSavedTracks(data || []);
        }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <View style={{ flex: 1, padding: 24 }}>
        
        {/* Header */}
        <Text className="text-white text-4xl font-black uppercase tracking-tighter mb-8">My Library.</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#00FF85" className="mt-8" />
          ) : savedTracks.length > 0 ? (
            <View>
              <Text className="text-neonPurple font-bold text-xl uppercase tracking-widest mb-4">Saved Tracks</Text>
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

      </View>
    </SafeAreaView>
  );
}
