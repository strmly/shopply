import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { can as canFn } from '@config/roles';
import { getAuthUser, getRole, getToken, clearAuthUser } from '../utils/authState';
import apiFetch from '../utils/apiClient';

const STORAGE_KEY = 'shopply_user';

const DEFAULT_USER = {
  id: null,
  name: 'Guest',
  firstName: 'Guest',
  lastName: '',
  email: '',
  mobile: '',
  avatarUrl: '',
  role: 'guest',
  isSeller: false,
};

const UserContext = createContext({
  user: DEFAULT_USER,
  loading: true,
  role: 'guest',
  can: () => false,
  updateUser: async () => {},
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const buildUser = (data) => {
  if (!data) return null;
  const { firstName, lastName } = splitName(data.name || '');
  return {
    ...DEFAULT_USER,
    ...data,
    firstName: data.firstName || firstName,
    lastName: data.lastName || lastName,
  };
};

const getInitialUser = () => {
  try {
    const authUser = getAuthUser();
    if (authUser?.token) return buildUser(authUser);
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return { ...DEFAULT_USER, ...JSON.parse(cached) };
  } catch {}
  return DEFAULT_USER;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(true);
  const [authRole, setAuthRole] = useState(() => getRole());

  const applyUser = useCallback((data) => {
    const merged = buildUser(data) || DEFAULT_USER;
    setUser(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  }, []);

  // Fetch fresh data from /api/auth/me using the JWT
  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/auth/me');
      const d = await res.json();
      if (d.success && d.data?.user) applyUser(d.data.user);
    } catch {
      // keep current state
    } finally {
      setLoading(false);
    }
  }, [applyUser]);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  // React to sign-in / sign-out events
  useEffect(() => {
    const handler = () => {
      const authUser = getAuthUser();
      setAuthRole(getRole());
      if (authUser?.token) {
        setUser(buildUser(authUser) || DEFAULT_USER);
        refreshUser();
      } else {
        setUser(DEFAULT_USER);
        localStorage.removeItem(STORAGE_KEY);
        setLoading(false);
      }
    };
    window.addEventListener('authChanged', handler);
    return () => window.removeEventListener('authChanged', handler);
  }, [refreshUser]);

  const updateUser = useCallback(async (patch) => {
    const authUser = getAuthUser();
    const userId = authUser?.id || 'default';

    const next = { ...user, ...patch };
    if (patch.firstName !== undefined || patch.lastName !== undefined) {
      next.name = [patch.firstName ?? user.firstName, patch.lastName ?? user.lastName]
        .filter(Boolean).join(' ').trim();
    }
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    const res = await apiFetch(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({
        firstName: next.firstName,
        lastName: next.lastName,
        name: next.name,
        email: next.email,
        mobile: next.mobile,
        avatarUrl: next.avatarUrl,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      applyUser(user);
      throw new Error(data.message || 'Could not update profile');
    }
    if (data.data) applyUser(data.data);
  }, [applyUser, user]);

  const role = (authRole && authRole !== 'guest') ? authRole : (user.role || 'guest');

  return (
    <UserContext.Provider value={{ user, loading, role, can: (p) => canFn(role, p), updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
