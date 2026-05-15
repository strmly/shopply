import Order from '../models/Order.js';
import { CartService } from './CartService.js';
import { ProductService } from './ProductService.js';
import { VoucherService } from './VoucherService.js';
import SellerOrderService from './SellerOrderService.js';
import { SellerService } from './SellerService.js';
import { getStoreById } from './StoreService.js';

const normalizeWhatsAppNumber = (value = '') => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `27${digits.slice(1)}`;
  if (digits.length === 9) digits = `27${digits}`;
  return digits;
};

const formatCurrency = (value = 0) => `R${Number(value || 0).toFixed(2)}`;

const formatAddress = (address) => {
  if (!address) return 'Not provided';
  if (typeof address === 'string') return address;
  return [
    address.address,
    address.street,
    address.unit ? `Unit ${address.unit}` : '',
    address.suburb,
    address.city,
    address.postalCode,
  ].filter(Boolean).join(', ') || 'Not provided';
};

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

  async resolveSellerContact(storeId, group = {}) {
    storeId = storeId || 1;
    const store = getStoreById(storeId) || getStoreById(String(storeId));
    let seller = null;

    if (store?.sellerId) seller = await SellerService.getSellerById(store.sellerId);
    if (!seller && storeId) seller = await SellerService.getSellerById(storeId);
    if (!seller && parseInt(storeId, 10) === 1) seller = await SellerService.seedDefaultSeller();

    let firstProduct = group.items?.[0]?.product || null;
    if (!firstProduct && group.items?.[0]?.productId) {
      const productModel = await ProductService.getProductById(group.items[0].productId);
      firstProduct = productModel?.toJSON ? productModel.toJSON() : productModel;
    }

    const rawNumber = seller?.storeBasicInfo?.storePhone
      || seller?.phone
      || store?.phone
      || firstProduct?.sellerContact?.whatsappNumber
      || firstProduct?.sellerContact?.storePhone
      || firstProduct?.sellerPhone
      || firstProduct?.storePhone
      || '';

    return {
      sellerId: seller?.id || store?.sellerId || storeId || null,
      storeName: group.storeName || store?.name || seller?.storeSetup?.name || seller?.legalBusinessName || 'Shopply seller',
      whatsappNumber: normalizeWhatsAppNumber(rawNumber),
      rawWhatsappNumber: rawNumber,
    };
  }

  async buildWhatsAppHandoff(order) {
    const groups = order.storeGroups?.length ? order.storeGroups : this.groupItemsByStore(order.items || []);
    const handoffs = [];

    for (const group of groups) {
      const storeId = group.storeId || group.items?.[0]?.storeId || group.items?.[0]?.product?.storeId || 1;
      const contact = await this.resolveSellerContact(storeId, group);
      const groupItems = group.items || [];
      const itemsTotal = groupItems.reduce((sum, item) => {
        const price = item.product?.price || item.price || 0;
        return sum + (price * (item.quantity || 1));
      }, 0);
      const itemLines = groupItems.map(item => {
        const product = item.product || item;
        return `- ${item.quantity || 1} x ${product.name || 'Product'} (${formatCurrency(product.price || item.price || 0)})`;
      }).join('\n');

      const message = [
        `Hi ${contact.storeName},`,
        `I would like to place this Shopply order.`,
        ``,
        `Order: #${order.id}`,
        `Customer phone: ${order.contactInfo?.phone || 'Not provided'}`,
        order.contactInfo?.email ? `Customer email: ${order.contactInfo.email}` : '',
        `Delivery: ${order.deliveryMethod}${order.deliverySpeed ? ` (${order.deliverySpeed})` : ''}`,
        `Address: ${formatAddress(order.deliveryAddress)}`,
        order.orderInstructions ? `Instructions: ${order.orderInstructions}` : '',
        ``,
        `Items:`,
        itemLines,
        ``,
        `Seller subtotal: ${formatCurrency(itemsTotal)}`,
        `Order total: ${formatCurrency(order.totals?.total || 0)}`,
        ``,
        `Please confirm availability and next steps.`,
      ].filter(line => line !== '').join('\n');

      handoffs.push({
        storeId,
        sellerId: contact.sellerId,
        storeName: contact.storeName,
        whatsappNumber: contact.whatsappNumber,
        href: contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}` : '',
        message,
      });
    }

    return handoffs;
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

    if (orderData.deliveryAddress) {
      cart.deliveryAddress = orderData.deliveryAddress;
    }
    if (orderData.deliveryMethod) {
      cart.deliveryMethod = orderData.deliveryMethod;
    }

    // Validate cart
    const validation = await this.validateCart(userId, location);
    if (!validation.valid) {
      throw new Error(`Cart validation failed: ${validation.issues.map(i => i.message).join(', ')}`);
    }

    // Calculate cart totals first
    const calculatedCart = CartService.calculateCartTotals(cart);
    const cartTotals = calculatedCart.totals || {};
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

    const deliveryMethod = orderData.deliveryMethod || cart.deliveryMethod || 'delivery';
    const deliverySpeed = orderData.deliverySpeed || 'standard';
    const deliveryFee = deliveryMethod === 'delivery'
      ? (cartTotals.deliveryFee || 0) + (deliverySpeed === 'express' ? 20 : 0)
      : 0;
    const smallOrderFee = cartTotals.smallOrderFee || 0;
    const serviceFee = cartTotals.serviceFee || 0;

    // Recalculate totals with checkout delivery choice and voucher discount
    const finalTotals = {
      ...cartTotals,
      deliveryFee,
      smallOrderFee,
      serviceFee,
      discount: finalDiscount,
      subtotal: parseFloat(((cartTotals.itemsTotal || 0) + deliveryFee + smallOrderFee + serviceFee).toFixed(2)),
      total: parseFloat(Math.max(0, (cartTotals.itemsTotal || 0) + deliveryFee + smallOrderFee + serviceFee - finalDiscount).toFixed(2)),
    };

    // Calculate ETA
    const eta = this.calculateETA(
      calculatedCart.storeGroups,
      deliveryMethod,
      deliverySpeed,
      location
    );

    // Create order
    const order = new Order({
      userId,
      items: cart.items,
      storeGroups: calculatedCart.storeGroups || this.groupItemsByStore(cart.items),
      deliveryAddress: orderData.deliveryAddress || cart.deliveryAddress || location,
      deliveryMethod,
      deliverySpeed,
      paymentMethod: orderData.paymentMethod || cart.paymentMethod || 'seller_whatsapp',
      paymentDetails: orderData.paymentDetails || null,
      contactInfo: orderData.contactInfo || {},
      orderInstructions: orderData.orderInstructions || null,
      promoCode: cart.promoCode || null,
      voucherId: voucherId,
      discount: finalDiscount,
      totals: finalTotals,
      eta,
      status: 'pending_seller_confirmation',
    });

    // Validate order
    const orderValidation = order.validate();
    if (!orderValidation.valid) {
      throw new Error(`Order validation failed: ${orderValidation.errors.join(', ')}`);
    }

    order.whatsappHandoff = await this.buildWhatsAppHandoff(order);

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

    order.sellerOrders = this.createSellerOrders(order);

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

    // Mock payment processing. In production, integrate with a payment gateway.
    await new Promise(resolve => setTimeout(resolve, 1000));

    const method = paymentDetails?.method || order.paymentMethod || 'card';
    const success = !paymentDetails?.forceFailure;

    if (success) {
      order.status = 'confirmed';
      order.confirmedAt = new Date();
      order.paymentDetails = {
        ...paymentDetails,
        method,
        paidAt: new Date(),
      };
      order.sellerOrders = this.createSellerOrders(order);
      return {
        success: true,
        order,
        transactionId: method === 'cash' ? null : `TXN${Date.now()}`,
      };
    } else {
      throw new Error('Payment processing failed. Please try again.');
    }
  }

  createSellerOrders(order) {
    const groups = order.storeGroups?.length ? order.storeGroups : this.groupItemsByStore(order.items || []);
    return groups
      .map(group => {
        const storeId = group.storeId || group.items?.[0]?.storeId || group.items?.[0]?.product?.storeId || 1;
        const sellerId = group.sellerId || storeId;
        return SellerOrderService.createFromMainOrder(order, sellerId, storeId);
      })
      .filter(Boolean);
  }
}

// Export singleton instance
export default new CheckoutService();

