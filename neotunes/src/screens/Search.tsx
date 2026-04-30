import React, { useState } from 'react';
import {
  View, Text, TextInput, SafeAreaView, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, Alert, Platform
} from 'react-native';
import { Search as SearchIcon, Play, X, Mic, Sparkles } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  fetchSearch,
  fetchRecommendations,
  extractApiError,
  type ApiProviderError,
  type SearchSource,
  type SearchType,
} from '../lib/apiClient';
import { type EditorialHint, type EditorialTag, EDITORIAL_TAG_THEME, getEditorialTags } from '../lib/editorial';
import { recordPlaylistGenerated, recordTrackImpressions, recordTrackPlay } from '../lib/marketTelemetry';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { useJamStore } from '../store/jamStore';

export type RootStackParamList = {
  Main: undefined;
  Player: undefined;
  Auth: undefined;
  Settings: undefined;
  Reels: undefined;
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
  source?: string;
  url?: string;
  kind?: SearchType;
  searchQuery?: string;
  followers?: number;
  tracks_total?: number;
  description?: string;
}

type SearchResult = Track;

const BLOCK_COLORS = ['#FF2E63', '#6C5CE7', '#00F5FF', '#FF7AA2', '#8B5CF6', '#4FFBDF', '#FF2E63', '#6C5CE7'];

const GENRES = [
  { label: 'Focus', query: 'focus study playlist', bg: '#1B1B24', text: '#FFFFFF', border: '#6C5CE7' },
  { label: 'Chill', query: 'chill evening vibes', bg: '#14141A', text: '#FFFFFF', border: '#00F5FF' },
  { label: 'Party', query: 'party hits 2024', bg: '#FF2E63', text: '#FFFFFF', border: '#FF2E63' },
  { label: 'Workout', query: 'workout gym music', bg: '#6C5CE7', text: '#FFFFFF', border: '#6C5CE7' },
  { label: 'Happy', query: 'happy feel good songs', bg: '#00F5FF', text: '#0B0B0F', border: '#00F5FF' },
  { label: 'Sad', query: 'sad songs at night', bg: '#2A2A34', text: '#FFFFFF', border: '#FF2E63' },
];

const FILTERS: { label: string; value: SearchType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Track', value: 'track' },
  { label: 'Artist', value: 'artist' },
  { label: 'Album', value: 'album' },
  { label: 'Playlist', value: 'playlist' },
];

function getResultHint(activeGenre: string): EditorialHint {
  if (activeGenre === 'AI Playlist') return 'neutral';
  if (activeGenre === 'Sad') return 'neutral';
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [activeGenre, setActiveGenre] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchType | 'all'>('all');
  const [lastAiGenerated, setLastAiGenerated] = useState<{ trackCount: number; generatedAt: number; mood?: string } | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchProviderErrors, setSearchProviderErrors] = useState<ApiProviderError[]>([]);
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const aiGeneratedLabel = React.useMemo(() => {
    if (!lastAiGenerated) return '';
    const generatedDate = new Date(lastAiGenerated.generatedAt);
    return generatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [lastAiGenerated]);

  const performSearch = async (
    searchQuery: string,
    hint: EditorialHint = 'neutral',
    filter: SearchType | 'all' = activeFilter
  ) => {
    if (!searchQuery.trim()) return;
    setSearchError(null);
    setSearchProviderErrors([]);
    setLoading(true);
    try {
      const normalizedFilter: SearchType = filter === 'all' ? 'track' : filter;
      const source: SearchSource = filter === 'all' || filter === 'track' ? 'all' : 'spotify';
      const formatted = await fetchSearch(searchQuery, source, normalizedFilter);
      const colored = formatted.map((track: Track, index: number) => ({
        ...track,
        color: track.color ?? BLOCK_COLORS[index % BLOCK_COLORS.length],
        kind: track.kind ?? normalizedFilter,
      }));
      setResults(colored);
      if (normalizedFilter === 'track') {
        await recordTrackImpressions(colored, hint);
      }
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
    setLastAiGenerated(null);
    performSearch(query, 'neutral', activeFilter);
  };

  const handleGenre = (genre: typeof GENRES[0]) => {
    setActiveGenre(genre.label);
    setLastAiGenerated(null);
    setQuery('');
    setResults([]);
    const hint: EditorialHint = 'neutral';
    performSearch(genre.query, hint, 'track');
  };

  const handleGenerateAiPlaylist = async () => {
    const prompt = aiPrompt.trim() || 'Chill night vibes';
    setActiveGenre('AI Playlist');
    setSearchError(null);
    setSearchProviderErrors([]);
    setGeneratingAi(true);
    try {
      const response = await fetchRecommendations({ prompt, limit: 20 });
      const tracks = (response?.tracks ?? response ?? []) as Track[];
      const colored = tracks.map((track: Track, index: number) => ({
        ...track,
        color: track.color ?? BLOCK_COLORS[index % BLOCK_COLORS.length],
        kind: 'track',
      }));
      setResults(colored);
      await recordTrackImpressions(colored, 'neutral');
      await recordPlaylistGenerated(colored.length);
      setLastAiGenerated({ trackCount: colored.length, generatedAt: Date.now(), mood: response?.mood });
    } catch (e) {
      const apiError = extractApiError(e, 'Unable to generate AI playlist right now.');
      setSearchError(apiError.message);
      setSearchProviderErrors(apiError.providerErrors);
      setResults([]);
    } finally {
      setGeneratingAi(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setActiveGenre('');
    setLastAiGenerated(null);
    setSearchError(null);
    setSearchProviderErrors([]);
    setQuery('');
    setAiPrompt('');
    setActiveFilter('all');
  };

  const isPlayable = (item: SearchResult) => item.kind === 'track' || !item.kind;

  const playSong = (track: Track) => {
    if (jamConnected && jamRole === 'guest') {
      Alert.alert('Jam Mode Active', 'Only the host can change queue and tracks during a Jam session.');
      return;
    }

    recordTrackPlay(track, getResultHint(activeGenre)).catch(() => {});
    const playableQueue = results.filter(isPlayable) as Track[];
    setQueue(playableQueue);
    setCurrentTrack(track);
    navigation.navigate('Player');
  };

  const handleMetaPlay = (item: SearchResult) => {
    const seedQuery = item.kind === 'artist'
      ? item.title
      : `${item.title} ${item.artist}`;
    setQuery(seedQuery);
    performSearch(seedQuery, 'neutral', 'track');
  };

  const handleVoiceSearch = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Voice Search', 'Voice search is currently available on the web experience.');
      return;
    }

    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert('Voice Search', 'Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setVoiceListening(true);
    recognition.onerror = () => setVoiceListening(false);
    recognition.onend = () => setVoiceListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (transcript) {
        setQuery(transcript);
        performSearch(transcript, 'neutral', activeFilter);
      }
    };
    recognition.start();
  };

  const showGenres = results.length === 0 && !loading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ padding: 24, flex: 1 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: palette.text, fontSize: 28, fontWeight: '700' }}>
              Search
            </Text>
            <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 4 }}>
              Find tracks, artists, albums, and playlists.
            </Text>
          </View>
          {(results.length > 0 || activeGenre !== '') && (
            <TouchableOpacity onPress={clearResults} style={{ padding: 8 }}>
              <X stroke={palette.text} size={22} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          <SearchIcon stroke={palette.textMuted} size={20} />
          <TextInput
            style={{ flex: 1, color: palette.text, fontWeight: '500', fontSize: 16, marginLeft: 10 }}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={palette.textSubtle}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={{ marginRight: 10 }}>
              <X stroke={palette.textMuted} size={18} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleVoiceSearch}>
            <Mic stroke={voiceListening ? palette.accentGlow : palette.textMuted} size={20} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.value;
            return (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setActiveFilter(filter.value)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: active ? palette.accentGlow : palette.border,
                  backgroundColor: active ? 'rgba(0,245,255,0.12)' : palette.surfaceAlt,
                }}
              >
                <Text style={{ color: active ? palette.accentGlow : palette.textMuted, fontSize: 12, fontWeight: '600' }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AI Playlist Generator */}
        <View
          style={{
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.surfaceAlt,
            borderRadius: 20,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Sparkles stroke={palette.accentGlow} size={18} />
            <Text style={{ color: palette.text, fontWeight: '600', marginLeft: 8 }}>
              AI Playlist Generator
            </Text>
          </View>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: palette.text,
              backgroundColor: palette.surface,
            }}
            placeholder="Search by mood or vibe… e.g. Sad songs at night 🌙"
            placeholderTextColor={palette.textSubtle}
            value={aiPrompt}
            onChangeText={setAiPrompt}
          />
          <TouchableOpacity
            onPress={handleGenerateAiPlaylist}
            activeOpacity={0.88}
            style={{
              marginTop: 12,
              backgroundColor: palette.accent,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            {generatingAi ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                Generate AI Playlist
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {lastAiGenerated && (
          <View
            style={{
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: palette.text, fontWeight: '600', fontSize: 12 }}>
              {lastAiGenerated.mood ? `Mood: ${lastAiGenerated.mood}` : 'AI Playlist Ready'}
            </Text>
            <Text style={{ color: palette.textMuted, fontWeight: '500', fontSize: 11 }}>
              {lastAiGenerated.trackCount} tracks • {aiGeneratedLabel}
            </Text>
          </View>
        )}

        {searchError && (
          <View
            style={{
              borderWidth: 1,
              borderColor: palette.accent,
              backgroundColor: palette.dangerSurface,
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: palette.text,
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {searchError}
            </Text>
            {searchProviderErrors.map((providerError, index) => (
              <Text
                key={`${providerError.provider}-${index}`}
                style={{
                  color: palette.textMuted,
                  fontWeight: '500',
                  fontSize: 11,
                  marginTop: 6,
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
                const playable = isPlayable(item);
                const tags = playable ? getEditorialTags(item, getResultHint(activeGenre)) : [];
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => (playable ? playSong(item) : handleMetaPlay(item))}
                    activeOpacity={0.88}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: palette.surface,
                      borderWidth: 1,
                      borderColor: palette.border,
                      borderRadius: 18,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Image
                      source={{ uri: item.artwork }}
                      style={{ width: 60, height: 60, borderRadius: 14, marginRight: 12, backgroundColor: palette.surfaceAlt }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: palette.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={{ color: palette.textMuted, fontWeight: '500', fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                        {item.artist}
                      </Text>
                      {item.kind && item.kind !== 'track' && (
                        <Text style={{ color: palette.accentGlow, fontSize: 11, marginTop: 6, letterSpacing: 1 }}>
                          {item.kind.toUpperCase()}
                        </Text>
                      )}
                      {playable && <EditorialTagStrip tags={tags} />}
                    </View>
                    <View
                      style={{
                        minWidth: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 8,
                        backgroundColor: playable ? palette.accent : 'rgba(0,245,255,0.12)',
                        borderWidth: playable ? 0 : 1,
                        borderColor: palette.accentGlow,
                      }}
                    >
                      {playable ? (
                        <Play stroke="#FFF" fill="#FFF" size={16} />
                      ) : (
                        <Text style={{ color: palette.accentGlow, fontSize: 10, fontWeight: '600' }}>
                          PLAY
                        </Text>
                      )}
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
              <Text style={{ color: palette.text, fontWeight: '600', fontSize: 16, marginBottom: 16 }}>
                Mood Picks
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
                      borderWidth: 1,
                      borderColor: genre.border,
                      padding: 16,
                      marginBottom: 16,
                      height: 110,
                      borderRadius: 18,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Text style={{ color: genre.text, fontWeight: '700', fontSize: 18 }}>
                      {genre.label}
                    </Text>
                    <Text style={{ color: genre.text, fontWeight: '500', fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                      Tap to explore →
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
