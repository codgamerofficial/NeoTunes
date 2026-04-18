/**
 * YouTubeAudioPlayer.tsx
 * Native fallback (iOS / Android) — uses react-native-youtube-iframe.
 * The player is hidden since native audio background works fine.
 */
import React from 'react';
import { View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

interface Props {
  videoId: string;
  play: boolean;
  onStateChange?: (state: string) => void;
}

export default function YouTubeAudioPlayer({ videoId, play, onStateChange }: Props) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}>
      <YoutubePlayer
        height={0}
        play={play}
        videoId={videoId}
        onChangeState={onStateChange}
        initialPlayerParams={{ controls: false, modestbranding: true, rel: false }}
      />
    </View>
  );
}
