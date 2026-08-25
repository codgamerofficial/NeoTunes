import { Track } from './index';

export type MusicIntentType =
  | 'PLAY_TRACK'
  | 'PLAY_ARTIST'
  | 'PLAY_ALBUM'
  | 'PLAY_PLAYLIST'
  | 'SEARCH_MUSIC'
  | 'CREATE_PLAYLIST'
  | 'ADD_TO_QUEUE'
  | 'LIKE_TRACK'
  | 'SHOW_LYRICS'
  | 'SET_AUDIO_PROFILE'
  | 'START_RADIO'
  | 'DELETE_PLAYLIST';

export type IntentConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type ToolPermission = 'READ' | 'WRITE' | 'DESTRUCTIVE';

export interface AIToolDefinition {
  name: string;
  description: string;
  permission: ToolPermission;
  requiresConfirmation: boolean;
}

export interface MusicIntent {
  type: MusicIntentType;
  parameters: Record<string, any>;
  confidence: IntentConfidence;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

export interface AICopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  attachedTrack?: Track;
  attachedIntent?: MusicIntent;
  requiresConfirmation?: boolean;
  createdAt: number;
}
