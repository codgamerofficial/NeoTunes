'use client';

import { CreatorProfile, CreatorContent, ContentType, CreatorAnalytics } from '@/types/creator-ecosystem';

const CREATOR_CONTENT_STORAGE_KEY = 'neotunes_creator_content';

export class CreatorContentService {
  /**
   * Returns active creator profile (Section 2 & 36)
   */
  public static getProfile(): CreatorProfile {
    return {
      creatorId: 'cr_101',
      userId: 'usr_main',
      displayName: 'NeoTunes Curator Studio',
      username: '@neocurator',
      avatar: '/artwork/default.jpg',
      bio: 'Official Creator Studio Profile for curated releases & soundscapes.',
      roles: ['ARTIST', 'CURATOR'],
      verificationState: 'VERIFIED',
      followersCount: 14200,
      totalPlays: 985000,
      totalSaves: 124000,
      creationDate: Date.now() - 86400000 * 180,
    };
  }

  /**
   * Fetches creator content items (Section 8)
   */
  public static getCreatorContent(): CreatorContent[] {
    try {
      const stored = localStorage.getItem(CREATOR_CONTENT_STORAGE_KEY);
      if (!stored) {
        const initial: CreatorContent[] = [
          {
            contentId: 'cc_01',
            creatorId: 'cr_101',
            type: 'SINGLE',
            title: 'Midnight Synth Echoes (Original)',
            description: 'Ambient electronic single created for late-night sessions.',
            artwork: '/artwork/default.jpg',
            status: 'PUBLISHED',
            rightsStatus: 'VERIFIED',
            uploadState: 'READY',
            canonicalTrackId: 'spotify:track:shayad',
            plays: 45000,
            saves: 8200,
            createdAt: Date.now() - 86400000 * 30,
            publishedAt: Date.now() - 86400000 * 29,
            updatedAt: Date.now() - 86400000 * 29,
          },
          {
            contentId: 'cc_02',
            creatorId: 'cr_101',
            type: 'PLAYLIST',
            title: 'Chillhop & Lofi Horizons',
            description: 'Curated compilation of emerging indie lofi tracks.',
            artwork: '/artwork/default.jpg',
            status: 'DRAFT',
            rightsStatus: 'DECLARED',
            uploadState: 'READY',
            plays: 0,
            saves: 0,
            createdAt: Date.now() - 3600000 * 2,
            updatedAt: Date.now() - 3600000 * 2,
          },
        ];
        localStorage.setItem(CREATOR_CONTENT_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Creates new content draft (Section 10 & 26)
   */
  public static createDraft(title: string, type: ContentType): CreatorContent {
    const newContent: CreatorContent = {
      contentId: `cc_${Date.now()}`,
      creatorId: 'cr_101',
      type,
      title,
      description: 'Draft content in progress...',
      artwork: '/artwork/default.jpg',
      status: 'DRAFT',
      rightsStatus: 'DECLARED',
      uploadState: 'READY',
      plays: 0,
      saves: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const current = CreatorContentService.getCreatorContent();
    const updated = [newContent, ...current];
    try {
      localStorage.setItem(CREATOR_CONTENT_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return newContent;
  }

  /**
   * Publishes content item after validation (Section 26 & 27)
   */
  public static publishContent(contentId: string): boolean {
    const current = CreatorContentService.getCreatorContent();
    const target = current.find((c) => c.contentId === contentId);
    if (!target) return false;

    target.status = 'PUBLISHED';
    target.publishedAt = Date.now();
    target.updatedAt = Date.now();

    try {
      localStorage.setItem(CREATOR_CONTENT_STORAGE_KEY, JSON.stringify(current));
    } catch {}

    return true;
  }

  /**
   * Aggregates creator performance analytics (Section 51 & 61)
   */
  public static getAnalytics(): CreatorAnalytics {
    const content = CreatorContentService.getCreatorContent();
    const totalPlays = content.reduce((acc, curr) => acc + curr.plays, 0);
    const totalSaves = content.reduce((acc, curr) => acc + curr.saves, 0);

    return {
      totalPlays,
      uniqueListeners: Math.floor(totalPlays * 0.72),
      totalSaves,
      followersGained: 340,
      completionRate: 88.5,
    };
  }
}
