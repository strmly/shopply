import { getAuthUser } from './authState.js';

/**
 * Return the signed-in user's ID, falling back to 'default' for
 * unauthenticated sessions so existing backend fallback logic still works.
 */
export function getCurrentUserId() {
  return getAuthUser()?.id || 'default';
}

/**
 * Return the signed-in user's JWT token, or null if not signed in.
 */
export function getCurrentUserToken() {
  return getAuthUser()?.token ?? null;
}
