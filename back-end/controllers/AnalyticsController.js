import { AnalyticsService } from '../services/AnalyticsService.js';

/**
 * Analytics Controller
 * Handles HTTP requests and responses for seller analytics
 */
export class AnalyticsController {
  /**
   * Get sales overview KPIs
   */
  async getSalesOverview(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { period = '7d' } = req.query;
      
      const overview = await AnalyticsService.getSalesOverview(sellerId, period);
      
      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales heatmap by suburb
   */
  async getSalesHeatmap(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { period = '7d' } = req.query;
      
      const heatmap = await AnalyticsService.getSalesHeatmap(sellerId, period);
      
      res.json({
        success: true,
        data: heatmap,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get time-series sales data
   */
  async getTimeSeries(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { period = '7d', metric = 'revenue' } = req.query;
      
      const timeSeries = await AnalyticsService.getTimeSeries(sellerId, period, metric);
      
      res.json({
        success: true,
        data: timeSeries,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product performance data
   */
  async getProductPerformance(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { filter = 'bestsellers', period = '30d' } = req.query;
      
      const performance = await AnalyticsService.getProductPerformance(sellerId, filter, period);
      
      res.json({
        success: true,
        data: performance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer demographics
   */
  async getCustomerDemographics(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { period = '30d' } = req.query;
      
      const demographics = await AnalyticsService.getCustomerDemographics(sellerId, period);
      
      res.json({
        success: true,
        data: demographics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all analytics data in one request (for dashboard)
   */
  async getAllAnalytics(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { period = '7d', refresh = 'false' } = req.query;
      
      console.log(`[Analytics] Fetching analytics for seller ${sellerId}, period: ${period}`);
      
      // Clear cache if refresh is requested
      if (refresh === 'true') {
        AnalyticsService.clearCache(sellerId);
      }
      
      const [overview, heatmap, timeSeries, productPerformance, demographics] = await Promise.all([
        AnalyticsService.getSalesOverview(sellerId, period).catch(err => {
          console.error('[Analytics] Error in getSalesOverview:', err);
          return null;
        }),
        AnalyticsService.getSalesHeatmap(sellerId, period).catch(err => {
          console.error('[Analytics] Error in getSalesHeatmap:', err);
          return null;
        }),
        AnalyticsService.getTimeSeries(sellerId, period).catch(err => {
          console.error('[Analytics] Error in getTimeSeries:', err);
          return null;
        }),
        AnalyticsService.getProductPerformance(sellerId, 'bestsellers', '30d').catch(err => {
          console.error('[Analytics] Error in getProductPerformance:', err);
          return null;
        }),
        AnalyticsService.getCustomerDemographics(sellerId, '30d').catch(err => {
          console.error('[Analytics] Error in getCustomerDemographics:', err);
          return null;
        })
      ]);
      
      console.log('[Analytics] Data fetched:', {
        hasOverview: !!overview,
        hasHeatmap: !!heatmap,
        hasTimeSeries: !!timeSeries,
        hasProductPerformance: !!productPerformance,
        hasDemographics: !!demographics
      });
      
      res.json({
        success: true,
        data: {
          overview,
          heatmap,
          timeSeries,
          productPerformance,
          demographics
        },
      });
    } catch (error) {
      console.error('[Analytics] Error in getAllAnalytics:', error);
      next(error);
    }
  }

  /**
   * Clear analytics cache for a seller
   */
  async clearCache(req, res, next) {
    try {
      const { sellerId } = req.params;
      AnalyticsService.clearCache(sellerId);
      
      res.json({
        success: true,
        message: 'Analytics cache cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

