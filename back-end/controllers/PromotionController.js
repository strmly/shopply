import { PromotionService } from '../services/PromotionService.js';

/**
 * Promotion Controller
 * Handles promotion management operations
 */
export class PromotionController {
  /**
   * Get all promotions for a seller/store
   */
  async getPromotions(req, res, next) {
    try {
      const { storeId } = req.params;
      const result = await PromotionService.getPromotions({
        ...req.query,
        storeId,
      });

      res.json({
        success: true,
        data: result.promotions.map(p => p.toJSON()),
        count: result.promotions.length,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      // Verify promotion belongs to seller
      if (promotion.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this promotion',
        });
      }

      res.json({
        success: true,
        data: promotion.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new promotion
   */
  async createPromotion(req, res, next) {
    try {
      const { storeId } = req.params;
      const promotionData = {
        ...req.body,
        storeId: parseInt(storeId),
        sellerId: parseInt(req.body.sellerId) || parseInt(storeId), // Fallback to storeId if sellerId not provided
      };

      const promotion = await PromotionService.createPromotion(promotionData);

      res.status(201).json({
        success: true,
        data: promotion.toJSON(),
        message: 'Promotion created successfully',
      });
    } catch (error) {
      // Handle conflict errors with detailed information
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Promotion conflicts with existing active promotions',
          conflicts: error.conflicts?.map(c => ({
            promotionId: c.promotionId,
            promotionTitle: c.promotionTitle,
            promotionType: c.promotionType,
            promotionStatus: c.promotionStatus,
            conflictingProducts: c.conflictingProducts,
            conflictingProductNames: c.conflictingProductNames,
            existingStartDate: c.existingStartDate,
            existingEndDate: c.existingEndDate,
            overlapDetails: c.overlapDetails,
          })),
          conflictCount: error.conflicts?.length || 0,
        });
      }
      
      // Handle validation errors with field information
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
          field: error.field,
          validationErrors: error.validationErrors,
          productId: error.productId,
          productName: error.productName,
          availableStock: error.availableStock,
          requiredStock: error.requiredStock,
          durationHours: error.durationHours,
        });
      }
      
      // Handle authorization errors
      if (error.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: error.message,
          field: error.field,
          productId: error.productId,
          productName: error.productName,
        });
      }
      
      // Handle not found errors
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
          field: error.field,
          productId: error.productId,
        });
      }
      
      next(error);
    }
  }

  /**
   * Update promotion
   */
  async updatePromotion(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      // Verify promotion belongs to seller
      if (promotion.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this promotion',
        });
      }

      const updatedPromotion = await PromotionService.updatePromotion(id, req.body);

      res.json({
        success: true,
        data: updatedPromotion.toJSON(),
        message: 'Promotion updated successfully',
      });
    } catch (error) {
      // Handle conflict errors with detailed information
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message || 'Promotion conflicts with existing active promotions',
          conflicts: error.conflicts?.map(c => ({
            promotionId: c.promotionId,
            promotionTitle: c.promotionTitle,
            promotionType: c.promotionType,
            promotionStatus: c.promotionStatus,
            conflictingProducts: c.conflictingProducts,
            conflictingProductNames: c.conflictingProductNames,
            existingStartDate: c.existingStartDate,
            existingEndDate: c.existingEndDate,
            overlapDetails: c.overlapDetails,
          })),
          conflictCount: error.conflicts?.length || 0,
        });
      }
      
      // Handle validation errors with field information
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
          field: error.field,
          validationErrors: error.validationErrors,
          productId: error.productId,
          productName: error.productName,
          availableStock: error.availableStock,
          requiredStock: error.requiredStock,
        });
      }
      
      // Handle authorization errors
      if (error.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: error.message,
          field: error.field,
          productId: error.productId,
          productName: error.productName,
        });
      }
      
      // Handle not found errors
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
          field: error.field,
          productId: error.productId,
        });
      }
      
      next(error);
    }
  }

  /**
   * Delete promotion
   */
  async deletePromotion(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      // Verify promotion belongs to seller
      if (promotion.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this promotion',
        });
      }

      const deleted = await PromotionService.deletePromotion(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      res.json({
        success: true,
        message: 'Promotion deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pause promotion
   */
  async pausePromotion(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      if (promotion.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to pause this promotion',
        });
      }

      const updatedPromotion = await PromotionService.pausePromotion(id);

      res.json({
        success: true,
        data: updatedPromotion.toJSON(),
        message: 'Promotion paused successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resume promotion
   */
  async resumePromotion(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      if (promotion.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to resume this promotion',
        });
      }

      const updatedPromotion = await PromotionService.resumePromotion(id);

      res.json({
        success: true,
        data: updatedPromotion.toJSON(),
        message: 'Promotion resumed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * End promotion
   */
  async endPromotion(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      if (promotion.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to end this promotion',
        });
      }

      const updatedPromotion = await PromotionService.endPromotion(id);

      res.json({
        success: true,
        data: updatedPromotion.toJSON(),
        message: 'Promotion ended successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duplicate promotion
   */
  async duplicatePromotion(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const promotion = await PromotionService.getPromotionById(id);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Promotion not found',
        });
      }

      if (promotion.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to duplicate this promotion',
        });
      }

      const duplicatedPromotion = await PromotionService.duplicatePromotion(id);

      res.status(201).json({
        success: true,
        data: duplicatedPromotion.toJSON(),
        message: 'Promotion duplicated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get promotions for calendar view
   */
  async getPromotionsForCalendar(req, res, next) {
    try {
      const { storeId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const promotions = await PromotionService.getPromotionsForCalendar(
        storeId,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: promotions.map(p => p.toJSON()),
        count: promotions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get promotion statistics
   */
  async getPromotionStats(req, res, next) {
    try {
      const { storeId } = req.params;
      const stats = await PromotionService.getPromotionStats(storeId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check for conflicts before creating/updating
   */
  async checkConflicts(req, res, next) {
    try {
      const { storeId } = req.params;
      const promotionData = {
        ...req.body,
        storeId: parseInt(storeId),
      };

      const conflicts = await PromotionService.checkConflicts(
        promotionData,
        req.body.excludeId
      );

      res.json({
        success: true,
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts.map(c => ({
          promotionId: c.promotion.id,
          promotionTitle: c.promotion.title,
          conflictingProducts: c.conflictingProducts,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

