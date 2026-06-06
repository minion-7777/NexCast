export type ParticipantRole = 'broadcaster' | 'viewer';

export interface StreamRecord {
  id: string;
  roomName: string;
  title: string;
  hostIdentity: string;
  hostDisplayName: string;
  createdAt: string;
  isLive: boolean;
}

export interface SessionUser {
  identity: string;
  displayName: string;
}
