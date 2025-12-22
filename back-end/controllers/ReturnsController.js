import ReturnsService from '../services/ReturnsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Returns Controller
 * Handles HTTP requests and responses for returns and refunds
 */
export class ReturnsController {
  /**
   * Create a new return request
   * POST /api/returns
   */
  async createReturn(req, res, next) {
    try {
      const { userId, orderId, ...returnData } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required',
        });
      }

      if (!returnData.reason) {
        return res.status(400).json({
          success: false,
          message: 'Return reason is required',
        });
      }

      const returnRequest = await ReturnsService.createReturn(userId, orderId, returnData);

      res.status(201).json({
        success: true,
        message: 'Return request created successfully',
        data: returnRequest.toJSON(),
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Returns can only be requested')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get user returns
   * GET /api/returns/user/:userId
   * Query params: filter (active, completed, cancelled, all), page, limit
   */
  async getUserReturns(req, res, next) {
    try {
      const { userId } = req.params;
      const { filter = 'all', page, limit } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const result = await ReturnsService.getUserReturns(userId, filter, {
        page,
        limit,
      });

      res.json({
        success: true,
        data: result.returns,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get return by ID
   * GET /api/returns/:returnId
   */
  async getReturnById(req, res, next) {
    try {
      const { returnId } = req.params;
      const { userId } = req.query; // Optional: verify ownership

      if (!returnId) {
        return res.status(400).json({
          success: false,
          message: 'Return ID is required',
        });
      }

      const returnRequest = ReturnsService.getReturnById(returnId, userId);

      if (!returnRequest) {
        return res.status(404).json({
          success: false,
          message: 'Return not found',
        });
      }

      // Add timeline to return data
      const timeline = ReturnsService.getReturnTimeline(returnId);
      const returnData = returnRequest.toJSON();
      returnData.timeline = timeline;

      res.json({
        success: true,
        data: returnData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get return summary for quick action card
   * GET /api/returns/user/:userId/summary
   */
  async getReturnSummary(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const summary = ReturnsService.getReturnSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel return
   * POST /api/returns/:returnId/cancel
   */
  async cancelReturn(req, res, next) {
    try {
      const { returnId } = req.params;
      const { userId } = req.body;

      if (!returnId) {
        return res.status(400).json({
          success: false,
          message: 'Return ID is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const returnRequest = ReturnsService.cancelReturn(returnId, userId);

      res.json({
        success: true,
        message: 'Return cancelled successfully',
        data: returnRequest.toJSON(),
      });
    } catch (error) {
      if (error.message === 'Return not found') {
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

  /**
   * Approve return (seller action)
   * POST /api/returns/:returnId/approve
   */
  async approveReturn(req, res, next) {
    try {
      const { returnId } = req.params;
      const { approvedBy } = req.body;

      if (!returnId) {
        return res.status(400).json({
          success: false,
          message: 'Return ID is required',
        });
      }

      const returnRequest = ReturnsService.approveReturn(returnId, approvedBy);

      res.json({
        success: true,
        message: 'Return approved successfully',
        data: returnRequest.toJSON(),
      });
    } catch (error) {
      if (error.message === 'Return not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot approve')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Reject return (seller action)
   * POST /api/returns/:returnId/reject
   */
  async rejectReturn(req, res, next) {
    try {
      const { returnId } = req.params;
      const { reason, rejectedBy } = req.body;

      if (!returnId) {
        return res.status(400).json({
          success: false,
          message: 'Return ID is required',
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }

      const returnRequest = ReturnsService.rejectReturn(returnId, reason, rejectedBy);

      res.json({
        success: true,
        message: 'Return rejected',
        data: returnRequest.toJSON(),
      });
    } catch (error) {
      if (error.message === 'Return not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot reject')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Mark item as received (seller action)
   * POST /api/returns/:returnId/received
   */
  async markItemReceived(req, res, next) {
    try {
      const { returnId } = req.params;

      if (!returnId) {
        return res.status(400).json({
          success: false,
          message: 'Return ID is required',
        });
      }

      const returnRequest = ReturnsService.markItemReceived(returnId);

      res.json({
        success: true,
        message: 'Item marked as received',
        data: returnRequest.toJSON(),
      });
    } catch (error) {
      if (error.message === 'Return not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Cannot mark item')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

export default ReturnsController;

