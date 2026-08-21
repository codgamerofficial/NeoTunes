import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const QUICK_PLAY_ITEMS = [
  { id: '1', title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80', spatial: true },
  { id: '2', title: 'Midnight City', artist: 'M83', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', spatial: true },
  { id: '3', title: 'Cyberpunk Soundscapes', artist: 'NeoSynth', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80', spatial: false },
  { id: '4', title: 'After Hours', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', spatial: true },
];

const RECENTLY_PLAYED = [
  { id: '5', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', duration: '3:20' },
  { id: '6', title: 'Resonance', artist: 'HOME', album: 'Odyssey', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', duration: '3:32' },
  { id: '7', title: 'Nightcall', artist: 'Kavinsky', album: 'OutRun', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', duration: '4:18' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(QUICK_PLAY_ITEMS[0]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>GOOD EVENING</Text>
            <Text style={styles.headerTitle}>Neo Universe</Text>
          </View>

          <TouchableOpacity style={styles.spatialPill} activeOpacity={0.8} onPress={() => router.push('/profile')}>
            <View style={styles.liveDot} />
            <Text style={styles.spatialText}>N/OS SPATIAL</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Play Grid */}
        <Text style={styles.sectionTitle}>QUICK PLAY</Text>
        <View style={styles.quickGrid}>
          {QUICK_PLAY_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickCard}
              activeOpacity={0.85}
              onPress={() => {
                setCurrentTrack(item);
                setIsPlaying(true);
              }}
            >
              <Image source={{ uri: item.cover }} style={styles.quickCover} />
              <View style={styles.quickInfo}>
                <Text style={styles.quickTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.quickArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recently Played */}
        <Text style={styles.sectionTitle}>RECENTLY PLAYED</Text>
        <View style={styles.recentList}>
          {RECENTLY_PLAYED.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentRow}
              activeOpacity={0.8}
              onPress={() => {
                setCurrentTrack({ ...item, spatial: true });
                setIsPlaying(true);
              }}
            >
              <Image source={{ uri: item.cover }} style={styles.recentCover} />
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle}>{item.title}</Text>
                <Text style={styles.recentSubtitle}>{item.artist} • {item.album}</Text>
              </View>
              <Text style={styles.durationText}>{item.duration}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Mini Player */}
      <TouchableOpacity
        style={styles.miniPlayer}
        activeOpacity={0.9}
        onPress={() => router.push('/player')}
      >
        <Image source={{ uri: currentTrack.cover }} style={styles.miniCover} />
        <View style={styles.miniInfo}>
          <Text style={styles.miniTitle} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.miniArtist} numberOfLines={1}>{currentTrack.artist} • 24-Bit Spatial</Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
          }}
        >
          <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070B',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingText: {
    color: '#DFFF00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  spatialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(223, 255, 0, 0.25)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DFFF00',
  },
  spatialText: {
    color: '#DFFF00',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickCover: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  quickInfo: {
    flex: 1,
    marginLeft: 10,
  },
  quickTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickArtist: {
    color: '#A1A1A6',
    fontSize: 10,
    marginTop: 2,
  },
  recentList: {
    gap: 8,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  recentCover: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  recentSubtitle: {
    color: '#A1A1A6',
    fontSize: 11,
    marginTop: 2,
  },
  durationText: {
    color: '#A1A1A6',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: '#0D111A',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
  },
  miniCover: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  miniArtist: {
    color: '#DFFF00',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DFFF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#05070B',
    fontSize: 12,
    fontWeight: '900',
  },
});
