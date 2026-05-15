/**
 * Checkout Skill
 * Handles checkout flow with payment links
 */

import BaseSkill from './BaseSkill.js';
import whatsappSessionService from '../WhatsAppSessionService.js';
import CheckoutService from '../CheckoutService.js';
import { CartService } from '../CartService.js';

class CheckoutSkill extends BaseSkill {
  constructor() {
    super('CheckoutSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;

    switch (step) {
      case 'PREPARE':
        return this.prepareCheckout(channelEvent, session);
      
      case 'CONFIRM_ADDRESS':
        return this.confirmAddress(channelEvent, session);
      
      case 'PAYMENT':
        return this.handlePayment(channelEvent, session);
      
      default:
        return this.prepareCheckout(channelEvent, session);
    }
  }

  /**
   * Prepare checkout
   */
  async prepareCheckout(channelEvent, session) {
    const { userChannelId } = channelEvent;
    
    try {
      // Get cart
      const cart = await CartService.getCart(userChannelId);
      
      if (!cart || !cart.items || cart.items.length === 0) {
        return this.buttonsResponse(
          '🛒 Your cart is empty.\n\nAdd items before checking out.',
          [
            { id: 'search', title: '🔍 Search' },
            { id: 'home', title: '🏠 Home' },
          ]
        );
      }

      // Get delivery address
      const user = await whatsappSessionService.getLinkedUser(userChannelId);
      const address = user?.defaultAddress;

      if (!address) {
        return this.buttonsResponse(
          '📍 Please set your delivery address first:',
          [
            { id: 'set_address', title: '📍 Set Address' },
            { id: 'cart', title: '🛒 Back to Cart' },
          ]
        );
      }

      await this.updateContext(userChannelId, { cart, address });
      await this.changeFlow(userChannelId, 'CHECKOUT', 'CONFIRM_ADDRESS');

      return this.buttonsResponse(
        `📍 *Delivery Address*\n\n${address.address || 'Your location'}\n\n*Order Summary:*\nSubtotal: R${cart.subtotal.toFixed(2)}\nDelivery: R${cart.deliveryFee.toFixed(2)}\n*Total: R${cart.total.toFixed(2)}*\n\nIs everything correct?`,
        [
          { id: 'confirm_checkout', title: '✅ Confirm' },
          { id: 'change_address', title: '📍 Change Address' },
          { id: 'cart', title: '🛒 Edit Cart' },
        ]
      );
    } catch (error) {
      console.error('Checkout prepare error:', error);
      return this.textResponse('Sorry, couldn\'t prepare checkout. Please try again.');
    }
  }

  /**
   * Confirm address
   */
  async confirmAddress(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id === 'confirm_checkout') {
      await this.changeFlow(userChannelId, 'CHECKOUT', 'PAYMENT');
      return this.handlePayment(channelEvent, session);
    }

    if (id === 'change_address') {
      // TODO: Implement address change flow
      return this.textResponse('Address change coming soon! For now, please continue with current address.');
    }

    return this.textResponse('Please confirm or change your address.');
  }

  /**
   * Handle payment
   */
  async handlePayment(channelEvent, session) {
    const { userChannelId } = channelEvent;
    const { cart } = session.context;

    try {
      // Create order
      const order = await CheckoutService.createOrder(userChannelId, {
        items: cart.items,
        total: cart.total,
      });

      // Generate payment link
      const paymentLink = await this.generatePaymentLink(order);

      // Store order ID for tracking
      await this.updateContext(userChannelId, { orderId: order.id });

      // Send payment link
      return this.ctaUrlResponse(
        `💳 *Complete Payment*\n\nOrder #${order.id}\nTotal: R${cart.total.toFixed(2)}\n\nClick the button below to complete your payment securely:`,
        'Pay Now',
        paymentLink
      );
    } catch (error) {
      console.error('Payment error:', error);
      return this.textResponse('Sorry, couldn\'t process payment. Please try again.');
    }
  }

  /**
   * Generate payment link
   */
  async generatePaymentLink(order) {
    // In production, integrate with payment gateway (Paystack, Stripe, etc.)
    // For now, return a mock link
    const baseUrl = process.env.APP_URL || 'https://shopply.co.za';
    return `${baseUrl}/checkout/payment/${order.id}`;
  }
}

export default new CheckoutSkill();

