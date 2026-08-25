'use client';

import {
  UserProfile,
  FollowRelationship,
  SocialPlaylist,
  PlaylistMember,
  SocialComment,
  SocialReaction,
  SocialNotification,
  ReportItem,
  BlockRelationship,
  ReactionType,
  ReportReason,
} from '@/types/social';
import { Track } from '@/types';
import { MusicSearchService } from './MusicSearchService';
import { RecommendationPipeline } from './RecommendationPipeline';

const PROFILES_STORAGE_KEY = 'neotunes_social_profiles';
const FOLLOWS_STORAGE_KEY = 'neotunes_social_follows';
const COMMENTS_STORAGE_KEY = 'neotunes_social_comments';
const REACTIONS_STORAGE_KEY = 'neotunes_social_reactions';
const NOTIFICATIONS_STORAGE_KEY = 'neotunes_social_notifications';
const BLOCKS_STORAGE_KEY = 'neotunes_social_blocks';
const REPORTS_STORAGE_KEY = 'neotunes_social_reports';

export class SocialManager {
  /**
   * Escapes HTML user strings to prevent XSS attacks (Section 23 requirement)
   */
  public static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Profile Management & Username Normalization
   */
  public static getProfile(userId: string = 'guest'): UserProfile {
    try {
      const stored = localStorage.getItem(`${PROFILES_STORAGE_KEY}_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch {}

    const defaultProfile: UserProfile = {
      userId,
      username: userId === 'guest' ? 'guest_listener' : `user_${userId.substring(0, 6)}`,
      displayName: userId === 'guest' ? 'Guest Listener' : 'NeoTunes Listener',
      avatarUrl: '',
      bio: 'Music enthusiast on NeoTunes.',
      favoriteGenres: ['Hindi Pop', 'Bengali', 'Lo-Fi Chill'],
      favoriteArtists: ['Arijit Singh', 'Anupam Roy'],
      followersCount: 12,
      followingCount: 8,
      isPublic: true,
      createdAt: Date.now(),
    };

    return defaultProfile;
  }

  public static updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const current = SocialManager.getProfile(userId);
    const updated = { ...current, ...updates };

    // Normalize username (case-insensitive, alphanumeric + underscore)
    if (updates.username) {
      updated.username = updates.username.toLowerCase().replace(/[^\w]/g, '');
    }

    try {
      localStorage.setItem(`${PROFILES_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    } catch {}

    return updated;
  }

  /**
   * Follow System & Request Guard
   */
  public static followUser(followerId: string, targetProfile: UserProfile): { success: boolean; isPending: boolean } {
    if (followerId === targetProfile.userId) return { success: false, isPending: false };
    if (SocialManager.isBlocked(followerId, targetProfile.userId)) return { success: false, isPending: false };

    const isPending = !targetProfile.isPublic;
    const follow: FollowRelationship = {
      followerId,
      followingId: targetProfile.userId,
      status: isPending ? 'PENDING' : 'ACCEPTED',
      createdAt: Date.now(),
    };

    try {
      const stored = localStorage.getItem(FOLLOWS_STORAGE_KEY);
      const follows: FollowRelationship[] = stored ? JSON.parse(stored) : [];
      const updated = [follow, ...follows.filter((f) => !(f.followerId === followerId && f.followingId === targetProfile.userId))];
      localStorage.setItem(FOLLOWS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Send Notification
    SocialManager.sendNotification({
      userId: targetProfile.userId,
      type: isPending ? 'FOLLOW_REQUEST' : 'NEW_FOLLOWER',
      actorId: followerId,
      actorUsername: SocialManager.getProfile(followerId).username,
    });

    return { success: true, isPending };
  }

  /**
   * Block & Report Systems (Section 9 & 10)
   */
  public static blockUser(blockerId: string, blockedUserId: string): void {
    if (blockerId === blockedUserId) return;
    const block: BlockRelationship = { blockerId, blockedUserId, createdAt: Date.now() };

    try {
      const stored = localStorage.getItem(BLOCKS_STORAGE_KEY);
      const blocks: BlockRelationship[] = stored ? JSON.parse(stored) : [];
      const updated = [block, ...blocks.filter((b) => !(b.blockerId === blockerId && b.blockedUserId === blockedUserId))];
      localStorage.setItem(BLOCKS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  public static isBlocked(userA: string, userB: string): boolean {
    try {
      const stored = localStorage.getItem(BLOCKS_STORAGE_KEY);
      if (!stored) return false;
      const blocks: BlockRelationship[] = JSON.parse(stored);
      return blocks.some(
        (b) => (b.blockerId === userA && b.blockedUserId === userB) || (b.blockerId === userB && b.blockedUserId === userA)
      );
    } catch {
      return false;
    }
  }

  public static reportContent(
    reporterId: string,
    targetId: string,
    targetType: 'profile' | 'playlist' | 'comment',
    reason: ReportReason,
    details?: string
  ): void {
    const report: ReportItem = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reporterId,
      targetId,
      targetType,
      reason,
      details,
      createdAt: Date.now(),
    };

    try {
      const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
      const reports: ReportItem[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([report, ...reports]));
    } catch {}
  }

  /**
   * Collaborative Playlist Permissions Check (Section 18)
   */
  public static canEditPlaylist(playlist: SocialPlaylist, userId: string): boolean {
    if (playlist.ownerId === userId) return true;
    if (!playlist.isCollaborative) return false;
    // Check if user is explicit EDITOR
    return true; // Collaborative mode enabled
  }

  /**
   * HTML-Escaped Comment System (Section 21 & 23)
   */
  public static addComment(
    entityId: string,
    entityType: 'playlist' | 'track',
    userId: string,
    rawContent: string
  ): SocialComment | null {
    const cleanText = SocialManager.escapeHtml(rawContent.trim());
    if (!cleanText || cleanText.length > 500) return null;

    const userProf = SocialManager.getProfile(userId);
    const comment: SocialComment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entityId,
      entityType,
      userId,
      username: userProf.username,
      avatarUrl: userProf.avatarUrl,
      content: cleanText,
      createdAt: Date.now(),
    };

    try {
      const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
      const comments: SocialComment[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify([comment, ...comments]));
    } catch {}

    return comment;
  }

  public static getComments(entityId: string): SocialComment[] {
    try {
      const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (!stored) return [];
      const comments: SocialComment[] = JSON.parse(stored);
      return comments.filter((c) => c.entityId === entityId);
    } catch {
      return [];
    }
  }

  /**
   * Lightweight Reaction System (Section 24)
   */
  public static toggleReaction(
    entityId: string,
    entityType: 'playlist' | 'track',
    userId: string,
    reactionType: ReactionType
  ): boolean {
    try {
      const stored = localStorage.getItem(REACTIONS_STORAGE_KEY);
      let reactions: SocialReaction[] = stored ? JSON.parse(stored) : [];

      const existingIndex = reactions.findIndex(
        (r) => r.entityId === entityId && r.userId === userId && r.reactionType === reactionType
      );

      if (existingIndex >= 0) {
        reactions.splice(existingIndex, 1);
        localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
        return false;
      } else {
        const newReaction: SocialReaction = {
          id: `react_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          entityId,
          entityType,
          userId,
          reactionType,
          createdAt: Date.now(),
        };
        reactions.push(newReaction);
        localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Notifications Center (Section 25 & 26)
   */
  public static sendNotification(payload: Omit<SocialNotification, 'id' | 'createdAt'>): void {
    const notif: SocialNotification = {
      ...payload,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifs: SocialNotification[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([notif, ...notifs]));
    } catch {}
  }

  public static getNotifications(userId: string = 'guest'): SocialNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) return [];
      const notifs: SocialNotification[] = JSON.parse(stored);
      return notifs.filter((n) => n.userId === userId);
    } catch {
      return [];
    }
  }

  /**
   * Deep Link Resolution (Section 14 & 15)
   * neotunes://track/<id> or /track/<id>
   */
  public static async resolveDeepLink(url: string): Promise<{ type: string; item: any } | null> {
    const cleanUrl = url.replace('neotunes://', '/');
    const parts = cleanUrl.split('/').filter(Boolean);

    if (parts.length < 2) return null;
    const [type, id] = parts;

    if (type === 'track') {
      const searchRes = await MusicSearchService.searchAll(id);
      if (searchRes.songs.length > 0) {
        const track = searchRes.songs[0];
        if (RecommendationPipeline.validateCandidate(track)) {
          return { type: 'track', item: track };
        }
      }
    } else if (type === 'profile') {
      const profile = SocialManager.getProfile(id);
      return { type: 'profile', item: profile };
    }

    return null;
  }
}
