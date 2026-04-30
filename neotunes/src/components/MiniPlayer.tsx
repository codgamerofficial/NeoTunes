import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, Alert,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, Easing, interpolateColor
} from 'react-native-reanimated';
import { Play, Pause, ChevronUp } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/Search';
import { shadow } from '../lib/shadow';
import EqualizerBars from './EqualizerBars';
import { usePreferencesStore } from '../store/preferencesStore';
import { getThemePalette } from '../lib/themePalette';
import { useJamStore } from '../store/jamStore';

export default function MiniPlayer() {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const palette = getThemePalette(themeMode);
  const jamConnected = useJamStore((state) => state.isConnected);
  const jamRole = useJamStore((state) => state.role);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const controlsLocked = jamConnected && jamRole === 'guest';

  // Slide-in animation
  const slideAnim = useSharedValue(100); 
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    if (currentTrack) {
      slideAnim.value = withSpring(0, {
        mass: 1, damping: 15, stiffness: 120,
      });
    } else {
      slideAnim.value = withTiming(100, { duration: 200 });
    }
  }, [currentTrack]);

  // Pulsing glow when playing
  useEffect(() => {
    if (isPlaying) {
      glowAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      glowAnim.value = withTiming(0, { duration: 300 });
    }
  }, [isPlaying]);

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const animatedInnerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      glowAnim.value,
      [0, 1],
      [palette.border, palette.accentGlow]
    );
    return { borderColor };
  });

  if (!currentTrack) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          bottom: 92,
          left: 0,
          right: 0,
          zIndex: 999,
          paddingHorizontal: 12,
        },
        animatedWrapperStyle,
      ]}
    >
      <Animated.View
        pointerEvents="auto"
        style={[
          {
            backgroundColor: 'rgba(20,20,26,0.92)',
            borderWidth: 1,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
          },
          shadow(
            isPlaying
              ? '0px 12px 32px rgba(0,245,255,0.25)'
              : '0px 8px 24px rgba(0,0,0,0.35)',
            {
              shadowColor: palette.accentGlow,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isPlaying ? 0.35 : 0.2,
              shadowRadius: 16,
              elevation: 14,
            }
          ),
          animatedInnerStyle,
        ]}>

        {/* Artwork */}
        <TouchableOpacity onPress={() => navigation.navigate('Player')} activeOpacity={0.9}>
          <Image
            source={{ uri: currentTrack.artwork }}
            style={{ width: 52, height: 52, borderRadius: 12, marginRight: 12 }}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Track info */}
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('Player')}
          activeOpacity={0.9}
        >
          <Text
            style={{ color: palette.text, fontWeight: '700', fontSize: 14, letterSpacing: 0.3 }}
            numberOfLines={1}
          >
            {currentTrack.title}
          </Text>
          <Text
            style={{ color: palette.textMuted, fontWeight: '500', fontSize: 11, letterSpacing: 0.6, marginTop: 2 }}
            numberOfLines={1}
          >
            {currentTrack.artist}
          </Text>
        </TouchableOpacity>

        {/* Equalizer bars (animated when playing) */}
        <View style={{ marginRight: 12 }}>
          <EqualizerBars color={currentTrack.color} barCount={4} height={20} active={isPlaying} />
        </View>

        {/* Play / Pause */}
        <TouchableOpacity
          onPress={() => {
            if (controlsLocked) {
              Alert.alert('Jam Guest Mode', 'Only the host can control playback in this Jam.');
              return;
            }
            togglePlay();
          }}
          disabled={controlsLocked}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: palette.accent,
            alignItems: 'center', justifyContent: 'center',
            opacity: controlsLocked ? 0.55 : 1,
          }}
        >
          {isPlaying
            ? <Pause stroke="#FFF" fill="#FFF" size={18} />
            : <Play stroke="#FFF" fill="#FFF" size={18} />
          }
        </TouchableOpacity>

        {/* Expand arrow */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Player')}
          style={{ marginLeft: 8 }}
        >
          <ChevronUp stroke={palette.text} size={20} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
