import CheckoutService from './CheckoutService.js';
import SellerOrderService from './SellerOrderService.js';
import { ProductService } from './ProductService.js';

/**
 * Orders Service
 * Comprehensive order management for buyers
 * Handles order listing, filtering, status tracking, and reordering
 */
class OrdersService {
  constructor() {
    // This service works with CheckoutService's order storage
    this.productCache = new Map(); // Cache for product data to reduce API calls
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
  }

  /**
   * Get cached product or fetch and cache it
   */
  async getCachedProduct(productId) {
    const cached = this.productCache.get(productId);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const product = await ProductService.getProductById(productId);
      if (product) {
        this.productCache.set(productId, {
          data: product,
          timestamp: Date.now(),
        });
      }
      return product;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.productCache.entries()) {
      if (now - value.timestamp >= this.cacheExpiry) {
        this.productCache.delete(key);
      }
    }
  }

  /**
   * Get user orders with enhanced data
   * @param {string} userId - User ID
   * @param {string} filter - 'active', 'past', 'cancelled', or 'all'
   * @param {Object} options - Pagination and sorting options
   * @returns {Object} Object with orders array and pagination info
   */
  async getUserOrders(userId, filter = 'all', options = {}) {
    try {
      // Clear expired cache periodically
      this.clearExpiredCache();

      const orders = CheckoutService.getUserOrders(userId);
      
      // Enrich orders with additional data (batch process for better performance)
      const enrichedOrders = await Promise.all(
        orders.map(order => this.enrichOrderData(order))
      );

      // Filter orders based on status
      let filteredOrders = this.filterOrders(enrichedOrders, filter);

      // Sort orders (most recent first by default)
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'desc';
      filteredOrders = this.sortOrders(filteredOrders, sortBy, sortOrder);

      // Apply pagination
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      return {
        orders: paginatedOrders,
        pagination: {
          page,
          limit,
          total: filteredOrders.length,
          totalPages: Math.ceil(filteredOrders.length / limit),
          hasMore: endIndex < filteredOrders.length,
        },
      };
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw new Error(`Failed to retrieve orders: ${error.message}`);
    }
  }

  /**
   * Sort orders by field
   */
  sortOrders(orders, sortBy, sortOrder = 'desc') {
    return [...orders].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy.includes('At') || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  /**
   * Enrich order data with product details, store info, and status metadata
   */
  async enrichOrderData(order) {
    const enriched = {
      ...order.toJSON(),
      storeGroups: [],
      productThumbnails: [],
      statusMetadata: this.getStatusMetadata(order),
      canReorder: order.status === 'delivered',
      needsAttention: this.orderNeedsAttention(order),
    };

    // Get product thumbnails (max 3) - use cache for better performance
    if (order.items && order.items.length > 0) {
      enriched.productThumbnails = await Promise.all(
        order.items.slice(0, 3).map(async (item) => {
          try {
            const product = await this.getCachedProduct(item.productId);
            return {
              id: item.productId,
              name: product?.name || item.name || 'Product',
              image: product?.images?.[0] || product?.image || null,
            };
          } catch (error) {
            return {
              id: item.productId,
              name: item.name || 'Product',
              image: null,
            };
          }
        })
      );
    }

    // Enrich store groups
    if (order.storeGroups && order.storeGroups.length > 0) {
      enriched.storeGroups = order.storeGroups.map(group => ({
        ...group,
        storeName: group.storeName || 'Store',
      }));
    } else if (order.items && order.items.length > 0) {
      // Fallback: create store groups from items
      const storeMap = new Map();
      order.items.forEach(item => {
        const storeId = item.storeId || 'default';
        const storeName = item.storeName || 'Store';
        if (!storeMap.has(storeId)) {
          storeMap.set(storeId, {
            storeId,
            storeName,
            items: [],
          });
        }
        storeMap.get(storeId).items.push(item);
      });
      enriched.storeGroups = Array.from(storeMap.values());
    }

    return enriched;
  }

  /**
   * Get status metadata for UI display
   */
  getStatusMetadata(order) {
    const status = order.status || 'pending';
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
    const confirmedAt = order.confirmedAt ? new Date(order.confirmedAt) : null;

    // Calculate time estimates
    const timeSinceOrder = (now - createdAt) / (1000 * 60); // minutes
    const estimatedDeliveryTime = order.deliverySpeed === 'express' ? 30 : 60;
    const isPastETA = timeSinceOrder > estimatedDeliveryTime;

    const metadata = {
      status,
      badgeColor: 'blue',
      subtext: '',
      icon: '📦',
      isUrgent: false,
      progress: this.calculateProgress(status),
      estimatedMinutesRemaining: this.estimateTimeRemaining(order, timeSinceOrder),
    };

    switch (status) {
      case 'pending':
        metadata.badgeColor = 'blue';
        metadata.subtext = 'Order placed';
        metadata.icon = '⏳';
        break;

      case 'pending_seller_confirmation':
        metadata.badgeColor = 'amber';
        metadata.subtext = 'Waiting for seller confirmation on WhatsApp';
        metadata.icon = 'W';
        metadata.isUrgent = true;
        break;

      case 'confirmed':
        metadata.badgeColor = 'blue';
        metadata.subtext = 'Order confirmed';
        metadata.icon = '✓';
        break;

      case 'processing':
      case 'preparing':
        metadata.badgeColor = 'blue';
        metadata.subtext = 'Being prepared';
        metadata.icon = '👨‍🍳';
        break;

      case 'out_for_delivery':
        metadata.badgeColor = 'blue';
        const eta = order.eta || 'Soon';
        metadata.subtext = `Out for delivery • ${eta}`;
        metadata.icon = '🚚';
        break;

      case 'ready':
      case 'ready_for_pickup':
        metadata.badgeColor = 'green';
        metadata.subtext = 'Ready for pickup';
        metadata.icon = '✅';
        break;

      case 'delivered':
        metadata.badgeColor = 'green';
        if (deliveredAt) {
          const timeStr = deliveredAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
          metadata.subtext = `Delivered at ${timeStr}`;
        } else {
          metadata.subtext = 'Delivered';
        }
        metadata.icon = '✓';
        break;

      case 'delayed':
        metadata.badgeColor = 'amber';
        metadata.subtext = "Delayed • We're fixing this";
        metadata.icon = '⚠️';
        metadata.isUrgent = true;
        break;

      case 'cancelled':
        metadata.badgeColor = 'red';
        metadata.subtext = 'Cancelled';
        metadata.icon = '❌';
        break;

      default:
        metadata.badgeColor = 'blue';
        metadata.subtext = 'In progress';
        metadata.icon = '📦';
    }

    // Check if order is delayed (past ETA)
    if (status !== 'delivered' && status !== 'cancelled') {
      const threshold = order.deliverySpeed === 'express' ? 60 : 90;
      if (status !== 'pending_seller_confirmation' && timeSinceOrder > threshold) {
        metadata.badgeColor = 'amber';
        metadata.subtext = "We're working on an update";
        metadata.isUrgent = true;
      }
    }

    return metadata;
  }

  /**
   * Calculate order progress percentage
   */
  calculateProgress(status) {
    const progressMap = {
      'pending': 10,
      'pending_seller_confirmation': 15,
      'confirmed': 20,
      'processing': 40,
      'preparing': 50,
      'out_for_delivery': 80,
      'ready': 90,
      'ready_for_pickup': 90,
      'delivered': 100,
      'cancelled': 0,
      'delayed': 50,
    };
    return progressMap[status] || 0;
  }

  /**
   * Estimate time remaining for order
   */
  estimateTimeRemaining(order, timeSinceOrder) {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return 0;
    }

    const baseETA = order.deliverySpeed === 'express' ? 30 : 60;
    const remaining = Math.max(0, baseETA - timeSinceOrder);
    return Math.round(remaining);
  }

  /**
   * Check if order needs attention
   */
  orderNeedsAttention(order) {
    const status = order.status || 'pending';
    return status === 'pending_seller_confirmation' || status === 'delayed' || status === 'cancelled' || this.isDelayed(order);
  }

  /**
   * Check if order is delayed
   */
  isDelayed(order) {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return false;
    }

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const timeSinceOrder = (now - createdAt) / (1000 * 60); // minutes

    // Consider delayed if more than 90 minutes for standard delivery
    // or 60 minutes for express
    const threshold = order.deliverySpeed === 'express' ? 60 : 90;
    return timeSinceOrder > threshold;
  }

  /**
   * Filter orders by status
   */
  filterOrders(orders, filter) {
    if (filter === 'all') {
      return orders;
    }

    const activeStatuses = ['pending', 'pending_seller_confirmation', 'confirmed', 'processing', 'preparing', 'out_for_delivery', 'ready', 'ready_for_pickup', 'delayed'];
    const pastStatuses = ['delivered'];
    const cancelledStatuses = ['cancelled'];

    switch (filter) {
      case 'active':
        return orders.filter(order => activeStatuses.includes(order.status));
      
      case 'past':
        return orders.filter(order => pastStatuses.includes(order.status));
      
      case 'cancelled':
        return orders.filter(order => cancelledStatuses.includes(order.status));
      
      default:
        return orders;
    }
  }

  /**
   * Get order by ID with enriched data
   */
  async getOrderById(orderId, userId = null) {
    const order = CheckoutService.getOrder(orderId);
    
    if (!order) {
      return null;
    }

    // Check if user owns this order
    if (userId && order.userId !== userId) {
      return null;
    }

    return await this.enrichOrderData(order);
  }

  /**
   * Get order summary for quick action card
   */
  async getOrderSummary(userId) {
    try {
      const result = await this.getUserOrders(userId, 'all', { limit: 1000 });
      const orders = result.orders || [];
      
      const activeOrders = orders.filter(order => {
        const activeStatuses = ['pending', 'pending_seller_confirmation', 'confirmed', 'processing', 'preparing', 'out_for_delivery', 'ready', 'ready_for_pickup'];
        return activeStatuses.includes(order.status);
      });

      const needsAttention = orders.filter(order => this.orderNeedsAttention(order));

    // Get most recent active order for ETA
    const mostRecentActive = activeOrders.length > 0 
      ? activeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;

    // Get most recent delivered order
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    const mostRecentDelivered = deliveredOrders.length > 0
      ? deliveredOrders.sort((a, b) => new Date(b.deliveredAt || b.createdAt) - new Date(a.deliveredAt || a.createdAt))[0]
      : null;

      return {
        totalOrders: orders.length,
        activeCount: activeOrders.length,
        needsAttentionCount: needsAttention.length,
        mostRecentActive,
        mostRecentDelivered,
        subtext: this.generateSubtext(activeOrders, mostRecentActive, mostRecentDelivered, needsAttention),
        badgeCount: activeOrders.length > 0 ? activeOrders.length : null,
        hasIssue: needsAttention.length > 0,
      };
    } catch (error) {
      console.error('Error getting order summary:', error);
      // Return safe defaults on error
      return {
        totalOrders: 0,
        activeCount: 0,
        needsAttentionCount: 0,
        mostRecentActive: null,
        mostRecentDelivered: null,
        subtext: 'No orders yet',
        badgeCount: null,
        hasIssue: false,
      };
    }
  }

  /**
   * Generate dynamic subtext for quick action card
   */
  generateSubtext(activeOrders, mostRecentActive, mostRecentDelivered, needsAttention) {
    if (needsAttention.length > 0) {
      return `${needsAttention.length} order${needsAttention.length > 1 ? 's' : ''} needs attention`;
    }

    if (activeOrders.length > 0 && mostRecentActive) {
      const eta = mostRecentActive.eta || 'soon';
      if (mostRecentActive.status === 'out_for_delivery') {
        return `Arriving ${eta}`;
      }
      return `${activeOrders.length} order${activeOrders.length > 1 ? 's' : ''} in progress`;
    }

    if (mostRecentDelivered) {
      const deliveredAt = new Date(mostRecentDelivered.deliveredAt || mostRecentDelivered.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - deliveredAt) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        return 'Last order delivered today';
      } else if (daysDiff === 1) {
        return 'Last order delivered yesterday';
      } else {
        return `Last order delivered ${daysDiff} days ago`;
      }
    }

    return 'No orders yet';
  }

  /**
   * Create reorder from existing order
   */
  async createReorder(orderId, userId) {
    const order = CheckoutService.getOrder(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (order.status !== 'delivered') {
      throw new Error('Can only reorder delivered orders');
    }

    // Import CartService dynamically to avoid circular dependency
    const { CartService } = await import('./CartService.js');
    
    // Clear existing cart
    CartService.clearCart(userId);

    const addedItems = [];
    const unavailableItems = [];
    const partialItems = [];

    // Add all items from order to cart with stock validation
    for (const item of order.items) {
      try {
        const product = await this.getCachedProduct(item.productId);
        
        if (!product) {
          unavailableItems.push({
            productId: item.productId,
            name: item.name || 'Product',
            reason: 'Product no longer available',
          });
          continue;
        }

        const availableStock = product.stockQuantity || 0;
        const requestedQuantity = item.quantity || 1;

        if (availableStock === 0) {
          unavailableItems.push({
            productId: item.productId,
            name: product.name,
            reason: 'Out of stock',
          });
        } else if (availableStock < requestedQuantity) {
          // Add partial quantity
          CartService.addToCart(userId, {
            productId: item.productId,
            quantity: availableStock,
            variant: item.variant || null,
            storeId: item.storeId,
            storeName: item.storeName,
          });
          partialItems.push({
            productId: item.productId,
            name: product.name,
            requested: requestedQuantity,
            added: availableStock,
          });
        } else {
          // Add full quantity
          CartService.addToCart(userId, {
            productId: item.productId,
            quantity: requestedQuantity,
            variant: item.variant || null,
            storeId: item.storeId,
            storeName: item.storeName,
          });
          addedItems.push({
            productId: item.productId,
            name: product.name,
            quantity: requestedQuantity,
          });
        }
      } catch (error) {
        console.error(`Error adding product ${item.productId} to cart:`, error);
        unavailableItems.push({
          productId: item.productId,
          name: item.name || 'Product',
          reason: 'Error loading product',
        });
      }
    }

    const cart = CartService.getCart(userId);

    return {
      success: true,
      message: this.generateReorderMessage(addedItems, partialItems, unavailableItems),
      cart,
      summary: {
        added: addedItems.length,
        partial: partialItems.length,
        unavailable: unavailableItems.length,
        total: order.items.length,
      },
      details: {
        addedItems,
        partialItems,
        unavailableItems,
      },
    };
  }

  /**
   * Generate reorder message based on results
   */
  generateReorderMessage(added, partial, unavailable) {
    if (added.length === 0 && partial.length === 0) {
      return 'No items could be added to cart';
    }
    if (unavailable.length === 0 && partial.length === 0) {
      return 'All items added to cart';
    }
    if (unavailable.length > 0 && partial.length === 0) {
      return `${added.length} items added, ${unavailable.length} unavailable`;
    }
    return `${added.length} items added, ${partial.length} with limited stock, ${unavailable.length} unavailable`;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId, reason = null) {
    const order = CheckoutService.getOrder(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Only allow cancellation before the seller starts fulfilling the order
    if (!['pending', 'pending_seller_confirmation', 'confirmed'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // Update order status
    CheckoutService.updateOrderStatus(orderId, 'cancelled');
    
    return {
      success: true,
      message: 'Order cancelled successfully',
      order: CheckoutService.getOrder(orderId),
    };
  }

  /**
   * Get order timeline/status history
   */
  getOrderTimeline(order) {
    const timeline = [];
    const createdAt = new Date(order.createdAt);
    
    timeline.push({
      event: 'order_placed',
      timestamp: createdAt,
      status: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received',
    });

    if (order.confirmedAt) {
      timeline.push({
        event: 'order_confirmed',
        timestamp: new Date(order.confirmedAt),
        status: 'confirmed',
        label: 'Order Confirmed',
        description: 'Your order has been confirmed',
      });
    }

    // Add status transitions based on current status
    const statusMap = {
      'pending_seller_confirmation': { label: 'Sent to Seller', description: 'Confirm the order with the seller on WhatsApp' },
      'processing': { label: 'Processing', description: 'Your order is being prepared' },
      'preparing': { label: 'Preparing', description: 'Store is preparing your order' },
      'out_for_delivery': { label: 'Out for Delivery', description: 'Your order is on the way' },
      'ready': { label: 'Ready', description: 'Your order is ready for pickup' },
      'delivered': { label: 'Delivered', description: 'Your order has been delivered' },
      'cancelled': { label: 'Cancelled', description: 'Your order has been cancelled' },
    };

    if (statusMap[order.status]) {
      timeline.push({
        event: `status_${order.status}`,
        timestamp: order.updatedAt ? new Date(order.updatedAt) : new Date(),
        status: order.status,
        label: statusMap[order.status].label,
        description: statusMap[order.status].description,
      });
    }

    return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}

// Export singleton instance
export default new OrdersService();

