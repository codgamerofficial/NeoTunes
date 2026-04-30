import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { DownloadCloud } from 'lucide-react-native';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { shadow } from '../lib/shadow';

export default function OfflineScreen() {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const palette = getThemePalette(themeMode);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <View
          style={[
            {
              backgroundColor: palette.surface,
              borderRadius: 24,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: palette.border,
            },
            shadow('0px 16px 40px rgba(0,245,255,0.18)'),
          ]}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: 'rgba(0,245,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <DownloadCloud stroke={palette.accentGlow} size={32} />
          </View>
          <Text style={{ color: palette.text, fontSize: 22, fontWeight: '700', textAlign: 'center' }}>
            Download songs to enjoy offline 🎧
          </Text>
          <Text
            style={{
              color: palette.textMuted,
              fontSize: 14,
              textAlign: 'center',
              marginTop: 10,
              lineHeight: 20,
            }}
          >
            Your offline library will appear here once you save tracks for travel or low-data listening.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
