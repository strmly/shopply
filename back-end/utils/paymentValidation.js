/**
 * Payment Method Validation Utilities
 * Provides comprehensive validation for payment methods
 */

/**
 * Validate card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return { isValid: false, error: 'Card number is required' };
  }

  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { isValid: false, error: 'Card number must be between 13 and 19 digits' };
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const isValid = sum % 10 === 0;
  return {
    isValid,
    error: isValid ? null : 'Invalid card number',
    cleaned,
  };
};

/**
 * Detect card brand from card number
 */
export const detectCardBrand = (cardNumber) => {
  if (!cardNumber) return 'unknown';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Visa: starts with 4, 13-19 digits
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard: starts with 5[1-5] or 2[2-7], 16 digits
  if (/^5[1-5]|^2[2-7]/.test(cleaned) && cleaned.length === 16) {
    return 'mastercard';
  }
  
  // American Express: starts with 34 or 37, 15 digits
  if (/^3[47]/.test(cleaned) && cleaned.length === 15) {
    return 'amex';
  }
  
  // Discover: starts with 6, 16 digits
  if (/^6/.test(cleaned) && cleaned.length === 16) {
    return 'discover';
  }
  
  // Diners Club: starts with 30, 36, or 38, 14 digits
  if (/^3[068]/.test(cleaned) && cleaned.length === 14) {
    return 'diners';
  }
  
  // JCB: starts with 35, 16 digits
  if (/^35/.test(cleaned) && cleaned.length === 16) {
    return 'jcb';
  }
  
  // UnionPay: starts with 62, 16-19 digits
  if (/^62/.test(cleaned) && cleaned.length >= 16 && cleaned.length <= 19) {
    return 'unionpay';
  }
  
  return 'unknown';
};

/**
 * Get expected CVV length for card brand
 */
export const getCVVLength = (brand) => {
  const brandLower = (brand || '').toLowerCase();
  // Amex has 4-digit CVV, others have 3
  return brandLower === 'amex' ? 4 : 3;
};

/**
 * Validate CVV
 */
export const validateCVV = (cvv, brand) => {
  if (!cvv || typeof cvv !== 'string') {
    return { isValid: false, error: 'CVV is required' };
  }

  const cleaned = cvv.replace(/\D/g, '');
  const expectedLength = getCVVLength(brand);
  
  if (cleaned.length !== expectedLength) {
    return {
      isValid: false,
      error: `CVV must be ${expectedLength} digits`,
    };
  }
  
  return { isValid: true, error: null, cleaned };
};

/**
 * Validate expiry date
 */
export const validateExpiry = (expMonth, expYear) => {
  const errors = [];
  
  // Validate month
  if (!expMonth || typeof expMonth !== 'number') {
    errors.push('Expiry month is required');
  } else if (expMonth < 1 || expMonth > 12) {
    errors.push('Expiry month must be between 1 and 12');
  }
  
  // Validate year
  if (!expYear || typeof expYear !== 'number') {
    errors.push('Expiry year is required');
  } else {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (expYear < currentYear) {
      errors.push('Card has expired');
    } else if (expYear === currentYear && expMonth < currentMonth) {
      errors.push('Card has expired');
    }
    
    // Check if year is too far in the future (reasonable limit: 20 years)
    if (expYear > currentYear + 20) {
      errors.push('Expiry year is too far in the future');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize card number (remove spaces, keep only digits)
 */
export const sanitizeCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  return cardNumber.replace(/\D/g, '');
};

/**
 * Extract last 4 digits from card number
 */
export const extractLast4 = (cardNumber) => {
  const cleaned = sanitizeCardNumber(cardNumber);
  return cleaned.slice(-4);
};

/**
 * Mask card number for logging (never log full numbers)
 */
export const maskCardNumber = (cardNumber) => {
  const cleaned = sanitizeCardNumber(cardNumber);
  if (cleaned.length < 4) return '****';
  return `****${cleaned.slice(-4)}`;
};

/**
 * Validate cardholder name
 */
export const validateCardholderName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: true, error: null }; // Optional field
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Cardholder name must be at least 2 characters' };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Cardholder name must be less than 50 characters' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { isValid: false, error: 'Cardholder name contains invalid characters' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate payment method creation data
 */
export const validatePaymentMethodData = (data) => {
  const errors = [];
  const warnings = [];
  
  // Validate user ID
  if (!data.userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }
  
  // Validate card number if provided
  if (data.cardNumber) {
    const cardValidation = validateCardNumber(data.cardNumber);
    if (!cardValidation.isValid) {
      errors.push({ field: 'cardNumber', message: cardValidation.error });
    } else {
      // Detect brand
      const brand = detectCardBrand(data.cardNumber);
      if (brand === 'unknown') {
        warnings.push({ field: 'brand', message: 'Card brand could not be detected' });
      }
    }
  } else if (!data.last4) {
    errors.push({ field: 'cardNumber', message: 'Card number or last4 is required' });
  }
  
  // Validate expiry
  if (data.expMonth || data.expYear) {
    const expiryValidation = validateExpiry(data.expMonth, data.expYear);
    if (!expiryValidation.isValid) {
      expiryValidation.errors.forEach(error => {
        errors.push({ field: 'expiry', message: error });
      });
    }
  }
  
  // Validate CVV if provided
  if (data.cvv) {
    const cvvValidation = validateCVV(data.cvv, data.brand);
    if (!cvvValidation.isValid) {
      errors.push({ field: 'cvv', message: cvvValidation.error });
    }
  }
  
  // Validate cardholder name if provided
  if (data.cardholderName) {
    const nameValidation = validateCardholderName(data.cardholderName);
    if (!nameValidation.isValid) {
      errors.push({ field: 'cardholderName', message: nameValidation.error });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

