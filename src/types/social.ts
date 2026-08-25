import { Track } from './index';

export type PrivacyLevel = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE' | 'UNLISTED';

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  favoriteGenres: string[];
  favoriteArtists: string[];
  followersCount: number;
  followingCount: number;
  isPublic: boolean;
  createdAt: number;
}

export type FollowStatus = 'ACCEPTED' | 'PENDING';

export interface FollowRelationship {
  followerId: string;
  followingId: string;
  status: FollowStatus;
  createdAt: number;
}

export type CollaborativeRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface PlaylistMember {
  playlistId: string;
  userId: string;
  role: CollaborativeRole;
  addedAt: number;
}

export interface SocialPlaylist {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerUsername: string;
  privacy: PrivacyLevel;
  isCollaborative: boolean;
  coverUrl?: string;
  tracks: Track[];
  followersCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface SocialComment {
  id: string;
  entityId: string;
  entityType: 'playlist' | 'track';
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string; // HTML-escaped string
  createdAt: number;
}

export type ReactionType = '❤️' | '🔥' | '🎧' | '✨' | '💯';

export interface SocialReaction {
  id: string;
  entityId: string;
  entityType: 'playlist' | 'track';
  userId: string;
  reactionType: ReactionType;
  createdAt: number;
}

export type NotificationType =
  | 'NEW_FOLLOWER'
  | 'FOLLOW_REQUEST'
  | 'PLAYLIST_COLLABORATION'
  | 'PLAYLIST_UPDATE'
  | 'REACTION'
  | 'COMMENT'
  | 'SHARED_TRACK';

export interface SocialNotification {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  actorUsername: string;
  entityId?: string;
  entityTitle?: string;
  createdAt: number;
  readAt?: number;
}

export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'IMPERSONATION'
  | 'INAPPROPRIATE'
  | 'COPYRIGHT'
  | 'OTHER';

export interface ReportItem {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'profile' | 'playlist' | 'comment';
  reason: ReportReason;
  details?: string;
  createdAt: number;
}

export interface BlockRelationship {
  blockerId: string;
  blockedUserId: string;
  createdAt: number;
}
