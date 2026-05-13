import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '@config/api';

const STORAGE_KEY = 'shopply_user';
const AUTH_STORAGE_KEY = 'tsenga_auth_user';
const USER_ID = 'default';

const ensureGuestAuth = (userData) => {
  try {
    const existing = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!existing) {
      const authUser = { ...userData, signedIn: true, registered: true, signedInAt: new Date().toISOString() };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      window.dispatchEvent(new Event('authChanged'));
    }
  } catch {}
};

const DEFAULT_USER = {
  id: USER_ID,
  name: 'Guest User',
  firstName: 'Guest',
  lastName: 'User',
  email: 'guest@example.com',
  mobile: '',
  avatarUrl: '',
  role: 'buyer',
  isSeller: false,
};

const UserContext = createContext({
  user: DEFAULT_USER,
  loading: true,
  updateUser: async () => {},
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: 'Guest', lastName: 'User' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const initial = cached ? { ...DEFAULT_USER, ...JSON.parse(cached) } : DEFAULT_USER;
      ensureGuestAuth(initial);
      return initial;
    } catch {
      ensureGuestAuth(DEFAULT_USER);
      return DEFAULT_USER;
    }
  });
  const [loading, setLoading] = useState(true);

  const applyProfile = (data) => {
    const { firstName, lastName } = splitName(data.name || '');
    const merged = {
      ...DEFAULT_USER,
      ...data,
      firstName: data.firstName || firstName,
      lastName: data.lastName || lastName,
    };
    setUser(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    ensureGuestAuth(merged);
    return merged;
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/${USER_ID}`);
      const d = await res.json();
      if (d.success && d.data) applyProfile(d.data);
    } catch {
      // keep cached value
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const updateUser = useCallback(async (patch) => {
    // Optimistic update
    const next = { ...user, ...patch };
    if (patch.firstName !== undefined || patch.lastName !== undefined) {
      next.name = [patch.firstName ?? user.firstName, patch.lastName ?? user.lastName]
        .filter(Boolean).join(' ').trim();
    }
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Persist to backend
    await fetch(`${API_BASE_URL}/profile/${USER_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: next.name,
        email: next.email,
        mobile: next.mobile,
        avatarUrl: next.avatarUrl,
      }),
    });
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
