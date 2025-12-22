/**
 * WhatsApp Controller
 * Handles WhatsApp webhook endpoints
 */

import whatsappGateway from '../services/WhatsAppGateway.js';
import whatsappOrchestrator from '../services/WhatsAppOrchestrator.js';
import whatsappConfig from '../config/whatsapp.js';
import redisClient from '../config/redis.js';

class WhatsAppController {
  /**
   * Webhook verification (GET request from WhatsApp)
   */
  async verify(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      console.log('📞 WhatsApp webhook verification request');

      if (mode === 'subscribe' && token === whatsappConfig.webhook.verifyToken) {
        console.log('✅ Webhook verified successfully');
        return res.status(200).send(challenge);
      }

      console.log('❌ Webhook verification failed');
      return res.status(403).json({ error: 'Verification failed' });
    } catch (error) {
      console.error('Webhook verification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Webhook handler (POST request from WhatsApp)
   */
  async webhook(req, res) {
    try {
      const signature = req.headers['x-hub-signature-256'];
      const payload = req.body;

      console.log('📨 WhatsApp webhook received');

      // Verify signature (security)
      if (signature) {
        const isValid = whatsappGateway.verifySignature(payload, signature);
        if (!isValid) {
          console.log('❌ Invalid webhook signature');
          return res.status(403).json({ error: 'Invalid signature' });
        }
      }

      // Respond immediately (WhatsApp expects 200 within 20 seconds)
      res.status(200).json({ success: true });

      // Process webhook asynchronously
      this.processWebhook(payload);
    } catch (error) {
      console.error('Webhook handler error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Process webhook asynchronously
   */
  async processWebhook(payload) {
    try {
      // Normalize webhook into channel event
      const channelEvent = whatsappGateway.normalizeInboundEvent(payload);

      if (!channelEvent) {
        console.log('⚠️ No valid message in webhook payload');
        return;
      }

      console.log(`📩 Processing message from ${channelEvent.userChannelId}`);
      console.log(`   Type: ${channelEvent.type}`);
      console.log(`   Payload:`, channelEvent.payload);

      // Pass to orchestrator
      const result = await whatsappOrchestrator.processEvent(channelEvent);

      if (result.success) {
        console.log('✅ Message processed successfully');
      } else {
        console.log('❌ Message processing failed:', result.error);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  /**
   * Send template message (for testing/admin)
   */
  async sendTemplate(req, res) {
    try {
      const { phoneNumber, templateName, components } = req.body;

      if (!phoneNumber || !templateName) {
        return res.status(400).json({
          error: 'phoneNumber and templateName are required',
        });
      }

      const result = await whatsappGateway.sendTemplate(
        phoneNumber,
        templateName,
        'en',
        components || []
      );

      return res.json(result);
    } catch (error) {
      console.error('Send template error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Send text message (for testing/admin)
   */
  async sendMessage(req, res) {
    try {
      const { phoneNumber, text } = req.body;

      if (!phoneNumber || !text) {
        return res.status(400).json({
          error: 'phoneNumber and text are required',
        });
      }

      const result = await whatsappGateway.sendTextMessage(phoneNumber, text);

      return res.json(result);
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get active sessions (admin/debug)
   */
  async getActiveSessions(req, res) {
    try {
      const whatsappSessionService = (await import('../services/WhatsAppSessionService.js')).default;
      const sessions = await whatsappSessionService.getActiveSessions();
      
      return res.json({
        count: sessions.length,
        sessions: sessions.map(s => ({
          phoneNumber: s.phoneNumber,
          mode: s.mode,
          currentFlow: s.currentFlow,
          step: s.step,
          lastActivity: s.lastActivity,
        })),
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Health check
   */
  async health(req, res) {
    try {
      const redisHealth = await redisClient.healthCheck();
      const whatsappSessionService = (await import('../services/WhatsAppSessionService.js')).default;
      const sessionHealth = await whatsappSessionService.healthCheck();

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          redis: redisHealth,
          session: sessionHealth,
        },
      };

      return res.json(health);
    } catch (error) {
      console.error('Health check error:', error);
      return res.status(500).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }
}

export default new WhatsAppController();

