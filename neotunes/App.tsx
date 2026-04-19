import './global.css';
import React from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { Home, Search, Library, User, Users } from 'lucide-react-native';

// Screens
import HomeScreen from './src/screens/Home';
import SearchScreen from './src/screens/Search';
import PlayerScreen from './src/screens/Player';
import AuthScreen from './src/screens/Auth';
import LibraryScreen from './src/screens/Library';
import ProfileScreen from './src/screens/Profile';
import PlaylistDetailScreen from './src/screens/PlaylistDetail';
import ArtistsScreen from './src/screens/Artists';
import ArtistDetailScreen from './src/screens/ArtistDetail';

// Components
import MiniPlayer from './src/components/MiniPlayer';
import YouTubeAudioPlayer from './src/components/YouTubeAudioPlayer';

import { useAuthStore } from './src/store/authStore';
import { usePlayerStore } from './src/store/playerStore';
import { isSupabaseConfigured } from './src/lib/supabase';
/**
 * GlobalAudioEngine — mounted once at app root, never unmounts.
 * This is what actually plays audio. Lives outside all screens so
 * tapping play on MiniPlayer, Library, or Home all produce sound.
 */
function GlobalAudioEngine() {
  const { currentTrack, isPlaying, play, pause, nextTrack } = usePlayerStore();

  if (!currentTrack) return null;
  const playbackId = currentTrack.playbackId ?? (currentTrack.source === 'spotify_metadata' ? null : currentTrack.id);
  if (!playbackId) return null;

  const handleStateChange = (state: string) => {
    if (state === 'ended') nextTrack();
    else if (state === 'playing') play();
    else if (state === 'paused') pause();
  };

  return (
    <YouTubeAudioPlayer
      videoId={playbackId}
      play={isPlaying}
      onStateChange={handleStateChange}
    />
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function MainTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0A0A0A',
            borderTopWidth: 4,
            borderTopColor: '#1C1C1E',
            height: 80,
            paddingBottom: 10,
          },
          sceneStyle: { backgroundColor: '#0A0A0A' },
          tabBarActiveTintColor: '#00FF85',
          tabBarInactiveTintColor: '#FFF',
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'HomeTab') return <Home stroke={color} size={size} />;
            if (route.name === 'SearchTab') return <Search stroke={color} size={size} />;
            if (route.name === 'ArtistsTab') return <Users stroke={color} size={size} />;
            if (route.name === 'LibraryTab') return <Library stroke={color} size={size} />;
            if (route.name === 'ProfileTab') return <User stroke={color} size={size} />;
            return null;
          },
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
              {route.name.replace('Tab', '')}
            </Text>
          ),
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeScreen} />
        <Tab.Screen name="SearchTab" component={SearchScreen} />
        <Tab.Screen name="ArtistsTab" component={ArtistsScreen} />
        <Tab.Screen name="LibraryTab" component={LibraryScreen} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Mini Player floats above tab bar on all tabs */}
      <MiniPlayer />
    </View>
  );
}

export default function App() {
  const { user, loading, initialize } = useAuthStore();

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    const cleanup = initialize();
    return cleanup;
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#00FF85', fontSize: 28, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12 }}>
          NeoTunes needs setup
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then rebuild the web app.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00FF85" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Global audio engine — always mounted when a track is selected.
          Placing it outside NavigationContainer means it NEVER unmounts
          when screens change, so audio plays from any screen. */}
      <GlobalAudioEngine />

      <NavigationContainer theme={DarkTheme}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
{user ? (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'modal' }} />
                <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} options={{ presentation: 'card' }} />
                <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ presentation: 'card' }} />
              </>
            ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
