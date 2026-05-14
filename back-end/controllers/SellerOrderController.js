import SellerOrderService from '../services/SellerOrderService.js';
import { notificationService } from '../services/NotificationService.js';

const STATUS_NOTIFICATIONS = {
  preparing: ['Order Being Prepared', 'Great news — the seller has started preparing your order and it will be ready soon.'],
  courier_assigned: ['Courier On The Way', 'A courier has been assigned to your order and is heading your way. Estimated arrival: 45 min.'],
  completed: ['Order Delivered', 'Your order has been delivered successfully. We hope you love it!'],
  cancelled: ['Order Cancelled', 'Your order has been cancelled by the seller. If you were charged, a refund will be processed.'],
};

/**
 * Seller Order Controller
 * Handles HTTP requests for seller order management
 */
export class SellerOrderController {
  /**
   * Get all orders for a seller
   * GET /api/sellers/:sellerId/orders
   */
  async getSellerOrders(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { status, deliveryMethod } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (deliveryMethod) filters.deliveryMethod = deliveryMethod;
      
      const orders = SellerOrderService.getSellerOrders(sellerId, filters);
      
      // Add SLA status to each order
      const ordersWithSLA = orders.map(order => {
        const slaStatus = SellerOrderService.calculateSLAStatus(order);
        return {
          ...order,
          slaStatus
        };
      });
      
      res.json({
        success: true,
        data: ordersWithSLA,
        count: ordersWithSLA.length
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get order by ID
   * GET /api/sellers/:sellerId/orders/:orderId
   */
  async getOrderById(req, res, next) {
    try {
      const { sellerId, orderId } = req.params;
      
      const order = SellerOrderService.getOrderById(orderId, sellerId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      const slaStatus = SellerOrderService.calculateSLAStatus(order);
      
      res.json({
        success: true,
        data: {
          ...order,
          slaStatus
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update order status
   * PATCH /api/sellers/:sellerId/orders/:orderId/status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { sellerId, orderId } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
          errors: [{ field: 'status', message: 'Status field is required' }]
        });
      }
      
      const validStatuses = ['new', 'preparing', 'ready', 'courier_assigned', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          errors: [{ field: 'status', message: `Invalid status value: ${status}` }]
        });
      }
      
      const order = SellerOrderService.updateOrderStatus(orderId, sellerId, status);
      const slaStatus = SellerOrderService.calculateSLAStatus(order);

      const notifPayload = STATUS_NOTIFICATIONS[status];
      if (notifPayload && (order.buyerId || order.userId)) {
        notificationService.notify(
          order.buyerId || order.userId,
          'order',
          notifPayload[0],
          notifPayload[1],
          { actionUrl: `/orders/${orderId}`, metadata: { orderId } }
        );
      }

      res.json({
        success: true,
        message: `Order status updated from ${order.statusHistory?.[order.statusHistory.length - 2]?.from || 'previous'} to ${status}`,
        data: {
          ...order,
          slaStatus
        }
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
  
  /**
   * Mark order as preparing
   * POST /api/sellers/:sellerId/orders/:orderId/mark-preparing
   */
  async markAsPreparing(req, res, next) {
    try {
      const { sellerId, orderId } = req.params;
      
      const order = SellerOrderService.updateOrderStatus(orderId, sellerId, 'preparing');
      const slaStatus = SellerOrderService.calculateSLAStatus(order);
      
      res.json({
        success: true,
        message: 'Order marked as preparing',
        data: {
          ...order,
          slaStatus
        }
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
  
  /**
   * Mark order as ready
   * POST /api/sellers/:sellerId/orders/:orderId/mark-ready
   */
  async markAsReady(req, res, next) {
    try {
      const { sellerId, orderId } = req.params;
      
      const order = SellerOrderService.updateOrderStatus(orderId, sellerId, 'ready');
      const slaStatus = SellerOrderService.calculateSLAStatus(order);
      
      res.json({
        success: true,
        message: 'Order marked as ready',
        data: {
          ...order,
          slaStatus
        }
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
  
  /**
   * Assign courier to order
   * POST /api/sellers/:sellerId/orders/:orderId/assign-courier
   */
  async assignCourier(req, res, next) {
    try {
      const { sellerId, orderId } = req.params;
      const { courierId, autoAssign = true } = req.body;
      
      // Validate request
      if (!autoAssign && !courierId) {
        return res.status(400).json({
          success: false,
          message: 'Courier ID is required when autoAssign is false',
          errors: [{ field: 'courierId', message: 'Courier ID is required for manual assignment' }]
        });
      }
      
      const order = SellerOrderService.assignCourier(orderId, sellerId, courierId, autoAssign);
      const slaStatus = SellerOrderService.calculateSLAStatus(order);
      
      const courierName = order.courierInfo?.name || 'courier';
      const eta = order.courierInfo?.eta || '8-12';
      
      res.json({
        success: true,
        message: autoAssign 
          ? `Courier ${courierName} assigned automatically. Estimated arrival: ${eta} minutes`
          : `Courier ${courierName} assigned successfully. Estimated arrival: ${eta} minutes`,
        data: {
          ...order,
          slaStatus
        }
      });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
  
  /**
   * Get available couriers
   * GET /api/sellers/:sellerId/couriers?orderId=xxx
   */
  async getAvailableCouriers(req, res, next) {
    try {
      const { orderId } = req.query;
      const couriers = SellerOrderService.getAvailableCouriers(orderId);
      
      res.json({
        success: true,
        data: couriers,
        count: couriers.length,
        message: couriers.length === 0 
          ? 'No couriers available at this time' 
          : `${couriers.length} courier${couriers.length === 1 ? '' : 's'} available`
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Mark order as picked up (for pickup orders)
   * POST /api/sellers/:sellerId/orders/:orderId/mark-picked-up
   */
  async markAsPickedUp(req, res, next) {
    try {
      const { sellerId, orderId } = req.params;
      
      const order = SellerOrderService.markAsPickedUp(orderId, sellerId);
      const slaStatus = SellerOrderService.calculateSLAStatus(order);
      
      res.json({
        success: true,
        message: 'Order marked as picked up',
        data: {
          ...order,
          slaStatus
        }
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === 'Order is not a pickup order' || error.message === 'Order must be ready before marking as picked up') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
  
  /**
   * Get order statistics
   * GET /api/sellers/:sellerId/orders/stats
   */
  async getOrderStats(req, res, next) {
    try {
      const { sellerId } = req.params;
      
      const stats = SellerOrderService.getOrderStats(sellerId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

