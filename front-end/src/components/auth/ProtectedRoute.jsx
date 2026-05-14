import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Wraps routes that require authentication and/or a minimum role.
 *
 * Uses token presence (not just signedIn flag) as the real auth check,
 * because UserContext creates a guest auth entry for all users.
 *
 * Usage:
 *   <ProtectedRoute>...</ProtectedRoute>                    — any authenticated user
 *   <ProtectedRoute roles={['seller','admin']}>...</ProtectedRoute>  — role check
 */
const ProtectedRoute = ({ children, roles = null }) => {
  const { token, role } = useAuth();
  const location = useLocation();

  // No JWT → send to sign-in with return path
  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // JWT present but wrong role
  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
