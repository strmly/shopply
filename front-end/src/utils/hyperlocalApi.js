/**
 * Hyperlocal API Utilities
 * Client-side API functions for hyperlocal features
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Get hyperlocal home feed
 */
export async function getHyperlocalHomeFeed(lat, lng, tierIndex = 0) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/hyperlocal/feed/home?lat=${lat}&lng=${lng}&tier_index=${tierIndex}`
    );
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load home feed');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error getting home feed:', error);
    throw error;
  }
}

/**
 * Search with hyperlocal radius expansion
 */
export async function searchHyperlocal({
  query,
  lat,
  lng,
  category = null,
  minResults = 50,
  maxTier = 4,
  filters = {},
}) {
  try {
    const params = new URLSearchParams({
      q: query || '',
      lat,
      lng,
      min_results: minResults,
      max_tier: maxTier,
    });

    if (category) params.append('category', category);
    if (filters.inStockOnly) params.append('in_stock_only', '1');
    if (filters.minRating) params.append('min_rating', filters.minRating);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.openNow) params.append('open_now', '1');

    const response = await fetch(`${API_BASE_URL}/hyperlocal/search?${params.toString()}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Search failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
}

/**
 * Search by category
 */
export async function searchByCategory(category, lat, lng, tierIndex = 1) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/hyperlocal/category/${category}?lat=${lat}&lng=${lng}&tier_index=${tierIndex}`
    );
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Category search failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error searching category:', error);
    throw error;
  }
}

/**
 * Get available radius tiers
 */
export async function getRadiusTiers() {
  try {
    const response = await fetch(`${API_BASE_URL}/hyperlocal/tiers`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load tiers');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error getting tiers:', error);
    throw error;
  }
}

/**
 * Get inventory for a product at a store
 */
export async function getInventory(storeId, productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${storeId}/${productId}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load inventory');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error getting inventory:', error);
    throw error;
  }
}

/**
 * Update inventory
 */
export async function updateInventory(storeId, productId, stockQuantity, reason = 'adjustment') {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${storeId}/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: stockQuantity, reason }),
    });
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update inventory');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
}

/**
 * Get user's current location
 */
export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to address
 * In production, use Google Maps Geocoding API or similar
 */
export async function reverseGeocode(lat, lng) {
  // Placeholder - in production, integrate with geocoding service
  return {
    street: '',
    suburb: 'Johannesburg',
    city: 'Johannesburg',
    province: 'Gauteng',
    country: 'South Africa',
  };
}

export default {
  getHyperlocalHomeFeed,
  searchHyperlocal,
  searchByCategory,
  getRadiusTiers,
  getInventory,
  updateInventory,
  getUserLocation,
  reverseGeocode,
};

