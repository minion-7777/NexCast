# NexCast

Internal live video broadcasting for your organization. **React** frontend and **Node.js** API run on Windows; **LiveKit** media server runs on an Ubuntu VM.

## Architecture

```
┌──────────────────── Windows host ────────────────────┐
│  React (Vite) :5173  ──►  Node.js API :3001         │
└──────────────────────────────┬───────────────────────┘
                               │ tokens, room API
                               ▼
┌──────────────────── Ubuntu VM ─────────────────────┐
│  LiveKit SFU :7880  +  UDP 50000-60000, TCP 7881   │
└────────────────────────────────────────────────────┘
```

| Component | Path | Role |
|-----------|------|------|
| Frontend | `apps/frontend` | Browse streams, broadcast, watch |
| Backend | `apps/backend` | JWT tokens, stream registry, LiveKit room API |
| Media server | `media-server` | LiveKit SFU (Docker on Ubuntu VM) |

## Quick start (development)

### 1. Media server (Ubuntu VM)

See [media-server/README.md](media-server/README.md). Copy API keys from setup into backend `.env`.

### 2. Backend

```bash
cd apps/backend
cp .env.example .env
# Edit LIVEKIT_* and CORS_ORIGIN
npm install
npm run dev
```

### 3. Frontend

```bash
cd apps/frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

### 4. From repo root (both apps)

```bash
npm install
npm run dev
```

Open http://localhost:5173, enter a display name, create a stream or join as viewer.

## Production (your layout)

| Machine | Service | Notes |
|---------|---------|--------|
| Windows | `apps/frontend` build → static host (IIS/nginx) | Set `VITE_API_URL` to backend URL at build time |
| Windows | `apps/backend` → `npm run build && npm start` | Point `LIVEKIT_URL` to VM (e.g. `ws://192.168.1.50:7880`) |
| Ubuntu VM | `media-server/docker compose up -d` | Open firewall ports; set `node_ip` if needed |

## Environment variables

- **Backend:** `apps/backend/.env.example`
- **Frontend:** `apps/frontend/.env.example`
- **LiveKit:** `media-server/.env.example`

Never expose LiveKit API secret to the browser — only the backend issues tokens.

## License

Private / internal use.
