/**
 * WhatsApp Message Renderer
 * Converts internal response objects into WhatsApp message formats
 */

import whatsappGateway from './WhatsAppGateway.js';
import whatsappConfig from '../config/whatsapp.js';

class WhatsAppMessageRenderer {
  /**
   * Render a response and send via WhatsApp
   */
  async renderAndSend(phoneNumber, response) {
    const { type, data, options } = response;

    switch (type) {
      case 'text':
        return this.sendText(phoneNumber, data.text, options);
      
      case 'buttons':
        return this.sendButtons(phoneNumber, data.text, data.buttons, options);
      
      case 'list':
        return this.sendList(phoneNumber, data.text, data.buttonText, data.sections, options);
      
      case 'product_card':
        return this.sendProductCard(phoneNumber, data.product, options);
      
      case 'products_list':
        return this.sendProductsList(phoneNumber, data.products, data.tier, options);
      
      case 'order_summary':
        return this.sendOrderSummary(phoneNumber, data.order, options);
      
      case 'cart_summary':
        return this.sendCartSummary(phoneNumber, data.cart, options);
      
      case 'cta_url':
        return this.sendCTAButton(phoneNumber, data.text, data.buttonText, data.url, options);
      
      case 'template':
        return this.sendTemplate(phoneNumber, data.templateName, data.components, options);
      
      case 'location_request':
        return this.sendLocationRequest(phoneNumber, data.text, options);
      
      default:
        return this.sendText(phoneNumber, 'Sorry, I didn\'t understand that.', options);
    }
  }

  /**
   * Send simple text
   */
  async sendText(phoneNumber, text, options = {}) {
    return whatsappGateway.sendTextMessage(phoneNumber, text, options);
  }

  /**
   * Send buttons (max 3)
   */
  async sendButtons(phoneNumber, text, buttons, options = {}) {
    // Add standard global buttons if not in options
    const allButtons = [...buttons];
    
    if (!options.skipGlobalButtons && allButtons.length < 3) {
      if (!allButtons.find(b => b.id === 'home')) {
        allButtons.push({ id: 'home', title: '🏠 Home' });
      }
    }

    return whatsappGateway.sendButtonMessage(
      phoneNumber,
      text,
      allButtons.slice(0, 3),
      options
    );
  }

  /**
   * Send list message
   */
  async sendList(phoneNumber, text, buttonText, sections, options = {}) {
    return whatsappGateway.sendListMessage(
      phoneNumber,
      text,
      buttonText,
      sections,
      options
    );
  }

  /**
   * Send product card
   */
  async sendProductCard(phoneNumber, product, options = {}) {
    const {
      id,
      name,
      price,
      discount,
      distance,
      eta,
      seller,
      image,
      stock,
      rating,
    } = product;

    // Send image if available
    if (image) {
      await whatsappGateway.sendImageMessage(
        phoneNumber,
        image,
        `${name} - R${this.formatPrice(price)}`
      );
    }

    // Format product details
    const finalPrice = discount ? price * (1 - discount / 100) : price;
    let text = `*${name}*\n\n`;
    
    if (discount) {
      text += `~~R${this.formatPrice(price)}~~ *R${this.formatPrice(finalPrice)}* (${discount}% off)\n`;
    } else {
      text += `💰 *R${this.formatPrice(price)}*\n`;
    }

    if (distance) {
      text += `📍 ${this.formatDistance(distance)}`;
      if (eta) text += ` • ${eta} min`;
      text += '\n';
    }

    if (seller) {
      text += `🏪 ${seller.name}`;
      if (seller.rating) text += ` ⭐ ${seller.rating.toFixed(1)}`;
      if (seller.topRated) text += ' 🏆';
      text += '\n';
    }

    if (stock !== undefined) {
      text += stock > 0 ? `✅ In stock (${stock})` : '❌ Out of stock';
      text += '\n';
    }

    // Action buttons
    const buttons = [];
    
    if (stock > 0) {
      buttons.push({ id: `add_to_cart_${id}`, title: '🛒 Add to Cart' });
      buttons.push({ id: `buy_now_${id}`, title: '⚡ Buy Now' });
    } else {
      buttons.push({ id: `notify_${id}`, title: '🔔 Notify Me' });
    }

    if (buttons.length < 3) {
      buttons.push({ id: `similar_${id}`, title: '🔍 More Like This' });
    }

    return this.sendButtons(phoneNumber, text, buttons, { skipGlobalButtons: true });
  }

  /**
   * Send products list (search results)
   */
  async sendProductsList(phoneNumber, products, tier, options = {}) {
    if (!products || products.length === 0) {
      return this.sendText(
        phoneNumber,
        '😔 No products found. Try expanding your search radius or browsing categories.',
        options
      );
    }

    // Show tier info first
    let tierText = this.formatTierMessage(tier);
    await this.sendText(phoneNumber, tierText);

    // Format as list message
    const rows = products.slice(0, 10).map(product => {
      const price = product.discount 
        ? product.price * (1 - product.discount / 100)
        : product.price;
      
      return {
        id: `product_${product.id}`,
        title: `${product.name} - R${this.formatPrice(price)}`,
        description: `📍 ${this.formatDistance(product.distance)} • ${product.seller?.name || 'Store'}`,
      };
    });

    const sections = [{
      title: `${products.length} Products Found`,
      rows,
    }];

    return this.sendList(
      phoneNumber,
      `Found *${products.length} products* near you.\nSelect one to view details:`,
      'View Products',
      sections,
      options
    );
  }

  /**
   * Send order summary
   */
  async sendOrderSummary(phoneNumber, order, options = {}) {
    const {
      id,
      status,
      items,
      total,
      deliveryAddress,
      seller,
      timeline,
      trackingUrl,
    } = order;

    let text = `📦 *Order #${id}*\n\n`;
    text += `Status: ${this.formatOrderStatus(status)}\n\n`;

    // Items
    text += '*Items:*\n';
    items.forEach(item => {
      text += `• ${item.quantity}x ${item.name} - R${this.formatPrice(item.price)}\n`;
    });

    text += `\n*Total:* R${this.formatPrice(total)}\n\n`;

    // Timeline
    if (timeline) {
      text += '*Timeline:*\n';
      timeline.forEach(event => {
        const icon = event.completed ? '✅' : '⏳';
        text += `${icon} ${event.label}\n`;
      });
    }

    // Buttons based on status
    const buttons = [];
    
    if (status === 'preparing' || status === 'ready') {
      buttons.push({ id: `track_${id}`, title: '📍 Track Order' });
    }
    
    if (status === 'delivered') {
      buttons.push({ id: `review_${id}`, title: '⭐ Leave Review' });
      buttons.push({ id: `return_${id}`, title: '↩️ Return Item' });
    } else {
      buttons.push({ id: `contact_seller_${id}`, title: '💬 Contact Seller' });
    }

    return this.sendButtons(phoneNumber, text, buttons, options);
  }

  /**
   * Send cart summary
   */
  async sendCartSummary(phoneNumber, cart, options = {}) {
    const { items, stores, subtotal, deliveryFee, total } = cart;

    if (!items || items.length === 0) {
      return this.sendButtons(
        phoneNumber,
        '🛒 Your cart is empty.\n\nStart shopping to add items!',
        [
          { id: 'search', title: '🔍 Search Products' },
          { id: 'browse_categories', title: '📂 Browse Categories' },
        ],
        options
      );
    }

    let text = `🛒 *Your Cart*\n\n`;
    
    // Group by store
    stores.forEach(store => {
      text += `🏪 *${store.name}*\n`;
      store.items.forEach(item => {
        text += `  • ${item.quantity}x ${item.name} - R${this.formatPrice(item.price)}\n`;
      });
      text += '\n';
    });

    text += `Subtotal: R${this.formatPrice(subtotal)}\n`;
    text += `Delivery: R${this.formatPrice(deliveryFee)}\n`;
    text += `*Total: R${this.formatPrice(total)}*\n`;

    const buttons = [
      { id: 'checkout', title: '✅ Checkout' },
      { id: 'edit_cart', title: '✏️ Edit Cart' },
      { id: 'clear_cart', title: '🗑️ Clear Cart' },
    ];

    return this.sendButtons(phoneNumber, text, buttons, options);
  }

  /**
   * Send CTA URL button (for payments, KYC, etc.)
   */
  async sendCTAButton(phoneNumber, text, buttonText, url, options = {}) {
    return whatsappGateway.sendCTAUrlButton(phoneNumber, text, buttonText, url, options);
  }

  /**
   * Send template message
   */
  async sendTemplate(phoneNumber, templateName, components = [], options = {}) {
    return whatsappGateway.sendTemplate(
      phoneNumber,
      templateName,
      options.languageCode || 'en',
      components
    );
  }

  /**
   * Send location request
   */
  async sendLocationRequest(phoneNumber, text, options = {}) {
    return whatsappGateway.sendLocationRequest(phoneNumber, text, options);
  }

  /**
   * Format tier message (hyperlocal expansion info)
   */
  formatTierMessage(tier) {
    if (!tier) return '';

    const { radius, expanded, resultsCount } = tier;
    
    let msg = '';
    if (expanded) {
      msg = `🔍 Expanded search to *${this.formatDistance(radius)}*\n`;
    } else {
      msg = `📍 Searching within *${this.formatDistance(radius)}*\n`;
    }
    
    msg += `Found *${resultsCount}* ${resultsCount === 1 ? 'result' : 'results'}`;
    
    return msg;
  }

  /**
   * Format distance
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Format price
   */
  formatPrice(price) {
    return price.toFixed(2);
  }

  /**
   * Format order status
   */
  formatOrderStatus(status) {
    const statusMap = {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      preparing: '👨‍🍳 Preparing',
      ready: '📦 Ready for Pickup',
      assigned: '🚚 Courier Assigned',
      out_for_delivery: '🛵 Out for Delivery',
      delivered: '✅ Delivered',
      cancelled: '❌ Cancelled',
      refunded: '💰 Refunded',
    };
    return statusMap[status] || status;
  }

  /**
   * Send welcome message (onboarding)
   */
  async sendWelcome(phoneNumber, userName = '') {
    const greeting = userName ? `Hi ${userName}! 👋` : 'Welcome! 👋';
    const text = `${greeting}\n\nWelcome to *Str3mly ShopLocal* on WhatsApp!\n\nDiscover amazing products from local sellers near you. Shop hyperlocal, support local! 🛍️\n\nLet's get started:`;

    const buttons = [
      { id: 'set_location', title: '📍 Set Location' },
      { id: 'browse', title: '🔍 Start Shopping' },
    ];

    return this.sendButtons(phoneNumber, text, buttons, { skipGlobalButtons: true });
  }

  /**
   * Send error message
   */
  async sendError(phoneNumber, error, recoveryOptions = []) {
    const text = `😔 Oops! Something went wrong.\n\n${error}\n\nWhat would you like to do?`;
    
    const buttons = recoveryOptions.length > 0
      ? recoveryOptions
      : [
          { id: 'try_again', title: '🔄 Try Again' },
          { id: 'home', title: '🏠 Go Home' },
          { id: 'help', title: '❓ Get Help' },
        ];

    return this.sendButtons(phoneNumber, text, buttons.slice(0, 3));
  }

  /**
   * Send help message
   */
  async sendHelp(phoneNumber) {
    const text = `🆘 *Help & Commands*\n\n*Quick Actions:*\n• Type "search" to find products\n• Type "cart" to view your cart\n• Type "orders" to track orders\n• Type "help" for this message\n\n*Seller Mode:*\n• Type "seller" to switch to seller tools\n\n*Need human help?*`;

    const buttons = [
      { id: 'contact_support', title: '💬 Contact Support' },
      { id: 'home', title: '🏠 Back to Home' },
    ];

    return this.sendButtons(phoneNumber, text, buttons);
  }
}

export default new WhatsAppMessageRenderer();

