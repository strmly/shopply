import InventoryService from '../services/InventoryService.js';

/**
 * Inventory Controller
 * Manages product inventory operations
 */

/**
 * Get inventory for a product at a store
 * GET /api/inventory/:storeId/:productId
 */
export function getInventory(req, res) {
  try {
    const { storeId, productId } = req.params;
    const inventory = InventoryService.getInventory(storeId, productId);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found',
      });
    }

    res.json({
      success: true,
      data: inventory.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get all inventories for a store
 * GET /api/inventory/store/:storeId
 */
export function getStoreInventories(req, res) {
  try {
    const { storeId } = req.params;
    const inventories = InventoryService.getStoreInventories(storeId);

    res.json({
      success: true,
      data: inventories.map(inv => inv.toJSON()),
      count: inventories.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Create or update inventory
 * POST /api/inventory
 */
export function upsertInventory(req, res) {
  try {
    const inventoryData = req.body;
    const inventory = InventoryService.upsertInventory(inventoryData);

    res.json({
      success: true,
      data: inventory.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update stock level
 * PUT /api/inventory/:storeId/:productId/stock
 */
export function updateStock(req, res) {
  try {
    const { storeId, productId } = req.params;
    const { quantity, reason } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        error: 'Quantity is required',
      });
    }

    const inventory = InventoryService.updateStock(storeId, productId, quantity, reason);

    res.json({
      success: true,
      data: inventory.toJSON(),
      message: 'Stock updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Bulk update inventories
 * POST /api/inventory/bulk
 */
export function bulkUpdateInventories(req, res) {
  try {
    const { inventories } = req.body;

    if (!Array.isArray(inventories)) {
      return res.status(400).json({
        success: false,
        error: 'Inventories must be an array',
      });
    }

    const result = InventoryService.bulkUpdateInventories(inventories);

    res.json({
      success: true,
      data: result,
      message: `Updated ${result.success} inventories, ${result.errors} errors`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get low stock items for a store
 * GET /api/inventory/store/:storeId/low-stock
 */
export function getLowStockItems(req, res) {
  try {
    const { storeId } = req.params;
    const items = InventoryService.getLowStockItems(storeId);

    res.json({
      success: true,
      data: items.map(inv => inv.toJSON()),
      count: items.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get out of stock items for a store
 * GET /api/inventory/store/:storeId/out-of-stock
 */
export function getOutOfStockItems(req, res) {
  try {
    const { storeId } = req.params;
    const items = InventoryService.getOutOfStockItems(storeId);

    res.json({
      success: true,
      data: items.map(inv => inv.toJSON()),
      count: items.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default {
  getInventory,
  getStoreInventories,
  upsertInventory,
  updateStock,
  bulkUpdateInventories,
  getLowStockItems,
  getOutOfStockItems,
};

