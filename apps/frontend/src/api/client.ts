const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface SessionUser {
  identity: string;
  displayName: string;
}

export interface Stream {
  id: string;
  roomName: string;
  title: string;
  hostIdentity: string;
  hostDisplayName: string;
  createdAt: string;
  isLive: boolean;
  hasActiveRoom?: boolean;
}

export interface TokenResponse {
  token: string;
  livekitUrl: string;
  roomName: string;
  role: 'broadcaster' | 'viewer';
}

function headers(user?: SessionUser): HeadersInit {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const apiKey = import.meta.env.VITE_INTERNAL_API_KEY;
  if (apiKey) {
    h['x-nexcast-api-key'] = apiKey;
  }
  if (user) {
    h['x-nexcast-identity'] = user.identity;
    h['x-nexcast-display-name'] = user.displayName;
  }
  return h;
}

async function request<T>(
  path: string,
  options: RequestInit & { user?: SessionUser } = {},
): Promise<T> {
  const { user, ...init } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...headers(user),
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  createSession(displayName: string): Promise<SessionUser> {
    return request<SessionUser>('/api/session', {
      method: 'POST',
      body: JSON.stringify({ displayName }),
    });
  },

  listStreams(user: SessionUser): Promise<{ streams: Stream[] }> {
    return request('/api/streams', { user });
  },

  createStream(user: SessionUser, title: string): Promise<{ stream: Stream }> {
    return request('/api/streams', {
      method: 'POST',
      user,
      body: JSON.stringify({ title }),
    });
  },

  endStream(user: SessionUser, streamId: string): Promise<{ stream: Stream }> {
    return request(`/api/streams/${streamId}`, {
      method: 'DELETE',
      user,
    });
  },

  getToken(
    user: SessionUser,
    roomName: string,
    role: 'broadcaster' | 'viewer',
  ): Promise<TokenResponse> {
    return request<TokenResponse>('/api/token', {
      method: 'POST',
      user,
      body: JSON.stringify({ roomName, role }),
    });
  },
};
