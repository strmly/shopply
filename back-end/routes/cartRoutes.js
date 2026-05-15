import express from 'express';
import { CartController } from '../controllers/CartController.js';
import { CartService } from '../services/CartService.js';
import { ProductService } from '../services/ProductService.js';
import { getInventory } from '../services/InventoryService.js';

const router = express.Router();

// GET /api/cart - Get cart
router.get('/', CartController.getCart);

// POST /api/cart/items - Add item to cart
router.post('/items', CartController.addItem);

// PUT /api/cart/items/by-product/:productId - Update qty by product (no server item ID needed)
router.put('/items/by-product/:productId', CartController.updateByProduct);

// DELETE /api/cart/items/by-product/:productId - Remove by product
router.delete('/items/by-product/:productId', CartController.removeByProduct);

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

/**
 * GET /api/cart/validate?userId=default
 * Validates each cart item against current product and inventory data.
 * Returns per-item result: { productId, ok, issue }
 * Possible issues: "out_of_stock" | "low_stock" | "price_changed" | "unavailable"
 */
router.get('/validate', async (req, res, next) => {
  try {
    const userId = req.query.userId || 'default';
    const cart = CartService.getCart(userId);

    const validations = await Promise.all(
      cart.items.map(async (item) => {
        const productId = String(item.productId);

        // Fetch current product state
        let currentProduct;
        try {
          currentProduct = await ProductService.getProductById(productId);
        } catch {
          currentProduct = null;
        }

        if (!currentProduct) {
          return { productId, ok: false, issue: 'unavailable' };
        }

        // Check visibility
        if (currentProduct.isVisible === false) {
          return { productId, ok: false, issue: 'unavailable' };
        }

        // Check price change (compare against snapshot stored in cart item)
        const cartPrice = item.product?.price;
        const livePrice = currentProduct.price ?? (typeof currentProduct.toJSON === 'function' ? currentProduct.toJSON().price : undefined);
        if (cartPrice !== undefined && livePrice !== undefined && Math.abs(livePrice - cartPrice) > 0.01) {
          return { productId, ok: false, issue: 'price_changed' };
        }

        // Check inventory
        const storeId = item.storeId || item.product?.storeId || currentProduct.storeId;
        const inventory = storeId ? getInventory(String(storeId), String(productId)) : null;

        if (inventory) {
          if (!inventory.availableNow || (typeof inventory.getAvailableStock === 'function' && inventory.getAvailableStock() === 0)) {
            return { productId, ok: false, issue: 'out_of_stock' };
          }
          const isLow = typeof inventory.isLowStock === 'function' ? inventory.isLowStock() : inventory.isLowStock;
          if (isLow) {
            return { productId, ok: false, issue: 'low_stock' };
          }
        }

        return { productId, ok: true, issue: null };
      })
    );

    res.json({
      success: true,
      data: {
        userId,
        itemCount: cart.items.length,
        validations,
        allValid: validations.every(v => v.ok),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;











