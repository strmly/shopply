import { useState, useEffect } from 'react';
import { getAuthUser, isSignedIn, getToken, getRole } from '../utils/authState';
import { can, hasMinimumRole } from '../config/roles';

export const useAuth = () => {
  const [state, setState] = useState(() => {
    const user = getAuthUser();
    return {
      user,
      role: user?.role || 'guest',
      isSignedIn: isSignedIn(),
      token: user?.token || null,
    };
  });

  useEffect(() => {
    const sync = () => {
      const user = getAuthUser();
      setState({
        user,
        role: user?.role || 'guest',
        isSignedIn: isSignedIn(),
        token: user?.token || null,
      });
    };
    window.addEventListener('authChanged', sync);
    return () => window.removeEventListener('authChanged', sync);
  }, []);

  return {
    ...state,
    hasRole: (role) => hasMinimumRole(state.role, role),
    can: (permission) => can(state.role, permission),
  };
};
