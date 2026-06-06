# NexCast Media Server (LiveKit)

Run LiveKit on your **Ubuntu VM**. Windows hosts the React app and Node API; browsers connect to this VM for WebRTC.

## Requirements

- Ubuntu 22.04+ (or similar)
- Docker Engine + Docker Compose plugin
- VM has a static LAN IP (e.g. `192.168.1.100`)

## Install Docker (Ubuntu)

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```

Log out and back in so `docker` works without `sudo`.

## Configure

```bash
cd media-server
cp .env.example .env
# Edit LIVEKIT_API_KEY / LIVEKIT_API_SECRET — use long random values in production
nano .env
```

Edit `livekit.yaml` and set `rtc.node_ip` to the VM’s IP if clients cannot connect:

```yaml
rtc:
  use_external_ip: false
  node_ip: 192.168.1.100
```

## Start

```bash
docker compose --env-file .env up -d
docker compose logs -f livekit
```

Verify:

```bash
curl -s http://127.0.0.1:7880
```

## Firewall (UFW example)

```bash
sudo ufw allow 7880/tcp
sudo ufw allow 7881/tcp
sudo ufw allow 50000:60000/udp
sudo ufw reload
```

| Port | Protocol | Purpose |
|------|----------|---------|
| 7880 | TCP | LiveKit HTTP / WebSocket |
| 7881 | TCP | WebRTC over TCP fallback |
| 50000–60000 | UDP | WebRTC media |

## Wire backend (Windows)

In `apps/backend/.env`:

```env
LIVEKIT_API_KEY=<same as media-server>
LIVEKIT_API_SECRET=<same as media-server>
LIVEKIT_HTTP_URL=http://192.168.1.100:7880
LIVEKIT_WS_URL=ws://192.168.1.100:7880
```

## Production notes

- Generate strong API key/secret pairs; never commit `.env`.
- For HTTPS/WSS, put a reverse proxy (nginx/Caddy) in front of port 7880 and use `wss://` in `LIVEKIT_WS_URL`.
- `network_mode: host` is used so UDP port ranges work reliably on a single VM. For Docker bridge mode you must publish the full UDP range explicitly.

## Stop

```bash
docker compose down
```
