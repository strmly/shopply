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
      const { location, deliveryAddress, deliveryMethod, deliverySpeed, paymentMethod, contactInfo, orderInstructions, voucherId } = req.body;
      // JWT takes priority; fall back to body userId for unauthenticated/legacy requests
      const userId = req.user?.userId || req.body.userId || 'default';

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
        paymentMethod: paymentMethod || 'seller_whatsapp',
        contactInfo: contactInfo || {},
        orderInstructions: orderInstructions || null,
        voucherId: voucherId || null,
      }, location);

      notificationService.notify(
        userId,
        'order',
        'Order sent to seller',
        `Your order #${order.id} is ready to send through WhatsApp for seller confirmation.`,
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
