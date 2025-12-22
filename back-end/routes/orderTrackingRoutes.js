import express from 'express';
import { OrderTrackingController } from '../controllers/OrderTrackingController.js';

const router = express.Router();
const orderTrackingController = new OrderTrackingController();

/**
 * Order Tracking Routes
 */
router.get('/:id', (req, res, next) => orderTrackingController.getOrderTracking(req, res, next));
router.get('/user/:userId', (req, res, next) => orderTrackingController.getUserOrders(req, res, next));

export default router;
