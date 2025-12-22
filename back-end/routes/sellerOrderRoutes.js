import express from 'express';
import { SellerOrderController } from '../controllers/SellerOrderController.js';

const router = express.Router();
const sellerOrderController = new SellerOrderController();

/**
 * Seller Order Routes
 * All routes are prefixed with /api/sellers/:sellerId
 */

// Get order statistics
router.get('/:sellerId/orders/stats', (req, res, next) => 
  sellerOrderController.getOrderStats(req, res, next)
);

// Get all orders for a seller
router.get('/:sellerId/orders', (req, res, next) => 
  sellerOrderController.getSellerOrders(req, res, next)
);

// Get order by ID
router.get('/:sellerId/orders/:orderId', (req, res, next) => 
  sellerOrderController.getOrderById(req, res, next)
);

// Update order status
router.patch('/:sellerId/orders/:orderId/status', (req, res, next) => 
  sellerOrderController.updateOrderStatus(req, res, next)
);

// Mark order as preparing
router.post('/:sellerId/orders/:orderId/mark-preparing', (req, res, next) => 
  sellerOrderController.markAsPreparing(req, res, next)
);

// Mark order as ready
router.post('/:sellerId/orders/:orderId/mark-ready', (req, res, next) => 
  sellerOrderController.markAsReady(req, res, next)
);

// Assign courier to order
router.post('/:sellerId/orders/:orderId/assign-courier', (req, res, next) => 
  sellerOrderController.assignCourier(req, res, next)
);

// Mark order as picked up
router.post('/:sellerId/orders/:orderId/mark-picked-up', (req, res, next) => 
  sellerOrderController.markAsPickedUp(req, res, next)
);

// Get available couriers
router.get('/:sellerId/couriers', (req, res, next) => 
  sellerOrderController.getAvailableCouriers(req, res, next)
);

export default router;


