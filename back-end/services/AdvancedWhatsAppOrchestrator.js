/**
 * Advanced WhatsApp Orchestrator
 * Elite-grade conversation management with A/B/C interaction grades
 */

import whatsappSessionService from './WhatsAppSessionService.js';
import whatsappMessageRenderer from './WhatsAppMessageRenderer.js';
import whatsappGateway from './WhatsAppGateway.js';
import whatsappAdvancedConfig from '../config/whatsappAdvanced.js';

// Import skills
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

class AdvancedWhatsAppOrchestrator {
  constructor() {
    this.skills = {
      BUYER_HOME: BuyerHomeSkill,
      SEARCH: SearchSkill,
      CART: CartSkill,
      CHECKOUT: CheckoutSkill,
      ORDERS: OrdersSkill,
      SELLER_HOME: SellerHomeSkill,
      SELLER_ORDERS: SellerOrdersSkill,
      SELLER_PRODUCTS: SellerProductsSkill,
      SELLER_PROMOS: SellerPromosSkill,
      ONBOARDING: OnboardingSkill,
      HELP: HelpSkill,
    };

    this.config = whatsappAdvancedConfig;
  }

  /**
   * Process event with enhanced patterns
   */
  async processEvent(channelEvent) {
    try {
      const { userChannelId, messageId } = channelEvent;

      // 1. Idempotency check (replay protection)
      const isProcessed = await this.checkIdempotency(messageId);
      if (isProcessed) {
        console.log(`[IDEMPOTENT] Message ${messageId} already processed`);
        return { success: true, skipped: true, reason: 'already_processed' };
      }

      // 2. Mark as read
      await whatsappGateway.markAsRead(messageId);

      // 3. Abuse & quality controls
      const qualityCheck = await this.qualityControl(userChannelId, channelEvent);
      if (!qualityCheck.allowed) {
        await this.sendQualityControlMessage(userChannelId, qualityCheck.reason);
        return { success: false, reason: qualityCheck.reason };
      }

      // 4. Get or create session
      let session = await whatsappSessionService.getSession(userChannelId);
      
      if (!session) {
        session = await whatsappSessionService.createSession(userChannelId, {
          currentFlow: 'ONBOARDING',
          step: 'WELCOME',
        });
      }

      // 5. Check for human handoff triggers
      if (await this.shouldHandoffToHuman(channelEvent, session)) {
        return this.initiateHumanHandoff(userChannelId, session);
      }

      // 6. Handle global commands (with enhanced matching)
      const globalResponse = await this.handleEnhancedGlobalCommands(channelEvent, session);
      if (globalResponse) {
        await this.sendChannelResponse(userChannelId, globalResponse, session);
        await this.markProcessed(messageId);
        return { success: true };
      }

      // 7. Check step-up auth requirements
      if (await this.requiresStepUpAuth(session)) {
        return this.handleStepUpAuth(userChannelId, session);
      }

      // 8. Route to skill with enhanced context
      const skill = this.getSkill(session.currentFlow);
      if (!skill) {
        console.error(`Unknown flow: ${session.currentFlow}`);
        await this.sendErrorRecovery(userChannelId);
        return { success: false, error: 'Unknown flow' };
      }

      // 9. Execute skill with enhanced error handling
      const skillResponse = await this.executeSkillWithRetry(skill, channelEvent, session);
      
      // 10. Send response with channel-agnostic format
      if (skillResponse) {
        await this.sendChannelResponse(userChannelId, skillResponse, session);
      }

      // 11. Track analytics
      await this.trackConversion(userChannelId, session, channelEvent, skillResponse);

      // 12. Mark as processed
      await this.markProcessed(messageId);

      return { success: true };
    } catch (error) {
      console.error('[ORCHESTRATOR ERROR]', error);
      
      // Dead letter queue for critical failures
      await this.sendToDeadLetterQueue(channelEvent, error);
      
      // User-friendly error
      try {
        await whatsappMessageRenderer.sendError(
          channelEvent.userChannelId,
          'Something went wrong. Please try again or type "help".'
        );
      } catch (sendError) {
        console.error('Failed to send error message:', sendError);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Enhanced global commands with fuzzy matching
   */
  async handleEnhancedGlobalCommands(channelEvent, session) {
    const { type, payload, userChannelId } = channelEvent;
    
    if (type !== 'text' && type !== 'button') {
      return null;
    }

    const text = (payload.text || payload.id || '').toLowerCase().trim();
    const commands = this.config.globalNavigation.commands;

    // Check each command category
    for (const [action, triggers] of Object.entries(commands)) {
      if (triggers.some(trigger => text === trigger || text.startsWith(trigger))) {
        return this.executeGlobalCommand(action, channelEvent, session);
      }
    }

    return null;
  }

  /**
   * Execute global command
   */
  async executeGlobalCommand(action, channelEvent, session) {
    const { userChannelId } = channelEvent;

    switch (action) {
      case 'home':
        const flow = session.mode === 'seller' ? 'SELLER_HOME' : 'BUYER_HOME';
        await whatsappSessionService.changeFlow(userChannelId, flow, 'INITIAL');
        const skill = this.getSkill(flow);
        return skill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));

      case 'search':
        await whatsappSessionService.changeFlow(userChannelId, 'SEARCH', 'QUERY');
        return SearchSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));

      case 'cart':
        await whatsappSessionService.changeFlow(userChannelId, 'CART', 'VIEW');
        return CartSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));

      case 'orders':
        await whatsappSessionService.changeFlow(userChannelId, 'ORDERS', 'LIST');
        return OrdersSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));

      case 'help':
        return HelpSkill.handle(channelEvent, session);

      case 'seller':
        await whatsappSessionService.switchMode(userChannelId, 'seller');
        await whatsappSessionService.changeFlow(userChannelId, 'SELLER_HOME', 'INITIAL');
        return SellerHomeSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));

      case 'buyer':
        await whatsappSessionService.switchMode(userChannelId, 'buyer');
        await whatsappSessionService.changeFlow(userChannelId, 'BUYER_HOME', 'INITIAL');
        return BuyerHomeSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));

      default:
        return null;
    }
  }

  /**
   * Quality control checks
   */
  async qualityControl(phoneNumber, event) {
    const controls = this.config.qualityControls;

    // Check spam detection
    if (controls.spamDetection.enabled) {
      const messageCount = await whatsappSessionService.checkRateLimit(phoneNumber, 'spam_check');
      if (!messageCount.allowed) {
        return { allowed: false, reason: 'rate_limit_exceeded' };
      }
    }

    // Check search throttling
    if (event.type === 'text' && event.payload.text?.toLowerCase().includes('search')) {
      const searchCount = await whatsappSessionService.checkRateLimit(phoneNumber, 'search');
      if (!searchCount.allowed) {
        return { allowed: false, reason: 'too_many_searches' };
      }
    }

    return { allowed: true };
  }

  /**
   * Send quality control message
   */
  async sendQualityControlMessage(phoneNumber, reason) {
    const messages = {
      rate_limit_exceeded: '⏱️ Please slow down a bit. Try again in a moment.',
      too_many_searches: '🔍 Taking a breather! Please wait a moment before searching again.',
    };

    await whatsappGateway.sendTextMessage(phoneNumber, messages[reason] || messages.rate_limit_exceeded);
  }

  /**
   * Check if should handoff to human
   */
  async shouldHandoffToHuman(event, session) {
    if (!this.config.humanHandoff.enabled) return false;

    const text = (event.payload.text || '').toLowerCase();
    const triggers = this.config.humanHandoff.triggers;

    // Check trigger patterns
    if (triggers.includes('user_types_agent') && 
        (text.includes('agent') || text.includes('human') || text.includes('representative'))) {
      return true;
    }

    // Check for repeated errors
    const errorCount = session.context.errorCount || 0;
    if (triggers.includes('repeated_errors') && errorCount >= 3) {
      return true;
    }

    return false;
  }

  /**
   * Initiate human handoff
   */
  async initiateHumanHandoff(phoneNumber, session) {
    await whatsappGateway.sendTextMessage(
      phoneNumber,
      '👤 Connecting you to our support team...\n\n' + 
      this.config.humanHandoff.fallbackMessage
    );

    // Log handoff for agent console
    console.log(`[HANDOFF] User ${phoneNumber} escalated to human support`);

    return { success: true, handoff: true };
  }

  /**
   * Check step-up auth requirements
   */
  async requiresStepUpAuth(session) {
    if (!this.config.stepUpAuth.enabled) return false;

    const triggers = this.config.stepUpAuth.triggers;
    const requiresAuth = triggers.some(trigger => 
      session.context.pendingAction === trigger
    );

    if (requiresAuth && !session.context.stepUpVerified) {
      return true;
    }

    return false;
  }

  /**
   * Handle step-up authentication
   */
  async handleStepUpAuth(phoneNumber, session) {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP
    await whatsappSessionService.setTempData(
      phoneNumber,
      'step_up_otp',
      otp,
      this.config.stepUpAuth.otpExpiry
    );

    // Send OTP
    await whatsappGateway.sendTextMessage(
      phoneNumber,
      `🔐 Security Check\n\nYour verification code is: ${otp}\n\nValid for 5 minutes.`
    );

    // Update session
    await whatsappSessionService.updateContext(phoneNumber, {
      awaitingStepUpOtp: true,
    });

    return { success: true, requiresAuth: true };
  }

  /**
   * Execute skill with retry logic
   */
  async executeSkillWithRetry(skill, event, session) {
    const maxRetries = this.config.deadLetterQueue.maxRetries;
    const delays = this.config.deadLetterQueue.retryDelays;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await skill.handle(event, session);
      } catch (error) {
        console.error(`[RETRY ${attempt + 1}/${maxRetries}]`, error);
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Send channel-agnostic response
   */
  async sendChannelResponse(phoneNumber, response, session) {
    // Add header context if configured
    if (this.config.messageHeaders.enabled && this.shouldShowHeader(session)) {
      response = this.addHeaderContext(response, session);
    }

    // Convert to WhatsApp format and send
    if (Array.isArray(response)) {
      for (const msg of response) {
        await whatsappMessageRenderer.renderAndSend(phoneNumber, msg);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      await whatsappMessageRenderer.renderAndSend(phoneNumber, response);
    }
  }

  /**
   * Should show header context
   */
  shouldShowHeader(session) {
    if (this.config.messageHeaders.showOnEveryMessage) return true;
    
    if (this.config.messageHeaders.showOnHomeAndSearch) {
      return ['BUYER_HOME', 'SELLER_HOME', 'SEARCH'].includes(session.currentFlow);
    }

    return false;
  }

  /**
   * Add header context to message
   */
  addHeaderContext(response, session) {
    const address = session.context.address || 'Location not set';
    const radiusMode = session.context.radiusMode || 'Auto';
    const currentRadius = session.context.currentRadius || '1km';

    const header = this.config.messageHeaders.format
      .replace('{address}', address.substring(0, 20))
      .replace('{radius_mode}', radiusMode)
      .replace('{current_radius}', currentRadius);

    // Prepend header to first text message
    if (Array.isArray(response)) {
      if (response[0]?.data?.text) {
        response[0].data.text = `${header}\n\n${response[0].data.text}`;
      }
    } else if (response?.data?.text) {
      response.data.text = `${header}\n\n${response.data.text}`;
    }

    return response;
  }

  /**
   * Track conversion metrics
   */
  async trackConversion(phoneNumber, session, event, response) {
    if (!this.config.observability.trackConversions) return;

    const metrics = {
      flow: session.currentFlow,
      step: session.step,
      mode: session.mode,
      eventType: event.type,
      timestamp: Date.now(),
    };

    // Log to your analytics service
    console.log('[ANALYTICS]', phoneNumber, metrics);
  }

  /**
   * Send error recovery options
   */
  async sendErrorRecovery(phoneNumber) {
    const emptyState = this.config.emptyStates.offline;
    
    await whatsappMessageRenderer.sendError(
      phoneNumber,
      emptyState.message,
      [
        { id: 'try_again', title: '🔄 Try Again' },
        { id: 'home', title: '🏠 Go Home' },
        { id: 'help', title: '❓ Get Help' },
      ]
    );
  }

  /**
   * Check idempotency
   */
  async checkIdempotency(messageId) {
    return whatsappSessionService.isMessageProcessed(messageId);
  }

  /**
   * Mark message as processed
   */
  async markProcessed(messageId) {
    return whatsappSessionService.markMessageProcessed(messageId);
  }

  /**
   * Send to dead letter queue
   */
  async sendToDeadLetterQueue(event, error) {
    if (!this.config.deadLetterQueue.enabled) return;

    const dlqEntry = {
      event,
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: Date.now(),
      attempts: 0,
    };

    // In production, send to actual queue (Redis, RabbitMQ, etc.)
    console.error('[DLQ]', JSON.stringify(dlqEntry, null, 2));
  }

  /**
   * Get skill handler
   */
  getSkill(flowName) {
    return this.skills[flowName];
  }
}

export default new AdvancedWhatsAppOrchestrator();

