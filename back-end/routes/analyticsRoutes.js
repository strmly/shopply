import express from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController.js';

const router = express.Router();
const analyticsController = new AnalyticsController();

/**
 * Analytics Routes
 */
router.get('/:sellerId/overview', (req, res, next) => 
  analyticsController.getSalesOverview(req, res, next)
);

router.get('/:sellerId/heatmap', (req, res, next) => 
  analyticsController.getSalesHeatmap(req, res, next)
);

router.get('/:sellerId/timeseries', (req, res, next) => 
  analyticsController.getTimeSeries(req, res, next)
);

router.get('/:sellerId/products', (req, res, next) => 
  analyticsController.getProductPerformance(req, res, next)
);

router.get('/:sellerId/demographics', (req, res, next) => 
  analyticsController.getCustomerDemographics(req, res, next)
);

router.get('/:sellerId/all', (req, res, next) => 
  analyticsController.getAllAnalytics(req, res, next)
);

router.post('/:sellerId/clear-cache', (req, res, next) => 
  analyticsController.clearCache(req, res, next)
);

export default router;

