import { CartService } from '../services/CartService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Cart Controller
 */
class CartControllerClass {
  /**
   * Get cart
   */
  getCart = asyncHandler(async (req, res) => {
    const userId = req.query.userId || 'default';
    const location = req.query.location ? JSON.parse(req.query.location) : null;
    
    const cart = CartService.getCart(userId);
    const cartWithTotals = CartService.calculateCartTotals(cart);
    
    // Get optimization suggestions if location provided
    let suggestions = [];
    if (location) {
      suggestions = await CartService.getOptimizationSuggestions(userId, location);
    }

    res.json({
      success: true,
      data: {
        ...cartWithTotals,
        suggestions,
      },
    });
  });

  /**
   * Add item to cart
   */
  addItem = asyncHandler(async (req, res) => {
    const userId = req.body.userId || 'default';
    const { productId, quantity, variant, storeId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const cart = await CartService.addItem(userId, productId, quantity || 1, variant, storeId);
    
    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart',
    });
  });

  /**
   * Update item quantity
   */
  updateQuantity = asyncHandler(async (req, res) => {
    const userId = req.query.userId || req.body.userId || 'default';
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
      });
    }

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required',
      });
    }

    try {
      const parsedItemId = parseInt(itemId);
      if (isNaN(parsedItemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID',
        });
      }

      const cart = CartService.updateQuantity(userId, parsedItemId, parseInt(quantity));
      
      res.json({
        success: true,
        data: cart,
        message: 'Quantity updated',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update quantity',
      });
    }
  });

  /**
   * Remove item from cart
   */
  removeItem = asyncHandler(async (req, res) => {
    const userId = req.query.userId || 'default';
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
      });
    }

    const cart = CartService.removeItem(userId, itemId);
    
    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart',
    });
  });

  /**
   * Update quantity by productId (no server item ID needed)
   */
  updateByProduct = asyncHandler(async (req, res) => {
    const userId = req.query.userId || req.body.userId || 'default';
    const { productId } = req.params;
    const { quantity, variant } = req.body;
    try {
      const cart = CartService.updateByProduct(userId, productId, parseInt(quantity) || 1, variant || null);
      res.json({ success: true, data: cart, message: 'Quantity updated' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  /**
   * Remove item by productId
   */
  removeByProduct = asyncHandler(async (req, res) => {
    const userId = req.query.userId || 'default';
    const { productId } = req.params;
    const variant = req.query.variant ? JSON.parse(req.query.variant) : null;
    const cart = CartService.removeByProduct(userId, productId, variant);
    res.json({ success: true, data: cart, message: 'Item removed' });
  });

  /**
   * Clear cart
   */
  clearCart = asyncHandler(async (req, res) => {
    const userId = req.query.userId || 'default';
    const cart = CartService.clearCart(userId);
    
    res.json({
      success: true,
      data: cart,
      message: 'Cart cleared',
    });
  });

  /**
   * Apply promo code
   */
  applyPromoCode = asyncHandler(async (req, res) => {
    const userId = req.body.userId || 'default';
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required',
      });
    }

    try {
      const cart = CartService.applyPromoCode(userId, code);
      res.json({
        success: true,
        data: cart,
        message: 'Promo code applied',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  });

  /**
   * Remove promo code
   */
  removePromoCode = asyncHandler(async (req, res) => {
    const userId = req.query.userId || 'default';
    const cart = CartService.removePromoCode(userId);
    
    res.json({
      success: true,
      data: cart,
      message: 'Promo code removed',
    });
  });

  /**
   * Set delivery address
   */
  setDeliveryAddress = asyncHandler(async (req, res) => {
    const userId = req.body.userId || 'default';
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required',
      });
    }

    const cart = CartService.setDeliveryAddress(userId, address);
    
    res.json({
      success: true,
      data: cart,
      message: 'Delivery address updated',
    });
  });

  /**
   * Set delivery method
   */
  setDeliveryMethod = asyncHandler(async (req, res) => {
    const userId = req.body.userId || 'default';
    const { method } = req.body;

    if (!method) {
      return res.status(400).json({
        success: false,
        message: 'Delivery method is required',
      });
    }

    const cart = CartService.setDeliveryMethod(userId, method);
    
    res.json({
      success: true,
      data: cart,
      message: 'Delivery method updated',
    });
  });

  /**
   * Set payment method
   */
  setPaymentMethod = asyncHandler(async (req, res) => {
    const userId = req.body.userId || 'default';
    const { method } = req.body;

    if (!method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }

    const cart = CartService.setPaymentMethod(userId, method);
    
    res.json({
      success: true,
      data: cart,
      message: 'Payment method updated',
    });
  });

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions = asyncHandler(async (req, res) => {
    const userId = req.query.userId || 'default';
    const location = req.query.location ? JSON.parse(req.query.location) : null;

    const suggestions = await CartService.getOptimizationSuggestions(userId, location);
    
    res.json({
      success: true,
      data: suggestions,
    });
  });
}

export const CartController = new CartControllerClass();

