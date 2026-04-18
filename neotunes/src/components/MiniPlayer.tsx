import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image,
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

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
      ['#1C1C1E', '#00FF85'] // #00FF85 can be dynamic color later if wanted
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
          bottom: 80, // sits just above the 80px tab bar
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
            backgroundColor: '#1C1C1E',
            borderWidth: 3,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
          },
        shadow(
          isPlaying
            ? '0px -2px 12px rgba(0,255,133,0.4)'
            : '0px 2px 8px rgba(0,0,0,0.5)',
          {
            shadowColor: '#00FF85',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isPlaying ? 0.4 : 0,
            shadowRadius: 8,
            elevation: 12,
          }
        ),
        animatedInnerStyle,
      ]}>

        {/* Artwork */}
        <TouchableOpacity onPress={() => navigation.navigate('Player')} activeOpacity={0.9}>
          <Image
            source={{ uri: currentTrack.artwork }}
            style={{ width: 52, height: 52, borderWidth: 3, borderColor: currentTrack.color, marginRight: 12 }}
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
            style={{ color: '#FFF', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}
            numberOfLines={1}
          >
            {currentTrack.title}
          </Text>
          <Text
            style={{ color: '#FFF', opacity: 0.5, fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}
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
          onPress={togglePlay}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: currentTrack.color,
            borderWidth: 3, borderColor: '#FFF',
            alignItems: 'center', justifyContent: 'center',
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
          <ChevronUp stroke="#FFF" size={20} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
