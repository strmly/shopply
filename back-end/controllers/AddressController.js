import { addressService } from '../services/AddressService.js';
import { validateAddressId } from '../utils/addressValidation.js';
import { getAddressSuggestions } from '../utils/addressUtils.js';

/**
 * Address Controller
 */
export class AddressController {
  /**
   * Get address by ID
   */
  async getAddressById(req, res, next) {
    try {
      const { id } = req.params;
      
      const idValidation = validateAddressId(id);
      if (!idValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: idValidation.message,
        });
      }

      const address = await addressService.getAddressById(idValidation.id);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      // Calculate distance if current location provided
      let distance = null;
      if (req.query.lat && req.query.lng) {
        const currentLat = parseFloat(req.query.lat);
        const currentLng = parseFloat(req.query.lng);
        if (!isNaN(currentLat) && !isNaN(currentLng)) {
          distance = await addressService.calculateDistanceToAddress(
            address.id,
            currentLat,
            currentLng
          );
        }
      }

      res.json({
        success: true,
        data: {
          ...address.toJSON(),
          distance,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get addresses by user ID
   */
  async getAddressesByUserId(req, res, next) {
    try {
      const { userId } = req.params;
      const addresses = await addressService.getAddressesByUserId(userId);
      
      res.json({
        success: true,
        data: addresses.map(addr => addr.toJSON()),
        count: addresses.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new address
   */
  async createAddress(req, res, next) {
    try {
      const address = await addressService.createAddress(req.body);
      res.status(201).json({
        success: true,
        data: address.toJSON(),
        message: 'Address created successfully',
      });
    } catch (error) {
      // Check if it's a validation error
      if (error.message.includes('required') || error.message.includes('must be')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Update address
   */
  async updateAddress(req, res, next) {
    try {
      const { id } = req.params;
      
      const idValidation = validateAddressId(id);
      if (!idValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: idValidation.message,
        });
      }

      const address = await addressService.updateAddress(idValidation.id, req.body);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      res.json({
        success: true,
        data: address.toJSON(),
        message: 'Address updated successfully',
      });
    } catch (error) {
      // Check if it's a validation error
      if (error.message.includes('required') || error.message.includes('must be')) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(req, res, next) {
    try {
      const { id } = req.params;
      // TODO: Get userId from authenticated user (req.user.id)
      const userId = req.body.userId || req.query.userId || req.user?.id || null;
      
      const deleted = await addressService.deleteAddress(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      res.json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Cannot delete the only address') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Validate coordinates
   */
  async validateCoordinates(req, res, next) {
    try {
      const { lat, lng } = req.query;
      const validation = await addressService.validateCoordinates(
        parseFloat(lat),
        parseFloat(lng)
      );

      res.json({
        success: validation.isValid,
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's addresses
   */
  async getMyAddresses(req, res, next) {
    try {
      // TODO: Get userId from authenticated user (req.user.id)
      // For now, use query param or default
      const userId = req.query.userId || req.user?.id || 'default';
      const addresses = await addressService.getUserAddresses(userId);
      
      // Calculate distances if current location provided
      let addressesWithDistance = addresses.map(addr => addr.toJSON());
      if (req.query.lat && req.query.lng) {
        const currentLat = parseFloat(req.query.lat);
        const currentLng = parseFloat(req.query.lng);
        if (!isNaN(currentLat) && !isNaN(currentLng)) {
          addressesWithDistance = await Promise.all(
            addresses.map(async (addr) => {
              const distance = await addressService.calculateDistanceToAddress(
                addr.id,
                currentLat,
                currentLng
              );
              return {
                ...addr.toJSON(),
                distance,
              };
            })
          );
        }
      }
      
      res.json({
        success: true,
        data: addressesWithDistance,
        count: addressesWithDistance.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search address suggestions
   */
  async searchAddresses(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.json({
          success: true,
          data: [],
          count: 0,
        });
      }

      const suggestions = await getAddressSuggestions(q);
      
      res.json({
        success: true,
        data: suggestions,
        count: suggestions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(req, res, next) {
    try {
      const { id } = req.params;
      // TODO: Get userId from authenticated user (req.user.id)
      const userId = req.body.userId || req.user?.id || 'default';
      
      const address = await addressService.setDefaultAddress(id, userId);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      res.json({
        success: true,
        data: address.toJSON(),
        message: 'Default address updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}











