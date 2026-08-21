import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENRES = [
  { id: '1', title: 'SYNTHWAVE', color: '#FF0055', icon: '⚡' },
  { id: '2', title: 'HIP-HOP', color: '#00D9FF', icon: '🎤' },
  { id: '3', title: 'SPATIAL ATMOS', color: '#DFFF00', icon: '🎧' },
  { id: '4', title: 'ELECTRONIC', color: '#7928CA', icon: '🎹' },
  { id: '5', title: 'AMBIENT', color: '#00F5D4', icon: '🌌' },
  { id: '6', title: 'R&B / SOUL', color: '#FF9900', icon: '🎷' },
];

const TRENDING = [
  { id: '10', title: 'Blinding Lights', artist: 'The Weeknd', plays: '2.8B Plays', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
  { id: '11', title: 'Resonance', artist: 'HOME', plays: '1.2B Plays', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
  { id: '12', title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell', plays: '1.9B Plays', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
];

export default function BrowseScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Browse & Discover</Text>
        <Text style={styles.headerSubtitle}>Explore spatial soundscapes and trending genres</Text>

        {/* Genre Grid */}
        <Text style={styles.sectionTitle}>GENRES & MOODS</Text>
        <View style={styles.genreGrid}>
          {GENRES.map((g) => (
            <TouchableOpacity key={g.id} style={[styles.genreCard, { borderColor: g.color }]} activeOpacity={0.85}>
              <Text style={styles.genreIcon}>{g.icon}</Text>
              <Text style={[styles.genreTitle, { color: g.color }]}>{g.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Global Trending Charts */}
        <Text style={styles.sectionTitle}>GLOBAL TOP CHARTS</Text>
        <View style={styles.trendingList}>
          {TRENDING.map((item, idx) => (
            <TouchableOpacity key={item.id} style={styles.trendingRow} activeOpacity={0.8}>
              <Text style={styles.rankNumber}>0{idx + 1}</Text>
              <Image source={{ uri: item.cover }} style={styles.trendingCover} />
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingTitle}>{item.title}</Text>
                <Text style={styles.trendingArtist}>{item.artist}</Text>
              </View>
              <Text style={styles.playsBadge}>{item.plays}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: 90,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#A1A1A6',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#DFFF00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genreCard: {
    width: '48%',
    height: 84,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    padding: 14,
    justifyContent: 'space-between',
  },
  genreIcon: {
    fontSize: 20,
  },
  genreTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  trendingList: {
    gap: 10,
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rankNumber: {
    color: '#DFFF00',
    fontSize: 14,
    fontWeight: '900',
    marginRight: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  trendingCover: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  trendingArtist: {
    color: '#A1A1A6',
    fontSize: 11,
    marginTop: 2,
  },
  playsBadge: {
    color: '#00D9FF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
