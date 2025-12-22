/**
 * Orders Skill
 * Handles order tracking and management
 */

import BaseSkill from './BaseSkill.js';
import whatsappSessionService from '../WhatsAppSessionService.js';
import OrdersService from '../OrdersService.js';

class OrdersSkill extends BaseSkill {
  constructor() {
    super('OrdersSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;

    switch (step) {
      case 'LIST':
        return this.listOrders(channelEvent, session);
      
      case 'DETAIL':
        return this.showOrderDetail(channelEvent, session);
      
      case 'TRACK':
        return this.trackOrder(channelEvent, session);
      
      default:
        return this.listOrders(channelEvent, session);
    }
  }

  /**
   * List orders
   */
  async listOrders(channelEvent, session) {
    const { userChannelId } = channelEvent;
    
    try {
      const orders = await OrdersService.getUserOrders(userChannelId);
      
      if (!orders || orders.length === 0) {
        return this.buttonsResponse(
          '📦 You don\'t have any orders yet.\n\nStart shopping to place your first order!',
          [
            { id: 'search', title: '🔍 Search' },
            { id: 'home', title: '🏠 Home' },
          ]
        );
      }

      const sections = [{
        title: 'Your Orders',
        rows: orders.slice(0, 10).map(order => ({
          id: `order_${order.id}`,
          title: `Order #${order.id} - ${this.formatStatus(order.status)}`,
          description: `R${order.total.toFixed(2)} • ${order.items?.length || 0} items`,
        })),
      }];

      return this.listResponse(
        '📦 *Your Orders*\n\nSelect an order to view details:',
        'View Orders',
        sections
      );
    } catch (error) {
      console.error('Orders list error:', error);
      return this.textResponse('Sorry, couldn\'t load your orders. Please try again.');
    }
  }

  /**
   * Show order detail
   */
  async showOrderDetail(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id.startsWith('order_')) {
      const orderId = this.parseOrderId(id);
      
      try {
        const order = await OrdersService.getOrder(orderId);
        
        if (!order) {
          return this.textResponse('Order not found.');
        }

        // Build timeline
        const timeline = this.buildTimeline(order);

        const orderData = {
          ...order,
          timeline,
        };

        await this.updateContext(userChannelId, { selectedOrder: order });
        await this.changeFlow(userChannelId, 'ORDERS', 'DETAIL');

        return this.orderSummaryResponse(orderData);
      } catch (error) {
        console.error('Order detail error:', error);
        return this.textResponse('Sorry, couldn\'t load order details. Please try again.');
      }
    }

    return this.textResponse('Invalid order selection.');
  }

  /**
   * Track order
   */
  async trackOrder(channelEvent, session) {
    const { selectedOrder } = session.context;
    
    if (!selectedOrder) {
      return this.textResponse('No order selected.');
    }

    const trackingUrl = `${process.env.APP_URL || 'https://shopply.app'}/orders/${selectedOrder.id}/track`;

    return this.ctaUrlResponse(
      `📍 *Track Order #${selectedOrder.id}*\n\nClick below to view real-time tracking:`,
      'Track Order',
      trackingUrl
    );
  }

  /**
   * Build order timeline
   */
  buildTimeline(order) {
    const statuses = [
      { key: 'confirmed', label: 'Order Confirmed', completed: false },
      { key: 'preparing', label: 'Being Prepared', completed: false },
      { key: 'ready', label: 'Ready for Pickup', completed: false },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { key: 'delivered', label: 'Delivered', completed: false },
    ];

    const currentIndex = statuses.findIndex(s => s.key === order.status);

    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex,
    }));
  }

  /**
   * Format order status
   */
  formatStatus(status) {
    const statusMap = {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      preparing: '👨‍🍳 Preparing',
      ready: '📦 Ready',
      out_for_delivery: '🚚 On the way',
      delivered: '✅ Delivered',
      cancelled: '❌ Cancelled',
    };
    return statusMap[status] || status;
  }
}

export default new OrdersSkill();

