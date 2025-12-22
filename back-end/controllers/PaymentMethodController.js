import { PaymentMethodService } from '../services/PaymentMethodService.js';

const paymentMethodService = new PaymentMethodService();

/**
 * Payment Method Controller
 */
export class PaymentMethodController {
  /**
   * Get payment method by ID
   */
  async getPaymentMethodById(req, res, next) {
    try {
      const { id } = req.params;
      
      const paymentMethod = await paymentMethodService.getPaymentMethodById(id);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      res.json({
        success: true,
        data: paymentMethod.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment methods by user ID
   */
  async getPaymentMethodsByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const paymentMethods = await paymentMethodService.getPaymentMethodsByUserId(userId);
      
      res.json({
        success: true,
        data: paymentMethods.map(pm => pm.toJSON()),
        count: paymentMethods.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's payment methods
   */
  async getMyPaymentMethods(req, res, next) {
    try {
      // TODO: Get userId from authenticated user (req.user.id)
      // For now, use query param or default
      const userId = req.query.userId || req.user?.id || 'default';
      const paymentMethods = await paymentMethodService.getUserPaymentMethods(userId);
      
      res.json({
        success: true,
        data: paymentMethods.map(pm => pm.toJSON()),
        count: paymentMethods.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new payment method
   */
  async createPaymentMethod(req, res, next) {
    try {
      // TODO: Get userId from authenticated user (req.user.id)
      const userId = req.body.userId || req.user?.id || 'default';
      
      const paymentMethod = await paymentMethodService.createPaymentMethod({
        ...req.body,
        userId,
      });
      
      res.status(201).json({
        success: true,
        data: paymentMethod.toJSON(),
        message: 'Payment method added successfully',
      });
    } catch (error) {
      // Check if it's a validation error
      if (error.message.includes('required') || 
          error.message.includes('must be') ||
          error.message.includes('Invalid') ||
          error.message.includes('expired')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(req, res, next) {
    try {
      const { id } = req.params;
      
      const paymentMethod = await paymentMethodService.updatePaymentMethod(id, req.body);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      res.json({
        success: true,
        data: paymentMethod.toJSON(),
        message: 'Payment method updated successfully',
      });
    } catch (error) {
      // Check if it's a validation error
      if (error.message.includes('required') || 
          error.message.includes('must be') ||
          error.message.includes('Invalid') ||
          error.message.includes('expired')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(req, res, next) {
    try {
      const { id } = req.params;
      // TODO: Get userId from authenticated user (req.user.id)
      const userId = req.body.userId || req.query.userId || req.user?.id || null;
      
      const deleted = await paymentMethodService.deletePaymentMethod(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      res.json({
        success: true,
        message: 'Payment method removed successfully',
      });
    } catch (error) {
      if (error.message === 'Cannot delete the only payment method') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Set payment method as default
   */
  async setDefaultPaymentMethod(req, res, next) {
    try {
      const { id } = req.params;
      // TODO: Get userId from authenticated user (req.user.id)
      const userId = req.body.userId || req.user?.id || 'default';
      
      const paymentMethod = await paymentMethodService.setDefaultPaymentMethod(id, userId);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      res.json({
        success: true,
        data: paymentMethod.toJSON(),
        message: 'Default payment method updated successfully',
      });
    } catch (error) {
      if (error.message === 'Payment method does not belong to user') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Mark payment method as failed
   */
  async markPaymentFailed(req, res, next) {
    try {
      const { id } = req.params;
      
      const paymentMethod = await paymentMethodService.markPaymentFailed(id);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      res.json({
        success: true,
        data: paymentMethod.toJSON(),
        message: 'Payment failure recorded',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear failed payment status
   */
  async clearFailedPayment(req, res, next) {
    try {
      const { id } = req.params;
      
      const paymentMethod = await paymentMethodService.clearFailedPayment(id);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      res.json({
        success: true,
        data: paymentMethod.toJSON(),
        message: 'Failed payment status cleared',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate card number
   */
  async validateCardNumber(req, res, next) {
    try {
      const { cardNumber } = req.body;
      
      if (!cardNumber) {
        return res.status(400).json({
          success: false,
          message: 'Card number is required',
        });
      }

      const isValid = paymentMethodService.validateCardNumber(cardNumber);
      const brand = isValid ? paymentMethodService.detectCardBrand(cardNumber) : null;

      res.json({
        success: true,
        data: {
          isValid,
          brand,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

