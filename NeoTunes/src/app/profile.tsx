import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const PRESETS = ['NEO SIGNATURE', 'PURE', 'WARM', 'DEEP BASS', 'CINEMATIC', 'LIVE'];

export default function ProfileScreen() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState('NEO SIGNATURE');
  const [hiResEnabled, setHiResEnabled] = useState(true);
  const [spatialAtmos, setSpatialAtmos] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>N</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Neo Member</Text>
            <Text style={styles.userEmail}>user@neotunes.app</Text>
            <View style={styles.subPill}>
              <Text style={styles.subText}>NEO TUNES PREMIUM • ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* N/O/S Audio Engine Controls */}
        <Text style={styles.sectionTitle}>N/OS SPATIAL AUDIO ENGINE</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[styles.presetCard, selectedPreset === preset && styles.activePresetCard]}
              onPress={() => setSelectedPreset(preset)}
            >
              <Text style={[styles.presetText, selectedPreset === preset && styles.activePresetText]}>
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences & Toggles */}
        <Text style={styles.sectionTitle}>AUDIO STREAMING QUALITY</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>24-Bit / 96kHz Lossless Audio</Text>
              <Text style={styles.settingSubtitle}>Ultra Hi-Res FLAC studio streaming</Text>
            </View>
            <Switch
              value={hiResEnabled}
              onValueChange={setHiResEnabled}
              trackColor={{ false: '#222', true: '#DFFF00' }}
              thumbColor="#05070B"
            />
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)', paddingTop: 12 }]}>
            <View>
              <Text style={styles.settingTitle}>Dolby Atmos Device Spatialization</Text>
              <Text style={styles.settingSubtitle}>Headphone motion tracking & surround sound</Text>
            </View>
            <Switch
              value={spatialAtmos}
              onValueChange={setSpatialAtmos}
              trackColor={{ false: '#222', true: '#00D9FF' }}
              thumbColor="#05070B"
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </TouchableOpacity>

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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  avatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#DFFF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#05070B',
    fontSize: 24,
    fontWeight: '900',
  },
  profileInfo: {
    marginLeft: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    color: '#A1A1A6',
    fontSize: 11,
    marginTop: 2,
  },
  subPill: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    alignSelf: 'flex-start',
  },
  subText: {
    color: '#00D9FF',
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionTitle: {
    color: '#DFFF00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activePresetCard: {
    backgroundColor: '#DFFF00',
    borderColor: '#DFFF00',
  },
  presetText: {
    color: '#A1A1A6',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  activePresetText: {
    color: '#05070B',
  },
  settingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  settingSubtitle: {
    color: '#A1A1A6',
    fontSize: 11,
    marginTop: 2,
  },
  signOutBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 0, 85, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#FF0055',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
