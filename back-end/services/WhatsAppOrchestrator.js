/**
 * WhatsApp Conversation Orchestrator
 * The "brain" that routes messages to skills and manages conversation flow
 */

import whatsappSessionService from './WhatsAppSessionService.js';
import whatsappMessageRenderer from './WhatsAppMessageRenderer.js';
import whatsappGateway from './WhatsAppGateway.js';

// Import skills (to be created)
import BuyerHomeSkill from './skills/BuyerHomeSkill.js';
import SearchSkill from './skills/SearchSkill.js';
import CartSkill from './skills/CartSkill.js';
import CheckoutSkill from './skills/CheckoutSkill.js';
import OrdersSkill from './skills/OrdersSkill.js';
import SellerHomeSkill from './skills/SellerHomeSkill.js';
import SellerOrdersSkill from './skills/SellerOrdersSkill.js';
import SellerProductsSkill from './skills/SellerProductsSkill.js';
import SellerPromosSkill from './skills/SellerPromosSkill.js';
import OnboardingSkill from './skills/OnboardingSkill.js';
import HelpSkill from './skills/HelpSkill.js';

class WhatsAppOrchestrator {
  constructor() {
    this.skills = {
      // Buyer skills
      BUYER_HOME: BuyerHomeSkill,
      SEARCH: SearchSkill,
      CART: CartSkill,
      CHECKOUT: CheckoutSkill,
      ORDERS: OrdersSkill,
      
      // Seller skills
      SELLER_HOME: SellerHomeSkill,
      SELLER_ORDERS: SellerOrdersSkill,
      SELLER_PRODUCTS: SellerProductsSkill,
      SELLER_PROMOS: SellerPromosSkill,
      
      // Common skills
      ONBOARDING: OnboardingSkill,
      HELP: HelpSkill,
    };
  }

  /**
   * Main entry point: process incoming channel event
   */
  async processEvent(channelEvent) {
    try {
      const { userChannelId, messageId } = channelEvent;

      // Check for duplicate (idempotency)
      const isProcessed = await whatsappSessionService.isMessageProcessed(messageId);
      if (isProcessed) {
        console.log(`Message ${messageId} already processed, skipping`);
        return { success: true, skipped: true };
      }

      // Mark as read
      await whatsappGateway.markAsRead(messageId);

      // Rate limiting
      const rateLimit = await whatsappSessionService.checkRateLimit(userChannelId);
      if (!rateLimit.allowed) {
        await whatsappMessageRenderer.sendText(
          userChannelId,
          '⏱️ Please slow down a bit. Try again in a moment.'
        );
        return { success: false, reason: rateLimit.reason };
      }

      // Get or create session
      let session = await whatsappSessionService.getSession(userChannelId);
      
      if (!session) {
        // New user - start onboarding
        session = await whatsappSessionService.createSession(userChannelId, {
          currentFlow: 'ONBOARDING',
          step: 'WELCOME',
        });
      }

      // Handle global commands (shortcuts)
      const response = await this.handleGlobalCommands(channelEvent, session);
      if (response) {
        await this.sendResponse(userChannelId, response);
        await whatsappSessionService.markMessageProcessed(messageId);
        return { success: true };
      }

      // Route to appropriate skill
      const skill = this.getSkill(session.currentFlow);
      if (!skill) {
        console.error(`Unknown flow: ${session.currentFlow}`);
        await whatsappMessageRenderer.sendError(
          userChannelId,
          'Something went wrong. Let\'s start over.'
        );
        await whatsappSessionService.changeFlow(userChannelId, 'BUYER_HOME', 'INITIAL');
        return { success: false, error: 'Unknown flow' };
      }

      // Execute skill
      const skillResponse = await skill.handle(channelEvent, session);
      
      // Send response
      if (skillResponse) {
        await this.sendResponse(userChannelId, skillResponse);
      }

      // Mark message as processed
      await whatsappSessionService.markMessageProcessed(messageId);

      return { success: true };
    } catch (error) {
      console.error('Orchestrator error:', error);
      
      // Send error message to user
      try {
        await whatsappMessageRenderer.sendError(
          channelEvent.userChannelId,
          'An unexpected error occurred. Please try again.'
        );
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Handle global commands (work from any flow)
   */
  async handleGlobalCommands(channelEvent, session) {
    const { type, payload, userChannelId } = channelEvent;
    
    if (type !== 'text' && type !== 'button') {
      return null;
    }

    const text = (payload.text || payload.id || '').toLowerCase().trim();

    // Home
    if (text === 'home' || text === '🏠 home') {
      const flow = session.mode === 'seller' ? 'SELLER_HOME' : 'BUYER_HOME';
      await whatsappSessionService.changeFlow(userChannelId, flow, 'INITIAL');
      const skill = this.getSkill(flow);
      return skill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Search
    if (text === 'search' || text === '🔍 search' || text.startsWith('search ')) {
      const query = text.replace(/^search\s*/i, '').trim();
      await whatsappSessionService.changeFlow(userChannelId, 'SEARCH', 'QUERY', { query });
      const skill = this.getSkill('SEARCH');
      return skill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Cart
    if (text === 'cart' || text === '🛒 cart' || text === 'my cart') {
      await whatsappSessionService.changeFlow(userChannelId, 'CART', 'VIEW');
      const skill = this.getSkill('CART');
      return skill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Orders
    if (text === 'orders' || text === '📦 orders' || text === 'my orders') {
      await whatsappSessionService.changeFlow(userChannelId, 'ORDERS', 'LIST');
      const skill = this.getSkill('ORDERS');
      return skill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Help
    if (text === 'help' || text === '❓ help' || text === '?') {
      return whatsappMessageRenderer.sendHelp(userChannelId);
    }

    // Switch to seller mode
    if (text === 'seller' || text === 'seller mode') {
      await whatsappSessionService.switchMode(userChannelId, 'seller');
      await whatsappSessionService.changeFlow(userChannelId, 'SELLER_HOME', 'INITIAL');
      const skill = this.getSkill('SELLER_HOME');
      return skill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Switch to buyer mode
    if (text === 'buyer' || text === 'buyer mode' || text === 'shop') {
      await whatsappSessionService.switchMode(userChannelId, 'buyer');
      await whatsappSessionService.changeFlow(userChannelId, 'BUYER_HOME', 'INITIAL');
      const skill = this.getSkill('BUYER_HOME');
      return skill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Back
    if (text === 'back' || text === '⬅️ back') {
      const previousSession = await whatsappSessionService.goBack(userChannelId);
      if (previousSession) {
        const skill = this.getSkill(previousSession.currentFlow);
        return skill.handle(channelEvent, previousSession);
      }
    }

    return null;
  }

  /**
   * Get skill handler
   */
  getSkill(flowName) {
    return this.skills[flowName];
  }

  /**
   * Send response to user
   */
  async sendResponse(phoneNumber, response) {
    if (Array.isArray(response)) {
      // Multiple messages
      for (const msg of response) {
        await whatsappMessageRenderer.renderAndSend(phoneNumber, msg);
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      // Single message
      await whatsappMessageRenderer.renderAndSend(phoneNumber, response);
    }
  }

  /**
   * Handle errors gracefully
   */
  async handleError(phoneNumber, error, session) {
    console.error('Conversation error:', error);
    
    const recoveryOptions = [
      { id: 'try_again', title: '🔄 Try Again' },
      { id: 'home', title: '🏠 Go Home' },
    ];

    await whatsappMessageRenderer.sendError(phoneNumber, error.message, recoveryOptions);
  }
}

export default new WhatsAppOrchestrator();

