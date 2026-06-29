import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps protected pages: shows a loader while restoring session, redirects to /login if not authed
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
