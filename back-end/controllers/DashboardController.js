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

      // Get seller info for store ID
      const seller = await SellerService.getSellerById(parseInt(sellerId));
      const storeId = seller?.storeSetup?.name ? sellerId : null;

      // Get async data (not cached for real-time updates)
      const [lowStockProducts, messages] = await Promise.all([
        DashboardService.getLowStockProductsForDashboard(storeId),
        DashboardService.getMessagesForDashboard(sellerId),
      ]);

      // Combine all data
      const completeData = {
        ...dashboardData,
        lowStockProducts,
        messages,
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
}

