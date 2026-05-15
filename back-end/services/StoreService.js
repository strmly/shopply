import Store from '../models/Store.js';
import { indexStore } from './H3IndexingService.js';
import { latLngToCell, gridDisk } from 'h3-js';

/**
 * Compute delivery cells for a store given its lat/lng and delivery radius (km).
 * Uses H3 resolution 7 (approx. 1.2 km per hex).
 */
function computeDeliveryCells(lat, lng, deliveryRadiusKm) {
  if (!lat || !lng || !deliveryRadiusKm || deliveryRadiusKm <= 0) return [];
  try {
    const centerCell = latLngToCell(lat, lng, 7);
    const ringSize = Math.ceil(deliveryRadiusKm / 1.2);
    return gridDisk(centerCell, ringSize);
  } catch {
    return [];
  }
}

/**
 * Store Service
 * Manages store operations with H3 geospatial indexing
 */

// In-memory store storage (replace with database in production)
const storeStore = new Map();

/**
 * Get all stores
 */
export function getAllStores() {
  return Array.from(storeStore.values());
}

/**
 * Get store by ID
 */
export function getStoreById(storeId) {
  return storeStore.get(storeId) || null;
}

/**
 * Get stores by seller ID
 */
export function getStoresBySeller(sellerId) {
  return getAllStores().filter(store => store.sellerId === sellerId);
}

/**
 * Create a new store
 */
export function createStore(storeData, seller = null) {
  const store = new Store(storeData);

  // Compute deliveryCells from store lat/lng and delivery radius
  const lat = store.address?.lat;
  const lng = store.address?.lng;
  const deliveryRadiusKm = storeData.deliveryRadiusKm
    || seller?.deliveryRadiusKm
    || store.policies?.deliveryRadiusKm
    || 0;
  if (!store.deliveryCells || store.deliveryCells.length === 0) {
    store.deliveryCells = computeDeliveryCells(lat, lng, deliveryRadiusKm);
  }

  // Validate store
  const validation = store.validate();
  if (!validation.valid) {
    throw new Error(`Store validation failed: ${validation.errors.join(', ')}`);
  }

  // Index store with H3 cells
  try {
    indexStore(store, seller);
  } catch (error) {
    throw new Error(`Failed to index store: ${error.message}`);
  }

  // Save store
  storeStore.set(store.id, store);

  return store;
}

/**
 * Update store
 */
export function updateStore(storeId, updates, seller = null) {
  const store = getStoreById(storeId);
  
  if (!store) {
    throw new Error('Store not found');
  }

  // Update fields
  Object.assign(store, updates);
  store.updatedAt = new Date();

  // Validate
  const validation = store.validate();
  if (!validation.valid) {
    throw new Error(`Store validation failed: ${validation.errors.join(', ')}`);
  }

  // Re-index if location changed
  if (updates.address && (updates.address.lat || updates.address.lng)) {
    try {
      indexStore(store, seller);
    } catch (error) {
      throw new Error(`Failed to re-index store: ${error.message}`);
    }
  }

  storeStore.set(storeId, store);

  return store;
}

/**
 * Delete store
 */
export function deleteStore(storeId) {
  const store = getStoreById(storeId);
  
  if (!store) {
    throw new Error('Store not found');
  }

  storeStore.delete(storeId);

  return { success: true, message: 'Store deleted successfully' };
}

/**
 * Search stores by name or location
 */
export function searchStores(query) {
  const lowerQuery = query.toLowerCase();
  return getAllStores().filter(store => 
    store.name.toLowerCase().includes(lowerQuery) ||
    store.type.toLowerCase().includes(lowerQuery) ||
    (store.address && (
      store.address.suburb?.toLowerCase().includes(lowerQuery) ||
      store.address.city?.toLowerCase().includes(lowerQuery)
    ))
  );
}

/**
 * Get stores by category
 */
export function getStoresByCategory(category) {
  return getAllStores().filter(store => 
    store.categories.includes(category)
  );
}

/**
 * Get stores by H3 cell
 */
export function getStoresByH3Cell(h3Cell, resolution = 7) {
  const h3Field = `h3_r${resolution}`;
  return getAllStores().filter(store => store[h3Field] === h3Cell);
}

export default {
  getAllStores,
  getStoreById,
  getStoresBySeller,
  createStore,
  updateStore,
  deleteStore,
  searchStores,
  getStoresByCategory,
  getStoresByH3Cell,
};

