import { Address } from '../models/Address.js';
import { sanitizeAddress, calculateDistance, formatDistance, checkServiceArea } from '../utils/addressUtils.js';
import { validateAddressData } from '../utils/addressValidation.js';

/**
 * Address Service
 * Handles business logic for addresses
 */
export class AddressService {
  constructor() {
    this.addresses = [];
    this.nextId = 1;
    // Track recently used addresses (in production, use database)
    this.recentlyUsed = new Map(); // userId -> [addressIds]
  }

  /**
   * Get address by ID
   */
  async getAddressById(id) {
    return this.addresses.find(addr => addr.id === parseInt(id));
  }

  /**
   * Get addresses by user ID
   * Sorted: default first, then by most recently used, then alphabetically
   */
  async getAddressesByUserId(userId) {
    const uid = String(userId);
    const userAddresses = this.addresses.filter(addr => String(addr.userId) === uid);
    const recentlyUsed = this.recentlyUsed.get(uid) || [];
    
    // Sort: default first, then by recently used, then by updatedAt, then by label
    return userAddresses.sort((a, b) => {
      // Default address always first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      
      // Recently used addresses next
      const aRecentlyUsed = recentlyUsed.indexOf(a.id);
      const bRecentlyUsed = recentlyUsed.indexOf(b.id);
      
      if (aRecentlyUsed !== -1 && bRecentlyUsed !== -1) {
        return aRecentlyUsed - bRecentlyUsed; // Earlier in array = more recent
      }
      if (aRecentlyUsed !== -1) return -1;
      if (bRecentlyUsed !== -1) return 1;
      
      // Then by updatedAt (most recent)
      if (a.updatedAt > b.updatedAt) return -1;
      if (a.updatedAt < b.updatedAt) return 1;
      
      // Finally alphabetically by label
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Mark address as recently used
   * @private
   */
  markAsRecentlyUsed(userId, addressId) {
    const uid = String(userId);
    const addressIdNum = parseInt(addressId);

    if (!this.recentlyUsed.has(uid)) {
      this.recentlyUsed.set(uid, []);
    }

    const recent = this.recentlyUsed.get(uid);
    // Remove if already exists
    const index = recent.indexOf(addressIdNum);
    if (index !== -1) {
      recent.splice(index, 1);
    }
    // Add to front
    recent.unshift(addressIdNum);
    // Keep only last 10
    if (recent.length > 10) {
      recent.pop();
    }
  }

  /**
   * Get default address for user
   */
  async getDefaultAddress(userId) {
    const uid = String(userId);
    return this.addresses.find(
      addr => String(addr.userId) === uid && addr.isDefault
    );
  }

  /**
   * Create a new address
   */
  async createAddress(addressData) {
    // Sanitize input
    const sanitized = sanitizeAddress(addressData);
    
    // Validate data
    const validation = validateAddressData(sanitized);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join(', ');
      throw new Error(errorMessages);
    }

    // Check service area
    const serviceAreaCheck = checkServiceArea(sanitized.latitude, sanitized.longitude);
    if (!serviceAreaCheck.isInServiceArea) {
      // Allow creation but warn user
      console.warn(`Address outside service area: ${serviceAreaCheck.message}`);
    }

    const address = new Address({
      ...sanitized,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const modelValidation = address.validate();
    if (!modelValidation.isValid) {
      throw new Error(modelValidation.errors.join(', '));
    }

    // If this is set as default, unset other defaults for this user
    if (address.isDefault && address.userId) {
      this.addresses.forEach(addr => {
        if (addr.userId === address.userId && addr.id !== address.id) {
          addr.isDefault = false;
          addr.updatedAt = new Date();
        }
      });
    }

    this.addresses.push(address);
    
    // Mark as recently used
    if (address.userId) {
      this.markAsRecentlyUsed(address.userId, address.id);
    }
    
    return address;
  }

  /**
   * Update address
   */
  async updateAddress(id, addressData) {
    const addressIndex = this.addresses.findIndex(addr => addr.id === parseInt(id));
    if (addressIndex === -1) {
      return null;
    }

    const existingAddress = this.addresses[addressIndex];
    
    // Sanitize input
    const sanitized = sanitizeAddress(addressData);
    
    // Validate data
    const validation = validateAddressData({
      ...existingAddress,
      ...sanitized,
    });
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join(', ');
      throw new Error(errorMessages);
    }

    // Check service area if coordinates changed
    if (sanitized.latitude !== existingAddress.latitude || 
        sanitized.longitude !== existingAddress.longitude) {
      const serviceAreaCheck = checkServiceArea(sanitized.latitude, sanitized.longitude);
      if (!serviceAreaCheck.isInServiceArea) {
        console.warn(`Updated address outside service area: ${serviceAreaCheck.message}`);
      }
    }

    const updatedAddress = new Address({
      ...existingAddress,
      ...sanitized,
      id: parseInt(id),
      updatedAt: new Date(),
    });

    const modelValidation = updatedAddress.validate();
    if (!modelValidation.isValid) {
      throw new Error(modelValidation.errors.join(', '));
    }

    // If this is set as default, unset other defaults for this user
    if (updatedAddress.isDefault && updatedAddress.userId) {
      this.addresses.forEach(addr => {
        if (addr.userId === updatedAddress.userId && addr.id !== updatedAddress.id) {
          addr.isDefault = false;
          addr.updatedAt = new Date();
        }
      });
    }

    this.addresses[addressIndex] = updatedAddress;
    
    // Mark as recently used
    if (updatedAddress.userId) {
      this.markAsRecentlyUsed(updatedAddress.userId, updatedAddress.id);
    }
    
    return updatedAddress;
  }

  /**
   * Delete address
   */
  async deleteAddress(id, userId = null) {
    const addressIndex = this.addresses.findIndex(addr => addr.id === parseInt(id));
    if (addressIndex === -1) {
      return false;
    }

    const address = this.addresses[addressIndex];
    
    // Prevent deleting if it's the only address for the user
    if (userId) {
      const userAddresses = this.addresses.filter(addr => String(addr.userId) === String(userId));
      if (userAddresses.length === 1 && userAddresses[0].id === address.id) {
        throw new Error('Cannot delete the only address');
      }
    }

    this.addresses.splice(addressIndex, 1);
    return true;
  }

  /**
   * Validate address coordinates
   */
  async validateCoordinates(lat, lng) {
    const { validateCoordinates: validateCoords } = await import('../utils/addressValidation.js');
    const validation = validateCoords(lat, lng);
    
    if (!validation.isValid) {
      return { 
        isValid: false, 
        message: validation.errors.join(', ') 
      };
    }

    // Check service area
    const serviceAreaCheck = checkServiceArea(lat, lng);
    
    return { 
      isValid: true,
      isInServiceArea: serviceAreaCheck.isInServiceArea,
      message: serviceAreaCheck.message,
    };
  }

  /**
   * Calculate distance from current location to address
   */
  async calculateDistanceToAddress(addressId, currentLat, currentLng) {
    const address = await this.getAddressById(addressId);
    if (!address || !address.latitude || !address.longitude) {
      return null;
    }

    const distance = calculateDistance(
      currentLat,
      currentLng,
      address.latitude,
      address.longitude
    );

    return {
      distanceKm: distance,
      distanceFormatted: formatDistance(distance),
    };
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id, userId) {
    const address = await this.getAddressById(id);
    if (!address) {
      return null;
    }

    if (String(address.userId) !== String(userId)) {
      throw new Error('Address does not belong to user');
    }

    // Unset other defaults for this user
    this.addresses.forEach(addr => {
      if (String(addr.userId) === String(userId) && addr.id !== address.id) {
        addr.isDefault = false;
        addr.updatedAt = new Date();
      }
    });

    // Set this address as default
    address.isDefault = true;
    address.updatedAt = new Date();
    
    // Mark as recently used
    this.markAsRecentlyUsed(userId, address.id);
    
    return address;
  }

  /**
   * Get user's addresses (for authenticated user)
   */
  async getUserAddresses(userId) {
    return this.getAddressesByUserId(userId);
  }
}











