import { Voucher } from '../models/Voucher.js';

/**
 * Voucher Service
 * Handles voucher operations
 */
class VoucherServiceClass {
  constructor() {
    // In production, this would be stored per user in database
    this.vouchers = new Map(); // userId -> Map<voucherId, voucher>
    this.voucherCodes = new Map(); // code -> voucherId (for code lookup)

    // Seed some demo vouchers
    this.seedDemoVouchers();
  }

  /**
   * Seed demo vouchers for testing
   */
  seedDemoVouchers() {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const demoVouchers = [
      new Voucher({
        id: 'voucher-1',
        userId: 'default',
        code: 'WELCOME50',
        title: 'Welcome Bonus',
        description: 'R50 off your first order - Welcome to Tsenga!',
        value: 50,
        type: 'fixed',
        minPurchase: 100,
        expiresAt: in30Days.toISOString(),
        source: 'reward',
      }),
      new Voucher({
        id: 'voucher-2',
        userId: 'default',
        code: 'SAVE10',
        title: '10% Off',
        description: 'Save 10% on your next purchase',
        value: 10,
        type: 'percentage',
        minPurchase: 50,
        maxDiscount: 100,
        expiresAt: in7Days.toISOString(),
        source: 'reward',
      }),
      new Voucher({
        id: 'voucher-3',
        userId: 'default',
        title: 'Loyalty Reward',
        description: 'R25 off for being a loyal customer',
        value: 25,
        type: 'fixed',
        minPurchase: 75,
        expiresAt: in30Days.toISOString(),
        source: 'reward',
      }),
      new Voucher({
        id: 'voucher-4',
        userId: 'default',
        title: 'Flash Sale Voucher',
        description: 'R15 off - Limited time offer!',
        value: 15,
        type: 'fixed',
        minPurchase: 30,
        expiresAt: in3Days.toISOString(),
        source: 'promotion',
      }),
      new Voucher({
        id: 'voucher-5',
        userId: 'default',
        title: '20% Off',
        description: 'Save 20% on orders over R200',
        value: 20,
        type: 'percentage',
        minPurchase: 200,
        maxDiscount: 150,
        expiresAt: in14Days.toISOString(),
        source: 'reward',
      }),
      new Voucher({
        id: 'voucher-6',
        userId: 'default',
        title: 'Expired Voucher',
        description: 'This voucher has expired',
        value: 30,
        type: 'fixed',
        minPurchase: 50,
        expiresAt: yesterday.toISOString(),
        source: 'reward',
      }),
    ];

    if (!this.vouchers.has('default')) {
      this.vouchers.set('default', new Map());
    }

    const userVouchers = this.vouchers.get('default');
    demoVouchers.forEach(voucher => {
      userVouchers.set(voucher.id, voucher);
      if (voucher.code) {
        this.voucherCodes.set(voucher.code, voucher.id);
      }
    });
  }

  /**
   * Get user's vouchers
   */
  getUserVouchers(userId = 'default', status = null) {
    if (!this.vouchers.has(userId)) {
      this.vouchers.set(userId, new Map());
    }

    const userVouchers = Array.from(this.vouchers.get(userId).values());

    // Update expired vouchers
    userVouchers.forEach(voucher => {
      if (voucher.isUsable() === false && voucher.status === 'active') {
        voucher.markAsExpired();
      }
    });

    // Filter by status if provided
    if (status) {
      return userVouchers.filter(v => v.getStatus() === status);
    }

    return userVouchers.sort((a, b) => {
      // Sort: active first, then by expiry date
      if (a.getStatus() !== b.getStatus()) {
        const statusOrder = { active: 0, used: 1, expired: 2 };
        return statusOrder[a.getStatus()] - statusOrder[b.getStatus()];
      }
      if (a.expiresAt && b.expiresAt) {
        return new Date(a.expiresAt) - new Date(b.expiresAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * Get active vouchers
   */
  getActiveVouchers(userId = 'default') {
    return this.getUserVouchers(userId, 'active');
  }

  /**
   * Get voucher by ID
   */
  getVoucherById(userId, voucherId) {
    if (!this.vouchers.has(userId)) {
      return null;
    }

    const voucher = this.vouchers.get(userId).get(voucherId);
    if (!voucher) {
      return null;
    }

    // Update status if expired
    if (voucher.isUsable() === false && voucher.status === 'active') {
      voucher.markAsExpired();
    }

    return voucher;
  }

  /**
   * Get voucher by code
   */
  getVoucherByCode(code) {
    const voucherId = this.voucherCodes.get(code.toUpperCase());
    if (!voucherId) {
      return null;
    }

    // Find voucher across all users (in production, this would be a database query)
    for (const [userId, userVouchers] of this.vouchers.entries()) {
      const voucher = userVouchers.get(voucherId);
      if (voucher) {
        return voucher;
      }
    }

    return null;
  }

  /**
   * Create a new voucher
   */
  createVoucher(userId, voucherData) {
    if (!this.vouchers.has(userId)) {
      this.vouchers.set(userId, new Map());
    }

    const voucher = new Voucher({
      ...voucherData,
      userId,
      id: `voucher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    const validation = voucher.validate();
    if (!validation.isValid) {
      throw new Error(`Voucher validation failed: ${validation.errors.join(', ')}`);
    }

    this.vouchers.get(userId).set(voucher.id, voucher);

    if (voucher.code) {
      this.voucherCodes.set(voucher.code.toUpperCase(), voucher.id);
    }

    return voucher;
  }

  /**
   * Apply voucher to cart (validate and calculate discount)
   */
  applyVoucherToCart(userId, voucherId, cartTotal) {
    // Validate cart total
    if (!cartTotal || cartTotal <= 0) {
      throw new Error('Cart total must be greater than zero');
    }

    const voucher = this.getVoucherById(userId, voucherId);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    const status = voucher.getStatus();
    if (status !== 'active') {
      if (status === 'used') {
        throw new Error('This voucher has already been used');
      }
      if (status === 'expired') {
        throw new Error('This voucher has expired');
      }
      throw new Error('Voucher is not usable');
    }

    if (cartTotal < voucher.minPurchase) {
      const shortfall = voucher.minPurchase - cartTotal;
      throw new Error(`Add R${shortfall.toFixed(2)} more to your cart to use this voucher (minimum R${voucher.minPurchase})`);
    }

    const discount = voucher.calculateDiscount(cartTotal);
    
    if (discount <= 0) {
      throw new Error('Voucher discount could not be calculated');
    }

    return {
      voucher: voucher.toJSON(),
      discount: parseFloat(discount.toFixed(2)),
      isValid: true,
      savings: discount,
      finalTotal: parseFloat((cartTotal - discount).toFixed(2)),
    };
  }

  /**
   * Use voucher (mark as used after order)
   */
  useVoucher(userId, voucherId, orderId) {
    const voucher = this.getVoucherById(userId, voucherId);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (!voucher.isUsable()) {
      throw new Error('Voucher is not usable');
    }

    voucher.markAsUsed(orderId);
    return voucher;
  }

  /**
   * Get eligible vouchers for a cart total
   */
  getEligibleVouchers(userId, cartTotal) {
    const activeVouchers = this.getActiveVouchers(userId);
    return activeVouchers.filter(v => {
      if (cartTotal < v.minPurchase) {
        return false;
      }
      const discount = v.calculateDiscount(cartTotal);
      return discount > 0;
    }).sort((a, b) => {
      // Sort by discount value (highest first)
      const discountA = a.calculateDiscount(cartTotal);
      const discountB = b.calculateDiscount(cartTotal);
      return discountB - discountA;
    });
  }

  /**
   * Get voucher summary for user
   */
  getVoucherSummary(userId = 'default') {
    const allVouchers = this.getUserVouchers(userId);
    const active = allVouchers.filter(v => v.getStatus() === 'active');
    const used = allVouchers.filter(v => v.getStatus() === 'used');
    const expired = allVouchers.filter(v => v.getStatus() === 'expired');

    // Calculate total available value (estimate at R150 cart for percentage vouchers)
    const estimateCartValue = 150;
    const totalAvailable = active.reduce((sum, v) => {
      if (v.type === 'percentage') {
        const estimatedDiscount = Math.min(
          (estimateCartValue * v.value) / 100,
          v.maxDiscount || Infinity
        );
        return sum + estimatedDiscount;
      }
      return sum + v.value;
    }, 0);

    // Calculate total savings from used vouchers
    const totalSavings = used.reduce((sum, v) => {
      // Estimate savings at R100 cart value for used vouchers
      if (v.type === 'percentage') {
        return sum + Math.min((100 * v.value) / 100, v.maxDiscount || 0);
      }
      return sum + v.value;
    }, 0);

    return {
      total: allVouchers.length,
      active: active.length,
      used: used.length,
      expired: expired.length,
      totalAvailableValue: parseFloat(totalAvailable.toFixed(2)),
      totalSavings: parseFloat(totalSavings.toFixed(2)),
      expiringSoon: active.filter(v => v.isExpiringSoon()).length,
    };
  }
}

export const VoucherService = new VoucherServiceClass();

