import { BaseModel } from './BaseModel.js';

/**
 * Payment Method Model
 */
export class PaymentMethod extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.type = data.type || 'card'; // 'card', 'bank_account', etc.
    this.brand = data.brand || ''; // 'visa', 'mastercard', 'amex', etc.
    this.last4 = data.last4 || ''; // Last 4 digits of card
    this.expMonth = data.expMonth || null; // Expiry month (1-12)
    this.expYear = data.expYear || null; // Expiry year (YYYY)
    this.cardholderName = data.cardholderName || '';
    this.isDefault = data.isDefault || false;
    this.isExpired = data.isExpired || false;
    this.hasFailedPayment = data.hasFailedPayment || false;
    this.failedPaymentDate = data.failedPaymentDate || null;
    this.nickname = data.nickname || ''; // Optional nickname for the card
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (this.type === 'card') {
      if (!this.brand || this.brand.trim().length === 0) {
        errors.push('Card brand is required');
      }

      if (!this.last4 || this.last4.length !== 4) {
        errors.push('Last 4 digits must be exactly 4 characters');
      }

      if (!this.expMonth || this.expMonth < 1 || this.expMonth > 12) {
        errors.push('Valid expiry month (1-12) is required');
      }

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      if (!this.expYear || this.expYear < currentYear) {
        errors.push('Expiry year must be current or future year');
      } else if (this.expYear === currentYear && this.expMonth < currentMonth) {
        errors.push('Card has expired');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if card is expired
   */
  checkExpiry() {
    if (!this.expMonth || !this.expYear) {
      return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const expiryDate = new Date(this.expYear, this.expMonth - 1);

    return expiryDate < currentDate;
  }

  /**
   * Check if card is expiring soon (within 3 months)
   */
  isExpiringSoon() {
    if (!this.expMonth || !this.expYear) {
      return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const expiryDate = new Date(this.expYear, this.expMonth - 1);
    
    // Add 3 months to current date
    const threeMonthsFromNow = new Date(currentYear, currentMonth + 2);

    return expiryDate <= threeMonthsFromNow && expiryDate >= currentDate;
  }

  /**
   * Get masked card number for display
   */
  getMaskedNumber() {
    if (!this.last4) {
      return '•••• •••• •••• ••••';
    }
    return `•••• ${this.last4}`;
  }

  /**
   * Get formatted expiry date
   */
  getFormattedExpiry() {
    if (!this.expMonth || !this.expYear) {
      return '';
    }
    const month = String(this.expMonth).padStart(2, '0');
    const year = String(this.expYear).slice(-2);
    return `${month}/${year}`;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      brand: this.brand,
      last4: this.last4,
      maskedNumber: this.getMaskedNumber(),
      expMonth: this.expMonth,
      expYear: this.expYear,
      expiryDate: this.getFormattedExpiry(),
      cardholderName: this.cardholderName,
      nickname: this.nickname,
      isDefault: this.isDefault,
      isExpired: this.checkExpiry(),
      isExpiringSoon: this.isExpiringSoon(),
      hasFailedPayment: this.hasFailedPayment,
      failedPaymentDate: this.failedPaymentDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

