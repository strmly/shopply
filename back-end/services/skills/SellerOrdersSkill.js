/**
 * Seller Orders Skill
 * Handles seller order management
 */

import BaseSkill from './BaseSkill.js';
import SellerOrderService from '../SellerOrderService.js';
import { SellerService } from '../SellerService.js';

class SellerOrdersSkill extends BaseSkill {
  constructor() {
    super('SellerOrdersSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;

    switch (step) {
      case 'LIST':
        return this.listOrders(channelEvent, session);
      
      case 'DETAIL':
        return this.showOrderDetail(channelEvent, session);
      
      case 'UPDATE_STATUS':
        return this.updateOrderStatus(channelEvent, session);
      
      default:
        return this.listOrders(channelEvent, session);
    }
  }

  /**
   * List seller orders
   */
  async listOrders(channelEvent, session) {
    const { userChannelId } = channelEvent;
    
    try {
      const seller = await SellerService.getByPhone(userChannelId);
      if (!seller) {
        return this.textResponse('You\'re not registered as a seller.');
      }

      const orders = await SellerOrderService.getSellerOrders(seller.id, {
        status: ['pending', 'confirmed', 'preparing'],
      });

      if (!orders || orders.length === 0) {
        return this.buttonsResponse(
          '📦 No pending orders.\n\nYou\'re all caught up!',
          [
            { id: 'seller_home', title: '🏪 Dashboard' },
            { id: 'seller_products', title: '📦 Products' },
          ]
        );
      }

      const sections = [{
        title: `${orders.length} Pending Orders`,
        rows: orders.slice(0, 10).map(order => ({
          id: `seller_order_${order.id}`,
          title: `Order #${order.id} - ${this.formatStatus(order.status)}`,
          description: `R${order.total.toFixed(2)} • ${order.items?.length || 0} items`,
        })),
      }];

      return this.listResponse(
        '📦 *Your Orders*\n\nSelect an order to manage:',
        'View Orders',
        sections
      );
    } catch (error) {
      console.error('Seller orders list error:', error);
      return this.textResponse('Sorry, couldn\'t load orders. Please try again.');
    }
  }

  /**
   * Show order detail
   */
  async showOrderDetail(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id.startsWith('seller_order_')) {
      const orderId = this.parseOrderId(id);
      
      try {
        const order = await SellerOrderService.getOrder(orderId);
        
        if (!order) {
          return this.textResponse('Order not found.');
        }

        await this.updateContext(userChannelId, { selectedOrder: order });
        await this.changeFlow(userChannelId, 'SELLER_ORDERS', 'DETAIL');

        let text = `📦 *Order #${order.id}*\n\n`;
        text += `Status: ${this.formatStatus(order.status)}\n`;
        text += `Customer: ${order.customerName || 'Customer'}\n\n`;
        text += `*Items:*\n`;
        
        order.items?.forEach(item => {
          text += `• ${item.quantity}x ${item.name}\n`;
        });
        
        text += `\n*Total:* R${order.total.toFixed(2)}\n`;
        
        if (order.notes) {
          text += `\n*Notes:* ${order.notes}`;
        }

        // Action buttons based on status
        const buttons = this.getActionButtons(order);

        return this.buttonsResponse(text, buttons);
      } catch (error) {
        console.error('Seller order detail error:', error);
        return this.textResponse('Sorry, couldn\'t load order details. Please try again.');
      }
    }

    return this.textResponse('Invalid order selection.');
  }

  /**
   * Update order status
   */
  async updateOrderStatus(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;
    const { selectedOrder } = session.context;

    if (!selectedOrder) {
      return this.textResponse('No order selected.');
    }

    try {
      let newStatus = null;

      if (id === 'mark_preparing') {
        newStatus = 'preparing';
      } else if (id === 'mark_ready') {
        newStatus = 'ready';
      } else if (id === 'mark_completed') {
        newStatus = 'completed';
      }

      if (newStatus) {
        await SellerOrderService.updateOrderStatus(selectedOrder.id, newStatus);
        
        await this.changeFlow(userChannelId, 'SELLER_ORDERS', 'LIST');
        
        return [
          this.textResponse(`✅ Order #${selectedOrder.id} marked as ${newStatus}!`),
          await this.listOrders(channelEvent, session),
        ];
      }

      return this.textResponse('Invalid action.');
    } catch (error) {
      console.error('Update order status error:', error);
      return this.textResponse('Sorry, couldn\'t update order status. Please try again.');
    }
  }

  /**
   * Get action buttons based on order status
   */
  getActionButtons(order) {
    const buttons = [];

    if (order.status === 'confirmed' || order.status === 'pending') {
      buttons.push({ id: 'mark_preparing', title: '👨‍🍳 Start Preparing' });
    }

    if (order.status === 'preparing') {
      buttons.push({ id: 'mark_ready', title: '📦 Mark Ready' });
    }

    if (order.status === 'ready' || order.status === 'out_for_delivery') {
      buttons.push({ id: 'mark_completed', title: '✅ Complete' });
    }

    if (buttons.length < 3) {
      buttons.push({ id: 'contact_customer', title: '💬 Contact' });
    }

    return buttons;
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
      completed: '✅ Completed',
      cancelled: '❌ Cancelled',
    };
    return statusMap[status] || status;
  }
}

export default new SellerOrdersSkill();

