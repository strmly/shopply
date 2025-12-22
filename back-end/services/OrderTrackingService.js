import CheckoutService from './CheckoutService.js';

class OrderTrackingService {
  constructor() {
    // Mock courier data (in production, this would come from a courier service)
    this.couriers = new Map();
    this.courierLocations = new Map(); // orderId -> courier location
    this.orderTimelines = new Map(); // orderId -> timeline events
  }

  /**
   * Get order tracking details
   */
  getOrderTracking(orderId) {
    const order = CheckoutService.getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const tracking = {
      orderId: order.id,
      status: order.status,
      currentStage: this.getCurrentStage(order.status),
      eta: order.eta,
      courier: this.getCourierForOrder(orderId),
      storeGroups: order.storeGroups || [],
      timeline: this.getTimeline(orderId, order),
      issues: this.getActiveIssues(orderId),
      lastUpdated: new Date(),
    };

    return tracking;
  }

  /**
   * Get current stage based on order status
   */
  getCurrentStage(status) {
    const stages = {
      'pending': 'order_received',
      'confirmed': 'store_preparing',
      'processing': 'store_preparing',
      'out_for_delivery': 'on_the_way',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
    };
    return stages[status] || 'order_received';
  }

  /**
   * Get courier information for order
   */
  getCourierForOrder(orderId) {
    // Mock courier data
    if (!this.couriers.has(orderId)) {
      const couriers = [
        {
          id: 'courier_1',
          name: 'Sam',
          rating: 4.8,
          deliveryCount: 532,
          vehicle: 'Yamaha Scooter',
          vehicleColor: 'Red',
          phone: '+27 12 345 6789',
          photo: null, // In production, would be a URL
        },
        {
          id: 'courier_2',
          name: 'Sarah',
          rating: 4.9,
          deliveryCount: 847,
          vehicle: 'Honda Motorcycle',
          vehicleColor: 'Blue',
          phone: '+27 12 345 6780',
          photo: null,
        },
        {
          id: 'courier_3',
          name: 'Mike',
          rating: 4.7,
          deliveryCount: 321,
          vehicle: 'Bicycle',
          vehicleColor: 'Green',
          phone: '+27 12 345 6781',
          photo: null,
        },
      ];
      
      // Assign a random courier
      const courier = couriers[Math.floor(Math.random() * couriers.length)];
      this.couriers.set(orderId, courier);
      
      // Initialize courier location (mock - starts at first store)
      const order = CheckoutService.getOrder(orderId);
      if (order && order.storeGroups && order.storeGroups.length > 0) {
        const firstStore = order.storeGroups[0];
        // Try to get location from storeLocation or use default
        const storeLat = firstStore.storeLocation?.lat || 
                        (firstStore.items && firstStore.items[0]?.product?.storeLocation?.lat) ||
                        -26.1076;
        const storeLng = firstStore.storeLocation?.lng || 
                        (firstStore.items && firstStore.items[0]?.product?.storeLocation?.lng) ||
                        28.0567;
        this.courierLocations.set(orderId, {
          lat: storeLat,
          lng: storeLng,
          heading: Math.random() * 360, // Random heading
          speed: 30, // km/h
          lastUpdated: new Date(),
        });
      }
    }

    return this.couriers.get(orderId);
  }

  /**
   * Get courier location (mock - simulates movement)
   */
  getCourierLocation(orderId, userLocation) {
    const order = CheckoutService.getOrder(orderId);
    if (!order) {
      return null;
    }

    let location = this.courierLocations.get(orderId);
    if (!location) {
      // Initialize location at first store
      if (order.storeGroups && order.storeGroups.length > 0) {
        const firstStore = order.storeGroups[0];
        const storeLat = firstStore.storeLocation?.lat || 
                        (firstStore.items && firstStore.items[0]?.product?.storeLocation?.lat) ||
                        -26.1076;
        const storeLng = firstStore.storeLocation?.lng || 
                        (firstStore.items && firstStore.items[0]?.product?.storeLocation?.lng) ||
                        28.0567;
        location = {
          lat: storeLat,
          lng: storeLng,
          heading: 0,
          speed: 0,
          lastUpdated: new Date(),
        };
        this.courierLocations.set(orderId, location);
      } else {
        return null;
      }
    }

    // Simulate courier movement based on order status
    if (order.status === 'out_for_delivery' && userLocation) {
      // Move courier towards user location
      const timeSinceUpdate = (new Date() - location.lastUpdated) / 1000; // seconds
      const distanceToMove = (location.speed / 3600) * timeSinceUpdate; // km
      
      // Simple movement simulation (in production, use proper routing)
      const latDiff = userLocation.lat - location.lat;
      const lngDiff = userLocation.lng - location.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // rough km conversion
      
      if (distance > 0.1) { // If more than 100m away
        const ratio = Math.min(distanceToMove / distance, 0.95); // Don't overshoot
        location.lat += latDiff * ratio;
        location.lng += lngDiff * ratio;
        location.heading = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
        location.lastUpdated = new Date();
      }
    }

    return location;
  }

  /**
   * Get timeline events for order
   */
  getTimeline(orderId, order) {
    if (this.orderTimelines.has(orderId)) {
      return this.orderTimelines.get(orderId);
    }

    const timeline = [];
    const now = new Date();
    const createdAt = new Date(order.createdAt);

    // Order received
    timeline.push({
      id: 'order_received',
      type: 'order_received',
      status: 'completed',
      title: 'Order confirmed',
      description: 'Your order has been confirmed',
      timestamp: createdAt,
      icon: '✓',
    });

    // Store preparing (if confirmed or processing)
    if (['confirmed', 'processing', 'out_for_delivery', 'delivered'].includes(order.status)) {
      const preparingTime = new Date(createdAt.getTime() + 3 * 60 * 1000); // 3 minutes after
      timeline.push({
        id: 'store_preparing',
        type: 'store_preparing',
        status: order.status === 'delivered' ? 'completed' : 
                ['confirmed', 'processing'].includes(order.status) ? 'active' : 'completed',
        title: `${order.storeGroups?.[0]?.storeName || 'Store'} has started preparing`,
        description: 'Your items are being packed',
        timestamp: preparingTime,
        icon: '📦',
      });
    }

    // Courier assigned (if processing or later)
    if (['processing', 'out_for_delivery', 'delivered'].includes(order.status)) {
      const courierAssignedTime = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 minutes after
      const courier = this.getCourierForOrder(orderId);
      timeline.push({
        id: 'courier_assigned',
        type: 'courier_assigned',
        status: order.status === 'delivered' ? 'completed' : 
                order.status === 'processing' ? 'active' : 'completed',
        title: `Courier ${courier?.name || 'assigned'} is on the way to store`,
        description: `Your courier will pick up your order`,
        timestamp: courierAssignedTime,
        icon: '🛵',
      });
    }

    // On the way (if out_for_delivery or delivered)
    if (['out_for_delivery', 'delivered'].includes(order.status)) {
      const onTheWayTime = new Date(createdAt.getTime() + 25 * 60 * 1000); // 25 minutes after
      timeline.push({
        id: 'on_the_way',
        type: 'on_the_way',
        status: order.status === 'delivered' ? 'completed' : 'active',
        title: 'Your order is on the way!',
        description: 'Your courier is heading to your location',
        timestamp: onTheWayTime,
        icon: '🚚',
      });
    }

    // Delivered (if delivered)
    if (order.status === 'delivered' && order.deliveredAt) {
      timeline.push({
        id: 'delivered',
        type: 'delivered',
        status: 'completed',
        title: 'Order delivered',
        description: 'Your order has arrived',
        timestamp: new Date(order.deliveredAt),
        icon: '✓',
      });
    }

    // Add future estimated events
    if (order.status !== 'delivered') {
      const estimatedDelivery = this.calculateEstimatedDeliveryTime(order);
      timeline.push({
        id: 'estimated_delivery',
        type: 'estimated_delivery',
        status: 'upcoming',
        title: 'Expected delivery',
        description: `Your order will arrive around ${this.formatTime(estimatedDelivery)}`,
        timestamp: estimatedDelivery,
        icon: '⏰',
      });
    }

    this.orderTimelines.set(orderId, timeline);
    return timeline;
  }

  /**
   * Calculate estimated delivery time
   */
  calculateEstimatedDeliveryTime(order) {
    const now = new Date();
    const baseMinutes = 45; // Base delivery time
    const storeCount = order.storeGroups?.length || 1;
    const additionalMinutes = (storeCount - 1) * 10;
    const totalMinutes = baseMinutes + additionalMinutes;
    
    return new Date(now.getTime() + totalMinutes * 60 * 1000);
  }

  /**
   * Format time for display
   */
  formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Get active issues for order
   */
  getActiveIssues(orderId) {
    const order = CheckoutService.getOrder(orderId);
    if (!order) {
      return [];
    }

    const issues = [];

    // Check for delays
    if (order.status === 'processing' || order.status === 'out_for_delivery') {
      const createdAt = new Date(order.createdAt);
      const elapsed = (new Date() - createdAt) / 1000 / 60; // minutes
      
      // If processing for more than 30 minutes, show delay
      if (order.status === 'processing' && elapsed > 30) {
        issues.push({
          id: 'delay_processing',
          type: 'delay',
          severity: 'warning',
          title: 'Order taking longer than expected',
          message: 'The store is taking longer to prepare your order. We\'re monitoring the situation.',
          action: null,
        });
      }

      // If out for delivery for more than 45 minutes, show delay
      if (order.status === 'out_for_delivery' && elapsed > 45) {
        issues.push({
          id: 'delay_delivery',
          type: 'delay',
          severity: 'warning',
          title: 'Courier is delayed due to traffic',
          message: 'Your courier is experiencing delays. New ETA: 4:30–4:50 PM',
          action: null,
        });
      }
    }

    return issues;
  }

  /**
   * Update order status (simulate progression)
   */
  simulateOrderProgression(orderId) {
    const order = CheckoutService.getOrder(orderId);
    if (!order) {
      return;
    }

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const elapsed = (now - createdAt) / 1000 / 60; // minutes

    // Simulate status progression
    if (order.status === 'pending' && elapsed > 1) {
      CheckoutService.updateOrderStatus(orderId, 'confirmed');
    } else if (order.status === 'confirmed' && elapsed > 5) {
      CheckoutService.updateOrderStatus(orderId, 'processing');
    } else if (order.status === 'processing' && elapsed > 20) {
      CheckoutService.updateOrderStatus(orderId, 'out_for_delivery');
    } else if (order.status === 'out_for_delivery' && elapsed > 45) {
      CheckoutService.updateOrderStatus(orderId, 'delivered');
      order.deliveredAt = now;
    }
  }

  /**
   * Get store status for multi-store orders
   */
  getStoreStatuses(orderId) {
    const order = CheckoutService.getOrder(orderId);
    if (!order || !order.storeGroups) {
      return [];
    }

    const statuses = [];
    const orderStatus = order.status;

    order.storeGroups.forEach((store, index) => {
      let storeStatus = 'waiting';
      let message = 'Waiting for pickup';

      if (orderStatus === 'confirmed' || orderStatus === 'processing') {
        if (index === 0) {
          storeStatus = 'preparing';
          message = 'Preparing items';
        } else {
          storeStatus = 'waiting';
          message = 'Waiting for pickup';
        }
      } else if (orderStatus === 'out_for_delivery') {
        if (index === 0) {
          storeStatus = 'completed';
          message = 'Picked up';
        } else {
          storeStatus = 'preparing';
          message = 'Preparing items';
        }
      } else if (orderStatus === 'delivered') {
        storeStatus = 'completed';
        message = 'Delivered';
      }

      statuses.push({
        storeId: store.storeId,
        storeName: store.storeName,
        status: storeStatus,
        message: message,
        distance: store.distance || 0,
        eta: store.eta || 'Soon',
      });
    });

    return statuses;
  }
}

// Export singleton instance
export default new OrderTrackingService();

