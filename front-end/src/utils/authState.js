const AUTH_STORAGE_KEY = 'tsenga_auth_user';

const canUseStorage = () => typeof window !== 'undefined' && window.localStorage;

export const getAuthUser = () => {
  if (!canUseStorage()) return null;

  try {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const isSignedIn = () => {
  const user = getAuthUser();
  return Boolean(user?.signedIn && user?.registered);
};

export const saveAuthUser = (user) => {
  if (!canUseStorage()) return null;

  const savedUser = {
    ...user,
    signedIn: true,
    registered: true,
    signedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(savedUser));
  window.dispatchEvent(new Event('authChanged'));
  return savedUser;
};

export const clearAuthUser = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem('shopply_user'); // clear cached profile too
  window.dispatchEvent(new Event('authChanged'));
};

export const getToken = () => {
  const user = getAuthUser();
  return user?.token || null;
};

export const getRole = () => {
  const user = getAuthUser();
  return user?.role || 'guest';
};

export { AUTH_STORAGE_KEY };
