class SellerOrder {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.orderId = data.orderId || null; // Links to main Order
    this.storeId = data.storeId || null;
    this.sellerId = data.sellerId || null;
    this.buyerId = data.buyerId || null;
    this.buyerName = data.buyerName || '';
    this.buyerPhone = data.buyerPhone || '';
    this.items = data.items || [];
    this.total = data.total || 0;
    this.status = data.status || 'new'; // 'new', 'preparing', 'ready', 'courier_assigned', 'completed', 'cancelled', 'delayed'
    this.deliveryMethod = data.deliveryMethod || 'delivery'; // 'delivery', 'pickup'
    this.deliveryAddress = data.deliveryAddress || null;
    this.pickupCode = data.pickupCode || this.generatePickupCode();
    this.courierId = data.courierId || null;
    this.courierInfo = data.courierInfo || null; // { name, phone, rating, distance, eta }
    this.notes = data.notes || '';
    this.orderInstructions = data.orderInstructions || '';
    this.paymentMethod = data.paymentMethod || 'card'; // 'card', 'cash'
    this.paymentDetails = data.paymentDetails || null;
    this.neededBy = data.neededBy || null;
    this.slaMinutes = data.slaMinutes || 30; // Standard SLA in minutes
    this.timeline = data.timeline || []; // Array of { event, timestamp, status }
    this.earnings = data.earnings || {
      itemsTotal: 0,
      deliveryFee: 0,
      serviceFee: 0,
      discount: 0,
      sellerEarnings: 0,
      payoutScheduled: null
    };
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.confirmedAt = data.confirmedAt || null;
    this.preparingAt = data.preparingAt || null;
    this.readyAt = data.readyAt || null;
    this.courierAssignedAt = data.courierAssignedAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.statusHistory = data.statusHistory || [];
    
    // Initialize timeline if empty
    if (this.timeline.length === 0) {
      this.addTimelineEvent('order_placed', this.createdAt);
    }
  }
  
  generatePickupCode() {
    // Generate 4-digit pickup code
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  
  addTimelineEvent(event, timestamp = new Date()) {
    if (!this.timeline) {
      this.timeline = [];
    }
    this.timeline.push({
      event,
      timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp),
      status: this.status
    });
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      storeId: this.storeId,
      sellerId: this.sellerId,
      buyerId: this.buyerId,
      buyerName: this.buyerName,
      buyerPhone: this.buyerPhone,
      items: this.items,
      total: this.total,
      status: this.status,
      deliveryMethod: this.deliveryMethod,
      deliveryAddress: this.deliveryAddress,
      pickupCode: this.pickupCode,
      courierId: this.courierId,
      courierInfo: this.courierInfo,
      notes: this.notes,
      orderInstructions: this.orderInstructions,
      paymentMethod: this.paymentMethod,
      paymentDetails: this.paymentDetails,
      neededBy: this.neededBy,
      slaMinutes: this.slaMinutes,
      timeline: this.timeline,
      earnings: this.earnings,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      confirmedAt: this.confirmedAt,
      preparingAt: this.preparingAt,
      readyAt: this.readyAt,
      courierAssignedAt: this.courierAssignedAt,
      deliveredAt: this.deliveredAt,
      statusHistory: this.statusHistory,
    };
  }

  validate() {
    const errors = [];

    if (!this.storeId) {
      errors.push('Store ID is required');
    }

    if (!this.sellerId) {
      errors.push('Seller ID is required');
    }

    if (!this.items || this.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    if (this.total <= 0) {
      errors.push('Order total must be greater than zero');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default SellerOrder;











