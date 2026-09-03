import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <main className="session-loading">Đang kiểm tra phiên đăng nhập…</main>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function GuestRoute() {
  const { user, initializing } = useAuth();
  if (initializing) return <main className="session-loading">Đang kiểm tra phiên đăng nhập…</main>;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
