import { BaseModel } from './BaseModel.js';

/**
 * Inventory Model
 * Tracks stock levels for products at specific stores
 */
export class Inventory extends BaseModel {
  constructor(data = {}) {
    super(data);
    
    this.id = data.id || null;
    this.storeId = data.storeId || null;
    this.productId = data.productId || null;
    this.stockOnHand = data.stockOnHand || 0;
    this.lowStockThreshold = data.lowStockThreshold || 5;
    this.availableNow = data.availableNow !== undefined ? data.availableNow : true;
    this.reservedStock = data.reservedStock || 0; // Stock reserved for pending orders
    this.lastRestockedAt = data.lastRestockedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Check if product is available
   */
  isAvailable() {
    return this.availableNow && (this.stockOnHand - this.reservedStock) > 0;
  }

  /**
   * Get effective available stock
   */
  getAvailableStock() {
    return Math.max(0, this.stockOnHand - this.reservedStock);
  }

  /**
   * Check if stock is low
   */
  isLowStock() {
    return this.getAvailableStock() <= this.lowStockThreshold && this.getAvailableStock() > 0;
  }

  /**
   * Update stock level
   */
  updateStock(quantity, reason = 'adjustment') {
    this.stockOnHand = Math.max(0, quantity);
    this.updatedAt = new Date();
    
    if (quantity > this.stockOnHand) {
      this.lastRestockedAt = new Date();
    }
    
    return this;
  }

  /**
   * Reserve stock for an order
   */
  reserveStock(quantity) {
    const available = this.getAvailableStock();
    if (quantity > available) {
      throw new Error(`Insufficient stock. Available: ${available}, Requested: ${quantity}`);
    }
    this.reservedStock += quantity;
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Release reserved stock
   */
  releaseReservedStock(quantity) {
    this.reservedStock = Math.max(0, this.reservedStock - quantity);
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Confirm sale (reduce stock and reserved)
   */
  confirmSale(quantity) {
    this.stockOnHand = Math.max(0, this.stockOnHand - quantity);
    this.reservedStock = Math.max(0, this.reservedStock - quantity);
    this.updatedAt = new Date();
    return this;
  }

  validate() {
    const errors = [];

    if (!this.storeId) {
      errors.push('Store ID is required');
    }

    if (!this.productId) {
      errors.push('Product ID is required');
    }

    if (this.stockOnHand < 0) {
      errors.push('Stock on hand cannot be negative');
    }

    if (this.reservedStock < 0) {
      errors.push('Reserved stock cannot be negative');
    }

    if (this.reservedStock > this.stockOnHand) {
      errors.push('Reserved stock cannot exceed stock on hand');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toJSON() {
    return {
      id: this.id,
      storeId: this.storeId,
      productId: this.productId,
      stockOnHand: this.stockOnHand,
      lowStockThreshold: this.lowStockThreshold,
      availableNow: this.availableNow,
      reservedStock: this.reservedStock,
      availableStock: this.getAvailableStock(),
      isLowStock: this.isLowStock(),
      lastRestockedAt: this.lastRestockedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Inventory;

