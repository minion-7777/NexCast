import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useSession();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/">
          <h1>
            <span>Nex</span>Cast
          </h1>
        </Link>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="user-badge">
              Signed in as <strong>{user.displayName}</strong>
            </span>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Sign out
            </button>
          </div>
        )}
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
