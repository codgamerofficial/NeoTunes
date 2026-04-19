import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  SafeAreaView, ScrollView, Alert, Dimensions,
  Animated, Easing, Platform,
} from 'react-native';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Heart } from 'lucide-react-native';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './Search';
import ProgressSlider from '../components/ProgressSlider';
import { shadow } from '../lib/shadow';
// NOTE: YouTubeAudioPlayer lives in App.tsx so audio plays globally.

type PlayerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Player'>;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const ART_SIZE = Math.min(SCREEN_W - 56, SCREEN_H * 0.38, 340);

export default function PlayerScreen({ navigation }: PlayerScreenProps) {
  const {
    currentTrack, isPlaying, togglePlay,
    nextTrack, prevTrack,
  } = usePlayerStore();
  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(!!user);

  // ── Rotating artwork animation ──
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      spinRef.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );
      spinRef.current.start();
    } else {
      spinRef.current?.stop();
    }
  }, [isPlaying]);

  // Check if track is already saved
  useEffect(() => {
    const checkSaved = async () => {
      if (!user || !currentTrack) {
        setIsSaved(false);
        return;
      }
      const { data } = await supabase
        .from('saved_tracks')
        .select('id')
        .eq('user_id', user.id)
        .eq('track_id', currentTrack.id)
        .maybeSingle();
      setIsSaved(!!data);
    };
    checkSaved();
  }, [user, currentTrack]);

  // ── Rotating artwork animation ──
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!currentTrack) {
    navigation.goBack();
    return null;
  }

  const saveTrack = async () => {
    if (!user) return Alert.alert('Error', 'You must be logged in to save tracks');
    setIsSaved(true);
    const { error } = await supabase.from('saved_tracks').insert([{
      user_id: user.id,
      track_id: currentTrack.id,
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: currentTrack.artwork,
      color: currentTrack.color,
    }]);
    if (error) {
      setIsSaved(false);
      Alert.alert('Error saving track', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>

      {/* ── Top Bar ── */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronDown stroke="#FFF" size={26} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#FFF', opacity: 0.45, fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4 }}>
            Now Playing
          </Text>
        </View>

        <TouchableOpacity onPress={saveTrack} style={[styles.iconBtn, isSaved && { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }]}>
          <Heart stroke={isSaved ? '#FFF' : '#FFF'} fill={isSaved ? '#FFF' : 'transparent'} size={20} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ── Album Art with rotation ── */}
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 28 }}>
          {/* Outer ring (vinyl look) */}
          <View style={[
            {
              width: ART_SIZE + 24, height: ART_SIZE + 24,
              borderRadius: (ART_SIZE + 24) / 2,
              backgroundColor: '#1C1C1E',
              borderWidth: 4, borderColor: currentTrack.color,
              alignItems: 'center', justifyContent: 'center',
            },
            shadow(`0 8px 32px ${currentTrack.color}60`, {
              shadowColor: currentTrack.color,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 20,
            }),
          ]}>

            {/* Rotating artwork */}
            <Animated.View style={{
              width: ART_SIZE, height: ART_SIZE,
              borderRadius: ART_SIZE / 2,
              overflow: 'hidden',
              borderWidth: 6, borderColor: '#0A0A0A',
              transform: [{ rotate: spin }],
            }}>
              <Image
                source={{ uri: currentTrack.artwork }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </Animated.View>

            {/* Center dot (vinyl hole) */}
            <View style={{
              position: 'absolute', width: 20, height: 20,
              borderRadius: 10, backgroundColor: '#0A0A0A',
              borderWidth: 3, borderColor: currentTrack.color,
            }} />
          </View>
        </View>

        {/* ── Track Info ── */}
        <View style={{ marginBottom: 20 }}>
          {/* Color accent bar */}
          <View style={{ width: 40, height: 4, backgroundColor: currentTrack.color, marginBottom: 10 }} />

          <Text
            style={{ color: '#FFF', fontSize: 26, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 30 }}
            numberOfLines={2}
          >
            {currentTrack.title}
          </Text>
          <Text
            style={{ color: '#FFF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.5, marginTop: 8 }}
            numberOfLines={1}
          >
            {currentTrack.artist}
          </Text>
        </View>

        {/* ── Progress Slider ── */}
        <View style={{ marginBottom: 28 }}>
          <ProgressSlider accentColor={currentTrack.color} />
        </View>

        {/* ── Controls ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>

          {/* Prev */}
          <TouchableOpacity
            onPress={prevTrack}
            style={[styles.skipBtn, shadow('4px 4px 0px rgba(255,255,255,1)', { shadowColor: '#FFF', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 })]}
          >
            <SkipBack stroke="#0A0A0A" fill="#0A0A0A" size={22} />
          </TouchableOpacity>

          {/* Play / Pause */}
          <TouchableOpacity
            onPress={togglePlay}
            style={[
              styles.playBtn,
              { backgroundColor: currentTrack.color },
              shadow(`6px 6px 0px ${currentTrack.color}80`, { shadowColor: currentTrack.color, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 0.8, shadowRadius: 0 }),
            ]}
          >
            {isPlaying
              ? <Pause stroke="#FFF" fill="#FFF" size={32} />
              : <Play stroke="#FFF" fill="#FFF" size={32} />
            }
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            onPress={nextTrack}
            style={[styles.skipBtn, shadow('4px 4px 0px rgba(255,255,255,1)', { shadowColor: '#FFF', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 })]}
          >
            <SkipForward stroke="#0A0A0A" fill="#0A0A0A" size={22} />
          </TouchableOpacity>
        </View>

        {/* ── Extra space ── */}
        <View style={{ height: 32 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles: Record<string, any> = {
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1C1C1E',
    borderWidth: 2, borderColor: '#3C3C3E',
    alignItems: 'center', justifyContent: 'center',
  },
  skipBtn: {
    width: 60, height: 60,
    backgroundColor: '#FFF', borderWidth: 4, borderColor: '#0A0A0A',
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 5, borderColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
  },
};
