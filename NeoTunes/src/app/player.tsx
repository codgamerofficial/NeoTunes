import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function PlayerScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>↓ DISMISS</Text>
        </TouchableOpacity>
        <View style={styles.spatialBadge}>
          <Text style={styles.spatialText}>N/OS SPATIAL • 24-BIT</Text>
        </View>
      </View>

      {/* Main Cover Art */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&q=80' }}
          style={styles.coverImage}
        />
      </View>

      {/* Song Metadata */}
      <View style={styles.metaRow}>
        <View style={styles.metaInfo}>
          <Text style={styles.songTitle}>Starboy</Text>
          <Text style={styles.artistName}>The Weeknd ft. Daft Punk</Text>
        </View>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
          <Text style={[styles.likeIcon, isLiked && styles.likedIcon]}>{isLiked ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '45%' }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>1:45</Text>
          <Text style={styles.timeText}>3:20</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.subCtrlBtn}>
          <Text style={styles.ctrlText}>🔀</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainCtrlBtn}>
          <Text style={styles.ctrlText}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseBtn}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.playPauseText}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainCtrlBtn}>
          <Text style={styles.ctrlText}>⏭</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.subCtrlBtn}>
          <Text style={styles.ctrlText}>🔁</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070B',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    color: '#A1A1A6',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  spatialBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(223, 255, 0, 0.25)',
  },
  spatialText: {
    color: '#DFFF00',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  coverImage: {
    width: 260,
    height: 260,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 50px rgba(0, 217, 255, 0.3)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  artistName: {
    color: '#A1A1A6',
    fontSize: 14,
    marginTop: 4,
  },
  likeIcon: {
    color: '#A1A1A6',
    fontSize: 24,
  },
  likedIcon: {
    color: '#FF0055',
  },
  progressSection: {
    marginVertical: 16,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DFFF00',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#A1A1A6',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  subCtrlBtn: {
    padding: 10,
  },
  mainCtrlBtn: {
    padding: 12,
  },
  ctrlText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DFFF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseText: {
    color: '#05070B',
    fontSize: 18,
    fontWeight: '900',
  },
});
