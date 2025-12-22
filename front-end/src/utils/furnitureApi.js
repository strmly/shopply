import { API_BASE_URL } from '../config/api';

/**
 * Furniture Marketplace API Client
 * All furniture-specific API calls
 */

const furnitureApi = {
  /**
   * Get furniture home feed
   */
  async getHome(lat, lng, tier = 'auto') {
    try {
      const response = await fetch(`${API_BASE_URL}/furniture/home?lat=${lat}&lng=${lng}&tier=${tier}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching furniture home:', error);
      throw error;
    }
  },

  /**
   * Search furniture with filters
   */
  async search(params) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/furniture/search?${queryString}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching furniture:', error);
      throw error;
    }
  },

  /**
   * Get products by room
   */
  async getProductsByRoom(roomId, lat, lng, tier = 'auto') {
    try {
      const response = await fetch(`${API_BASE_URL}/furniture/room/${roomId}?lat=${lat}&lng=${lng}&tier=${tier}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products by room:', error);
      throw error;
    }
  },

  /**
   * Get product details
   */
  async getProductDetails(productId, lat, lng) {
    try {
      const response = await fetch(`${API_BASE_URL}/furniture/product/${productId}?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  /**
   * Get seller profile
   */
  async getSellerProfile(sellerId, lat, lng) {
    try {
      const response = await fetch(`${API_BASE_URL}/furniture/seller/${sellerId}?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      throw error;
    }
  },

  /**
   * Get filter options
   */
  async getFilterOptions() {
    try {
      const response = await fetch(`${API_BASE_URL}/furniture/filters`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  },

  /**
   * Get complete taxonomy
   */
  async getTaxonomy() {
    try {
      const response = await fetch(`${API_BASE_URL}/furniture/taxonomy`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
      throw error;
    }
  },
};

export default furnitureApi;

