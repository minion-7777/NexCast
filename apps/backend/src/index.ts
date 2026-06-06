import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { optionalInternalApiKey } from './middleware/auth.js';
import { healthRouter } from './routes/health.js';
import { sessionRouter } from './routes/session.js';
import { streamsRouter } from './routes/streams.js';

const app = express();

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(optionalInternalApiKey);

app.use('/api', healthRouter);
app.use('/api', sessionRouter);
app.use('/api', streamsRouter);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  },
);

app.listen(config.port, () => {
  console.log(`NexCast API listening on http://localhost:${config.port}`);
  console.log(`LiveKit WebSocket URL: ${config.livekit.wsUrl}`);
});
