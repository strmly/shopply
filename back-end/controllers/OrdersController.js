import OrdersService from '../services/OrdersService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Orders Controller
 * Handles HTTP requests and responses for buyer orders
 */
export class OrdersController {
  /**
   * Get user orders
   * GET /api/my-orders/user/:userId
   * Query params: filter (active, past, cancelled, all), page, limit, sortBy, sortOrder
   */
  async getUserOrders(req, res, next) {
    try {
      const { userId } = req.params;
      const { 
        filter = 'all', 
        page, 
        limit, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const result = await OrdersService.getUserOrders(userId, filter, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error.message.includes('Failed to retrieve')) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get order by ID
   * GET /api/my-orders/:orderId
   */
  async getOrderById(req, res, next) {
    try {
      const { orderId } = req.params;
      const { userId } = req.query; // Optional: verify ownership

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      const order = await OrdersService.getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Add timeline to order data
      const timeline = OrdersService.getOrderTimeline(order);
      order.timeline = timeline;

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order summary for quick action card
   * GET /api/orders/user/:userId/summary
   */
  async getOrderSummary(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const summary = await OrdersService.getOrderSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create reorder from existing order
   * POST /api/my-orders/:orderId/reorder
   */
  async createReorder(req, res, next) {
    try {
      const { orderId } = req.params;
      const { userId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const result = await OrdersService.createReorder(orderId, userId);

      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Can only reorder')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Cancel order
   * POST /api/my-orders/:orderId/cancel
   */
  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const { userId, reason } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const result = await OrdersService.cancelOrder(orderId, userId, reason);

      res.json({
        success: true,
        message: result.message,
        data: result.order,
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

