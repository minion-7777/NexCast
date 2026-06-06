import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { ViewerRoom } from '../components/BroadcastRoom';
import { useSession } from '../context/SessionContext';

export function WatchPage() {
  const { roomName } = useParams<{ roomName: string }>();
  const { user } = useSession();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !roomName) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await api.getToken(user, roomName, 'viewer');
        if (!cancelled) {
          setToken(res.token);
          setServerUrl(res.livekitUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to join stream');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, roomName]);

  if (!roomName) {
    return <div className="error-banner">Missing room name</div>;
  }

  if (error) {
    return (
      <div>
        <div className="error-banner">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back home
        </Link>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return <p className="empty-state">Connecting to stream…</p>;
  }

  return (
    <div className="room-layout">
      <div className="room-toolbar">
        <h2 className="room-title">
          Watching — <code style={{ fontFamily: 'var(--mono)' }}>{roomName}</code>
        </h2>
        <Link to="/" className="btn btn-secondary">
          Leave
        </Link>
      </div>
      <ViewerRoom
        token={token}
        serverUrl={serverUrl}
        onDisconnected={() => navigate('/')}
      />
    </div>
  );
}
