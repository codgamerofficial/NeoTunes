/**
 * NeoTunes Knowledge Base & Documentation Engine
 * Provides verified answers and citations for NeoTunes platform features, settings, audio engine, shortcuts, and troubleshooting.
 */

export interface KnowledgeArticle {
  id: string;
  category: 'audio' | 'features' | 'shortcuts' | 'settings' | 'troubleshooting' | 'creator';
  title: string;
  content: string;
  tags: string[];
  citation: string;
}

export const NEOTUNES_DOCS: KnowledgeArticle[] = [
  {
    id: 'lossless-audio',
    category: 'audio',
    title: 'Lossless & Spatial Audio Engine',
    content:
      'NeoTunes supports ultra-high-fidelity streaming with bit-perfect 24-bit/96kHz audio resolution, real-time Soundstage DSP emulation (Concert Hall, Studio, Acoustic, Bass Boost), and binaural spatial room acoustic rendering. Equalizer profiles feature a 10-band custom parametric filter.',
    tags: ['audio quality', 'lossless', 'spatial audio', 'soundstage', 'equalizer', 'dsp'],
    citation: 'NeoTunes Audio Architecture Guide — Section 4.2',
  },
  {
    id: 'sleep-timer',
    category: 'features',
    title: 'Smart Sleep Timer',
    content:
      'The Sleep Timer allows listeners to automatically fade out audio after 15, 30, 45, or 60 minutes, or at the end of the current track. Can be configured in Settings or via Neo voice/chat commands.',
    tags: ['sleep timer', 'fade out', 'playback controls', 'bedtime'],
    citation: 'NeoTunes User Manual — Chapter 3: Playback',
  },
  {
    id: 'offline-downloads',
    category: 'features',
    title: 'Offline Downloads & Storage Management',
    content:
      'Offline mode stores decrypted, cached audio chunks in indexed local device storage. Downloads can be filtered for Wi-Fi only in Settings to conserve cellular bandwidth. Offline tracks can be managed and cleared anytime from the Downloads page.',
    tags: ['downloads', 'offline', 'storage', 'wifi only', 'cache'],
    citation: 'NeoTunes Offline & Portability Guide',
  },
  {
    id: 'keyboard-shortcuts',
    category: 'shortcuts',
    title: 'Desktop Keyboard Shortcuts',
    content:
      'Global shortcuts: Space (Play/Pause), Left Arrow (Seek backward 5s), Right Arrow (Seek forward 5s), J (Skip Next), K (Skip Previous), M (Mute/Unmute), L (Like current track), Cmd/Ctrl+K (Command Palette / Search), Cmd/Ctrl+N (Ask Neo AI).',
    tags: ['shortcuts', 'hotkeys', 'navigation', 'keyboard controls'],
    citation: 'NeoTunes Desktop Reference Card',
  },
  {
    id: 'soundstage-modes',
    category: 'audio',
    title: 'Soundstage Acoustic Simulation Modes',
    content:
      'Soundstage DSP modes include: "Concert Hall" (adds realistic acoustic reverberation and wide stereo imaging), "Studio Reference" (flat, ultra-accurate studio monitor curve), "Acoustic Warmth" (emphasizes vocals and acoustic strings), and "Bass Punch" (tight low-frequency sub-bass resonance).',
    tags: ['soundstage', 'presets', 'reverb', 'audio modes'],
    citation: 'NeoTunes DSP Reference Manual',
  },
  {
    id: 'crossfade-gapless',
    category: 'settings',
    title: 'Crossfade & Gapless Playback',
    content:
      'Gapless playback eliminates silence between consecutive tracks (ideal for live albums and classical movements). Crossfade dynamically fades the ending track into the upcoming track over an adjustable window from 1 to 12 seconds.',
    tags: ['crossfade', 'gapless', 'smooth transitions', 'dj mode'],
    citation: 'NeoTunes Settings & Audio Preferences',
  },
  {
    id: 'neo-jam-sessions',
    category: 'features',
    title: 'Neo Jam Synchronized Listening Rooms',
    content:
      'Jam Sessions allow friends to listen to music together in real-time sync with shared queue management, real-time chat, and collaborative voting on upcoming tracks.',
    tags: ['jam', 'social', 'shared listening', 'multiplayer', 'party mode'],
    citation: 'NeoTunes Social Ecosystem Documentation',
  },
  {
    id: 'troubleshooting-playback',
    category: 'troubleshooting',
    title: 'Troubleshooting Playback & Device Connections',
    content:
      'If playback fails to start: 1. Check network connection. 2. Verify active audio output device in the player control bar. 3. Clear browser cache or refresh stream connection. 4. Ensure media autoplay permissions are granted in browser settings.',
    tags: ['troubleshooting', 'error', 'playback failed', 'no sound', 'connection'],
    citation: 'NeoTunes Troubleshooting & Support FAQ',
  },
];

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'of', 'in', 'and', 'a', 'to', 'for', 'on', 'how', 'do', 'i', 'can', 'are', 'my', 'me', 'it', 'capital', 'france'
]);

export class NeoKnowledgeBase {
  /**
   * Searches knowledge articles for documentation/help queries
   */
  public static query(query: string): { found: boolean; article?: KnowledgeArticle; relevanceScore: number } {
    const q = query.toLowerCase().trim();
    if (!q) return { found: false, relevanceScore: 0 };

    let bestMatch: KnowledgeArticle | null = null;
    let highestScore = 0;

    const significantWords = q.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    if (significantWords.length === 0) {
      return { found: false, relevanceScore: 0 };
    }

    for (const article of NEOTUNES_DOCS) {
      let score = 0;
      const titleLower = article.title.toLowerCase();
      const contentLower = article.content.toLowerCase();

      for (const word of significantWords) {
        if (titleLower.includes(word)) score += 30;
        if (article.tags.some((tag) => tag.includes(word))) score += 25;
        if (contentLower.includes(word)) score += 10;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = article;
      }
    }

    if (bestMatch && highestScore >= 20) {
      return {
        found: true,
        article: bestMatch,
        relevanceScore: highestScore,
      };
    }

    return { found: false, relevanceScore: 0 };
  }
}
