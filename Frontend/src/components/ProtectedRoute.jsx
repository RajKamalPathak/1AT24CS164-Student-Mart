import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Authenticated Route Guard
 * Ensures only logged-in users can access protected routes like Checkout, Orders, and Account.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-state-box" style={{ margin: '3rem auto', maxWidth: 420 }}>
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectTarget = location.pathname.replace(/^\//, '');
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  return <Outlet />;
}
