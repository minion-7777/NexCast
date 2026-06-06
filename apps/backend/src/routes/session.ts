import { Router } from 'express';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import type { SessionUser } from '../types.js';

const identityAlphabet = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  12,
);

export const sessionRouter = Router();

const sessionSchema = z.object({
  displayName: z.string().min(1).max(64).trim(),
});

sessionRouter.post('/session', (req, res) => {
  const parsed = sessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user: SessionUser = {
    identity: `user_${identityAlphabet()}`,
    displayName: parsed.data.displayName,
  };

  res.json(user);
});
