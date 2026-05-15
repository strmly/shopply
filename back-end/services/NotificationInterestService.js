// back-end/services/NotificationInterestService.js
// Simple in-memory store for back-in-stock notification interest.

/**
 * Map key: `${productId}:${storeId}`
 * Map value: Set<email>
 */
const interests = new Map();

/**
 * Build the composite key used to group interests by product + store.
 */
function makeKey(productId, storeId) {
  return `${String(productId)}:${String(storeId)}`;
}

/**
 * Register an email address as interested in back-in-stock notifications
 * for a specific product at a specific store.
 *
 * @param {string|number} productId
 * @param {string|number} storeId
 * @param {string} email
 */
export function addInterest(productId, storeId, email) {
  if (!productId || !storeId || !email) throw new Error('productId, storeId, and email are required');
  const key = makeKey(productId, storeId);
  if (!interests.has(key)) {
    interests.set(key, new Set());
  }
  interests.get(key).add(String(email).toLowerCase().trim());
}

/**
 * Retrieve all email addresses that have registered interest for a product
 * at a given store.
 *
 * @param {string|number} productId
 * @param {string|number} storeId
 * @returns {string[]} Array of email addresses
 */
export function getInterests(productId, storeId) {
  const key = makeKey(productId, storeId);
  const set = interests.get(key);
  return set ? Array.from(set) : [];
}

/**
 * Remove an email address from the interest list for a product at a store.
 *
 * @param {string|number} productId
 * @param {string|number} storeId
 * @param {string} email
 * @returns {boolean} true if the email was found and removed
 */
export function removeInterest(productId, storeId, email) {
  if (!productId || !storeId || !email) throw new Error('productId, storeId, and email are required');
  const key = makeKey(productId, storeId);
  const set = interests.get(key);
  if (!set) return false;
  const normalised = String(email).toLowerCase().trim();
  const deleted = set.delete(normalised);
  if (set.size === 0) interests.delete(key);
  return deleted;
}

export default { addInterest, getInterests, removeInterest };
