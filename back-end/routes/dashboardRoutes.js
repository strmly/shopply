import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';

const router = express.Router();
const dashboardController = new DashboardController();

/**
 * Dashboard Routes
 */
router.get('/:sellerId', (req, res, next) => dashboardController.getDashboard(req, res, next));

export default router;


