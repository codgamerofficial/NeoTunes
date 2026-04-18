/**
 * ProgressSlider.tsx
 * Premium playback progress bar with:
 *  - Draggable slider (react-native-community/slider)
 *  - Current time / Duration display
 *  - Decorative animated waveform bars behind the slider
 *  - Brutalist blocky time labels
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Platform, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/playerStore';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// 40 bars of random heights — decorative waveform
const WAVE_HEIGHTS = Array.from({ length: 40 }, (_, i) =>
  Math.sin(i * 0.4) * 12 + Math.cos(i * 0.9) * 8 + 18
);

interface Props {
  accentColor?: string;
}

export default function ProgressSlider({ accentColor = '#00FF85' }: Props) {
  const { currentTime, duration, seekTo } = usePlayerStore();
  const { isPlaying } = usePlayerStore();
  const [sliding, setSliding] = useState(false);
  const [slideValue, setSlideValue] = useState(0);

  // While sliding, show the slide value; otherwise show store currentTime
  const displayTime = sliding ? slideValue : currentTime;
  const progress = duration > 0 ? displayTime / duration : 0;

  // Animate waveform bars
  const waveAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
          Animated.timing(waveAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
        ])
      ).start();
    } else {
      waveAnim.setValue(0);
    }
  }, [isPlaying]);

  return (
    <View style={{ width: '100%' }}>

      {/* ── Waveform decoration ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', height: 52,
        marginBottom: 4, overflow: 'hidden', paddingHorizontal: 2,
      }}>
        {WAVE_HEIGHTS.map((baseH, i) => {
          const isFilled = i / WAVE_HEIGHTS.length < progress;
          return (
            <Animated.View
              key={i}
              style={{
                flex: 1,
                marginHorizontal: 1,
                borderRadius: 2,
                backgroundColor: isFilled ? accentColor : '#2C2C2E',
                height: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    baseH * 0.6,
                    isFilled ? baseH : baseH * 0.4,
                  ],
                }),
                opacity: isFilled ? 1 : 0.4,
              }}
            />
          );
        })}
      </View>

      {/* ── Slider ── */}
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={Math.max(duration, 1)}
        value={sliding ? slideValue : currentTime}
        minimumTrackTintColor={accentColor}
        maximumTrackTintColor="#2C2C2E"
        thumbTintColor={accentColor}
        onSlidingStart={() => {
          setSliding(true);
          setSlideValue(currentTime);
        }}
        onValueChange={(v) => setSlideValue(v)}
        onSlidingComplete={(v) => {
          setSliding(false);
          seekTo(v);
        }}
      />

      {/* ── Time labels ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 2 }}>
        <View style={{
          backgroundColor: '#1C1C1E', borderWidth: 2, borderColor: accentColor,
          paddingHorizontal: 8, paddingVertical: 3,
        }}>
          <Text style={{ color: accentColor, fontWeight: '900', fontSize: 12, fontVariant: ['tabular-nums'] }}>
            {formatTime(displayTime)}
          </Text>
        </View>
        <View style={{
          backgroundColor: '#1C1C1E', borderWidth: 2, borderColor: '#3C3C3E',
          paddingHorizontal: 8, paddingVertical: 3,
        }}>
          <Text style={{ color: '#FFF', opacity: 0.5, fontWeight: '900', fontSize: 12, fontVariant: ['tabular-nums'] }}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

    </View>
  );
}
