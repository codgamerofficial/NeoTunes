import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Library</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ NEW</Text>
          </TouchableOpacity>
        </View>

        {/* Library Categories */}
        <View style={styles.cardList}>
          <TouchableOpacity style={styles.libCard} activeOpacity={0.85}>
            <View style={[styles.iconBadge, { backgroundColor: '#FF0055' }]}>
              <Text style={styles.iconText}>♥</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Liked Songs</Text>
              <Text style={styles.cardSubtitle}>0 Tracks • Auto-synced</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.libCard} activeOpacity={0.85}>
            <View style={[styles.iconBadge, { backgroundColor: '#00D9FF' }]}>
              <Text style={styles.iconText}>⬇</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Downloaded Tracks</Text>
              <Text style={styles.cardSubtitle}>0 B Used • Offline Storage</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.libCard} activeOpacity={0.85}>
            <View style={[styles.iconBadge, { backgroundColor: '#DFFF00' }]}>
              <Text style={styles.iconText}>🎧</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Spatial Audio Mixes</Text>
              <Text style={styles.cardSubtitle}>N/OS Enhanced Playlists</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Empty State Notification */}
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>YOUR LIBRARY IS CLEAN</Text>
          <Text style={styles.emptyDesc}>
            Like songs, save albums, or create playlists to build your personalized spatial music collection.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#DFFF00',
  },
  addBtnText: {
    color: '#05070B',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardList: {
    gap: 12,
    marginBottom: 24,
  },
  libCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#05070B',
    fontSize: 18,
    fontWeight: '900',
  },
  cardInfo: {
    marginLeft: 14,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#A1A1A6',
    fontSize: 11,
    marginTop: 2,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#DFFF00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptyDesc: {
    color: '#A1A1A6',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
