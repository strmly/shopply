import SellerOrder from '../models/SellerOrder.js';
import CheckoutService from './CheckoutService.js';

/**
 * Seller Order Service
 * Manages seller-specific orders with state transitions, courier assignment, and SLA tracking
 */
class SellerOrderServiceClass {
  constructor() {
    this.orders = new Map(); // In-memory storage
    this.couriers = new Map(); // Mock courier data
    
    // Initialize mock couriers
    this.initializeMockCouriers();
    
    // Seed demo orders
    this.seedDemoOrders();
  }
  
  initializeMockCouriers() {
    const couriers = [
      { id: 'c1', name: 'Sam M.', phone: '+27 82 111 2222', rating: 4.8, deliveries: 532, status: 'available', vehicle: 'e-bike', distance: 1.2 },
      { id: 'c2', name: 'Thabo K.', phone: '+27 82 333 4444', rating: 4.9, deliveries: 789, status: 'available', vehicle: 'car', distance: 2.5 },
      { id: 'c3', name: 'Lerato N.', phone: '+27 82 555 6666', rating: 4.7, deliveries: 421, status: 'busy', vehicle: 'on-foot', distance: 0.8 },
      { id: 'c4', name: 'John D.', phone: '+27 82 777 8888', rating: 4.6, deliveries: 312, status: 'available', vehicle: 'e-bike', distance: 3.1 },
    ];
    
    couriers.forEach(courier => {
      this.couriers.set(courier.id, courier);
    });
  }
  
  seedDemoOrders() {
    const now = new Date();
    const orders = [
      {
        id: 'so1',
        orderId: '12345',
        storeId: '1',
        sellerId: '1',
        buyerId: 'buyer1',
        buyerName: 'Sipho D.',
        buyerPhone: '+27 82 123 4567',
        items: [
          { productId: '1', name: 'Fresh Milk 2L', quantity: 2, price: 25.00, variant: null },
          { productId: '2', name: 'Bread White', quantity: 1, price: 12.50, variant: null }
        ],
        total: 62.50,
        status: 'new',
        deliveryMethod: 'delivery',
        deliveryAddress: {
          street: '22 Rivonia Road',
          suburb: 'Sandton',
          city: 'Johannesburg',
          postalCode: '2196'
        },
        paymentMethod: 'card',
        slaMinutes: 30,
        createdAt: new Date(now.getTime() - 5 * 60000), // 5 minutes ago
        earnings: {
          itemsTotal: 62.50,
          deliveryFee: 20.00,
          serviceFee: -8.00,
          discount: 0,
          sellerEarnings: 74.50,
          payoutScheduled: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Tomorrow 8 AM
        }
      },
      {
        id: 'so2',
        orderId: '12346',
        storeId: '1',
        sellerId: '1',
        buyerId: 'buyer2',
        buyerName: 'Nomsa K.',
        buyerPhone: '+27 82 234 5678',
        items: [
          { productId: '3', name: 'Chicken Breast 500g', quantity: 1, price: 45.00, variant: null }
        ],
        total: 45.00,
        status: 'preparing',
        deliveryMethod: 'pickup',
        paymentMethod: 'cash',
        slaMinutes: 25,
        createdAt: new Date(now.getTime() - 15 * 60000), // 15 minutes ago
        preparingAt: new Date(now.getTime() - 10 * 60000), // 10 minutes ago
        earnings: {
          itemsTotal: 45.00,
          deliveryFee: 0,
          serviceFee: -4.50,
          discount: 0,
          sellerEarnings: 40.50,
          payoutScheduled: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'so3',
        orderId: '12347',
        storeId: '1',
        sellerId: '1',
        buyerId: 'buyer3',
        buyerName: 'David M.',
        buyerPhone: '+27 82 345 6789',
        items: [
          { productId: '4', name: 'Tomatoes 1kg', quantity: 3, price: 15.00, variant: null },
          { productId: '5', name: 'Onions 1kg', quantity: 2, price: 12.00, variant: null }
        ],
        total: 69.00,
        status: 'ready',
        deliveryMethod: 'delivery',
        deliveryAddress: {
          street: '45 Main Street',
          suburb: 'Rosebank',
          city: 'Johannesburg',
          postalCode: '2196'
        },
        paymentMethod: 'card',
        courierId: null,
        slaMinutes: 30,
        createdAt: new Date(now.getTime() - 20 * 60000), // 20 minutes ago
        preparingAt: new Date(now.getTime() - 15 * 60000),
        readyAt: new Date(now.getTime() - 2 * 60000), // 2 minutes ago
        earnings: {
          itemsTotal: 69.00,
          deliveryFee: 20.00,
          serviceFee: -8.90,
          discount: 0,
          sellerEarnings: 80.10,
          payoutScheduled: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    ];
    
    orders.forEach(orderData => {
      const order = new SellerOrder(orderData);
      // Add timeline events
      if (orderData.preparingAt) {
        order.addTimelineEvent('preparing', orderData.preparingAt);
      }
      if (orderData.readyAt) {
        order.addTimelineEvent('ready', orderData.readyAt);
      }
      this.orders.set(order.id, order);
    });
  }
  
  /**
   * Get all orders for a seller
   */
  getSellerOrders(sellerId, filters = {}) {
    let orders = Array.from(this.orders.values())
      .filter(order => order.sellerId === sellerId || order.sellerId === parseInt(sellerId));
    
    // Apply filters
    if (filters.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    if (filters.deliveryMethod) {
      orders = orders.filter(order => order.deliveryMethod === filters.deliveryMethod);
    }
    
    // Sort by priority: action needed first
    orders.sort((a, b) => {
      const statusPriority = {
        'new': 1,
        'preparing': 2,
        'ready': 3,
        'courier_assigned': 4,
        'delayed': 0, // Highest priority
        'completed': 5,
        'cancelled': 6
      };
      
      const aPriority = statusPriority[a.status] || 99;
      const bPriority = statusPriority[b.status] || 99;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same status, sort by creation time (newest first for new orders, oldest first for active)
      if (a.status === 'new' || a.status === 'preparing' || a.status === 'ready') {
        return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
      }
      
      return new Date(b.createdAt) - new Date(a.createdAt); // Newest first
    });
    
    return orders.map(order => order.toJSON());
  }
  
  /**
   * Get order by ID
   */
  getOrderById(orderId, sellerId) {
    const order = this.orders.get(orderId);
    if (!order) {
      return null;
    }
    
    // Verify seller owns this order
    if (order.sellerId !== sellerId && order.sellerId !== parseInt(sellerId)) {
      return null;
    }
    
    return order.toJSON();
  }
  
  /**
   * Create order from main order (when checkout completes)
   */
  createFromMainOrder(mainOrder, sellerId, storeId) {
    // Extract items for this seller
    const sellerItems = mainOrder.items.filter(item => 
      item.sellerId === sellerId || item.sellerId === parseInt(sellerId) || item.storeId === storeId
    );
    
    if (sellerItems.length === 0) {
      return null;
    }
    
    // Calculate totals for this seller's portion
    const itemsTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = mainOrder.deliveryMethod === 'delivery' ? 20 : 0;
    const serviceFee = -(itemsTotal * 0.12); // 12% service fee (deducted)
    const sellerEarnings = itemsTotal + deliveryFee + serviceFee;
    
    const sellerOrder = new SellerOrder({
      orderId: mainOrder.id,
      storeId: storeId,
      sellerId: sellerId,
      buyerId: mainOrder.userId,
      buyerName: mainOrder.contactInfo?.name || 'Customer',
      buyerPhone: mainOrder.contactInfo?.phone || '',
      items: sellerItems,
      total: itemsTotal + deliveryFee,
      status: 'new',
      deliveryMethod: mainOrder.deliveryMethod,
      deliveryAddress: mainOrder.deliveryAddress,
      orderInstructions: mainOrder.orderInstructions,
      paymentMethod: mainOrder.paymentMethod,
      paymentDetails: mainOrder.paymentDetails,
      slaMinutes: mainOrder.deliverySpeed === 'express' ? 30 : 45,
      earnings: {
        itemsTotal,
        deliveryFee,
        serviceFee,
        discount: 0,
        sellerEarnings,
        payoutScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow 8 AM
      }
    });
    
    this.orders.set(sellerOrder.id, sellerOrder);
    return sellerOrder.toJSON();
  }
  
  /**
   * Validate status transition
   */
  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'new': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['courier_assigned', 'completed', 'cancelled'],
      'courier_assigned': ['completed', 'cancelled'],
      'delayed': ['preparing', 'ready', 'courier_assigned', 'completed', 'cancelled'],
      'completed': [], // Terminal state
      'cancelled': [] // Terminal state
    };
    
    const allowed = validTransitions[currentStatus] || [];
    return allowed.includes(newStatus);
  }
  
  /**
   * Update order status with validation
   */
  updateOrderStatus(orderId, sellerId, newStatus) {
    const order = this.orders.get(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (order.sellerId !== sellerId && order.sellerId !== parseInt(sellerId)) {
      const error = new Error('Unauthorized: You do not have permission to modify this order');
      error.statusCode = 403;
      throw error;
    }
    
    // Validate status transition
    if (!this.validateStatusTransition(order.status, newStatus)) {
      const error = new Error(
        `Invalid status transition: Cannot change from ${order.status} to ${newStatus}`
      );
      error.statusCode = 400;
      throw error;
    }
    
    const oldStatus = order.status;
    const now = new Date();
    
    // Store status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      from: oldStatus,
      to: newStatus,
      timestamp: now,
      changedBy: sellerId
    });
    
    order.status = newStatus;
    order.updatedAt = now;
    
    // Set timestamp based on status
    switch (newStatus) {
      case 'preparing':
        if (!order.preparingAt) {
          order.preparingAt = now;
          order.addTimelineEvent('preparing', now);
        }
        break;
      case 'ready':
        if (!order.readyAt) {
          order.readyAt = now;
          order.addTimelineEvent('ready', now);
          // Auto-generate pickup code if pickup order
          if (order.deliveryMethod === 'pickup' && !order.pickupCode) {
            order.pickupCode = order.generatePickupCode();
          }
        }
        break;
      case 'courier_assigned':
        if (!order.courierAssignedAt) {
          order.courierAssignedAt = now;
          order.addTimelineEvent('courier_assigned', now);
        }
        break;
      case 'completed':
        if (!order.completedAt) {
          order.completedAt = now;
          order.deliveredAt = now;
          order.addTimelineEvent('delivered', now);
        }
        break;
      case 'cancelled':
        order.addTimelineEvent('cancelled', now);
        break;
    }
    
    // Check if order is delayed (only for active orders)
    if (newStatus !== 'completed' && newStatus !== 'cancelled') {
      const elapsedMinutes = (now - new Date(order.createdAt)) / (1000 * 60);
      if (elapsedMinutes > order.slaMinutes && order.status !== 'delayed') {
        // Don't override if already delayed
        if (order.status !== 'delayed') {
          order.status = 'delayed';
          order.addTimelineEvent('delayed', now);
        }
      }
    }
    
    return order.toJSON();
  }
  
  /**
   * Assign courier to order with enhanced logic
   */
  assignCourier(orderId, sellerId, courierId = null, autoAssign = true) {
    const order = this.orders.get(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (order.sellerId !== sellerId && order.sellerId !== parseInt(sellerId)) {
      const error = new Error('Unauthorized: You do not have permission to modify this order');
      error.statusCode = 403;
      throw error;
    }
    
    if (order.deliveryMethod === 'pickup') {
      const error = new Error('Cannot assign courier to pickup orders');
      error.statusCode = 400;
      throw error;
    }
    
    if (order.status !== 'ready' && order.status !== 'delayed') {
      const error = new Error('Order must be ready before assigning courier');
      error.statusCode = 400;
      throw error;
    }
    
    if (order.courierId) {
      const error = new Error('Courier already assigned to this order');
      error.statusCode = 400;
      throw error;
    }
    
    let courier;
    if (autoAssign) {
      // Auto-assign: find nearest available courier with better algorithm
      const availableCouriers = Array.from(this.couriers.values())
        .filter(c => c.status === 'available')
        .map(c => ({
          ...c,
          score: this.calculateCourierScore(c, order)
        }))
        .sort((a, b) => b.score - a.score); // Higher score = better match
      
      if (availableCouriers.length === 0) {
        const error = new Error('No couriers available at this time. Please try again in a few minutes.');
        error.statusCode = 404;
        throw error;
      }
      
      courier = availableCouriers[0];
    } else {
      if (!courierId) {
        const error = new Error('Courier ID is required for manual assignment');
        error.statusCode = 400;
        throw error;
      }
      
      courier = this.couriers.get(courierId);
      if (!courier) {
        const error = new Error('Courier not found');
        error.statusCode = 404;
        throw error;
      }
      if (courier.status !== 'available') {
        const error = new Error(`Courier ${courier.name} is not available (status: ${courier.status})`);
        error.statusCode = 400;
        throw error;
      }
    }
    
    // Calculate ETA more accurately
    const baseTime = 5; // Base preparation time
    const distanceTime = Math.ceil(courier.distance * 2.5); // 2.5 min per km
    const vehicleMultiplier = {
      'e-bike': 1.0,
      'on-foot': 1.5,
      'car': 0.8
    };
    const eta = Math.ceil((baseTime + distanceTime) * (vehicleMultiplier[courier.vehicle] || 1.0));
    
    order.courierId = courier.id;
    order.courierInfo = {
      name: courier.name,
      phone: courier.phone,
      rating: courier.rating,
      distance: courier.distance,
      vehicle: courier.vehicle,
      eta: eta,
      assignedAt: new Date()
    };
    
    // Update status through proper method
    this.updateOrderStatus(orderId, sellerId, 'courier_assigned');
    
    // Mark courier as busy
    courier.status = 'busy';
    courier.currentOrderId = orderId;
    
    return order.toJSON();
  }
  
  /**
   * Calculate courier score for auto-assignment
   */
  calculateCourierScore(courier, order) {
    let score = 0;
    
    // Distance score (closer = higher score, max 40 points)
    const maxDistance = 10; // km
    const distanceScore = Math.max(0, 40 * (1 - courier.distance / maxDistance));
    score += distanceScore;
    
    // Rating score (max 30 points)
    const ratingScore = (courier.rating / 5) * 30;
    score += ratingScore;
    
    // Experience score (max 20 points)
    const experienceScore = Math.min(20, (courier.deliveries / 100) * 2);
    score += experienceScore;
    
    // Vehicle efficiency (max 10 points)
    const vehicleScores = {
      'e-bike': 10,
      'car': 8,
      'on-foot': 5
    };
    score += vehicleScores[courier.vehicle] || 5;
    
    return score;
  }
  
  /**
   * Get available couriers with enhanced info
   */
  getAvailableCouriers(orderId = null) {
    let couriers = Array.from(this.couriers.values())
      .filter(c => c.status === 'available');
    
    // If order provided, calculate scores for ranking
    if (orderId) {
      const order = this.orders.get(orderId);
      if (order) {
        couriers = couriers.map(c => ({
          ...c,
          score: this.calculateCourierScore(c, order),
          estimatedETA: Math.ceil((5 + c.distance * 2.5) * (c.vehicle === 'car' ? 0.8 : c.vehicle === 'e-bike' ? 1.0 : 1.5))
        })).sort((a, b) => b.score - a.score);
      }
    }
    
    return couriers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      rating: c.rating,
      deliveries: c.deliveries,
      distance: c.distance,
      vehicle: c.vehicle,
      status: c.status,
      score: c.score,
      estimatedETA: c.estimatedETA
    }));
  }
  
  /**
   * Mark order as picked up (for pickup orders)
   */
  markAsPickedUp(orderId, sellerId) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.sellerId !== sellerId && order.sellerId !== parseInt(sellerId)) {
      throw new Error('Unauthorized');
    }
    
    if (order.deliveryMethod !== 'pickup') {
      throw new Error('Order is not a pickup order');
    }
    
    if (order.status !== 'ready') {
      throw new Error('Order must be ready before marking as picked up');
    }
    
    order.status = 'completed';
    order.completedAt = new Date();
    order.deliveredAt = order.completedAt;
    order.addTimelineEvent('picked_up', order.completedAt);
    order.updatedAt = new Date();
    
    return order.toJSON();
  }
  
  /**
   * Get order statistics
   */
  getOrderStats(sellerId) {
    const orders = Array.from(this.orders.values())
      .filter(order => order.sellerId === sellerId || order.sellerId === parseInt(sellerId));
    
    const stats = {
      total: orders.length,
      new: orders.filter(o => o.status === 'new').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      courierAssigned: orders.filter(o => o.status === 'courier_assigned').length,
      completed: orders.filter(o => o.status === 'completed').length,
      delayed: orders.filter(o => o.status === 'delayed').length,
      urgentCount: 0
    };
    
    // Count urgent orders (approaching SLA)
    const now = new Date();
    orders.forEach(order => {
      if (order.status !== 'completed' && order.status !== 'cancelled') {
        const elapsedMinutes = (now - new Date(order.createdAt)) / (1000 * 60);
        const remainingMinutes = order.slaMinutes - elapsedMinutes;
        if (remainingMinutes < 10 && remainingMinutes > 0) {
          stats.urgentCount++;
        } else if (remainingMinutes < 0) {
          stats.urgentCount++;
        }
      }
    });
    
    return stats;
  }
  
  /**
   * Calculate SLA status for an order
   */
  calculateSLAStatus(order) {
    const now = new Date();
    const elapsedMinutes = (now - new Date(order.createdAt)) / (1000 * 60);
    const remainingMinutes = order.slaMinutes - elapsedMinutes;
    
    return {
      elapsedMinutes: Math.floor(elapsedMinutes),
      remainingMinutes: Math.max(0, Math.floor(remainingMinutes)),
      isOverdue: remainingMinutes < 0,
      isUrgent: remainingMinutes < 10 && remainingMinutes >= 0,
      percentageComplete: Math.min(100, (elapsedMinutes / order.slaMinutes) * 100)
    };
  }
}

// Export singleton instance
export default new SellerOrderServiceClass();

