import express from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();
const analyticsController = new AnalyticsController();
const sellerAuth = authorize('seller', 'admin');

router.get('/:sellerId/overview', sellerAuth, (req, res, next) => analyticsController.getSalesOverview(req, res, next));
router.get('/:sellerId/heatmap', sellerAuth, (req, res, next) => analyticsController.getSalesHeatmap(req, res, next));
router.get('/:sellerId/timeseries', sellerAuth, (req, res, next) => analyticsController.getTimeSeries(req, res, next));
router.get('/:sellerId/products', sellerAuth, (req, res, next) => analyticsController.getProductPerformance(req, res, next));
router.get('/:sellerId/demographics', sellerAuth, (req, res, next) => analyticsController.getCustomerDemographics(req, res, next));
router.get('/:sellerId/all', sellerAuth, (req, res, next) => analyticsController.getAllAnalytics(req, res, next));
router.post('/:sellerId/clear-cache', sellerAuth, (req, res, next) => analyticsController.clearCache(req, res, next));

export default router;
