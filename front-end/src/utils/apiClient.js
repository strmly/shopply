import { getToken } from './authState';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Thin fetch wrapper that automatically attaches the JWT Authorization header
 * and sets Content-Type: application/json for non-FormData bodies.
 *
 * Usage mirrors native fetch — just swap `fetch('/api/...')` for `apiFetch('/...')`.
 */
export const apiFetch = (path, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE}${path}`, { ...options, headers });
};

export default apiFetch;
