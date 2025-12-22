import { BaseModel } from './BaseModel.js';

/**
 * Voucher Model
 * Represents user vouchers/rewards that can be applied at checkout
 */
export class Voucher extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.code = data.code || null; // Optional voucher code (for manual entry)
    this.title = data.title || '';
    this.description = data.description || '';
    this.value = data.value || 0; // Discount value in Rands
    this.type = data.type || 'fixed'; // 'fixed' (R50 off) or 'percentage' (10% off)
    this.minPurchase = data.minPurchase || 0; // Minimum purchase amount to use
    this.maxDiscount = data.maxDiscount || null; // Max discount for percentage vouchers
    this.expiresAt = data.expiresAt || null;
    this.usedAt = data.usedAt || null;
    this.orderId = data.orderId || null; // Order where voucher was used
    this.status = data.status || 'active'; // 'active', 'used', 'expired'
    this.source = data.source || 'reward'; // 'reward', 'promotion', 'referral', 'manual'
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Voucher title is required');
    }

    if (this.value <= 0) {
      errors.push('Voucher value must be greater than zero');
    }

    if (this.type === 'percentage' && this.value > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    }

    if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
      errors.push('Expiry date cannot be in the past');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if voucher is currently usable
   */
  isUsable() {
    if (this.status === 'used') {
      return false;
    }

    if (this.status === 'expired') {
      return false;
    }

    if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Check if voucher is expiring soon (within 7 days)
   */
  isExpiringSoon() {
    if (!this.expiresAt || this.status !== 'active') {
      return false;
    }

    const now = new Date();
    const expiry = new Date(this.expiresAt);
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);

    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }

  /**
   * Calculate discount amount for a given cart total
   */
  calculateDiscount(cartTotal) {
    if (!this.isUsable()) {
      return 0;
    }

    if (cartTotal < this.minPurchase) {
      return 0;
    }

    let discount = 0;

    if (this.type === 'fixed') {
      discount = this.value;
    } else if (this.type === 'percentage') {
      discount = cartTotal * (this.value / 100);
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
    }

    // Don't allow discount to exceed cart total
    return Math.min(discount, cartTotal);
  }

  /**
   * Mark voucher as used
   */
  markAsUsed(orderId) {
    this.status = 'used';
    this.usedAt = new Date();
    this.orderId = orderId;
    this.updatedAt = new Date();
  }

  /**
   * Mark voucher as expired
   */
  markAsExpired() {
    if (this.status === 'active') {
      this.status = 'expired';
      this.updatedAt = new Date();
    }
  }

  /**
   * Get status string
   */
  getStatus() {
    if (this.status === 'used') {
      return 'used';
    }

    if (this.status === 'expired') {
      return 'expired';
    }

    if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
      return 'expired';
    }

    return 'active';
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      code: this.code,
      title: this.title,
      description: this.description,
      value: this.value,
      type: this.type,
      minPurchase: this.minPurchase,
      maxDiscount: this.maxDiscount,
      expiresAt: this.expiresAt,
      usedAt: this.usedAt,
      orderId: this.orderId,
      status: this.getStatus(),
      source: this.source,
      isUsable: this.isUsable(),
      isExpiringSoon: this.isExpiringSoon(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

