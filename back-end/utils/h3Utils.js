import { latLngToCell, cellToBoundary, gridDisk, cellToLatLng, getResolution } from 'h3-js';

/**
 * H3 Utility Service for Hyperlocal Geospatial Operations
 * Handles H3 indexing at multiple resolutions for stores and products
 */

// H3 Resolution definitions (simplified, production-focused)
export const H3_RESOLUTIONS = {
  R9: 9,   // ~170m (dense neighborhood blocks - urban)
  R8: 8,   // ~460m (neighborhood zone)
  R7: 7,   // ~1.2km (local core)
  R6: 6,   // ~3.5km (nearby)
  R5: 5,   // ~10km (city)
  R4: 4,   // ~35km (metro)
  R3: 3,   // ~110km (province-scale)
};

// Tier definitions for Uber-style expansion
// Stronger penalties to keep local results dominant
export const RADIUS_TIERS = [
  { 
    id: 'T0', 
    label: 'Within 1km', 
    radiusKm: 1, 
    resolution: H3_RESOLUTIONS.R7, 
    ringSize: 2,
    penalty: 0,      // No penalty for local core
    minResults: 20   // Module-specific, can override
  },
  { 
    id: 'T1', 
    label: 'Within 5km', 
    radiusKm: 5, 
    resolution: H3_RESOLUTIONS.R6, 
    ringSize: 3,
    penalty: 0.08,   // Stronger penalty
    minResults: 40
  },
  { 
    id: 'T2', 
    label: 'Within 10km', 
    radiusKm: 10, 
    resolution: H3_RESOLUTIONS.R5, 
    ringSize: 4,
    penalty: 0.18,   // Stronger penalty
    minResults: 60
  },
  { 
    id: 'T3', 
    label: 'Within 35km', 
    radiusKm: 35, 
    resolution: H3_RESOLUTIONS.R4, 
    ringSize: 5,
    penalty: 0.35,   // Stronger penalty
    minResults: 80
  },
  { 
    id: 'T4', 
    label: 'Max (Nearest province)', 
    radiusKm: 110, 
    resolution: H3_RESOLUTIONS.R3, 
    ringSize: 6,
    penalty: 0.60,   // Strongest penalty
    minResults: 100
  },
];

/**
 * Generate H3 cells for a location at multiple resolutions
 * Simplified to essential tiers only
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} H3 cells at tier resolutions
 */
export function generateH3Cells(lat, lng) {
  try {
    return {
      h3_r3: latLngToCell(lat, lng, H3_RESOLUTIONS.R3),
      h3_r4: latLngToCell(lat, lng, H3_RESOLUTIONS.R4),
      h3_r5: latLngToCell(lat, lng, H3_RESOLUTIONS.R5),
      h3_r6: latLngToCell(lat, lng, H3_RESOLUTIONS.R6),
      h3_r7: latLngToCell(lat, lng, H3_RESOLUTIONS.R7),
      h3_r8: latLngToCell(lat, lng, H3_RESOLUTIONS.R8),
      h3_r9: latLngToCell(lat, lng, H3_RESOLUTIONS.R9),
    };
  } catch (error) {
    console.error('Error generating H3 cells:', error);
    return null;
  }
}

/**
 * Get neighboring H3 cells within a ring distance
 * @param {string} h3Cell - Center H3 cell
 * @param {number} ringSize - Number of rings to expand
 * @returns {Array} Array of H3 cells including center
 */
export function getH3Ring(h3Cell, ringSize = 1) {
  try {
    return gridDisk(h3Cell, ringSize);
  } catch (error) {
    console.error('Error getting H3 ring:', error);
    return [h3Cell];
  }
}

/**
 * Get H3 cells for a tier based on user location
 * @param {number} lat - User latitude
 * @param {number} lng - User longitude
 * @param {Object} tier - Radius tier configuration
 * @returns {Array} Array of H3 cells covering the tier radius
 */
export function getH3CellsForTier(lat, lng, tier) {
  try {
    const centerCell = latLngToCell(lat, lng, tier.resolution);
    return getH3Ring(centerCell, tier.ringSize);
  } catch (error) {
    console.error('Error getting H3 cells for tier:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get the center coordinates of an H3 cell
 * @param {string} h3Cell - H3 cell index
 * @returns {Object} {lat, lng}
 */
export function getH3CellCenter(h3Cell) {
  try {
    const [lat, lng] = cellToLatLng(h3Cell);
    return { lat, lng };
  } catch (error) {
    console.error('Error getting H3 cell center:', error);
    return null;
  }
}

/**
 * Get the boundary polygon of an H3 cell
 * @param {string} h3Cell - H3 cell index
 * @returns {Array} Array of [lat, lng] coordinates forming the boundary
 */
export function getH3CellBoundary(h3Cell) {
  try {
    return cellToBoundary(h3Cell, true); // true for GeoJSON format [lat, lng]
  } catch (error) {
    console.error('Error getting H3 cell boundary:', error);
    return [];
  }
}

/**
 * Determine which tier a distance falls into
 * @param {number} distanceKm - Distance in kilometers
 * @returns {Object} Matching tier or null
 */
export function getTierForDistance(distanceKm) {
  for (const tier of RADIUS_TIERS) {
    if (distanceKm <= tier.radiusKm) {
      return tier;
    }
  }
  return RADIUS_TIERS[RADIUS_TIERS.length - 1]; // Return last tier if beyond all
}

/**
 * Check if store is currently open based on hours
 * @param {Object} hours - Store hours object
 * @returns {boolean}
 */
export function isStoreOpenNow(hours) {
  if (!hours) return false;
  
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
  
  const todayHours = hours[currentDay];
  if (!todayHours || todayHours.closed) return false;
  
  // Parse open and close times
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

export default {
  H3_RESOLUTIONS,
  RADIUS_TIERS,
  generateH3Cells,
  getH3Ring,
  getH3CellsForTier,
  calculateDistance,
  getH3CellCenter,
  getH3CellBoundary,
  getTierForDistance,
  isStoreOpenNow,
  formatDistance,
};

