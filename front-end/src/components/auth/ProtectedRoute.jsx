import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getToken, getRole } from '../../utils/authState';

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
  const { role: contextRole, loading } = useUser();
  const location = useLocation();

  // Synchronous token check — same source as UserContext initial state
  const token = getToken();
  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // While UserContext is still resolving, fall back to localStorage role
  // so we don't flash /unauthorized on every page load
  const role = loading ? getRole() : contextRole;

  // JWT present but wrong role
  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
