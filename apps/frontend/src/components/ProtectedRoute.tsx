import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
