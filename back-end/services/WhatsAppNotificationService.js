/**
 * WhatsApp Notification Service
 * Sends template-based notifications for order events, promotions, etc.
 */

import whatsappGateway from './WhatsAppGateway.js';
import whatsappConfig from '../config/whatsapp.js';

class WhatsAppNotificationService {
  /**
   * Send OTP
   */
  async sendOTP(phoneNumber, otp, expiryMinutes = 5) {
    try {
      const templateName = whatsappConfig.templates.otp;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: otp },
            { type: 'text', text: expiryMinutes.toString() },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send OTP error:', error);
      // Fallback to regular message
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `Your verification code is: ${otp}\n\nValid for ${expiryMinutes} minutes.`
      );
    }
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(phoneNumber, order) {
    try {
      const templateName = whatsappConfig.templates.orderConfirmation;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
            { type: 'text', text: order.total.toFixed(2) },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send order confirmation error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `✅ Order #${order.id} confirmed!\n\nTotal: R${order.total.toFixed(2)}\n\nWe'll keep you updated on your order status.`
      );
    }
  }

  /**
   * Send order paid notification
   */
  async sendOrderPaid(phoneNumber, order) {
    try {
      const templateName = whatsappConfig.templates.orderPaid;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send order paid error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `💰 Payment received for Order #${order.id}!\n\nYour order is being prepared.`
      );
    }
  }

  /**
   * Send order preparing notification
   */
  async sendOrderPreparing(phoneNumber, order) {
    try {
      const templateName = whatsappConfig.templates.orderPreparing;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send order preparing error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `👨‍🍳 Your order #${order.id} is being prepared!\n\nWe'll notify you when it's ready.`
      );
    }
  }

  /**
   * Send order ready notification
   */
  async sendOrderReady(phoneNumber, order, pickupCode = null) {
    try {
      const templateName = whatsappConfig.templates.orderReady;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
            { type: 'text', text: pickupCode || 'N/A' },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send order ready error:', error);
      let message = `📦 Your order #${order.id} is ready!\n\n`;
      if (pickupCode) {
        message += `Pickup code: ${pickupCode}`;
      }
      return await whatsappGateway.sendTextMessage(phoneNumber, message);
    }
  }

  /**
   * Send courier assigned notification
   */
  async sendCourierAssigned(phoneNumber, order, courierName, courierPhone) {
    try {
      const templateName = whatsappConfig.templates.courierAssigned;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
            { type: 'text', text: courierName },
            { type: 'text', text: courierPhone },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send courier assigned error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `🚚 Courier assigned to Order #${order.id}!\n\nCourier: ${courierName}\nPhone: ${courierPhone}`
      );
    }
  }

  /**
   * Send out for delivery notification
   */
  async sendOutForDelivery(phoneNumber, order, estimatedArrival) {
    try {
      const templateName = whatsappConfig.templates.outForDelivery;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
            { type: 'text', text: estimatedArrival },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send out for delivery error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `🛵 Your order #${order.id} is on the way!\n\nEstimated arrival: ${estimatedArrival}`
      );
    }
  }

  /**
   * Send delivered notification
   */
  async sendDelivered(phoneNumber, order) {
    try {
      const templateName = whatsappConfig.templates.delivered;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send delivered error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `✅ Order #${order.id} delivered!\n\nEnjoy your purchase! 🎉\n\nType "review_${order.id}" to leave a review.`
      );
    }
  }

  /**
   * Send refund approved notification
   */
  async sendRefundApproved(phoneNumber, order, refundAmount) {
    try {
      const templateName = whatsappConfig.templates.refundApproved;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
            { type: 'text', text: refundAmount.toFixed(2) },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send refund approved error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `✅ Refund approved for Order #${order.id}\n\nAmount: R${refundAmount.toFixed(2)}\n\nFunds will be returned to your account.`
      );
    }
  }

  /**
   * Send refund paid notification
   */
  async sendRefundPaid(phoneNumber, order, refundAmount) {
    try {
      const templateName = whatsappConfig.templates.refundPaid;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: order.id.toString() },
            { type: 'text', text: refundAmount.toFixed(2) },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send refund paid error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `💰 Refund processed for Order #${order.id}\n\nAmount: R${refundAmount.toFixed(2)}\n\nPlease allow 3-5 business days for the funds to reflect.`
      );
    }
  }

  /**
   * Send low stock alert (for sellers)
   */
  async sendLowStockAlert(phoneNumber, product, currentStock, threshold) {
    try {
      const templateName = whatsappConfig.templates.lowStock;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: product.name },
            { type: 'text', text: currentStock.toString() },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send low stock alert error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `⚠️ Low Stock Alert!\n\nProduct: ${product.name}\nCurrent stock: ${currentStock}\n\nConsider restocking soon.`
      );
    }
  }

  /**
   * Send promo starting notification
   */
  async sendPromoStarting(phoneNumber, promo) {
    try {
      const templateName = whatsappConfig.templates.promoStarting;
      
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: promo.name },
            { type: 'text', text: promo.discount.toString() },
          ],
        },
      ];

      return await whatsappGateway.sendTemplate(phoneNumber, templateName, 'en', components);
    } catch (error) {
      console.error('Send promo starting error:', error);
      return await whatsappGateway.sendTextMessage(
        phoneNumber,
        `🎉 ${promo.name} is now live!\n\n${promo.discount}% off!\n\nType "deals" to see all active promotions.`
      );
    }
  }

  /**
   * Handle order status change events
   */
  async handleOrderStatusChange(order, newStatus, metadata = {}) {
    const phoneNumber = order.customerPhone || order.userPhone;
    
    if (!phoneNumber) {
      console.warn('No phone number for order notification');
      return;
    }

    switch (newStatus) {
      case 'confirmed':
        return this.sendOrderConfirmation(phoneNumber, order);
      
      case 'paid':
        return this.sendOrderPaid(phoneNumber, order);
      
      case 'preparing':
        return this.sendOrderPreparing(phoneNumber, order);
      
      case 'ready':
        return this.sendOrderReady(phoneNumber, order, metadata.pickupCode);
      
      case 'courier_assigned':
        return this.sendCourierAssigned(
          phoneNumber,
          order,
          metadata.courierName,
          metadata.courierPhone
        );
      
      case 'out_for_delivery':
        return this.sendOutForDelivery(phoneNumber, order, metadata.estimatedArrival);
      
      case 'delivered':
        return this.sendDelivered(phoneNumber, order);
      
      default:
        console.log(`No notification template for status: ${newStatus}`);
    }
  }
}

export default new WhatsAppNotificationService();

