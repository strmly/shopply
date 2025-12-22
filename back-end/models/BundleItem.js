import { BaseModel } from './BaseModel.js';

/**
 * BundleItem Model
 * Represents a product curated by a user for a specific bundle
 */
export class BundleItem extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || null;
    this.bundleType = data.bundleType || ''; // 'grocery-stores', 'electronics', 'food-favorites'
    this.productId = data.productId || null;
    this.userId = data.userId || 'default';
    this.userName = data.userName || 'Local Shopper';
    this.location = data.location || null; // { suburb, city }
    this.reason = data.reason || ''; // Optional reason for recommendation
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.bundleType || this.bundleType.trim().length === 0) {
      errors.push('Bundle type is required');
    }

    if (!this.productId) {
      errors.push('Product ID is required');
    }

    if (!this.userId || this.userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    const validBundleTypes = ['grocery-stores', 'electronics', 'food-favorites'];
    if (!validBundleTypes.includes(this.bundleType)) {
      errors.push(`Invalid bundle type. Must be one of: ${validBundleTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toJSON() {
    return {
      id: this.id,
      bundleType: this.bundleType,
      productId: this.productId,
      userId: this.userId,
      userName: this.userName,
      location: this.location,
      reason: this.reason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
