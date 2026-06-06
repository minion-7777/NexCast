import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Stream } from '../api/client';
import { useSession } from '../context/SessionContext';

export function HomePage() {
  const { user } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const { streams: list } = await api.listStreams(user);
      setStreams(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const { stream } = await api.createStream(user, title.trim());
      setTitle('');
      window.location.href = `/broadcast/${stream.roomName}?id=${stream.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stream');
      setCreating(false);
    }
  }

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>Start a broadcast</h2>
        {error && <div className="error-banner">{error}</div>}
        <form
          onSubmit={handleCreate}
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            maxWidth: 560,
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label" htmlFor="streamTitle">
              Stream title
            </label>
            <input
              id="streamTitle"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="All-hands, training, event…"
              maxLength={120}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating || !title.trim()}
          >
            {creating ? 'Creating…' : 'Go live'}
          </button>
        </form>
      </section>

      <section>
        <h2>Live streams</h2>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : streams.length === 0 ? (
          <p className="empty-state">No live streams right now.</p>
        ) : (
          <div className="card-grid">
            {streams.map((stream) => (
              <article key={stream.id} className="card stream-card">
                <h3>
                  <span className="live-dot" aria-hidden />
                  {stream.title}
                </h3>
                <p className="meta">
                  Host: {stream.hostDisplayName}
                  <br />
                  Room: <code style={{ fontFamily: 'var(--mono)' }}>{stream.roomName}</code>
                </p>
                <div className="actions">
                  <Link
                    to={`/watch/${stream.roomName}`}
                    className="btn btn-primary"
                  >
                    Watch
                  </Link>
                  {user?.identity === stream.hostIdentity && (
                    <Link
                      to={`/broadcast/${stream.roomName}?id=${stream.id}`}
                      className="btn btn-secondary"
                    >
                      Studio
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
