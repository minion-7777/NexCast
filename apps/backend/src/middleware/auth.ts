import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import type { SessionUser } from '../types.js';

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function optionalInternalApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!config.internalApiKey) {
    next();
    return;
  }
  const key = req.header('x-nexcast-api-key');
  if (key !== config.internalApiKey) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  next();
}

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const identity = req.header('x-nexcast-identity');
  const displayName = req.header('x-nexcast-display-name');
  if (!identity || !displayName) {
    res.status(401).json({
      error: 'Missing session headers. Call POST /api/session first.',
    });
    return;
  }
  req.user = { identity, displayName };
  next();
}
