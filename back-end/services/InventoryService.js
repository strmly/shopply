import Inventory from '../models/Inventory.js';
import { updateInventoryIndex } from './H3IndexingService.js';

/**
 * Inventory Service
 * Manages product inventory at stores with real-time updates
 */

// In-memory inventory storage (replace with database in production)
const inventoryStore = new Map();

/**
 * Get inventory for a product at a store
 */
export function getInventory(storeId, productId) {
  const key = `${storeId}_${productId}`;
  return inventoryStore.get(key) || null;
}

/**
 * Get all inventories for a store
 */
export function getStoreInventories(storeId) {
  const inventories = [];
  inventoryStore.forEach((inventory, key) => {
    if (key.startsWith(`${storeId}_`)) {
      inventories.push(inventory);
    }
  });
  return inventories;
}

/**
 * Get all inventories for a product across all stores
 */
export function getProductInventories(productId) {
  const inventories = [];
  inventoryStore.forEach((inventory, key) => {
    if (key.endsWith(`_${productId}`)) {
      inventories.push(inventory);
    }
  });
  return inventories;
}

/**
 * Get all inventories
 */
export function getAllInventories() {
  return Array.from(inventoryStore.values());
}

/**
 * Create or update inventory
 */
export function upsertInventory(data) {
  const inventory = new Inventory(data);
  const validation = inventory.validate();
  
  if (!validation.isValid) {
    throw new Error(`Inventory validation failed: ${validation.errors.join(', ')}`);
  }

  const key = `${inventory.storeId}_${inventory.productId}`;
  
  // Update or create
  const existing = inventoryStore.get(key);
  if (existing) {
    inventory.id = existing.id;
    inventory.createdAt = existing.createdAt;
  } else {
    inventory.id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  inventory.updatedAt = new Date();
  inventoryStore.set(key, inventory);

  // Emit inventory update event (for search index update)
  emitInventoryUpdate(inventory);

  return inventory;
}

/**
 * Update stock level
 */
export function updateStock(storeId, productId, quantity, reason = 'adjustment') {
  const inventory = getInventory(storeId, productId);
  
  if (!inventory) {
    throw new Error('Inventory not found');
  }

  inventory.updateStock(quantity, reason);
  inventory.updatedAt = new Date();

  const key = `${storeId}_${productId}`;
  inventoryStore.set(key, inventory);

  emitInventoryUpdate(inventory);

  return inventory;
}

/**
 * Reserve stock for an order
 */
export function reserveStock(storeId, productId, quantity) {
  const inventory = getInventory(storeId, productId);
  
  if (!inventory) {
    throw new Error('Inventory not found');
  }

  try {
    inventory.reserveStock(quantity);
    inventory.updatedAt = new Date();

    const key = `${storeId}_${productId}`;
    inventoryStore.set(key, inventory);

    emitInventoryUpdate(inventory);

    return inventory;
  } catch (error) {
    throw error;
  }
}

/**
 * Release reserved stock
 */
export function releaseReservedStock(storeId, productId, quantity) {
  const inventory = getInventory(storeId, productId);
  
  if (!inventory) {
    throw new Error('Inventory not found');
  }

  inventory.releaseReservedStock(quantity);
  inventory.updatedAt = new Date();

  const key = `${storeId}_${productId}`;
  inventoryStore.set(key, inventory);

  emitInventoryUpdate(inventory);

  return inventory;
}

/**
 * Confirm sale (reduce stock and reserved)
 */
export function confirmSale(storeId, productId, quantity) {
  const inventory = getInventory(storeId, productId);
  
  if (!inventory) {
    throw new Error('Inventory not found');
  }

  inventory.confirmSale(quantity);
  inventory.updatedAt = new Date();

  const key = `${storeId}_${productId}`;
  inventoryStore.set(key, inventory);

  emitInventoryUpdate(inventory);

  return inventory;
}

/**
 * Check if product is available at store
 */
export function isAvailable(storeId, productId) {
  const inventory = getInventory(storeId, productId);
  return inventory ? inventory.isAvailable() : false;
}

/**
 * Get available stock quantity
 */
export function getAvailableStock(storeId, productId) {
  const inventory = getInventory(storeId, productId);
  return inventory ? inventory.getAvailableStock() : 0;
}

/**
 * Bulk update inventories
 */
export function bulkUpdateInventories(inventoryUpdates) {
  const results = [];
  const errors = [];

  inventoryUpdates.forEach((update, index) => {
    try {
      const inventory = upsertInventory(update);
      results.push(inventory);
    } catch (error) {
      errors.push({
        index,
        update,
        error: error.message,
      });
    }
  });

  return {
    success: results.length,
    errors: errors.length,
    results,
    errorDetails: errors,
  };
}

/**
 * Emit inventory update event
 * In production, this would publish to a message queue/event stream
 */
function emitInventoryUpdate(inventory) {
  // Create index update payload
  const indexUpdate = updateInventoryIndex(
    inventory.storeId,
    inventory.productId,
    inventory
  );

  // Log event (in production, publish to event stream)
  console.log('INVENTORY_UPDATED', {
    storeId: inventory.storeId,
    productId: inventory.productId,
    availableNow: inventory.availableNow,
    stockOnHand: inventory.stockOnHand,
    timestamp: new Date(),
  });

  // In production, you would update search index here
  // await searchEngine.updateDocument(indexUpdate);
}

/**
 * Initialize inventory for a new product
 */
export function initializeInventory(storeId, productId, initialStock = 0) {
  return upsertInventory({
    storeId,
    productId,
    stockOnHand: initialStock,
    lowStockThreshold: 5,
    availableNow: initialStock > 0,
  });
}

/**
 * Get low stock items for a store
 */
export function getLowStockItems(storeId) {
  const storeInventories = getStoreInventories(storeId);
  return storeInventories.filter(inv => inv.isLowStock());
}

/**
 * Get out of stock items for a store
 */
export function getOutOfStockItems(storeId) {
  const storeInventories = getStoreInventories(storeId);
  return storeInventories.filter(inv => inv.getAvailableStock() === 0);
}

export default {
  getInventory,
  getStoreInventories,
  getProductInventories,
  getAllInventories,
  upsertInventory,
  updateStock,
  reserveStock,
  releaseReservedStock,
  confirmSale,
  isAvailable,
  getAvailableStock,
  bulkUpdateInventories,
  initializeInventory,
  getLowStockItems,
  getOutOfStockItems,
};

