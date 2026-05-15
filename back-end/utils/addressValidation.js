/**
 * Address Validation Schemas
 * Provides validation for address-related requests
 */

/**
 * Validate address creation/update data
 * @param {Object} data - Address data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export const validateAddressData = (data) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!data.street || typeof data.street !== 'string' || data.street.trim().length === 0) {
    errors.push({ field: 'street', message: 'Street address is required' });
  } else if (data.street.trim().length < 3) {
    errors.push({ field: 'street', message: 'Street address must be at least 3 characters' });
  }

  if (!data.suburb || typeof data.suburb !== 'string' || data.suburb.trim().length === 0) {
    errors.push({ field: 'suburb', message: 'Suburb is required' });
  }

  if (!data.city || typeof data.city !== 'string' || data.city.trim().length === 0) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  // Coordinates are optional for manually entered addresses.
  if (data.latitude !== null && data.latitude !== undefined && (typeof data.latitude !== 'number' || isNaN(data.latitude))) {
    errors.push({ field: 'latitude', message: 'Latitude must be a valid number' });
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90' });
  }

  if (data.longitude !== null && data.longitude !== undefined && (typeof data.longitude !== 'number' || isNaN(data.longitude))) {
    errors.push({ field: 'longitude', message: 'Longitude must be a valid number' });
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push({ field: 'longitude', message: 'Longitude must be between -180 and 180' });
  }

  // Optional field validations
  if (data.label && typeof data.label !== 'string') {
    errors.push({ field: 'label', message: 'Label must be a string' });
  } else if (data.label && data.label.trim().length > 50) {
    errors.push({ field: 'label', message: 'Label must be less than 50 characters' });
  }

  if (data.unit && typeof data.unit !== 'string') {
    errors.push({ field: 'unit', message: 'Unit must be a string' });
  } else if (data.unit && data.unit.trim().length > 20) {
    warnings.push({ field: 'unit', message: 'Unit number seems unusually long' });
  }

  if (data.floor && typeof data.floor !== 'string') {
    errors.push({ field: 'floor', message: 'Floor must be a string' });
  }

  if (data.postalCode && typeof data.postalCode !== 'string') {
    errors.push({ field: 'postalCode', message: 'Postal code must be a string' });
  } else if (data.postalCode && data.postalCode.trim().length > 10) {
    warnings.push({ field: 'postalCode', message: 'Postal code seems unusually long' });
  }

  if (data.deliveryInstructions && typeof data.deliveryInstructions !== 'string') {
    errors.push({ field: 'deliveryInstructions', message: 'Delivery instructions must be a string' });
  } else if (data.deliveryInstructions && data.deliveryInstructions.trim().length > 500) {
    warnings.push({ field: 'deliveryInstructions', message: 'Delivery instructions should be less than 500 characters' });
  }

  // Validate isDefault is boolean
  if (data.isDefault !== undefined && typeof data.isDefault !== 'boolean') {
    errors.push({ field: 'isDefault', message: 'isDefault must be a boolean' });
  }

  // Validate userId
  if (data.userId !== undefined && !data.userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate address ID parameter
 * @param {string} id - Address ID
 * @returns {Object} Validation result
 */
export const validateAddressId = (id) => {
  if (!id) {
    return { isValid: false, message: 'Address ID is required' };
  }

  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return { isValid: false, message: 'Address ID must be a positive number' };
  }

  return { isValid: true, id: numId };
};

/**
 * Validate coordinates for validation endpoint
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Validation result
 */
export const validateCoordinates = (lat, lng) => {
  const errors = [];

  if (lat === null || lat === undefined) {
    errors.push('Latitude is required');
  } else if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push('Latitude must be a valid number');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (lng === null || lng === undefined) {
    errors.push('Longitude is required');
  } else if (typeof lng !== 'number' || isNaN(lng)) {
    errors.push('Longitude must be a valid number');
  } else if (lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

