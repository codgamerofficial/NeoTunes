import { Track } from './index';

export type SocialPostType =
  | 'TRACK_SHARE'
  | 'ALBUM_SHARE'
  | 'PLAYLIST_SHARE'
  | 'ARTIST_SHARE'
  | 'ROOM_SHARE'
  | 'TEXT_WITH_MUSIC';

export type RoomType = 'PUBLIC' | 'FRIENDS' | 'INVITE_ONLY';

export type RoomRole = 'HOST' | 'MODERATOR' | 'LISTENER';

export interface RoomParticipant {
  userId: string;
  username: string;
  avatarUrl?: string;
  role: RoomRole;
  joinedAt: number;
}

export interface ListeningRoom {
  roomId: string;
  name: string;
  hostId: string;
  hostName: string;
  roomType: RoomType;
  currentTrack: Track | null;
  position: number; // in seconds
  isPlaying: boolean;
  participants: RoomParticipant[];
  queue: Track[];
  createdAt: number;
}

export interface SocialPost {
  postId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  postType: SocialPostType;
  caption: string;
  attachedTrack?: Track;
  attachedPlaylistId?: string;
  attachedPlaylistName?: string;
  reactionsCount: number;
  commentsCount: number;
  createdAt: number;
  userHasLiked?: boolean;
}

export interface CollaborativePlaylistMember {
  userId: string;
  username: string;
  role: 'OWNER' | 'EDITOR';
}
