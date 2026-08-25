import { Track } from './index';

export type CreatorRole = 'ARTIST' | 'DJ' | 'PRODUCER' | 'CURATOR' | 'PODCAST' | 'LABEL';
export type VerificationState = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export type ContentType = 'MUSIC' | 'ALBUM' | 'SINGLE' | 'PLAYLIST' | 'PODCAST' | 'ANNOUNCEMENT';
export type ContentStatus = 'DRAFT' | 'PROCESSING' | 'SCHEDULED' | 'PUBLISHED' | 'UNLISTED' | 'ARCHIVED';
export type UploadState = 'QUEUED' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
export type RightsStatus = 'DECLARED' | 'PENDING_REVIEW' | 'VERIFIED' | 'RESTRICTED';

export interface CreatorProfile {
  creatorId: string;
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  roles: CreatorRole[];
  verificationState: VerificationState;
  followersCount: number;
  totalPlays: number;
  totalSaves: number;
  creationDate: number;
}

export interface CreatorContent {
  contentId: string;
  creatorId: string;
  type: ContentType;
  title: string;
  description: string;
  artwork: string;
  status: ContentStatus;
  rightsStatus: RightsStatus;
  uploadState: UploadState;
  canonicalTrackId?: string;
  plays: number;
  saves: number;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

export interface CreatorAnalytics {
  totalPlays: number;
  uniqueListeners: number;
  totalSaves: number;
  followersGained: number;
  completionRate: number; // percentage
}
