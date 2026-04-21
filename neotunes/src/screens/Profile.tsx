import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, Platform, TextInput
} from 'react-native';
import { LogOut, Music, Clock, Trash2, RotateCcw, Sun, Moon } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useRecentStore } from '../store/recentStore';
import { clearCache } from '../lib/cache';
import { resetMarketTelemetry } from '../lib/marketTelemetry';
import { shadow } from '../lib/shadow';
import { usePreferencesStore } from '../store/preferencesStore';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { recentTracks, clearRecent } = useRecentStore();
  const { displayName, themeMode, setDisplayName, toggleTheme, loadPreferences } = usePreferencesStore();
  const [draftDisplayName, setDraftDisplayName] = useState('');

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    setDraftDisplayName(displayName);
  }, [displayName]);

  const email = user?.email ?? 'Unknown';
  const profileLabel = displayName !== '' ? displayName : email.split('@')[0] ?? 'Listener';
  const initials = profileLabel.slice(0, 2).toUpperCase();
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const handleSaveProfile = () => {
    setDisplayName(draftDisplayName);
    Alert.alert('Profile Updated', draftDisplayName.trim() === ''
      ? 'Display name cleared. Using email handle instead.'
      : `Display name saved as ${draftDisplayName.trim()}.`
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            // authStore onAuthStateChange fires → user = null → Auth screen shown
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will remove your recently played tracks.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearRecent() },
      ]
    );
  };

  const handleClearCache = async () => {
    await clearCache();
    Alert.alert('Cache Cleared', 'API cache has been reset.');
  };

  const handleResetTelemetry = () => {
    const runReset = async () => {
      await resetMarketTelemetry();
      if (Platform.OS === 'web') {
        if (typeof globalThis.alert === 'function') {
          globalThis.alert('Telemetry Reset\n\nLocal market analytics counters are now zeroed.');
        }
        return;
      }

      Alert.alert('Telemetry Reset', 'Local market analytics counters are now zeroed.');
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis.confirm === 'function'
        ? globalThis.confirm('Reset Market Telemetry\n\nThis resets local CTR and retention proxy counters used for testing.')
        : true;

      if (confirmed) {
        void runReset();
      }
      return;
    }

    Alert.alert(
      'Reset Market Telemetry',
      'This resets local CTR and retention proxy counters used for testing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void runReset();
          },
        },
      ]
    );
  };

  const StatCard = ({ icon, label, value, color }: {
    icon: React.ReactNode; label: string; value: string; color: string;
  }) => (
    <View style={[
      { flex: 1, backgroundColor: color, borderWidth: 4, borderColor: '#0A0A0A', padding: 16, alignItems: 'center' },
      shadow('4px 4px 0px rgba(255,255,255,1)', { shadowColor: '#FFF', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }),
    ]}>
      {icon}
      <Text style={{ color: '#0A0A0A', fontSize: 28, fontWeight: '900', marginTop: 8 }}>{value}</Text>
      <Text style={{ color: '#0A0A0A', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 }}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>

        {/* Header */}
        <Text style={{ color: '#FFF', fontSize: 36, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1, marginBottom: 24 }}>
          Profile.
        </Text>

        {/* Avatar + Email */}
        <View style={[
          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderWidth: 4, borderColor: '#7B61FF', padding: 16, marginBottom: 24 },
          shadow('6px 6px 0px rgba(123,97,255,1)', { shadowColor: '#7B61FF', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 }),
        ]}>
          <View style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: '#7B61FF', borderWidth: 4, borderColor: '#FFF',
            alignItems: 'center', justifyContent: 'center', marginRight: 16,
          }}>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900' }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' }} numberOfLines={1}>
              {profileLabel}
            </Text>
            <Text style={{ color: '#FFF', opacity: 0.65, fontWeight: '700', fontSize: 11, marginTop: 4 }} numberOfLines={1}>
              {email}
            </Text>
            <Text style={{ color: '#FFF', opacity: 0.5, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>
              Member since {joinedDate}
            </Text>
          </View>
        </View>

        <Text style={{ color: '#00D4FF', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>
          Profile Settings
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderWidth: 4,
              borderColor: '#00D4FF',
              color: '#0A0A0A',
              fontWeight: '800',
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
            placeholder="Display Name"
            placeholderTextColor="rgba(10,10,10,0.4)"
            value={draftDisplayName}
            onChangeText={setDraftDisplayName}
            returnKeyType="done"
            onSubmitEditing={handleSaveProfile}
          />
          <TouchableOpacity
            onPress={handleSaveProfile}
            activeOpacity={0.85}
            style={{
              marginLeft: 10,
              backgroundColor: '#00FF85',
              borderWidth: 4,
              borderColor: '#0A0A0A',
              justifyContent: 'center',
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ color: '#0A0A0A', fontWeight: '900', fontSize: 12, textTransform: 'uppercase' }}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <Text style={{ color: '#00FF85', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>
          Your Stats
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 28 }}>
          <StatCard
            icon={<Clock stroke="#0A0A0A" size={24} />}
            label="Recently Played"
            value={String(recentTracks.length)}
            color="#00FF85"
          />
          <StatCard
            icon={<Music stroke="#0A0A0A" size={24} />}
            label="In History"
            value={recentTracks.length > 0 ? `${recentTracks.length}/20` : '0'}
            color="#00D4FF"
          />
        </View>

        {/* Actions */}
        <Text style={{ color: '#7B61FF', fontWeight: '700', fontSize: 14, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 12 }}>
          Account
        </Text>

        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.85}
          style={[
            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderWidth: 4, borderColor: '#FFD700', padding: 16, marginBottom: 12 },
            shadow('4px 4px 0px rgba(255,215,0,1)', { shadowColor: '#FFD700', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }),
          ]}
        >
          {themeMode === 'dark'
            ? <Sun stroke="#FFD700" size={22} />
            : <Moon stroke="#FFD700" size={22} />
          }
          <Text style={{ color: '#FFD700', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 12, flex: 1 }}>
            {themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Text>
        </TouchableOpacity>

        {/* Clear history */}
        <TouchableOpacity
          onPress={handleClearHistory}
          activeOpacity={0.85}
          style={[
            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderWidth: 4, borderColor: '#FFF', padding: 16, marginBottom: 12 },
            shadow('4px 4px 0px rgba(255,255,255,1)', { shadowColor: '#FFF', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }),
          ]}
        >
          <Clock stroke="#FFF" size={22} />
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 12, flex: 1 }}>
            Clear Play History
          </Text>
          <Trash2 stroke="#FFF" size={18} />
        </TouchableOpacity>

        {/* Clear cache */}
        <TouchableOpacity
          onPress={handleClearCache}
          activeOpacity={0.85}
          style={[
            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderWidth: 4, borderColor: '#00D4FF', padding: 16, marginBottom: 12 },
            shadow('4px 4px 0px rgba(0,212,255,1)', { shadowColor: '#00D4FF', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }),
          ]}
        >
          <Trash2 stroke="#00D4FF" size={22} />
          <Text style={{ color: '#00D4FF', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 12, flex: 1 }}>
            Clear API Cache
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetTelemetry}
          activeOpacity={0.85}
          style={[
            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderWidth: 4, borderColor: '#FF9933', padding: 16, marginBottom: 12 },
            shadow('4px 4px 0px rgba(255,153,51,1)', { shadowColor: '#FF9933', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 }),
          ]}
        >
          <RotateCcw stroke="#FF9933" size={22} />
          <Text style={{ color: '#FF9933', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 12, flex: 1 }}>
            Reset Market Telemetry
          </Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.85}
          style={[
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6B6B', borderWidth: 4, borderColor: '#0A0A0A', padding: 18, marginTop: 8 },
            shadow('6px 6px 0px rgba(10,10,10,1)', { shadowColor: '#0A0A0A', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 }),
          ]}
        >
          <LogOut stroke="#FFF" size={22} />
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2, marginLeft: 12 }}>
            Sign Out
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
