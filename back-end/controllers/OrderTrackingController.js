import OrderTrackingService from '../services/OrderTrackingService.js';
import CheckoutService from '../services/CheckoutService.js';

/**
 * Order Tracking Controller
 * Handles HTTP requests and responses for order tracking operations
 */
export class OrderTrackingController {
  /**
   * Get order tracking by ID
   */
  async getOrderTracking(req, res, next) {
    try {
      const { id } = req.params;
      const { location } = req.query;

      const userLocation = location
        ? JSON.parse(location)
        : null;

      // Simulate order progression and retrieve tracking details
      OrderTrackingService.simulateOrderProgression(id);
      const tracking = OrderTrackingService.getOrderTracking(id);
      const courierLocation = OrderTrackingService.getCourierLocation(id, userLocation);
      const storeStatuses = OrderTrackingService.getStoreStatuses(id);

      res.json({
        success: true,
        data: {
          ...tracking,
          courierLocation,
          storeStatuses,
        },
      });
    } catch (error) {
      // Normalize not-found errors
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
      next(error);
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(req, res, next) {
    try {
      const { userId } = req.params;
      const orders = CheckoutService.getUserOrders(userId);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }
}
