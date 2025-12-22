import Order from '../models/Order.js';
import { CartService } from './CartService.js';
import { ProductService } from './ProductService.js';
import { VoucherService } from './VoucherService.js';

class CheckoutService {
  constructor() {
    this.orders = new Map(); // In-memory storage for orders

    // Seed a couple of demo orders so notification-based tracking works out of the box
    // These IDs correspond to the sample notifications in NotificationService.
    const now = new Date();
    const baseOrder = {
      userId: 'default',
      items: [],
      storeGroups: [],
      deliveryAddress: {
        suburb: 'Sandton',
        city: 'Johannesburg',
      },
      deliveryMethod: 'delivery',
      deliverySpeed: 'standard',
      paymentMethod: 'card',
      paymentDetails: null,
      contactInfo: {
        name: 'Demo User',
        phone: '+27 12 345 6789',
      },
      orderInstructions: null,
      promoCode: null,
      discount: 0,
      totals: {
        subtotal: 500,
        deliveryFee: 30,
        serviceFee: 5,
        total: 535,
      },
      eta: 'Today, 4-6 PM',
      status: 'processing',
      createdAt: now,
      updatedAt: now,
    };

    const order1 = new Order({ ...baseOrder, id: '12345', status: 'out_for_delivery' });
    const order2 = new Order({ ...baseOrder, id: '12340', status: 'delivered', deliveredAt: now });

    this.orders.set(order1.id, order1);
    this.orders.set(order2.id, order2);
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(userId, location = null) {
    const cart = CartService.getCart(userId);
    const issues = [];

    // Check if cart is empty
    if (!cart || !cart.items || cart.items.length === 0) {
      issues.push({
        type: 'empty_cart',
        message: 'Your cart is empty',
      });
      return { valid: false, issues };
    }

    // Validate stock for each item
    for (const item of cart.items) {
      try {
        const product = await ProductService.getProductById(item.productId);
        if (!product) {
          issues.push({
            type: 'product_unavailable',
            productId: item.productId,
            message: `Product ${item.productId} is no longer available`,
          });
        } else {
          const stockQuantity = item.variant
            ? item.variant.stockQuantity || product.stockQuantity
            : product.stockQuantity;

          if (stockQuantity < item.quantity) {
            issues.push({
              type: 'insufficient_stock',
              productId: item.productId,
              requested: item.quantity,
              available: stockQuantity,
              message: `Only ${stockQuantity} available for ${product.name}`,
            });
          }
        }
      } catch (error) {
        issues.push({
          type: 'validation_error',
          productId: item.productId,
          message: `Error validating product: ${error.message}`,
        });
      }
    }

    // Validate delivery address if delivery method is selected
    if (cart.deliveryMethod === 'delivery' && !location && !cart.deliveryAddress) {
      issues.push({
        type: 'missing_address',
        message: 'Delivery address is required',
      });
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Calculate ETA based on store groups and delivery method
   */
  calculateETA(storeGroups, deliveryMethod, deliverySpeed = 'standard', location = null) {
    if (!storeGroups || storeGroups.length === 0) {
      return 'Today, 4-6 PM'; // Default
    }

    if (deliveryMethod === 'pickup') {
      // Pickup is usually faster
      const minTime = 30; // minutes
      const maxTime = 90;
      return `Ready by ${this.formatTime(minTime)}`;
    }

    if (deliverySpeed === 'express') {
      // Express delivery: 30-60 minutes
      return '30-60 min';
    }

    // Standard delivery: calculate based on distance and store count
    let maxDistance = 0;
    for (const group of storeGroups) {
      if (group.distance && group.distance > maxDistance) {
        maxDistance = group.distance;
      }
    }

    // Base time: 60 minutes
    // Add 15 minutes per km beyond 1km
    // Add 10 minutes per additional store
    const baseTime = 60;
    const distanceTime = Math.max(0, (maxDistance - 1) * 15);
    const storeTime = (storeGroups.length - 1) * 10;
    const totalMinutes = baseTime + distanceTime + storeTime;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${totalMinutes}-${totalMinutes + 30} min`;
    }

    const startHour = new Date().getHours() + hours;
    const endHour = startHour + 1;

    return `Today, ${this.formatHour(startHour)}-${this.formatHour(endHour)}`;
  }

  formatTime(minutes) {
    const now = new Date();
    const target = new Date(now.getTime() + minutes * 60 * 1000);
    return `${target.getHours()}:${target.getMinutes().toString().padStart(2, '0')}`;
  }

  formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour} ${period}`;
  }

  /**
   * Create order from cart
   */
  async createOrder(userId, orderData, location = null) {
    // Get cart
    const cart = CartService.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate cart
    const validation = await this.validateCart(userId, location);
    if (!validation.valid) {
      throw new Error(`Cart validation failed: ${validation.issues.map(i => i.message).join(', ')}`);
    }

    // Calculate cart totals first
    const cartTotals = cart.totals || CartService.calculateCartTotals(cart);
    let finalDiscount = cart.discount || 0;
    let voucherId = orderData.voucherId || cart.voucherId || null;
    let voucher = null;

    // Apply voucher if provided
    if (voucherId) {
      try {
        const voucherResult = VoucherService.applyVoucherToCart(
          userId,
          voucherId,
          cartTotals.subtotal
        );
        finalDiscount = voucherResult.discount;
        voucher = voucherResult.voucher;
      } catch (error) {
        // If voucher validation fails, continue without voucher
        console.warn('Voucher application failed:', error.message);
        voucherId = null;
      }
    }

    // Recalculate totals with voucher discount
    const finalTotals = {
      ...cartTotals,
      discount: finalDiscount,
      total: Math.max(0, cartTotals.subtotal - finalDiscount),
    };

    // Calculate ETA
    const eta = this.calculateETA(
      cart.storeGroups,
      orderData.deliveryMethod || cart.deliveryMethod || 'delivery',
      orderData.deliverySpeed || 'standard',
      location
    );

    // Create order
    const order = new Order({
      userId,
      items: cart.items,
      storeGroups: cart.storeGroups || this.groupItemsByStore(cart.items),
      deliveryAddress: orderData.deliveryAddress || cart.deliveryAddress || location,
      deliveryMethod: orderData.deliveryMethod || cart.deliveryMethod || 'delivery',
      deliverySpeed: orderData.deliverySpeed || 'standard',
      paymentMethod: orderData.paymentMethod || cart.paymentMethod,
      paymentDetails: orderData.paymentDetails || null,
      contactInfo: orderData.contactInfo || {},
      orderInstructions: orderData.orderInstructions || null,
      promoCode: cart.promoCode || null,
      voucherId: voucherId,
      discount: finalDiscount,
      totals: finalTotals,
      eta,
      status: 'pending',
    });

    // Validate order
    const orderValidation = order.validate();
    if (!orderValidation.valid) {
      throw new Error(`Order validation failed: ${orderValidation.errors.join(', ')}`);
    }

    // Store order
    this.orders.set(order.id, order);

    // Mark voucher as used if applied
    if (voucherId && voucher) {
      try {
        VoucherService.useVoucher(userId, voucherId, order.id);
      } catch (error) {
        console.warn('Failed to mark voucher as used:', error.message);
      }
    }

    // Clear cart after successful order
    CartService.clearCart(userId);

    return order;
  }

  /**
   * Group items by store (helper method)
   */
  groupItemsByStore(items) {
    const groups = new Map();

    for (const item of items) {
      const storeId = item.storeId || 'default';
      if (!groups.has(storeId)) {
        groups.set(storeId, {
          storeId,
          storeName: item.storeName || 'Store',
          items: [],
          distance: item.distance || 0,
          deliveryFee: 0,
          eta: null,
        });
      }
      groups.get(storeId).items.push(item);
    }

    return Array.from(groups.values());
  }

  /**
   * Get order by ID
   */
  getOrder(orderId) {
    return this.orders.get(orderId) || null;
  }

  /**
   * Get user orders
   */
  getUserOrders(userId) {
    const userOrders = [];
    for (const order of this.orders.values()) {
      if (order.userId === userId) {
        userOrders.push(order);
      }
    }
    return userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get all orders (for dashboard aggregation)
   */
  getAllOrders() {
    return Array.from(this.orders.values());
  }

  /**
   * Get orders by store ID
   */
  getOrdersByStoreId(storeId) {
    const storeOrders = [];
    for (const order of this.orders.values()) {
      // Check if order has items from this store
      const hasStoreItems = order.items?.some(item => 
        item.storeId === parseInt(storeId) || 
        item.storeId === storeId
      ) || order.storeGroups?.some(group => 
        group.storeId === parseInt(storeId) || 
        group.storeId === storeId
      );

      if (hasStoreItems) {
        storeOrders.push(order);
      }
    }
    return storeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId, status) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    order.updatedAt = new Date();

    if (status === 'confirmed') {
      order.confirmedAt = new Date();
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    return order;
  }

  /**
   * Process payment (mock implementation)
   */
  async processPayment(orderId, paymentDetails) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Mock payment processing
    // In production, integrate with payment gateway
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate payment success (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
      order.status = 'confirmed';
      order.confirmedAt = new Date();
      order.paymentDetails = paymentDetails;
      return {
        success: true,
        order,
        transactionId: `TXN${Date.now()}`,
      };
    } else {
      throw new Error('Payment processing failed. Please try again.');
    }
  }
}

// Export singleton instance
export default new CheckoutService();

