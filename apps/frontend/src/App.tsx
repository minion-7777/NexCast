import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SessionProvider } from './context/SessionContext';
import { BroadcastPage } from './pages/BroadcastPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { WatchPage } from './pages/WatchPage';

export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/broadcast/:roomName" element={<BroadcastPage />} />
                  <Route path="/watch/:roomName" element={<WatchPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </SessionProvider>
  );
}
