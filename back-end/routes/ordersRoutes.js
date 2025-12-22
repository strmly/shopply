import express from 'express';
import { OrdersController } from '../controllers/OrdersController.js';

const router = express.Router();
const ordersController = new OrdersController();

/**
 * Orders Routes (Buyer-side)
 * All routes are prefixed with /api/orders
 */

// Get order summary for quick action card
router.get('/user/:userId/summary', (req, res, next) => 
  ordersController.getOrderSummary(req, res, next)
);

// Get user orders (with optional filter query param)
router.get('/user/:userId', (req, res, next) => 
  ordersController.getUserOrders(req, res, next)
);

// Get order by ID
router.get('/:orderId', (req, res, next) => 
  ordersController.getOrderById(req, res, next)
);

// Create reorder
router.post('/:orderId/reorder', (req, res, next) => 
  ordersController.createReorder(req, res, next)
);

// Cancel order
router.post('/:orderId/cancel', (req, res, next) => 
  ordersController.cancelOrder(req, res, next)
);

export default router;

