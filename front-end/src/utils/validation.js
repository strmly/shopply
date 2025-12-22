/**
 * Validation utilities for form validation
 */

/**
 * Validates phone number
 * Supports formats: +27 12 345 6789, 012 345 6789, 1234567890
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, parentheses, and plus signs for validation
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Phone number must contain only numbers' };
  }

  // Check length (8-15 digits is reasonable)
  if (cleaned.length < 8) {
    return { isValid: false, error: 'Phone number must be at least 8 digits' };
  }

  if (cleaned.length > 15) {
    return { isValid: false, error: 'Phone number is too long (maximum 15 digits)' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates email address
 */
export const validateEmail = (email, required = false) => {
  if (!email || email.trim().length === 0) {
    if (required) {
      return { isValid: false, error: 'Email address is required' };
    }
    return { isValid: true, error: null }; // Optional field
  }

  // More comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check length
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates store name
 */
export const validateStoreName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Store name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Store name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Store name must be less than 100 characters' };
  }

  // Check for only whitespace
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Store name cannot be only spaces' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates address fields
 */
export const validateAddress = (address) => {
  const errors = {};

  if (!address.street || address.street.trim().length < 3) {
    errors.street = 'Street address is required (minimum 3 characters)';
  } else if (address.street.trim().length > 200) {
    errors.street = 'Street address is too long (maximum 200 characters)';
  }

  if (!address.suburb || address.suburb.trim().length < 2) {
    errors.suburb = 'Suburb is required';
  } else if (address.suburb.trim().length > 100) {
    errors.suburb = 'Suburb name is too long (maximum 100 characters)';
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.city = 'City is required';
  } else if (address.city.trim().length > 100) {
    errors.city = 'City name is too long (maximum 100 characters)';
  }

  // Validate coordinates
  if (!address.lat || !address.lng) {
    errors.location = 'Store location is required. Please use the map to set your location.';
  } else {
    // Validate coordinates are reasonable (rough bounds for South Africa)
    if (address.lat < -35 || address.lat > -22 || 
        address.lng < 16 || address.lng > 33) {
      errors.location = 'Store location appears to be outside service area. Please check your location.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates account number
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.trim().length === 0) {
    return { isValid: false, error: 'Account number is required' };
  }

  const cleaned = accountNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Account number must contain only digits' };
  }

  if (cleaned.length < 8) {
    return { isValid: false, error: 'Account number must be at least 8 digits' };
  }

  if (cleaned.length > 20) {
    return { isValid: false, error: 'Account number is too long (maximum 20 digits)' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates branch code
 */
export const validateBranchCode = (branchCode) => {
  if (!branchCode || branchCode.trim().length === 0) {
    return { isValid: false, error: 'Branch code is required' };
  }

  const cleaned = branchCode.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Branch code must contain only digits' };
  }

  if (cleaned.length < 4) {
    return { isValid: false, error: 'Branch code must be at least 4 digits' };
  }

  if (cleaned.length > 10) {
    return { isValid: false, error: 'Branch code is too long (maximum 10 digits)' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates file upload
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    required = false,
  } = options;

  if (!file) {
    if (required) {
      return { isValid: false, error: 'File is required' };
    }
    return { isValid: true, error: null };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const types = allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    return { isValid: false, error: `File must be one of: ${types}` };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check minimum size (too small might be corrupted)
  if (file.size < 1000) {
    return { isValid: false, error: 'File appears to be corrupted or too small' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates description text
 */
export const validateDescription = (description, maxLength = 500) => {
  if (!description) {
    return { isValid: true, error: null }; // Optional
  }

  if (description.length > maxLength) {
    return { isValid: false, error: `Description must be less than ${maxLength} characters` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates categories
 */
export const validateCategories = (categories, minCount = 1, maxCount = 10) => {
  if (!Array.isArray(categories) || categories.length < minCount) {
    return { isValid: false, error: `Please select at least ${minCount} category${minCount > 1 ? 'ies' : ''}` };
  }

  if (categories.length > maxCount) {
    return { isValid: false, error: `Maximum ${maxCount} categories allowed` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates account holder name
 */
export const validateAccountHolderName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Account holder name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Account holder name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Account holder name is too long (maximum 100 characters)' };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { isValid: false, error: 'Account holder name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, error: null };
};

/**
 * Debounce function for validation
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


