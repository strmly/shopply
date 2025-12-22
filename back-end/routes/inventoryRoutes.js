import express from 'express';
import InventoryController from '../controllers/InventoryController.js';

const router = express.Router();

/**
 * Inventory routes
 * Manages product inventory
 */

// Get inventory for a product at a store
router.get('/:storeId/:productId', InventoryController.getInventory);

// Get all inventories for a store
router.get('/store/:storeId', InventoryController.getStoreInventories);

// Get low stock items
router.get('/store/:storeId/low-stock', InventoryController.getLowStockItems);

// Get out of stock items
router.get('/store/:storeId/out-of-stock', InventoryController.getOutOfStockItems);

// Create or update inventory
router.post('/', InventoryController.upsertInventory);

// Update stock level
router.put('/:storeId/:productId/stock', InventoryController.updateStock);

// Bulk update inventories
router.post('/bulk', InventoryController.bulkUpdateInventories);

export default router;

