import { customAlphabet } from 'nanoid';
import type { StreamRecord } from '../types.js';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

const streams = new Map<string, StreamRecord>();

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'stream';
}

export function createStream(input: {
  title: string;
  hostIdentity: string;
  hostDisplayName: string;
}): StreamRecord {
  const slug = slugifyTitle(input.title);
  const roomName = `${slug}-${nanoid()}`;
  const record: StreamRecord = {
    id: nanoid(),
    roomName,
    title: input.title.trim(),
    hostIdentity: input.hostIdentity,
    hostDisplayName: input.hostDisplayName,
    createdAt: new Date().toISOString(),
    isLive: true,
  };
  streams.set(record.id, record);
  return record;
}

export function listStreams(): StreamRecord[] {
  return [...streams.values()]
    .filter((s) => s.isLive)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getStream(id: string): StreamRecord | undefined {
  return streams.get(id);
}

export function getStreamByRoom(roomName: string): StreamRecord | undefined {
  return [...streams.values()].find((s) => s.roomName === roomName);
}

export function endStream(id: string, requesterIdentity: string): StreamRecord | null {
  const stream = streams.get(id);
  if (!stream || !stream.isLive) return null;
  if (stream.hostIdentity !== requesterIdentity) return null;
  stream.isLive = false;
  streams.set(id, stream);
  return stream;
}
