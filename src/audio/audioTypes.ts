import { Track } from '@/types';
import { PlaybackStatus } from '@/store/playback-store';

export interface RemoteControlEvent {
  type: 
    | 'remote-play' 
    | 'remote-[#pause]' 
    | 'remote-pause' 
    | 'remote-next' 
    | 'remote-previous' 
    | 'remote-seek' 
    | 'remote-stop' 
    | 'remote-duck';
  position?: number;
}

export type AudioFocusState = 'focused' | 'ducked' | 'lost' | 'none';

export interface BackgroundPlaybackConfig {
  pauseOnHeadphoneDisconnect: boolean;
  handleAudioFocus: boolean;
  syncMediaSession: boolean;
  minBufferSec: number;
  maxBufferSec: number;
}

export interface PlayerEngineState {
  isInitialized: boolean;
  currentTrack: Track | null;
  status: PlaybackStatus;
  position: number;
  duration: number;
  audioFocusState: AudioFocusState;
  mediaSessionRegistered: boolean;
  headphoneDisconnectGuardActive: boolean;
}
