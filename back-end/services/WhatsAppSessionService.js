/**
 * WhatsApp Session Service
 * Manages conversation state, user sessions, and context
 */

import redisClient from '../config/redis.js';
import whatsappConfig from '../config/whatsapp.js';
import { v4 as uuidv4 } from 'uuid';

class WhatsAppSessionService {
  constructor() {
    this.sessionPrefix = 'whatsapp:session:';
    this.messagePrefix = 'whatsapp:message:';
    this.userPrefix = 'whatsapp:user:';
    this.defaultTtl = whatsappConfig.session.ttl;
  }

  /**
   * Initialize session for a user
   */
  async createSession(phoneNumber, initialData = {}) {
    const sessionId = uuidv4();
    const sessionKey = `${this.sessionPrefix}${phoneNumber}`;
    
    const sessionData = {
      sessionId,
      phoneNumber,
      mode: initialData.mode || 'buyer', // buyer or seller
      currentFlow: initialData.currentFlow || 'HOME',
      step: initialData.step || 'INITIAL',
      context: initialData.context || {},
      backStack: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ...initialData,
    };

    await this.setSession(phoneNumber, sessionData);
    return sessionData;
  }

  /**
   * Get session for a user
   */
  async getSession(phoneNumber) {
    const client = redisClient.getClient();
    const sessionKey = `${this.sessionPrefix}${phoneNumber}`;
    
    try {
      const data = await client.get(sessionKey);
      if (!data) return null;
      
      const session = JSON.parse(data);
      
      // Check if session expired (idle timeout)
      const idleTime = Date.now() - session.lastActivity;
      if (idleTime > whatsappConfig.conversation.idleTimeout * 1000) {
        await this.clearSession(phoneNumber);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Update session
   */
  async setSession(phoneNumber, sessionData) {
    const client = redisClient.getClient();
    const sessionKey = `${this.sessionPrefix}${phoneNumber}`;
    
    sessionData.lastActivity = Date.now();
    
    await client.set(
      sessionKey,
      JSON.stringify(sessionData),
      'EX',
      this.defaultTtl
    );
  }

  /**
   * Update session context
   */
  async updateContext(phoneNumber, contextUpdates) {
    const session = await this.getSession(phoneNumber);
    if (!session) {
      throw new Error('Session not found');
    }

    session.context = {
      ...session.context,
      ...contextUpdates,
    };

    await this.setSession(phoneNumber, session);
    return session;
  }

  /**
   * Change flow (e.g., SEARCH -> CART -> CHECKOUT)
   */
  async changeFlow(phoneNumber, newFlow, step = 'INITIAL', contextUpdates = {}) {
    const session = await this.getSession(phoneNumber);
    if (!session) {
      return await this.createSession(phoneNumber, {
        currentFlow: newFlow,
        step,
        context: contextUpdates,
      });
    }

    // Save current state to back stack
    if (session.currentFlow !== newFlow) {
      session.backStack = session.backStack || [];
      session.backStack.push({
        flow: session.currentFlow,
        step: session.step,
        context: { ...session.context },
      });

      // Limit back stack size
      if (session.backStack.length > whatsappConfig.conversation.maxBackStackSize) {
        session.backStack.shift();
      }
    }

    session.currentFlow = newFlow;
    session.step = step;
    session.context = {
      ...session.context,
      ...contextUpdates,
    };

    await this.setSession(phoneNumber, session);
    return session;
  }

  /**
   * Go back to previous flow
   */
  async goBack(phoneNumber) {
    const session = await this.getSession(phoneNumber);
    if (!session || !session.backStack || session.backStack.length === 0) {
      return null;
    }

    const previous = session.backStack.pop();
    session.currentFlow = previous.flow;
    session.step = previous.step;
    session.context = previous.context;

    await this.setSession(phoneNumber, session);
    return session;
  }

  /**
   * Switch mode (buyer <-> seller)
   */
  async switchMode(phoneNumber, mode) {
    const session = await this.getSession(phoneNumber);
    if (!session) {
      return await this.createSession(phoneNumber, { mode });
    }

    session.mode = mode;
    session.currentFlow = 'HOME';
    session.step = 'INITIAL';
    session.context = {};
    session.backStack = [];

    await this.setSession(phoneNumber, session);
    return session;
  }

  /**
   * Clear session
   */
  async clearSession(phoneNumber) {
    const client = redisClient.getClient();
    const sessionKey = `${this.sessionPrefix}${phoneNumber}`;
    await client.del(sessionKey);
  }

  /**
   * Track processed message (idempotency)
   */
  async isMessageProcessed(messageId) {
    const client = redisClient.getClient();
    const messageKey = `${this.messagePrefix}${messageId}`;
    const exists = await client.exists(messageKey);
    return exists === 1;
  }

  /**
   * Mark message as processed
   */
  async markMessageProcessed(messageId) {
    const client = redisClient.getClient();
    const messageKey = `${this.messagePrefix}${messageId}`;
    // Store for 24 hours to prevent duplicate processing
    await client.set(messageKey, '1', 'EX', 86400);
  }

  /**
   * Store user data (links WhatsApp number to app user)
   */
  async linkUser(phoneNumber, userData) {
    const client = redisClient.getClient();
    const userKey = `${this.userPrefix}${phoneNumber}`;
    
    await client.set(
      userKey,
      JSON.stringify(userData),
      'EX',
      whatsappConfig.session.persistentTtl
    );
  }

  /**
   * Get linked user data
   */
  async getLinkedUser(phoneNumber) {
    const client = redisClient.getClient();
    const userKey = `${this.userPrefix}${phoneNumber}`;
    
    try {
      const data = await client.get(userKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting linked user:', error);
      return null;
    }
  }

  /**
   * Store temporary data (like OTP, pending actions)
   */
  async setTempData(phoneNumber, key, value, ttl = 300) {
    const client = redisClient.getClient();
    const tempKey = `whatsapp:temp:${phoneNumber}:${key}`;
    await client.set(tempKey, JSON.stringify(value), 'EX', ttl);
  }

  /**
   * Get temporary data
   */
  async getTempData(phoneNumber, key) {
    const client = redisClient.getClient();
    const tempKey = `whatsapp:temp:${phoneNumber}:${key}`;
    
    try {
      const data = await client.get(tempKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete temporary data
   */
  async deleteTempData(phoneNumber, key) {
    const client = redisClient.getClient();
    const tempKey = `whatsapp:temp:${phoneNumber}:${key}`;
    await client.del(tempKey);
  }

  /**
   * Rate limiting check
   */
  async checkRateLimit(phoneNumber, action = 'message') {
    const client = redisClient.getClient();
    const limits = whatsappConfig.rateLimits;
    
    // Check messages per minute
    const minuteKey = `ratelimit:${phoneNumber}:${action}:minute:${Math.floor(Date.now() / 60000)}`;
    const minuteCount = await client.incr(minuteKey);
    await client.expire(minuteKey, 60);
    
    if (action === 'message' && minuteCount > limits.messagesPerMinute) {
      return { allowed: false, reason: 'Too many messages per minute' };
    }
    
    if (action === 'search' && minuteCount > limits.searchPerHour) {
      return { allowed: false, reason: 'Too many searches per hour' };
    }
    
    return { allowed: true };
  }

  /**
   * Get all active sessions (for admin/debugging)
   */
  async getActiveSessions() {
    const client = redisClient.getClient();
    const keys = await client.keys(`${this.sessionPrefix}*`);
    
    const sessions = [];
    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        sessions.push(JSON.parse(data));
      }
    }
    
    return sessions;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const client = redisClient.getClient();
      await client.ping();
      return { status: 'healthy', service: 'WhatsAppSessionService' };
    } catch (error) {
      return { status: 'unhealthy', service: 'WhatsAppSessionService', error: error.message };
    }
  }
}

export default new WhatsAppSessionService();

