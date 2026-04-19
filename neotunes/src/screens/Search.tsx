import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, SafeAreaView, ScrollView,
  TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import { Search as SearchIcon, Play, X, Heart, Plus } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore, getThemeColors } from '../store/themeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchSearch } from '../lib/apiClient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export type RootStackParamList = {
  Main: undefined;
  Player: undefined;
  Auth: undefined;
  PlaylistDetail: { playlistId: string; playlistTitle: string };
  ArtistDetail: { artistId: string; artistName: string; artistImage: string; };
};

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Main'>;
};

interface YouTubeItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { high: { url: string } };
  };
}

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

const BLOCK_COLORS = ['#7B61FF', '#00FF85', '#00D4FF', '#FF6B6B', '#FFD700', '#FF4ECD', '#7B61FF', '#00FF85'];

const GENRES = [
  // Main Genres
  { label: 'Hip Hop', query: 'hip hop hits 2024', bg: '#7B61FF', text: '#FFF', border: '#0A0A0A' },
  { label: 'Electronic', query: 'electronic dance music 2024', bg: '#00D4FF', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Rock', query: 'rock music hits 2024', bg: '#00FF85', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Jazz', query: 'jazz music playlist', bg: '#FFF', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Bollywood', query: 'bollywood hits 2024', bg: '#FF6B6B', text: '#FFF', border: '#0A0A0A' },
  { label: 'Pop', query: 'pop music 2024', bg: '#FF4ECD', text: '#FFF', border: '#0A0A0A' },
  { label: 'Classical', query: 'classical music relaxing', bg: '#FFD700', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Lo-Fi', query: 'lofi hip hop chill beats', bg: '#1C1C1E', text: '#FFF', border: '#7B61FF' },
  // Additional Genres
  { label: 'K-Pop', query: 'kpop hits 2024', bg: '#FF1744', text: '#FFF', border: '#0A0A0A' },
  { label: 'Country', query: 'country music 2024', bg: '#FF9100', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'R&B', query: 'r&b hits 2024', bg: '#651FFF', text: '#FFF', border: '#0A0A0A' },
  { label: 'Metal', query: 'heavy metal 2024', bg: '#212121', text: '#FFF', border: '#FF6B6B' },
  { label: 'Punjabi', query: 'punjabi hits 2024', bg: '#FF9800', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Tamil', query: 'tamil songs 2024', bg: '#E91E63', text: '#FFF', border: '#0A0A0A' },
  { label: 'Telugu', query: 'telugu songs 2024', bg: '#9C27B0', text: '#FFF', border: '#0A0A0A' },
  { label: 'Podcast', query: 'podcast popular', bg: '#00BCD4', text: '#0A0A0A', border: '#0A0A0A' },
  // Moods
  { label: 'Chill', query: 'chill vibes playlist', bg: '#80CBC4', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Workout', query: 'workout gym music 2024', bg: '#F44336', text: '#FFF', border: '#0A0A0A' },
  { label: 'Party', query: 'party hits 2024', bg: '#E91E63', text: '#FFF', border: '#0A0A0A' },
  { label: 'Focus', query: 'lofi study music', bg: '#3F51B5', text: '#FFF', border: '#0A0A0A' },
  { label: 'Sleep', query: 'sleep music relaxation', bg: '#5C6BC0', text: '#FFF', border: '#0A0A0A' },
  { label: 'Road Trip', query: 'road trip driving music', bg: '#4CAF50', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Happy', query: 'happy uplifting songs', bg: '#FFEB3B', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Sad', query: 'sad emotional songs', bg: '#607D8B', text: '#FFF', border: '#0A0A0A' },
];

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState('');
  const { setCurrentTrack, setQueue } = usePlayerStore();
  const { mode, loadFromStorage } = useThemeStore();
  const theme = getThemeColors(mode);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const formatted = await fetchSearch(searchQuery, 'all');
      setResults(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveGenre('');
    performSearch(query);
  };

  const handleGenre = (genre: typeof GENRES[0]) => {
    setResults([]);
    setActiveGenre('');
    setQuery('');

    requestAnimationFrame(() => {
      setActiveGenre(genre.label);
      performSearch(genre.query);
    });
  };

  const clearResults = () => {
    setResults([]);
    setActiveGenre('');
    setQuery('');
  };

  const playSong = (track: Track) => {
    setQueue(results);
    setCurrentTrack(track);
    navigation.navigate('Player');
  };

  const showGenres = results.length === 0 && !loading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 24, flex: 1, backgroundColor: theme.background }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ color: theme.text, fontSize: 36, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1 }}>
              {'Search'}
              <Text style={{ color: '#00FF85' }}>.</Text>
            </Text>
          </View>
          {(results.length > 0 || activeGenre) && (
            <TouchableOpacity onPress={clearResults} style={{ padding: 8 }}>
              <X stroke={theme.text} size={24} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Input */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: theme.surface, borderWidth: 4, borderColor: '#00D4FF',
          paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24,
          shadowColor: '#00D4FF', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
        }}>
          <SearchIcon stroke="#0A0A0A" size={22} />
          <TextInput
            style={{ flex: 1, color: '#0A0A0A', fontWeight: '700', fontSize: 18, marginLeft: 12, textTransform: 'uppercase', letterSpacing: 2 }}
            placeholder="FIND MUSIC..."
            placeholderTextColor="rgba(10,10,10,0.4)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X stroke="#0A0A0A" size={18} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

          {/* Active Genre Tag */}
          {activeGenre !== '' && !loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#00FF85', fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 3 }}>
                {activeGenre} Picks
              </Text>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <ActivityIndicator size="large" color="#00D4FF" style={{ marginTop: 40 }} />
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <View>
              {results.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => playSong(item)}
                  activeOpacity={0.88}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: item.color,
                    borderWidth: 4, borderColor: '#FFF',
                    padding: 12, marginBottom: 12,
                    shadowColor: '#FFF', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
                  }}
                >
                  <Image
                    source={{ uri: item.artwork }}
                    style={{ width: 60, height: 60, borderWidth: 2, borderColor: '#0A0A0A', marginRight: 12 }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 15, textTransform: 'uppercase' }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ color: '#0A0A0A', fontWeight: '700', fontSize: 12, marginTop: 4, opacity: 0.7 }} numberOfLines={1}>
                      {item.album ? `${item.artist} - ${item.album}` : item.artist}
                    </Text>
                    {item.metadataProvider === 'spotify' && (
                      <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 10, marginTop: 4, textTransform: 'uppercase' }} numberOfLines={1}>
                        Spotify metadata
                      </Text>
                    )}
                  </View>
                  <View style={{ width: 40, height: 40, backgroundColor: '#0A0A0A', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                    <Play stroke="#FFF" fill="#FFF" size={16} />
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 80 }} />
            </View>
          )}

           {/* Genre Grid - shown when no results */}
           {showGenres && (
             <Animated.View entering={FadeInDown.duration(400)}>
               <Text style={{ color: '#00FF85', fontWeight: '700', fontSize: 16, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16 }}>
                 Browse Genres & Moods
               </Text>
               <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                 {GENRES.map((genre, index) => (
                   <Animated.View key={genre.label} entering={FadeInUp.delay(index * 30).springify()} style={{ width: '47%', marginBottom: 16 }}>
                     <TouchableOpacity
                       onPress={() => handleGenre(genre)}
                       activeOpacity={0.85}
                       style={{
                         width: '100%',
                         backgroundColor: genre.bg,
                         borderWidth: 4,
                         borderColor: genre.border,
                         padding: 20,
                         height: 110,
                         justifyContent: 'flex-end',
                         shadowColor: '#FFF',
                         shadowOffset: { width: 4, height: 4 },
                         shadowOpacity: 1,
                         shadowRadius: 0,
                       }}
                     >
                       <Text style={{ color: genre.text, fontWeight: '900', fontSize: 20, textTransform: 'uppercase' }}>
                         {genre.label}
                       </Text>
                       <Text style={{ color: genre.text, fontWeight: '700', fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                         {'TAP TO EXPLORE ->'}
                       </Text>
                     </TouchableOpacity>
                   </Animated.View>
                 ))}
               </View>
               <View style={{ height: 80 }} />
             </Animated.View>
           )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
