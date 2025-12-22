import express from 'express';
import { CheckoutController } from '../controllers/CheckoutController.js';

const router = express.Router();
const checkoutController = new CheckoutController();

/**
 * Checkout Routes
 * POST   /api/checkout/order              - Create new order
 * GET    /api/checkout/order/:id          - Get order by ID
 * POST   /api/checkout/order/:id/payment  - Process payment for order
 */
router.post('/order', (req, res, next) => checkoutController.createOrder(req, res, next));
router.get('/order/:id', (req, res, next) => checkoutController.getOrder(req, res, next));
router.post('/order/:id/payment', (req, res, next) => checkoutController.processPayment(req, res, next));

export default router;
