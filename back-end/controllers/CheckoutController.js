import CheckoutService from '../services/CheckoutService.js';
import { notificationService } from '../services/NotificationService.js';

/**
 * Checkout Controller
 * Handles HTTP requests and responses for checkout operations
 */
export class CheckoutController {
  /**
   * Create order
   */
  async createOrder(req, res, next) {
    try {
      const { userId, location, deliveryAddress, deliveryMethod, deliverySpeed, paymentMethod, contactInfo, orderInstructions, voucherId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const order = await CheckoutService.createOrder(userId, {
        deliveryAddress: deliveryAddress || location,
        deliveryMethod: deliveryMethod || 'delivery',
        deliverySpeed: deliverySpeed || 'standard',
        paymentMethod: paymentMethod || 'card',
        contactInfo: contactInfo || {},
        orderInstructions: orderInstructions || null,
        voucherId: voucherId || null,
      }, location);

      notificationService.notify(
        userId,
        'order',
        'Order Confirmed',
        `Your order #${order.id} has been confirmed and is being prepared by the seller.`,
        { actionUrl: `/orders/${order.id}`, metadata: { orderId: String(order.id) } }
      );

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(req, res, next) {
    try {
      const { id } = req.params;
      const order = CheckoutService.getOrder(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process payment for order
   */
  async processPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentDetails } = req.body;

      const result = await CheckoutService.processPayment(id, paymentDetails);

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Payment processing failed',
      });
    }
  }
}
