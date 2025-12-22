import { BaseModel } from './BaseModel.js';

/**
 * Review Model
 * Supports both product and store reviews
 * Content is optional - allows star-only reviews
 */
export class Review extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || Date.now().toString();
    this.userId = data.userId || 'default';
    this.userName = data.userName || 'Anonymous';
    this.userAvatar = data.userAvatar || null;
    this.userLocation = data.userLocation || null; // { lat, lng, suburb, distance }
    this.productId = data.productId || null;
    this.storeId = data.storeId || null;
    this.orderId = data.orderId || null; // Link to order for verified purchase
    this.orderItemId = data.orderItemId || null; // Specific item in order
    this.rating = data.rating || 5; // 1-5
    this.title = data.title || '';
    this.content = data.content || ''; // Optional - allows star-only reviews
    this.photos = data.photos || [];
    this.verifiedPurchase = data.verifiedPurchase || false;
    this.helpfulCount = data.helpfulCount || 0;
    this.reactions = data.reactions || {}; // { like: 5, love: 2, laugh: 1 }
    this.merchantResponse = data.merchantResponse || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userAvatar: this.userAvatar,
      userLocation: this.userLocation,
      productId: this.productId,
      storeId: this.storeId,
      orderId: this.orderId,
      orderItemId: this.orderItemId,
      rating: this.rating,
      title: this.title,
      content: this.content,
      photos: this.photos,
      verifiedPurchase: this.verifiedPurchase,
      helpfulCount: this.helpfulCount,
      reactions: this.reactions,
      merchantResponse: this.merchantResponse,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.productId && !this.storeId) {
      errors.push('Product ID or Store ID is required');
    }

    if (this.rating < 1 || this.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    // Content is optional - star-only reviews are allowed
    // No validation for content

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Review;











