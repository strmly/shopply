import { DashboardService } from '../services/DashboardService.js';
import { SellerService } from '../services/SellerService.js';

/**
 * Dashboard Controller
 * Handles HTTP requests and responses for dashboard operations
 */
export class DashboardController {
  /**
   * Get dashboard data for a seller
   */
  async getDashboard(req, res, next) {
    try {
      const { sellerId } = req.params;

      if (!sellerId) {
        return res.status(400).json({
          success: false,
          message: 'Seller ID is required',
        });
      }

      // Get main dashboard data (cached)
      const dashboardData = await DashboardService.getDashboardData(sellerId);

      // Use the effective seller returned by the service, so stale demo IDs
      // still hydrate stock and message widgets correctly after a reseed.
      const effectiveSellerId = dashboardData.seller?.id || parseInt(sellerId, 10);
      const seller = await SellerService.getSellerById(effectiveSellerId);
      const storeId = dashboardData.store?.id || (seller?.storeSetup?.name ? effectiveSellerId : null);

      // Get async data (not cached for real-time updates)
      const [lowStockProducts, messages] = await Promise.all([
        DashboardService.getLowStockProductsForDashboard(storeId),
        DashboardService.getMessagesForDashboard(effectiveSellerId),
      ]);

      // Combine all data
      const completeData = {
        ...dashboardData,
        lowStockProducts,
        messages,
        quickStats: {
          ...(dashboardData.quickStats || {}),
          unreadMessages: messages.unreadCount || 0,
          lowStock: lowStockProducts.products?.length || 0,
          criticalStock: lowStockProducts.criticalCount || 0,
        },
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        data: completeData,
      });
    } catch (error) {
      console.error('Dashboard controller error:', error);
      
      if (error.message === 'Seller not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === 'Invalid seller ID format') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Return partial data if some services fail
      res.status(500).json({
        success: false,
        message: 'Failed to load some dashboard data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  async getMessages(req, res, next) {
    try {
      const { sellerId } = req.params;
      const messages = await DashboardService.getMessagesForDashboard(sellerId);
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  async markMessageRead(req, res, next) {
    try {
      const { sellerId, messageId } = req.params;
      const messages = DashboardService.markMessageRead(sellerId, messageId);

      if (!messages) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  async markAllMessagesRead(req, res, next) {
    try {
      const { sellerId } = req.params;
      const messages = DashboardService.markAllMessagesRead(sellerId);
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  async replyToMessage(req, res, next) {
    try {
      const { sellerId, messageId } = req.params;
      const messages = DashboardService.replyToMessage(sellerId, messageId, req.body?.body);

      if (!messages) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      res.json({ success: true, data: messages });
    } catch (error) {
      if (error.message === 'Reply body is required') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

