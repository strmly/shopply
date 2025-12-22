import { VoucherService } from '../services/VoucherService.js';

/**
 * Voucher Controller
 * Handles HTTP requests and responses for voucher operations
 */
export class VoucherController {
  /**
   * Get user's vouchers
   */
  async getUserVouchers(req, res, next) {
    try {
      const { userId } = req.query;
      const { status } = req.query; // Optional filter: 'active', 'used', 'expired'

      const vouchers = VoucherService.getUserVouchers(userId || 'default', status);

      res.json({
        success: true,
        data: vouchers.map(v => v.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active vouchers
   */
  async getActiveVouchers(req, res, next) {
    try {
      const { userId, cartTotal } = req.query;

      let vouchers = VoucherService.getActiveVouchers(userId || 'default');

      // If cartTotal is provided, return only eligible vouchers sorted by discount
      if (cartTotal) {
        const cartTotalNum = parseFloat(cartTotal);
        if (!isNaN(cartTotalNum) && cartTotalNum > 0) {
          vouchers = VoucherService.getEligibleVouchers(userId || 'default', cartTotalNum);
        }
      }

      res.json({
        success: true,
        data: vouchers.map(v => v.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get voucher by ID
   */
  async getVoucherById(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const voucher = VoucherService.getVoucherById(userId || 'default', id);

      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: 'Voucher not found',
        });
      }

      res.json({
        success: true,
        data: voucher.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get voucher summary
   */
  async getVoucherSummary(req, res, next) {
    try {
      const { userId } = req.query;

      const summary = VoucherService.getVoucherSummary(userId || 'default');

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create voucher
   */
  async createVoucher(req, res, next) {
    try {
      const { userId, ...voucherData } = req.body;

      const voucher = VoucherService.createVoucher(userId || 'default', voucherData);

      res.status(201).json({
        success: true,
        message: 'Voucher created successfully',
        data: voucher.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Apply voucher to cart (validate)
   */
  async applyVoucher(req, res, next) {
    try {
      const { userId, voucherId, cartTotal } = req.body;

      if (!voucherId) {
        return res.status(400).json({
          success: false,
          message: 'Voucher ID is required',
        });
      }

      if (cartTotal === undefined || cartTotal === null) {
        return res.status(400).json({
          success: false,
          message: 'Cart total is required',
        });
      }

      const result = VoucherService.applyVoucherToCart(
        userId || 'default',
        voucherId,
        parseFloat(cartTotal)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to apply voucher',
      });
    }
  }

  /**
   * Use voucher (mark as used)
   */
  async useVoucher(req, res, next) {
    try {
      const { userId, voucherId, orderId } = req.body;

      if (!voucherId) {
        return res.status(400).json({
          success: false,
          message: 'Voucher ID is required',
        });
      }

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      const voucher = VoucherService.useVoucher(
        userId || 'default',
        voucherId,
        orderId
      );

      res.json({
        success: true,
        message: 'Voucher used successfully',
        data: voucher.toJSON(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to use voucher',
      });
    }
  }
}

