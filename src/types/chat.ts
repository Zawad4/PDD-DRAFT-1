/**
 * Turfington Scalable Firestore Real-Time Community Chat Data Model
 * TypeScript Definitions
 */

import { Timestamp, FieldValue } from 'firebase/firestore';

export type UserRole = 'player' | 'owner' | 'admin';
export type ConversationType = 'direct' | 'group';
export type MessageType = 'text' | 'image' | 'system';
export type GroupVisibility = 'public' | 'private';
export type GroupMemberRole = 'admin' | 'moderator' | 'member';
export type GroupMemberStatus = 'active' | 'banned' | 'pending';
export type DevicePlatform = 'web' | 'android' | 'ios';

/**
 * 1. `users/{uid}`
 * User profile reference in Firestore
 */
export interface FirestoreUser {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  sport?: string;
  location?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastActive?: Timestamp | FieldValue;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

/**
 * Last message summary embedded in conversation & inbox docs
 */
export interface MessagePreview {
  text: string;
  senderUid: string;
  senderName: string;
  type: MessageType;
  timestamp: Timestamp | FieldValue | number;
}

/**
 * 2. `conversations/{conversationId}`
 * Conversation metadata
 */
export interface Conversation {
  id: string;
  type: ConversationType;
  members: string[]; // List of Firebase Auth UIDs
  groupName?: string | null;
  groupImage?: string | null;
  groupId?: string | null; // Reference to communityGroups/{groupId} if linked
  creatorUid: string;
  lastMessage?: MessagePreview | null;
  lastMessageTimestamp?: Timestamp | FieldValue | null;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

/**
 * 3. `conversations/{conversationId}/messages/{messageId}`
 * Individual message document
 */
export interface Message {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  type: MessageType;
  attachmentUrl?: string | null;
  attachmentMetadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  } | null;
  replyToId?: string | null;
  replyToSnippet?: string | null;
  reactions?: Record<string, string[]>; // emoji -> array of UIDs
  isDeleted: boolean;
  deletedAt?: Timestamp | FieldValue | null;
  editedAt?: Timestamp | FieldValue | null;
  createdAt: Timestamp | FieldValue;
}

/**
 * 4. `users/{uid}/inbox/{conversationId}`
 * Individual user's personalized conversation inbox item
 */
export interface UserInboxItem {
  conversationId: string;
  type: ConversationType;
  title: string;
  avatarUrl: string;
  otherUid?: string | null; // For direct chats
  groupId?: string | null;
  sport?: string;
  lastMessage?: MessagePreview | null;
  lastMessageTimestamp?: Timestamp | FieldValue | null;
  unreadCount: number;
  lastReadTimestamp?: Timestamp | FieldValue | null;
  isPinned: boolean;
  isMuted: boolean;
  updatedAt: Timestamp | FieldValue;
}

/**
 * 5. `communityGroups/{groupId}`
 * Sports community group document
 */
export interface CommunityGroup {
  groupId: string;
  name: string;
  description: string;
  sportCategory: string; // 'Football', 'Cricket', 'Badminton', etc.
  locationReference: string;
  imageUrl: string;
  creatorUid: string;
  visibility: GroupVisibility;
  memberCount: number;
  conversationId: string; // Links to conversations/{conversationId}
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

/**
 * 6. `communityGroups/{groupId}/members/{uid}`
 * Community group member document
 */
export interface GroupMember {
  uid: string;
  displayName: string;
  avatarUrl: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt: Timestamp | FieldValue;
}

/**
 * 7. `users/{uid}/devices/{deviceId}`
 * Push notification device token document
 */
export interface UserDevice {
  deviceId: string;
  fcmToken: string;
  platform: DevicePlatform;
  userAgent?: string;
  lastActive: Timestamp | FieldValue;
  createdAt: Timestamp | FieldValue;
}
