import { Track } from './index';

export type SmartRuleField = 'genre' | 'artist' | 'language' | 'liked' | 'neverPlayed' | 'duration';
export type SmartRuleOperator = 'EQUALS' | 'CONTAINS' | 'IS_TRUE' | 'GREATER_THAN' | 'LESS_THAN';

export interface SmartPlaylistRule {
  field: SmartRuleField;
  operator: SmartRuleOperator;
  value: any;
}

export interface PlaylistTemplate {
  templateId: string;
  name: string;
  description: string;
  rules: SmartPlaylistRule[];
  visualTheme: 'Glass' | 'OLED' | 'Aurora' | 'Minimal' | 'Cinematic';
}

export interface PlaylistHealthReport {
  healthScore: number; // 0 - 100
  totalTracks: number;
  totalDuration: number;
  duplicatesCount: number;
  unavailableCount: number;
  previewOnlyCount: number;
  artistDiversityScore: number; // 0 - 100
}

export interface CreatorDraft {
  draftId: string;
  title: string;
  description: string;
  tracks: Track[];
  createdAt: number;
}
