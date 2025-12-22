import { BaseModel } from './BaseModel.js';

/**
 * Notification Model
 */
export class Notification extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.type = data.type || 'info'; // 'info', 'order', 'promotion', 'system'
    this.title = data.title || '';
    this.message = data.message || '';
    this.read = data.read || false;
    this.actionUrl = data.actionUrl || null; // Optional URL to navigate to
    this.metadata = data.metadata || {}; // Additional data (orderId, productId, etc.)
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('UserId is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.message || this.message.trim().length === 0) {
      errors.push('Message is required');
    }

    const validTypes = ['info', 'order', 'promotion', 'system'];
    if (!validTypes.includes(this.type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  markAsRead() {
    this.read = true;
    this.updatedAt = new Date();
    return this;
  }
}


