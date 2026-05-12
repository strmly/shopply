import { ProductService } from './ProductService.js';

/**
 * Cart Service
 * Handles cart operations with multi-store support
 */
class CartServiceClass {
  constructor() {
    // In production, this would be stored per user in database
    this.carts = new Map(); // userId -> cart
  }

  /**
   * Get or create cart for user
   */
  getCart(userId = 'default') {
    if (!this.carts.has(userId)) {
      this.carts.set(userId, {
        items: [],
        deliveryAddress: null,
        deliveryMethod: 'delivery',
        paymentMethod: null,
        promoCode: null,
        discount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return this.carts.get(userId);
  }

  /**
   * Add item to cart
   */
  async addItem(userId, productId, quantity = 1, variant = null, storeId = null) {
    const cart = this.getCart(userId);
    const product = await ProductService.getProductById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if item already exists with same variant
    const existingIndex = cart.items.findIndex(item => 
      item.productId === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        id: Date.now(),
        productId: product.id,
        product: product.toJSON(),
        quantity,
        variant,
        storeId: storeId || product.storeId,
        storeName: product.storeName,
        addedAt: new Date(),
      });
    }

    cart.updatedAt = new Date();
    return this.calculateCartTotals(cart);
  }

  /**
   * Update item quantity
   */
  updateQuantity(userId, itemId, quantity) {
    const cart = this.getCart(userId);
    const item = cart.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    item.quantity = quantity;
    cart.updatedAt = new Date();
    return this.calculateCartTotals(cart);
  }

  /**
   * Remove item from cart
   */
  removeItem(userId, itemId) {
    const cart = this.getCart(userId);
    const numericId = parseInt(itemId);
    cart.items = cart.items.filter(item => item.id !== numericId);
    cart.updatedAt = new Date();
    return this.calculateCartTotals(cart);
  }

  /**
   * Clear cart
   */
  clearCart(userId) {
    const cart = this.getCart(userId);
    cart.items = [];
    cart.updatedAt = new Date();
    return cart;
  }

  /**
   * Group items by store
   */
  groupItemsByStore(cart) {
    const storeGroups = {};
    
    cart.items.forEach(item => {
      const storeId = item.storeId || item.product.storeId;
      const storeName = item.storeName || item.product.storeName;
      
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          storeId,
          storeName,
          items: [],
          deliveryFee: this.calculateDeliveryFee(item.product, cart.deliveryAddress),
          distance: item.product.distance || 0,
          eta: this.calculateETA(item.product),
        };
      }
      
      storeGroups[storeId].items.push(item);
    });

    return Object.values(storeGroups);
  }

  /**
   * Calculate delivery fee for a product
   */
  calculateDeliveryFee(product, deliveryAddress) {
    const distance = product.distance || 0;
    
    if (distance < 1) return 0; // Free delivery within 1km
    if (distance < 3) return 15;
    if (distance < 5) return 25;
    return 35;
  }

  /**
   * Calculate ETA for delivery
   */
  calculateETA(product) {
    const distance = product.distance || 0;
    const hour = new Date().getHours();
    
    if (distance < 1) {
      return hour < 15 ? 'Today, 3-5 PM' : 'Today, 5-7 PM';
    }
    if (distance < 3) {
      return hour < 14 ? 'Today, 4-6 PM' : 'Today, 6-8 PM';
    }
    return 'Today, 5-7 PM';
  }

  /**
   * Calculate cart totals
   */
  calculateCartTotals(cart) {
    const storeGroups = this.groupItemsByStore(cart);
    
    let itemsTotal = 0;
    let deliveryFee = 0;
    let smallOrderFee = 0;
    let serviceFee = 0;
    
    cart.items.forEach(item => {
      const price = item.product.price || 0;
      itemsTotal += price * item.quantity;
    });

    // Calculate delivery fees per store
    storeGroups.forEach(group => {
      deliveryFee += group.deliveryFee;
    });

    // Small order fee (if items total < R50)
    if (itemsTotal < 50) {
      smallOrderFee = 5;
    }

    // Service fee (2% of items total, min R2.50)
    serviceFee = Math.max(2.50, itemsTotal * 0.02);

    const subtotal = itemsTotal + deliveryFee + smallOrderFee + serviceFee;
    const total = subtotal - (cart.discount || 0);

    return {
      ...cart,
      totals: {
        itemsTotal: parseFloat(itemsTotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        smallOrderFee: parseFloat(smallOrderFee.toFixed(2)),
        serviceFee: parseFloat(serviceFee.toFixed(2)),
        discount: cart.discount || 0,
        subtotal: parseFloat(subtotal.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      },
      storeGroups,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  /**
   * Apply promo code
   */
  applyPromoCode(userId, code) {
    const cart = this.getCart(userId);
    
    // Mock promo codes (in production, validate against database)
    const promoCodes = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE20': { discount: 20, type: 'fixed' },
      'FREESHIP': { discount: cart.totals?.deliveryFee || 0, type: 'delivery' },
    };

    const promo = promoCodes[code.toUpperCase()];
    
    if (!promo) {
      throw new Error('Invalid promo code');
    }

    cart.promoCode = code;
    
    if (promo.type === 'percentage') {
      cart.discount = (cart.totals?.itemsTotal || 0) * (promo.discount / 100);
    } else if (promo.type === 'fixed') {
      cart.discount = promo.discount;
    } else if (promo.type === 'delivery') {
      cart.discount = promo.discount;
    }

    cart.updatedAt = new Date();
    return this.calculateCartTotals(cart);
  }

  /**
   * Remove promo code
   */
  removePromoCode(userId) {
    const cart = this.getCart(userId);
    cart.promoCode = null;
    cart.discount = 0;
    cart.updatedAt = new Date();
    return this.calculateCartTotals(cart);
  }

  /**
   * Set delivery address
   */
  setDeliveryAddress(userId, address) {
    const cart = this.getCart(userId);
    cart.deliveryAddress = address;
    cart.updatedAt = new Date();
    return this.calculateCartTotals(cart);
  }

  /**
   * Set delivery method
   */
  setDeliveryMethod(userId, method) {
    const cart = this.getCart(userId);
    cart.deliveryMethod = method; // 'delivery', 'pickup', 'group'
    cart.updatedAt = new Date();
    return this.calculateCartTotals(cart);
  }

  /**
   * Set payment method
   */
  setPaymentMethod(userId, method) {
    const cart = this.getCart(userId);
    cart.paymentMethod = method;
    cart.updatedAt = new Date();
    return cart;
  }

  /**
   * Get cart optimization suggestions
   */
  async getOptimizationSuggestions(userId, location) {
    const cart = this.getCart(userId);
    const suggestions = [];

    // Check for delivery consolidation opportunities
    if (cart.storeGroups && cart.storeGroups.length > 1) {
      const totalDeliveryFee = cart.totals?.deliveryFee || 0;
      // Mock: if consolidating could save money
      if (totalDeliveryFee > 20) {
        suggestions.push({
          type: 'delivery_optimization',
          title: 'Save on delivery',
          message: `Switch items to consolidate delivery and save R${(totalDeliveryFee - 20).toFixed(2)}`,
          action: 'optimize_delivery',
          priority: 'high',
        });
      }
    }

    // Check for low stock items
    cart.items.forEach(item => {
      if (item.product.stock === 'low' || item.product.stockQuantity < item.quantity) {
        suggestions.push({
          type: 'low_stock',
          title: 'Low stock alert',
          message: `${item.product.name} is low stock. Only ${item.product.stockQuantity || 0} left.`,
          action: 'replace_item',
          itemId: item.id,
          priority: 'high',
        });
      }
    });

    // Check for cheaper alternatives (mock)
    if (cart.items.length > 0) {
      const firstItem = cart.items[0];
      suggestions.push({
        type: 'price_savings',
        title: 'Better price available',
        message: `${firstItem.product.name} is R6 cheaper at LocalGrocer (0.7km away)`,
        action: 'switch_store',
        itemId: firstItem.id,
        priority: 'medium',
      });
    }

    return suggestions;
  }
}

export const CartService = new CartServiceClass();











