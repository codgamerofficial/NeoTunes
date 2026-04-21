import React, { useState } from 'react';
import {
  View, Text, TextInput, SafeAreaView, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, Alert
} from 'react-native';
import { Search as SearchIcon, Play, X } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchSearch, fetchTrending, extractApiError, type ApiProviderError } from '../lib/apiClient';
import { type EditorialHint, type EditorialTag, EDITORIAL_TAG_THEME, getEditorialTags } from '../lib/editorial';
import { recordPlaylistGenerated, recordTrackImpressions, recordTrackPlay } from '../lib/marketTelemetry';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { useJamStore } from '../store/jamStore';

export type RootStackParamList = {
  Main: undefined;
  Player: undefined;
  Auth: undefined;
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
  source?: 'youtube' | 'jamendo';
  url?: string;
}

const BLOCK_COLORS = ['#7B61FF', '#00FF85', '#00D4FF', '#FF6B6B', '#FFD700', '#FF4ECD', '#7B61FF', '#00FF85'];

const GENRES = [
  { label: 'Hip Hop', query: 'hip hop hits 2024', bg: '#7B61FF', text: '#FFF', border: '#0A0A0A' },
  { label: 'Electronic', query: 'electronic dance music 2024', bg: '#00D4FF', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Rock', query: 'rock music hits 2024', bg: '#00FF85', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Jazz', query: 'jazz music playlist', bg: '#FFF', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Bollywood', query: 'bollywood hits 2024', bg: '#FF6B6B', text: '#FFF', border: '#0A0A0A' },
  { label: 'Pop', query: 'pop music 2024', bg: '#FF4ECD', text: '#FFF', border: '#0A0A0A' },
  { label: 'Classical', query: 'classical music relaxing', bg: '#FFD700', text: '#0A0A0A', border: '#0A0A0A' },
  { label: 'Lo-Fi', query: 'lofi hip hop chill beats', bg: '#1C1C1E', text: '#FFF', border: '#7B61FF' },
];

function blendGlobalIndiaTracks(globalTracks: Track[], indiaTracks: Track[], limit = 24): Track[] {
  const output: Track[] = [];
  const seen = new Set<string>();
  const maxLength = Math.max(globalTracks.length, indiaTracks.length);

  for (let i = 0; i < maxLength && output.length < limit; i += 1) {
    const globalTrack = globalTracks[i];
    if (globalTrack && !seen.has(globalTrack.id)) {
      seen.add(globalTrack.id);
      output.push({
        ...globalTrack,
        color: i % 2 === 0 ? '#00D4FF' : globalTrack.color,
      });
    }

    const indiaTrack = indiaTracks[i];
    if (indiaTrack && !seen.has(indiaTrack.id) && output.length < limit) {
      seen.add(indiaTrack.id);
      output.push({
        ...indiaTrack,
        color: i % 2 === 0 ? '#FF9933' : '#00FF85',
      });
    }
  }

  return output;
}

function getResultHint(activeGenre: string): EditorialHint {
  if (activeGenre === 'Global x India') return 'fusion';
  if (activeGenre === 'Bollywood') return 'india';
  return 'neutral';
}

function EditorialTagStrip({ tags }: { tags: EditorialTag[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
      {tags.slice(0, 3).map((tag) => {
        const theme = EDITORIAL_TAG_THEME[tag];
        return (
          <View
            key={tag}
            style={{
              backgroundColor: theme.background,
              borderColor: theme.border,
              borderWidth: 2,
              paddingHorizontal: 6,
              paddingVertical: 2,
              marginRight: 6,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontWeight: '900',
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              {tag}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const palette = getThemePalette(themeMode);
  const jamConnected = useJamStore((state) => state.isConnected);
  const jamRole = useJamStore((state) => state.role);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingFusion, setGeneratingFusion] = useState(false);
  const [activeGenre, setActiveGenre] = useState('');
  const [lastFusionGenerated, setLastFusionGenerated] = useState<{ trackCount: number; generatedAt: number } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchProviderErrors, setSearchProviderErrors] = useState<ApiProviderError[]>([]);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const fusionGeneratedLabel = React.useMemo(() => {
    if (!lastFusionGenerated) return '';
    const generatedDate = new Date(lastFusionGenerated.generatedAt);
    return generatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [lastFusionGenerated]);

  const performSearch = async (searchQuery: string, hint: EditorialHint = 'neutral') => {
    if (!searchQuery.trim()) return;
    setSearchError(null);
    setSearchProviderErrors([]);
    setLoading(true);
    try {
      const formatted = await fetchSearch(searchQuery, 'all');
      setResults(formatted);
      await recordTrackImpressions(formatted, hint);
    } catch (e) {
      const apiError = extractApiError(e, 'Unable to fetch tracks right now.');
      setSearchError(apiError.message);
      setSearchProviderErrors(apiError.providerErrors);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveGenre('');
    setLastFusionGenerated(null);
    performSearch(query, 'neutral');
  };

  const handleGenre = (genre: typeof GENRES[0]) => {
    setActiveGenre(genre.label);
    setLastFusionGenerated(null);
    setQuery('');
    setResults([]);
    const hint: EditorialHint = genre.label === 'Bollywood' ? 'india' : 'neutral';
    performSearch(genre.query, hint);
  };

  const handleGenerateFusionPlaylist = async () => {
    setActiveGenre('Global x India');
    setQuery('');
    setSearchError(null);
    setSearchProviderErrors([]);
    setLoading(true);
    setGeneratingFusion(true);
    try {
      const [globalTracks, indiaTracks] = await Promise.all([
        fetchTrending('global'),
        fetchTrending('india'),
      ]);
      const blended = blendGlobalIndiaTracks(globalTracks, indiaTracks);
      setResults(blended);
      await recordTrackImpressions(blended, 'fusion');
      await recordPlaylistGenerated(blended.length);
      setLastFusionGenerated({ trackCount: blended.length, generatedAt: Date.now() });
    } catch (e) {
      const apiError = extractApiError(e, 'Unable to generate fusion playlist right now.');
      setSearchError(apiError.message);
      setSearchProviderErrors(apiError.providerErrors);
      setResults([]);
    } finally {
      setLoading(false);
      setGeneratingFusion(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setActiveGenre('');
    setLastFusionGenerated(null);
    setSearchError(null);
    setSearchProviderErrors([]);
    setQuery('');
  };

  const playSong = (track: Track) => {
    if (jamConnected && jamRole === 'guest') {
      Alert.alert('Jam Mode Active', 'Only the host can change queue and tracks during a Jam session.');
      return;
    }

    recordTrackPlay(track, getResultHint(activeGenre)).catch(() => {});
    setQueue(results);
    setCurrentTrack(track);
    navigation.navigate('Player');
  };

  const showGenres = results.length === 0 && !loading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ padding: 24, flex: 1 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: palette.text, fontSize: 36, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1 }}>
            {'Search.'}
          </Text>
          {(results.length > 0 || activeGenre !== '') && (
            <TouchableOpacity onPress={clearResults} style={{ padding: 8 }}>
              <X stroke={palette.text} size={24} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Input */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#FFF', borderWidth: 4, borderColor: palette.accent,
          paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24,
          shadowColor: palette.accent, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
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

        <TouchableOpacity
          onPress={handleGenerateFusionPlaylist}
          activeOpacity={0.88}
          style={{
            borderWidth: 4,
            borderColor: palette.border,
            backgroundColor: palette.surface,
            padding: 14,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: palette.accent,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: palette.accent, fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
              Global x India Playlist
            </Text>
            <Text style={{ color: palette.textMuted, fontWeight: '700', fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              One tap to generate a blended cross-market playlist for worldwide and India-first audiences.
            </Text>
          </View>
          <View
            style={{
              minWidth: 86,
              borderWidth: 3,
              borderColor: palette.accent,
              backgroundColor: palette.accent,
              paddingHorizontal: 10,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            {generatingFusion ? (
              <ActivityIndicator size="small" color="#0A0A0A" />
            ) : (
              <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                {lastFusionGenerated ? 'Regenerate' : 'Generate'}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {lastFusionGenerated && (
          <View
            style={{
              borderWidth: 3,
              borderColor: palette.accentStrong,
              backgroundColor: palette.surface,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: palette.accentStrong, fontWeight: '900', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
              Generated Playlist
            </Text>
            <Text style={{ color: palette.textMuted, fontWeight: '700', fontSize: 10, textTransform: 'uppercase' }}>
              {lastFusionGenerated.trackCount} tracks at {fusionGeneratedLabel}
            </Text>
          </View>
        )}

        {searchError && (
          <View
            style={{
              borderWidth: 3,
              borderColor: '#FF6B6B',
              backgroundColor: palette.dangerSurface,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: '#FF9D9D',
                fontWeight: '900',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {searchError}
            </Text>
            {searchProviderErrors.map((providerError, index) => (
              <Text
                key={`${providerError.provider}-${index}`}
                style={{
                  color: '#FFFFFF',
                  opacity: 0.85,
                  fontWeight: '700',
                  fontSize: 10,
                  marginTop: 6,
                  textTransform: 'uppercase',
                }}
              >
                {providerError.provider}: {providerError.error}
              </Text>
            ))}
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

          {/* Active Genre Tag */}
          {activeGenre !== '' && !loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: palette.accentStrong, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 3 }}>
                {activeGenre} Picks
              </Text>
            </View>
          )}

          {/* Loading */}
          {loading && (
            <ActivityIndicator size="large" color={palette.accent} style={{ marginTop: 40 }} />
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <View>
              {results.map((item) => {
                const tags = getEditorialTags(item, getResultHint(activeGenre));
                return (
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
                        {item.artist}
                      </Text>
                      <EditorialTagStrip tags={tags} />
                    </View>
                    <View style={{ width: 40, height: 40, backgroundColor: '#0A0A0A', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                      <Play stroke="#FFF" fill="#FFF" size={16} />
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 80 }} />
            </View>
          )}

          {/* Genre Grid - shown when no results */}
          {showGenres && (
            <View>
              <Text style={{ color: palette.accentStrong, fontWeight: '700', fontSize: 16, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 16 }}>
                Browse Genres
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {GENRES.map((genre) => (
                  <TouchableOpacity
                    key={genre.label}
                    onPress={() => handleGenre(genre)}
                    activeOpacity={0.85}
                    style={{
                      width: '47%',
                      backgroundColor: genre.bg,
                      borderWidth: 4,
                      borderColor: genre.border,
                      padding: 20,
                      marginBottom: 16,
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
                      TAP TO EXPLORE →
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ height: 80 }} />
            </View>
          )}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
