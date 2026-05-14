import { PaymentMethod } from '../models/PaymentMethod.js';
import {
  validateCardNumber as validateCardNumberUtil,
  detectCardBrand as detectCardBrandUtil,
  extractLast4 as extractLast4Util,
  validateCVV,
  validateExpiry,
  sanitizeCardNumber,
  maskCardNumber,
  validatePaymentMethodData,
} from '../utils/paymentValidation.js';

/**
 * Payment Method Service
 * Handles business logic for payment methods
 */
export class PaymentMethodService {
  constructor() {
    this.paymentMethods = [];
    this.nextId = 1;
  }

  /**
   * Get payment method by ID
   */
  async getPaymentMethodById(id) {
    return this.paymentMethods.find(pm => pm.id === parseInt(id));
  }

  /**
   * Get payment methods by user ID
   * Sorted: default first, then by most recently updated
   */
  async getPaymentMethodsByUserId(userId) {
    const userPaymentMethods = this.paymentMethods.filter(
      pm => String(pm.userId) === String(userId)
    );
    
    // Sort: default first, then by updatedAt (most recent)
    return userPaymentMethods.sort((a, b) => {
      // Default payment method always first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      
      // Then by updatedAt (most recent)
      if (a.updatedAt > b.updatedAt) return -1;
      if (a.updatedAt < b.updatedAt) return 1;
      
      return 0;
    });
  }

  /**
   * Get default payment method for user
   */
  async getDefaultPaymentMethod(userId) {
    return this.paymentMethods.find(
      pm => String(pm.userId) === String(userId) && pm.isDefault
    );
  }

  /**
   * Detect card brand from card number
   */
  detectCardBrand(cardNumber) {
    return detectCardBrandUtil(cardNumber);
  }

  /**
   * Validate card number using Luhn algorithm
   */
  validateCardNumber(cardNumber) {
    const validation = validateCardNumberUtil(cardNumber);
    return validation.isValid;
  }

  /**
   * Extract last 4 digits from card number
   */
  extractLast4(cardNumber) {
    return extractLast4Util(cardNumber);
  }

  /**
   * Create a new payment method
   */
  async createPaymentMethod(paymentData) {
    // Comprehensive validation
    const validation = validatePaymentMethodData(paymentData);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join(', ');
      throw new Error(errorMessages);
    }
    
    // Extract and validate card data
    let brand = paymentData.brand || '';
    let last4 = paymentData.last4 || '';
    
    // If card number is provided, extract brand and last4
    if (paymentData.cardNumber) {
      // Validate card number (already validated above, but double-check)
      const cardValidation = validateCardNumberUtil(paymentData.cardNumber);
      if (!cardValidation.isValid) {
        throw new Error(cardValidation.error);
      }
      
      brand = detectCardBrandUtil(paymentData.cardNumber);
      last4 = extractLast4Util(paymentData.cardNumber);
      
      // Log masked card number for security (never log full number)
      console.log(`[PaymentMethod] Creating card for user ${paymentData.userId}: ${maskCardNumber(paymentData.cardNumber)}`);
    }
    
    // Validate expiry date
    const expiryValidation = validateExpiry(paymentData.expMonth, paymentData.expYear);
    if (!expiryValidation.isValid) {
      throw new Error(expiryValidation.errors.join(', '));
    }
    
    // Validate CVV if provided
    if (paymentData.cvv) {
      const cvvValidation = validateCVV(paymentData.cvv, brand);
      if (!cvvValidation.isValid) {
        throw new Error(cvvValidation.error);
      }
    }

    const paymentMethod = new PaymentMethod({
      ...paymentData,
      brand,
      last4,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const modelValidation = paymentMethod.validate();
    if (!modelValidation.isValid) {
      throw new Error(modelValidation.errors.join(', '));
    }

    // If this is set as default, unset other defaults for this user
    if (paymentMethod.isDefault && paymentMethod.userId) {
      this.paymentMethods.forEach(pm => {
        if (pm.userId === paymentMethod.userId && pm.id !== paymentMethod.id) {
          pm.isDefault = false;
          pm.updatedAt = new Date();
        }
      });
    }

    this.paymentMethods.push(paymentMethod);
    return paymentMethod;
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(id, paymentData) {
    const paymentMethodIndex = this.paymentMethods.findIndex(
      pm => pm.id === parseInt(id)
    );
    
    if (paymentMethodIndex === -1) {
      return null;
    }

    const existingPaymentMethod = this.paymentMethods[paymentMethodIndex];
    
    // If card number is provided, extract brand and last4
    let brand = paymentData.brand || existingPaymentMethod.brand;
    let last4 = paymentData.last4 || existingPaymentMethod.last4;
    
    if (paymentData.cardNumber) {
      const cardValidation = validateCardNumber(paymentData.cardNumber);
      if (!cardValidation.isValid) {
        throw new Error(cardValidation.error);
      }
      
      brand = detectCardBrandUtil(paymentData.cardNumber);
      last4 = extractLast4Util(paymentData.cardNumber);
      
      // Log masked card number for security
      console.log(`[PaymentMethod] Updating card ${id} for user ${existingPaymentMethod.userId}: ${maskCardNumber(paymentData.cardNumber)}`);
    }

    // Validate expiry date if provided
    if (paymentData.expMonth && paymentData.expYear) {
      const expiryValidation = validateExpiry(paymentData.expMonth, paymentData.expYear);
      if (!expiryValidation.isValid) {
        throw new Error(expiryValidation.errors.join(', '));
      }
    }
    
    // Validate CVV if provided
    if (paymentData.cvv) {
      const cvvValidation = validateCVV(paymentData.cvv, brand || existingPaymentMethod.brand);
      if (!cvvValidation.isValid) {
        throw new Error(cvvValidation.error);
      }
    }

    const updatedPaymentMethod = new PaymentMethod({
      ...existingPaymentMethod,
      ...paymentData,
      brand,
      last4,
      id: parseInt(id),
      updatedAt: new Date(),
    });

    const modelValidation = updatedPaymentMethod.validate();
    if (!modelValidation.isValid) {
      throw new Error(modelValidation.errors.join(', '));
    }

    // If this is set as default, unset other defaults for this user
    if (updatedPaymentMethod.isDefault && updatedPaymentMethod.userId) {
      this.paymentMethods.forEach(pm => {
        if (pm.userId === updatedPaymentMethod.userId && pm.id !== updatedPaymentMethod.id) {
          pm.isDefault = false;
          pm.updatedAt = new Date();
        }
      });
    }

    this.paymentMethods[paymentMethodIndex] = updatedPaymentMethod;
    return updatedPaymentMethod;
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(id, userId = null) {
    const paymentMethodIndex = this.paymentMethods.findIndex(
      pm => pm.id === parseInt(id)
    );
    
    if (paymentMethodIndex === -1) {
      return false;
    }

    const paymentMethod = this.paymentMethods[paymentMethodIndex];
    
    // Prevent deleting if it's the only payment method for the user
    if (userId) {
      const userPaymentMethods = this.paymentMethods.filter(
        pm => String(pm.userId) === String(userId)
      );
      
      if (userPaymentMethods.length === 1 && userPaymentMethods[0].id === paymentMethod.id) {
        throw new Error('Cannot delete the only payment method');
      }
    }

    this.paymentMethods.splice(paymentMethodIndex, 1);
    return true;
  }

  /**
   * Set payment method as default
   */
  async setDefaultPaymentMethod(id, userId) {
    const paymentMethod = await this.getPaymentMethodById(id);
    if (!paymentMethod) {
      return null;
    }

    if (String(paymentMethod.userId) !== String(userId)) {
      throw new Error('Payment method does not belong to user');
    }

    // Unset other defaults for this user
    this.paymentMethods.forEach(pm => {
      if (String(pm.userId) === String(userId) && pm.id !== paymentMethod.id) {
        pm.isDefault = false;
        pm.updatedAt = new Date();
      }
    });

    // Set this payment method as default
    paymentMethod.isDefault = true;
    paymentMethod.updatedAt = new Date();
    
    return paymentMethod;
  }

  /**
   * Mark payment method as failed
   */
  async markPaymentFailed(id) {
    const paymentMethod = await this.getPaymentMethodById(id);
    if (!paymentMethod) {
      return null;
    }

    paymentMethod.hasFailedPayment = true;
    paymentMethod.failedPaymentDate = new Date();
    paymentMethod.updatedAt = new Date();
    
    return paymentMethod;
  }

  /**
   * Clear failed payment status
   */
  async clearFailedPayment(id) {
    const paymentMethod = await this.getPaymentMethodById(id);
    if (!paymentMethod) {
      return null;
    }

    paymentMethod.hasFailedPayment = false;
    paymentMethod.failedPaymentDate = null;
    paymentMethod.updatedAt = new Date();
    
    return paymentMethod;
  }

  /**
   * Get user's payment methods (for authenticated user)
   */
  async getUserPaymentMethods(userId) {
    return this.getPaymentMethodsByUserId(userId);
  }
}

export const paymentMethodService = new PaymentMethodService();

