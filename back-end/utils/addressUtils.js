/**
 * Address Utility Functions
 * Handles geocoding, distance calculations, and address formatting
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 0.1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)}m`;
  } else {
    return `${distanceKm.toFixed(1)} km`;
  }
};

/**
 * Format full address string
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.unit) parts.push(`Unit ${address.unit}`);
  if (address.floor) parts.push(`Floor ${address.floor}`);
  
  const addressLine = parts.join(', ');
  const locationParts = [];
  
  if (address.suburb) locationParts.push(address.suburb);
  if (address.city) locationParts.push(address.city);
  if (address.postalCode) locationParts.push(address.postalCode);
  
  const locationLine = locationParts.join(', ');
  
  return [addressLine, locationLine].filter(Boolean).join('\n');
};

/**
 * Validate coordinates are within reasonable bounds
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Validation result
 */
export const validateCoordinates = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { isValid: false, message: 'Coordinates must be numbers' };
  }
  
  if (lat < -90 || lat > 90) {
    return { isValid: false, message: 'Latitude must be between -90 and 90' };
  }
  
  if (lng < -180 || lng > 180) {
    return { isValid: false, message: 'Longitude must be between -180 and 180' };
  }
  
  return { isValid: true };
};

/**
 * Check if coordinates are within service area
 * For now, this is a placeholder - in production, check against actual service boundaries
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Service area check result
 */
export const checkServiceArea = (lat, lng) => {
  // Example: Johannesburg area bounds (approximate)
  // In production, use actual service area polygons
  const JHB_BOUNDS = {
    north: -25.7,
    south: -26.4,
    east: 28.3,
    west: 27.7,
  };
  
  const isInBounds = 
    lat >= JHB_BOUNDS.south &&
    lat <= JHB_BOUNDS.north &&
    lng >= JHB_BOUNDS.west &&
    lng <= JHB_BOUNDS.east;
  
  return {
    isInServiceArea: isInBounds,
    message: isInBounds 
      ? 'Address is within service area' 
      : 'Address is outside our delivery area',
  };
};

/**
 * Sanitize address input
 * @param {Object} addressData - Raw address data
 * @returns {Object} Sanitized address data
 */
export const sanitizeAddress = (addressData) => {
  const sanitized = { ...addressData };
  
  // Sanitize string fields
  const stringFields = ['label', 'street', 'unit', 'floor', 'suburb', 'city', 'postalCode', 'deliveryInstructions'];
  stringFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  });
  
  // Ensure label has a default
  if (!sanitized.label || sanitized.label.trim() === '') {
    sanitized.label = 'Home';
  }
  
  // Validate and sanitize coordinates
  if (sanitized.latitude !== null && sanitized.latitude !== undefined) {
    sanitized.latitude = parseFloat(sanitized.latitude);
  }
  if (sanitized.longitude !== null && sanitized.longitude !== undefined) {
    sanitized.longitude = parseFloat(sanitized.longitude);
  }
  
  return sanitized;
};

/**
 * Generate address suggestions based on partial input
 * In production, this would use a geocoding API
 * @param {string} query - Search query
 * @returns {Array} Address suggestions
 */
export const getAddressSuggestions = async (query) => {
  if (!query || query.trim().length < 3) {
    return [];
  }
  
  // Placeholder for geocoding API integration
  // In production, integrate with Google Maps, Mapbox, or similar
  const suggestions = [];
  
  // Mock suggestions for common Johannesburg areas
  const commonAreas = [
    { street: 'Rivonia Road', suburb: 'Sandton', city: 'Johannesburg' },
    { street: 'Oxford Road', suburb: 'Rosebank', city: 'Johannesburg' },
    { street: 'Main Road', suburb: 'Melville', city: 'Johannesburg' },
    { street: 'Jan Smuts Avenue', suburb: 'Parktown', city: 'Johannesburg' },
  ];
  
  const queryLower = query.toLowerCase();
  commonAreas.forEach(area => {
    if (
      area.street.toLowerCase().includes(queryLower) ||
      area.suburb.toLowerCase().includes(queryLower) ||
      area.city.toLowerCase().includes(queryLower)
    ) {
      suggestions.push({
        formatted: `${area.street}, ${area.suburb}, ${area.city}`,
        street: area.street,
        suburb: area.suburb,
        city: area.city,
      });
    }
  });
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
};

