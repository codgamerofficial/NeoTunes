import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TAGS = ['The Weeknd', 'Synthwave', 'Daft Punk', 'Cyberpunk', 'Kavinsky', 'Spatial Audio'];

const INITIAL_RESULTS = [
  { id: '1', title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', album: 'Starboy', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80' },
  { id: '2', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
  { id: '3', title: 'Resonance', artist: 'HOME', album: 'Odyssey', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('The Weeknd');

  const filteredResults = INITIAL_RESULTS.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.artist.toLowerCase().includes(query.toLowerCase()) ||
    query === ''
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Search</Text>

        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists, podcasts..."
            placeholderTextColor="#66666E"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagPill, activeTag === tag && styles.activeTagPill]}
              onPress={() => {
                setActiveTag(tag);
                setQuery(tag);
              }}
            >
              <Text style={[styles.tagText, activeTag === tag && styles.activeTagText]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Results */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            {query.length > 0 ? `RESULTS FOR "${query.toUpperCase()}"` : 'TOP SEARCHES'}
          </Text>

          <View style={styles.resultList}>
            {filteredResults.map((item) => (
              <TouchableOpacity key={item.id} style={styles.resultRow} activeOpacity={0.8}>
                <Image source={{ uri: item.cover }} style={styles.resultCover} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultSubtitle}>{item.artist} • {item.album}</Text>
                </View>
                <Text style={styles.badgeText}>24-BIT SPATIAL</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  clearIcon: {
    color: '#A1A1A6',
    fontSize: 14,
  },
  tagScroll: {
    maxHeight: 36,
    marginBottom: 16,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeTagPill: {
    backgroundColor: '#DFFF00',
    borderColor: '#DFFF00',
  },
  tagText: {
    color: '#A1A1A6',
    fontSize: 11,
    fontWeight: '700',
  },
  activeTagText: {
    color: '#05070B',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  sectionTitle: {
    color: '#DFFF00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  resultList: {
    gap: 10,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  resultCover: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resultSubtitle: {
    color: '#A1A1A6',
    fontSize: 11,
    marginTop: 2,
  },
  badgeText: {
    color: '#00D9FF',
    fontSize: 8.5,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
