import { BaseModel } from './BaseModel.js';

/**
 * User Model Example
 */
export class User extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.mobile = data.mobile || '';
    this.avatarUrl = data.avatarUrl || '';
    // Authentication-related fields (never exposed directly via API)
    this.passwordHash = data.passwordHash || null;
    this.passwordUpdatedAt = data.passwordUpdatedAt || null;
    this.passwordHistory = data.passwordHistory || []; // Keep last 3 passwords
    this.address = data.address || null;
    this.location = data.location || null; // { lat, lng }
    // App-level preferences (language, theme, notifications, etc.)
    this.preferences = data.preferences || {
      language: 'en', // ISO code
      theme: 'system', // 'system' | 'light' | 'dark'
      notifications: {
        orderUpdates: true,
        deals: true,
        reminders: true,
      },
    };
    this.onboardingCompleted = data.onboardingCompleted || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    // Name is optional during onboarding
    if (this.name && this.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    }

    // Email is optional
    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }

    // Mobile is optional but if provided must be valid
    if (this.mobile && !this.isValidMobile(this.mobile)) {
      errors.push('Valid mobile number is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isValidMobile(mobile) {
    // Basic mobile validation - adjust based on your requirements
    const mobileRegex = /^[\d\s\-\+\(\)]+$/;
    return mobileRegex.test(mobile) && mobile.replace(/\D/g, '').length >= 10;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

