import express from 'express';
import { CartController } from '../controllers/CartController.js';

const router = express.Router();

// GET /api/cart - Get cart
router.get('/', CartController.getCart);

// POST /api/cart/items - Add item to cart
router.post('/items', CartController.addItem);

// PUT /api/cart/items/:itemId - Update item quantity
router.put('/items/:itemId', CartController.updateQuantity);

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', CartController.removeItem);

// DELETE /api/cart - Clear cart
router.delete('/', CartController.clearCart);

// POST /api/cart/promo - Apply promo code
router.post('/promo', CartController.applyPromoCode);

// DELETE /api/cart/promo - Remove promo code
router.delete('/promo', CartController.removePromoCode);

// POST /api/cart/address - Set delivery address
router.post('/address', CartController.setDeliveryAddress);

// POST /api/cart/delivery-method - Set delivery method
router.post('/delivery-method', CartController.setDeliveryMethod);

// POST /api/cart/payment-method - Set payment method
router.post('/payment-method', CartController.setPaymentMethod);

// GET /api/cart/suggestions - Get optimization suggestions
router.get('/suggestions', CartController.getOptimizationSuggestions);

export default router;











