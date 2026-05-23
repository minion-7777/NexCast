import { Router } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import {
  createAccessToken,
  deleteLiveKitRoom,
  listLiveKitRooms,
} from '../services/livekit.js';
import {
  createStream,
  endStream,
  getStream,
  getStreamByRoom,
  listStreams,
} from '../services/streamStore.js';
import { config } from '../config.js';
import type { ParticipantRole } from '../types.js';

export const streamsRouter = Router();

const createStreamSchema = z.object({
  title: z.string().min(1).max(120).trim(),
});

const tokenSchema = z.object({
  roomName: z.string().min(1),
  role: z.enum(['broadcaster', 'viewer']),
});

streamsRouter.get('/streams', async (_req, res, next) => {
  try {
    const livekitRooms = await listLiveKitRooms();
    const streams = listStreams().map((s) => ({
      ...s,
      hasActiveRoom: livekitRooms.includes(s.roomName),
    }));
    res.json({ streams });
  } catch (err) {
    next(err);
  }
});

streamsRouter.get('/streams/:id', (req, res) => {
  const id = String(req.params.id);
  const stream = getStream(id);
  if (!stream) {
    res.status(404).json({ error: 'Stream not found' });
    return;
  }
  res.json({ stream });
});

streamsRouter.post('/streams', requireUser, (req, res) => {
  const parsed = createStreamSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const stream = createStream({
    title: parsed.data.title,
    hostIdentity: req.user!.identity,
    hostDisplayName: req.user!.displayName,
  });

  res.status(201).json({ stream });
});

streamsRouter.delete('/streams/:id', requireUser, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const ended = endStream(id, req.user!.identity);
    if (!ended) {
      res.status(403).json({ error: 'Not found or not the host' });
      return;
    }
    await deleteLiveKitRoom(ended.roomName);
    res.json({ stream: ended });
  } catch (err) {
    next(err);
  }
});

streamsRouter.post('/token', requireUser, async (req, res, next) => {
  try {
    const parsed = tokenSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { roomName, role } = parsed.data;
    const stream = getStreamByRoom(roomName);

    if (!stream || !stream.isLive) {
      res.status(404).json({ error: 'Stream is not live' });
      return;
    }

    if (role === 'broadcaster' && stream.hostIdentity !== req.user!.identity) {
      res.status(403).json({ error: 'Only the host can broadcast' });
      return;
    }

    const token = await createAccessToken({
      roomName,
      identity: req.user!.identity,
      displayName: req.user!.displayName,
      role: role as ParticipantRole,
    });

    res.json({
      token,
      livekitUrl: config.livekit.wsUrl,
      roomName,
      role,
    });
  } catch (err) {
    next(err);
  }
});
