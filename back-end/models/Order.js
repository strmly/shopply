class Order {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.userId = data.userId || 'default';
    this.items = data.items || [];
    this.storeGroups = data.storeGroups || [];
    this.deliveryAddress = data.deliveryAddress || null;
    this.deliveryMethod = data.deliveryMethod || 'delivery'; // 'delivery', 'pickup', 'group'
    this.deliverySpeed = data.deliverySpeed || 'standard'; // 'standard', 'express'
    this.paymentMethod = data.paymentMethod || null;
    this.paymentDetails = data.paymentDetails || null;
    this.contactInfo = data.contactInfo || {};
    this.orderInstructions = data.orderInstructions || null;
    this.promoCode = data.promoCode || null;
    this.voucherId = data.voucherId || null;
    this.discount = data.discount || 0;
    this.totals = data.totals || {
      itemsTotal: 0,
      deliveryFee: 0,
      serviceFee: 0,
      smallOrderFee: 0,
      discount: 0,
      subtotal: 0,
      total: 0,
    };
    this.eta = data.eta || null;
    this.status = data.status || 'pending'; // 'pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.confirmedAt = data.confirmedAt || null;
    this.deliveredAt = data.deliveredAt || null;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      storeGroups: this.storeGroups,
      deliveryAddress: this.deliveryAddress,
      deliveryMethod: this.deliveryMethod,
      deliverySpeed: this.deliverySpeed,
      paymentMethod: this.paymentMethod,
      paymentDetails: this.paymentDetails,
      contactInfo: this.contactInfo,
      orderInstructions: this.orderInstructions,
      promoCode: this.promoCode,
      voucherId: this.voucherId,
      discount: this.discount,
      totals: this.totals,
      eta: this.eta,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      confirmedAt: this.confirmedAt,
      deliveredAt: this.deliveredAt,
    };
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.items || this.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    if (this.deliveryMethod === 'delivery' && !this.deliveryAddress) {
      errors.push('Delivery address is required for delivery orders');
    }

    if (!this.paymentMethod) {
      errors.push('Payment method is required');
    }

    if (!this.contactInfo.phone) {
      errors.push('Phone number is required');
    }

    if (this.totals.total <= 0) {
      errors.push('Order total must be greater than zero');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Order;











