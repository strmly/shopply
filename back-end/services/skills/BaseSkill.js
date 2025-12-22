/**
 * Base Skill Class
 * All conversation skills extend this
 */

import whatsappSessionService from '../WhatsAppSessionService.js';

class BaseSkill {
  constructor(name) {
    this.name = name;
  }

  /**
   * Main handler - must be implemented by subclasses
   */
  async handle(channelEvent, session) {
    throw new Error(`handle() not implemented in ${this.name}`);
  }

  /**
   * Update session context
   */
  async updateContext(phoneNumber, updates) {
    return whatsappSessionService.updateContext(phoneNumber, updates);
  }

  /**
   * Change flow
   */
  async changeFlow(phoneNumber, flow, step = 'INITIAL', context = {}) {
    return whatsappSessionService.changeFlow(phoneNumber, flow, step, context);
  }

  /**
   * Extract text from event
   */
  getText(channelEvent) {
    return channelEvent.payload?.text || channelEvent.payload?.title || '';
  }

  /**
   * Extract button/list ID from event
   */
  getId(channelEvent) {
    return channelEvent.payload?.id || '';
  }

  /**
   * Parse product ID from button/list ID
   */
  parseProductId(id) {
    const match = id.match(/product_(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Parse order ID from button/list ID
   */
  parseOrderId(id) {
    const match = id.match(/order_(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Create response object
   */
  createResponse(type, data, options = {}) {
    return { type, data, options };
  }

  /**
   * Create text response
   */
  textResponse(text, options = {}) {
    return this.createResponse('text', { text }, options);
  }

  /**
   * Create buttons response
   */
  buttonsResponse(text, buttons, options = {}) {
    return this.createResponse('buttons', { text, buttons }, options);
  }

  /**
   * Create list response
   */
  listResponse(text, buttonText, sections, options = {}) {
    return this.createResponse('list', { text, buttonText, sections }, options);
  }

  /**
   * Create product card response
   */
  productCardResponse(product, options = {}) {
    return this.createResponse('product_card', { product }, options);
  }

  /**
   * Create products list response
   */
  productsListResponse(products, tier, options = {}) {
    return this.createResponse('products_list', { products, tier }, options);
  }

  /**
   * Create order summary response
   */
  orderSummaryResponse(order, options = {}) {
    return this.createResponse('order_summary', { order }, options);
  }

  /**
   * Create cart summary response
   */
  cartSummaryResponse(cart, options = {}) {
    return this.createResponse('cart_summary', { cart }, options);
  }

  /**
   * Create CTA URL button response
   */
  ctaUrlResponse(text, buttonText, url, options = {}) {
    return this.createResponse('cta_url', { text, buttonText, url }, options);
  }

  /**
   * Create location request response
   */
  locationRequestResponse(text, options = {}) {
    return this.createResponse('location_request', { text }, options);
  }
}

export default BaseSkill;

