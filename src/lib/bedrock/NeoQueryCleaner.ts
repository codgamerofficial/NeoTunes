/**
 * NeoQueryCleaner
 * Extracts intent, language, mood, artist, and duration from natural language prompts,
 * and strips action command verbs to ensure music catalog searches succeed.
 */

export interface ParsedMusicIntent {
  rawPrompt: string;
  cleanedSearchQuery: string;
  language?: string;
  mood?: string;
  targetDurationMinutes?: number;
  isActionCommand: boolean;
  actionVerb?:
    | 'PLAY'
    | 'QUEUE'
    | 'LIKE'
    | 'SEARCH'
    | 'CREATE_PLAYLIST'
    | 'GET_CURRENT_TRACK'
    | 'GET_QUEUE'
    | 'GET_DEVICE'
    | 'GET_STORAGE'
    | 'GET_AUDIO_CAPS';
}

const ACTION_PREFIXES = [
  /^(please\s+)?(can\s+you\s+)?play\s+(me\s+)?(some\s+)?/i,
  /^(please\s+)?(can\s+you\s+)?put\s+on\s+(some\s+)?/i,
  /^(please\s+)?(can\s+you\s+)?find\s+(me\s+)?(some\s+)?/i,
  /^(please\s+)?(can\s+you\s+)?search\s+(for\s+)?/i,
  /^(please\s+)?(can\s+you\s+)?give\s+me\s+(some\s+)?/i,
  /^(please\s+)?(can\s+you\s+)?stream\s+/i,
  /^(please\s+)?(can\s+you\s+)?listen\s+to\s+/i,
  /^(please\s+)?(can\s+you\s+)?queue\s+(up\s+)?/i,
  /^(please\s+)?(can\s+you\s+)?create\s+(a\s+|me\s+a\s+)?(playlist\s+for\s+)?/i,
  /^(please\s+)?(can\s+you\s+)?make\s+(a\s+|me\s+a\s+)?(playlist\s+for\s+)?/i,
];

const KNOWN_LANGUAGES = [
  'Bengali',
  'Hindi',
  'Punjabi',
  'English',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Marathi',
  'Gujarati',
  'Spanish',
  'Korean',
  'Japanese',
  'French',
];

const KNOWN_MOODS = [
  'acoustic',
  'relaxing',
  'evening',
  'morning',
  'workout',
  'energetic',
  'calm',
  'romantic',
  'chill',
  'focus',
  'lofi',
  'party',
  'sad',
  'happy',
  'meditation',
  'sleep',
];

export class NeoQueryCleaner {
  /**
   * Cleans natural language user input for catalog querying
   */
  public static clean(prompt: string): ParsedMusicIntent {
    const raw = prompt.trim();
    let cleaned = raw;
    let actionVerb: ParsedMusicIntent['actionVerb'] = undefined;
    let isActionCommand = false;

    // Detect query questions
    if (/\b(what\s*(is|'s)?\s*playing|what\s*(am\s*i|are\s*we)\s*listening\s*to|current\s*(song|track)|who\s*(is\s*singing|'s\s*this))\b/i.test(raw)) {
      actionVerb = 'GET_CURRENT_TRACK';
      isActionCommand = true;
    } else if (/\b(show\s*(my\s*)?queue|what('s|\s*is)\s*next|upcoming\s*(songs|tracks))\b/i.test(raw)) {
      actionVerb = 'GET_QUEUE';
      isActionCommand = true;
    } else if (/\b(connected\s*device|what\s*speaker|audio\s*output|airplay|bluetooth)\b/i.test(raw)) {
      actionVerb = 'GET_DEVICE';
      isActionCommand = true;
    } else if (/\b(storage|downloads|offline\s*space|disk\s*space)\b/i.test(raw)) {
      actionVerb = 'GET_STORAGE';
      isActionCommand = true;
    } else if (/\b(soundstage|spatial\s*audio|surround|equalizer)\b/i.test(raw)) {
      actionVerb = 'GET_AUDIO_CAPS';
      isActionCommand = true;
    } else {
      // Detect and strip action verbs
      for (const prefix of ACTION_PREFIXES) {
        if (prefix.test(cleaned)) {
          isActionCommand = true;
          if (/\bplaylist\b/i.test(raw) || /\b(create|make)\b/i.test(raw)) {
            actionVerb = 'CREATE_PLAYLIST';
          } else if (/\bplay\b/i.test(raw)) {
            actionVerb = 'PLAY';
          } else if (/\bqueue\b/i.test(raw)) {
            actionVerb = 'QUEUE';
          } else {
            actionVerb = 'SEARCH';
          }

          cleaned = cleaned.replace(prefix, '').trim();
          break;
        }
      }
    }

    // Extract language
    let detectedLanguage: string | undefined = undefined;
    for (const lang of KNOWN_LANGUAGES) {
      const regex = new RegExp(`\\b${lang}\\b`, 'i');
      if (regex.test(raw)) {
        detectedLanguage = lang;
        break;
      }
    }

    // Extract mood
    let detectedMood: string | undefined = undefined;
    for (const mood of KNOWN_MOODS) {
      const regex = new RegExp(`\\b${mood}\\b`, 'i');
      if (regex.test(raw)) {
        detectedMood = mood;
        break;
      }
    }

    // Extract duration (e.g. "45 minute", "45 min", "1 hour")
    let targetDurationMinutes: number | undefined = undefined;
    const minMatch = raw.match(/(\d+)\s*(min|minute|minutes)/i);
    if (minMatch) {
      targetDurationMinutes = parseInt(minMatch[1], 10);
    } else {
      const hrMatch = raw.match(/(\d+)\s*(hr|hour|hours)/i);
      if (hrMatch) {
        targetDurationMinutes = parseInt(hrMatch[1], 10) * 60;
      }
    }

    // If cleaned string became empty (e.g. user just said "Play something"), supply fallback
    if (!cleaned) {
      if (detectedLanguage && detectedMood) {
        cleaned = `${detectedLanguage} ${detectedMood}`;
      } else if (detectedLanguage) {
        cleaned = `${detectedLanguage} hits`;
      } else if (detectedMood) {
        cleaned = `${detectedMood} music`;
      } else {
        cleaned = 'trending music';
      }
    }

    return {
      rawPrompt: raw,
      cleanedSearchQuery: cleaned,
      language: detectedLanguage,
      mood: detectedMood,
      targetDurationMinutes,
      isActionCommand,
      actionVerb,
    };
  }
}
