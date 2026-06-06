import {
  AccessToken,
  RoomServiceClient,
  type VideoGrant,
} from 'livekit-server-sdk';
import { config } from '../config.js';
import type { ParticipantRole } from '../types.js';

const roomService = new RoomServiceClient(
  config.livekit.httpUrl,
  config.livekit.apiKey,
  config.livekit.apiSecret,
);

export function getRoomService(): RoomServiceClient {
  return roomService;
}

export async function createAccessToken(options: {
  roomName: string;
  identity: string;
  displayName: string;
  role: ParticipantRole;
}): Promise<string> {
  const { roomName, identity, displayName, role } = options;

  const grant: VideoGrant = {
    roomJoin: true,
    room: roomName,
    canPublish: role === 'broadcaster',
    canSubscribe: true,
    canPublishData: role === 'broadcaster',
  };

  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
    identity,
    name: displayName,
    ttl: '6h',
  });
  at.addGrant(grant);
  return at.toJwt();
}

export async function deleteLiveKitRoom(roomName: string): Promise<void> {
  try {
    await roomService.deleteRoom(roomName);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.toLowerCase().includes('not found')) {
      throw err;
    }
  }
}

export async function listLiveKitRooms(): Promise<string[]> {
  const rooms = await roomService.listRooms();
  return rooms.map((r) => r.name);
}
