/**
 * EqualizerBars.tsx
 * Animated equalizer bars using react-native-reanimated.
 * Used in MiniPlayer and track cards while audio is playing.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  useDerivedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface BarProps {
  color?: string;
  height: number;
  index: number;
  active: boolean;
}

function EqualizerBar({ color, height, index, active }: BarProps) {
  const anim = useDerivedValue(() => {
    if (!active) {
      return withTiming(0.2, { duration: 200 });
    }
    const dur = 350 + index * 80;
    return withRepeat(
      withSequence(
        withTiming(1, { duration: dur, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: dur, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [active, index]);

  const style = useAnimatedStyle(() => ({
    height: anim.value * height,
    opacity: active ? 0.9 + anim.value * 0.1 : 0.3,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 4,
          backgroundColor: color,
          borderRadius: 2,
        },
      ]}
    />
  );
}

interface Props {
  color?: string;
  barCount?: number;
  height?: number;
  active?: boolean;
}

export default function EqualizerBars({
  color = '#00FF85',
  barCount = 4,
  height = 24,
  active = true,
}: Props) {
  const bars = useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => (
        <EqualizerBar
          key={i}
          color={color}
          height={height}
          index={i}
          active={active}
        />
      )),
    [barCount, color, height, active]
  );

  return <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height }}>{bars}</View>;
}
