import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { BroadcastRoom } from '../components/BroadcastRoom';
import { useSession } from '../context/SessionContext';

export function BroadcastPage() {
  const { roomName } = useParams<{ roomName: string }>();
  const [searchParams] = useSearchParams();
  const streamId = searchParams.get('id');
  const { user } = useSession();
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!user || !roomName) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await api.getToken(user, roomName, 'broadcaster');
        if (!cancelled) {
          setToken(res.token);
          setServerUrl(res.livekitUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to join room');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, roomName]);

  const endBroadcast = useCallback(async () => {
    if (!user || !streamId) {
      navigate('/');
      return;
    }
    setEnding(true);
    try {
      await api.endStream(user, streamId);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end stream');
      setEnding(false);
    }
  }, [user, streamId, navigate]);

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
    return <p className="empty-state">Preparing studio…</p>;
  }

  return (
    <div className="room-layout">
      <div className="room-toolbar">
        <h2 className="room-title">
          Broadcasting — <code style={{ fontFamily: 'var(--mono)' }}>{roomName}</code>
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/" className="btn btn-secondary">
            Dashboard
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={endBroadcast}
            disabled={ending}
          >
            {ending ? 'Ending…' : 'End broadcast'}
          </button>
        </div>
      </div>
      <BroadcastRoom
        token={token}
        serverUrl={serverUrl}
        onDisconnected={() => navigate('/')}
      />
    </div>
  );
}
