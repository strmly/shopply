import express from 'express';
import { SellerOrderController } from '../controllers/SellerOrderController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();
const sellerOrderController = new SellerOrderController();
const sellerAuth = authorize('seller', 'admin');

router.get('/:sellerId/orders/stats', sellerAuth, (req, res, next) => sellerOrderController.getOrderStats(req, res, next));
router.get('/:sellerId/orders', sellerAuth, (req, res, next) => sellerOrderController.getSellerOrders(req, res, next));
router.get('/:sellerId/orders/:orderId', sellerAuth, (req, res, next) => sellerOrderController.getOrderById(req, res, next));
router.patch('/:sellerId/orders/:orderId/status', sellerAuth, (req, res, next) => sellerOrderController.updateOrderStatus(req, res, next));
router.post('/:sellerId/orders/:orderId/mark-preparing', sellerAuth, (req, res, next) => sellerOrderController.markAsPreparing(req, res, next));
router.post('/:sellerId/orders/:orderId/mark-ready', sellerAuth, (req, res, next) => sellerOrderController.markAsReady(req, res, next));
router.post('/:sellerId/orders/:orderId/assign-courier', sellerAuth, (req, res, next) => sellerOrderController.assignCourier(req, res, next));
router.post('/:sellerId/orders/:orderId/mark-picked-up', sellerAuth, (req, res, next) => sellerOrderController.markAsPickedUp(req, res, next));
router.get('/:sellerId/couriers', sellerAuth, (req, res, next) => sellerOrderController.getAvailableCouriers(req, res, next));

export default router;
