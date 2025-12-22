/**
 * WhatsApp Gateway Service
 * Handles all WhatsApp Business API communication
 * Normalizes WhatsApp payloads into internal ChannelEvent format
 */

import axios from 'axios';
import crypto from 'crypto';
import whatsappConfig from '../config/whatsapp.js';

class WhatsAppGateway {
  constructor() {
    this.config = whatsappConfig.cloudApi;
    this.baseUrl = `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}`;
  }

  /**
   * Verify webhook signature (security)
   */
  verifySignature(payload, signature) {
    if (!whatsappConfig.webhook.secret) {
      console.warn('⚠️ Webhook secret not configured');
      return true; // In dev, allow without signature
    }

    const expectedSignature = crypto
      .createHmac('sha256', whatsappConfig.webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Normalize incoming WhatsApp webhook into ChannelEvent
   */
  normalizeInboundEvent(webhookPayload) {
    try {
      const entry = webhookPayload.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (!message) {
        return null;
      }

      const channelEvent = {
        channel: 'whatsapp',
        eventId: `${entry.id}_${message.id}`,
        messageId: message.id,
        timestamp: parseInt(message.timestamp) * 1000,
        userChannelId: message.from,
        userName: contact?.profile?.name || '',
        type: this.getMessageType(message),
        payload: this.extractPayload(message),
        context: message.context ? {
          messageId: message.context.id,
          from: message.context.from,
        } : null,
      };

      return channelEvent;
    } catch (error) {
      console.error('Error normalizing WhatsApp event:', error);
      return null;
    }
  }

  /**
   * Determine message type
   */
  getMessageType(message) {
    if (message.type === 'text') return 'text';
    if (message.type === 'interactive') {
      if (message.interactive.type === 'button_reply') return 'button';
      if (message.interactive.type === 'list_reply') return 'list';
    }
    if (message.type === 'location') return 'location';
    if (message.type === 'image') return 'image';
    if (message.type === 'document') return 'document';
    return 'unknown';
  }

  /**
   * Extract payload based on message type
   */
  extractPayload(message) {
    const type = message.type;

    if (type === 'text') {
      return { text: message.text.body };
    }

    if (type === 'interactive') {
      const interactive = message.interactive;
      if (interactive.type === 'button_reply') {
        return {
          id: interactive.button_reply.id,
          title: interactive.button_reply.title,
        };
      }
      if (interactive.type === 'list_reply') {
        return {
          id: interactive.list_reply.id,
          title: interactive.list_reply.title,
          description: interactive.list_reply.description,
        };
      }
    }

    if (type === 'location') {
      return {
        latitude: message.location.latitude,
        longitude: message.location.longitude,
        name: message.location.name,
        address: message.location.address,
      };
    }

    if (type === 'image') {
      return {
        id: message.image.id,
        mimeType: message.image.mime_type,
        caption: message.image.caption,
      };
    }

    return {};
  }

  /**
   * Send text message
   */
  async sendTextMessage(to, text, options = {}) {
    return this.sendMessage(to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
      ...options,
    });
  }

  /**
   * Send interactive button message
   */
  async sendButtonMessage(to, text, buttons, options = {}) {
    if (buttons.length > 3) {
      throw new Error('Maximum 3 buttons allowed');
    }

    return this.sendMessage(to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map((btn, idx) => ({
            type: 'reply',
            reply: {
              id: btn.id || `btn_${idx}`,
              title: btn.title.substring(0, 20), // Max 20 chars
            },
          })),
        },
        ...options.interactive,
      },
    });
  }

  /**
   * Send interactive list message
   */
  async sendListMessage(to, text, buttonText, sections, options = {}) {
    return this.sendMessage(to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text },
        action: {
          button: buttonText,
          sections: sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              id: row.id,
              title: row.title.substring(0, 24),
              description: row.description?.substring(0, 72),
            })),
          })),
        },
        ...options.interactive,
      },
    });
  }

  /**
   * Send image message
   */
  async sendImageMessage(to, imageUrl, caption = '', options = {}) {
    return this.sendMessage(to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption.substring(0, 1024),
      },
    });
  }

  /**
   * Send template message (for notifications)
   */
  async sendTemplate(to, templateName, languageCode = 'en', components = []) {
    return this.sendMessage(to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  /**
   * Send location request
   */
  async sendLocationRequest(to, text) {
    return this.sendMessage(to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'location_request_message',
        body: { text },
        action: {
          name: 'send_location',
        },
      },
    });
  }

  /**
   * Send CTA URL button (for payment links, KYC, etc.)
   */
  async sendCTAUrlButton(to, text, buttonText, url, options = {}) {
    return this.sendMessage(to, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'cta_url',
        body: { text },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: buttonText,
            url,
          },
        },
        ...options.interactive,
      },
    });
  }

  /**
   * Core send message method
   */
  async sendMessage(to, payload) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages?.[0]?.id,
        data: response.data,
      };
    } catch (error) {
      console.error('WhatsApp send message error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    try {
      await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  /**
   * Get media URL (for uploaded images, documents)
   */
  async getMediaUrl(mediaId) {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/${this.config.apiVersion}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
          },
        }
      );
      return response.data.url;
    } catch (error) {
      console.error('Error getting media URL:', error);
      return null;
    }
  }

  /**
   * Download media
   */
  async downloadMedia(mediaUrl) {
    try {
      const response = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading media:', error);
      return null;
    }
  }
}

export default new WhatsAppGateway();

