import { Promotion } from '../models/Promotion.js';
import { ProductService } from './ProductService.js';

/**
 * Promotion Service
 * Handles business logic for promotions
 * Using singleton pattern to share data across requests
 */
class PromotionServiceClass {
  constructor() {
    this.promotions = [];
    this.nextId = 1;
  }

  /**
   * Get all promotions for a seller/store
   */
  async getPromotions(filters = {}) {
    let promotions = [...this.promotions];

    // Filter by storeId
    if (filters.storeId) {
      promotions = promotions.filter(p => p.storeId === parseInt(filters.storeId));
    }

    // Filter by sellerId
    if (filters.sellerId) {
      promotions = promotions.filter(p => p.sellerId === parseInt(filters.sellerId));
    }

    // Filter by type
    if (filters.type) {
      promotions = promotions.filter(p => p.type === filters.type);
    }

    // Filter by status
    if (filters.status) {
      promotions = promotions.filter(p => p.getStatus() === filters.status);
    }

    // Filter by productId
    if (filters.productId) {
      promotions = promotions.filter(p => 
        p.productIds.includes(parseInt(filters.productId))
      );
    }

    // Filter active only
    if (filters.activeOnly === 'true' || filters.activeOnly === true) {
      promotions = promotions.filter(p => p.isCurrentlyActive());
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          promotions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          promotions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'start_date':
          promotions.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          break;
        case 'end_date':
          promotions.sort((a, b) => {
            if (!a.endDate && !b.endDate) return 0;
            if (!a.endDate) return 1;
            if (!b.endDate) return -1;
            return new Date(a.endDate) - new Date(b.endDate);
          });
          break;
        default:
          break;
      }
    } else {
      // Default: newest first
      promotions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPromotions = promotions.slice(startIndex, endIndex);

    return {
      promotions: paginatedPromotions,
      pagination: {
        page,
        limit,
        total: promotions.length,
        totalPages: Math.ceil(promotions.length / limit),
        hasMore: endIndex < promotions.length,
      },
    };
  }

  /**
   * Get promotion by ID
   */
  async getPromotionById(id) {
    return this.promotions.find(p => p.id === parseInt(id));
  }

  /**
   * Check for conflicting promotions (same product, overlapping dates)
   * Returns detailed conflict information
   */
  async checkConflicts(promotionData, excludeId = null) {
    const conflicts = [];
    const newStart = new Date(promotionData.startDate);
    const newEnd = promotionData.endDate ? new Date(promotionData.endDate) : null;

    for (const promo of this.promotions) {
      if (excludeId && promo.id === parseInt(excludeId)) {
        continue;
      }

      // Check if same store/seller
      if (promo.storeId !== parseInt(promotionData.storeId) || 
          promo.sellerId !== parseInt(promotionData.sellerId)) {
        continue;
      }

      // Check for product overlap
      const conflictingProductIds = promotionData.productIds.filter(productId =>
        promo.productIds.includes(productId)
      );

      if (conflictingProductIds.length === 0) {
        continue;
      }

      // Check for date overlap
      const promoStart = new Date(promo.startDate);
      const promoEnd = promo.endDate ? new Date(promo.endDate) : null;

      let dateOverlap = false;
      let overlapDetails = null;

      if (newEnd && promoEnd) {
        // Both have end dates
        dateOverlap = (newStart <= promoEnd && newEnd >= promoStart);
        if (dateOverlap) {
          const overlapStart = newStart > promoStart ? newStart : promoStart;
          const overlapEnd = newEnd < promoEnd ? newEnd : promoEnd;
          overlapDetails = {
            start: overlapStart.toISOString(),
            end: overlapEnd.toISOString(),
            durationHours: Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60)),
          };
        }
      } else if (newEnd && !promoEnd) {
        // New has end, existing doesn't
        dateOverlap = newStart <= promoEnd || newEnd >= promoStart;
        if (dateOverlap) {
          overlapDetails = {
            start: (newStart > promoStart ? newStart : promoStart).toISOString(),
            end: newEnd.toISOString(),
            durationHours: Math.round((newEnd - (newStart > promoStart ? newStart : promoStart)) / (1000 * 60 * 60)),
          };
        }
      } else if (!newEnd && promoEnd) {
        // New doesn't have end, existing does
        dateOverlap = newStart <= promoEnd;
        if (dateOverlap) {
          overlapDetails = {
            start: (newStart > promoStart ? newStart : promoStart).toISOString(),
            end: promoEnd.toISOString(),
            durationHours: Math.round((promoEnd - (newStart > promoStart ? newStart : promoStart)) / (1000 * 60 * 60)),
          };
        }
      } else {
        // Neither has end date
        dateOverlap = true;
        overlapDetails = {
          start: (newStart > promoStart ? newStart : promoStart).toISOString(),
          end: null,
          durationHours: null,
        };
      }

      if (dateOverlap && promo.isActive && !promo.isPaused) {
        // Get product names for better error messages
        const productNames = [];
        for (const productId of conflictingProductIds) {
          const product = await ProductService.getProductById(productId);
          if (product) {
            productNames.push(product.name);
          }
        }

        conflicts.push({
          promotionId: promo.id,
          promotionTitle: promo.title,
          promotionType: promo.type,
          promotionStatus: promo.getStatus(),
          conflictingProducts: conflictingProductIds,
          conflictingProductNames: productNames,
          existingStartDate: promo.startDate,
          existingEndDate: promo.endDate,
          overlapDetails,
        });
      }
    }

    return conflicts;
  }

  /**
   * Create a new promotion
   */
  async createPromotion(promotionData) {
    // Validate required fields
    if (!promotionData.storeId) {
      const error = new Error('Store ID is required');
      error.statusCode = 400;
      error.field = 'storeId';
      throw error;
    }

    if (!promotionData.sellerId) {
      const error = new Error('Seller ID is required');
      error.statusCode = 400;
      error.field = 'sellerId';
      throw error;
    }

    // Validate products exist and belong to seller
    const validatedProducts = [];
    if (promotionData.productIds && promotionData.productIds.length > 0) {
      for (const productId of promotionData.productIds) {
        const product = await ProductService.getProductById(productId);
        if (!product) {
          const error = new Error(`Product with ID ${productId} not found`);
          error.statusCode = 404;
          error.field = 'productIds';
          error.productId = productId;
          throw error;
        }
        if (product.storeId !== parseInt(promotionData.storeId)) {
          const error = new Error(`Product "${product.name}" does not belong to your store`);
          error.statusCode = 403;
          error.field = 'productIds';
          error.productId = productId;
          error.productName = product.name;
          throw error;
        }
        validatedProducts.push(product);
      }
    }

    // For flash deals, validate stock and duration
    if (promotionData.type === 'flash') {
      if (!promotionData.maxInventory || promotionData.maxInventory <= 0) {
        const error = new Error('Maximum inventory is required for flash deals');
        error.statusCode = 400;
        error.field = 'maxInventory';
        throw error;
      }

      if (!promotionData.endDate) {
        const error = new Error('End date is required for flash deals');
        error.statusCode = 400;
        error.field = 'endDate';
        throw error;
      }

      // Validate duration (max 48 hours)
      const startDate = new Date(promotionData.startDate);
      const endDate = new Date(promotionData.endDate);
      const durationHours = (endDate - startDate) / (1000 * 60 * 60);
      
      if (durationHours > 48) {
        const error = new Error('Flash deals cannot exceed 48 hours');
        error.statusCode = 400;
        error.field = 'endDate';
        error.durationHours = durationHours;
        throw error;
      }

      // Validate stock for each product
      for (const product of validatedProducts) {
        if (product.trackInventory && product.stockQuantity !== null) {
          if (product.stockQuantity < promotionData.maxInventory) {
            const error = new Error(
              `Product "${product.name}" has insufficient stock. Available: ${product.stockQuantity}, Required: ${promotionData.maxInventory}`
            );
            error.statusCode = 400;
            error.field = 'maxInventory';
            error.productId = product.id;
            error.productName = product.name;
            error.availableStock = product.stockQuantity;
            error.requiredStock = promotionData.maxInventory;
            throw error;
          }
        }
      }
    }

    // For bundles, validate minimum products
    if (promotionData.type === 'bundle') {
      if (!promotionData.productIds || promotionData.productIds.length < 2) {
        const error = new Error('Bundles must contain at least 2 products');
        error.statusCode = 400;
        error.field = 'productIds';
        throw error;
      }
      if (!promotionData.bundlePrice || promotionData.bundlePrice <= 0) {
        const error = new Error('Bundle price must be greater than zero');
        error.statusCode = 400;
        error.field = 'bundlePrice';
        throw error;
      }
    }

    // Check for conflicts
    const conflicts = await this.checkConflicts(promotionData);
    if (conflicts.length > 0) {
      const error = new Error('Promotion conflicts with existing active promotions');
      error.statusCode = 409;
      error.conflicts = conflicts;
      error.message = `This promotion conflicts with ${conflicts.length} existing promotion${conflicts.length > 1 ? 's' : ''}`;
      throw error;
    }

    const promotion = new Promotion({
      ...promotionData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = promotion.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join('; '));
      error.statusCode = 400;
      error.validationErrors = validation.errors;
      throw error;
    }

    this.promotions.push(promotion);
    return promotion;
  }

  /**
   * Update promotion
   */
  async updatePromotion(id, promotionData) {
    const promotionIndex = this.promotions.findIndex(p => p.id === parseInt(id));
    if (promotionIndex === -1) {
      return null;
    }

    const existingPromotion = this.promotions[promotionIndex];

    // Check for conflicts (excluding current promotion)
    const updatedData = { ...existingPromotion.toJSON(), ...promotionData };
    const conflicts = await this.checkConflicts(updatedData, id);
    if (conflicts.length > 0) {
      const error = new Error('Promotion conflicts with existing active promotions');
      error.statusCode = 409;
      error.conflicts = conflicts;
      throw error;
    }

    // Validate products if changed
    if (promotionData.productIds) {
      for (const productId of promotionData.productIds) {
        const product = await ProductService.getProductById(productId);
        if (!product) {
          const error = new Error(`Product ${productId} not found`);
          error.statusCode = 404;
          throw error;
        }
        if (product.storeId !== existingPromotion.storeId) {
          const error = new Error(`Product ${productId} does not belong to your store`);
          error.statusCode = 403;
          throw error;
        }
      }
    }

    const updatedPromotion = new Promotion({
      ...existingPromotion,
      ...promotionData,
      id: parseInt(id),
      updatedAt: new Date(),
    });

    const validation = updatedPromotion.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    this.promotions[promotionIndex] = updatedPromotion;
    return updatedPromotion;
  }

  /**
   * Delete promotion
   */
  async deletePromotion(id) {
    const promotionIndex = this.promotions.findIndex(p => p.id === parseInt(id));
    if (promotionIndex === -1) {
      return false;
    }

    this.promotions.splice(promotionIndex, 1);
    return true;
  }

  /**
   * Pause promotion
   */
  async pausePromotion(id) {
    return this.updatePromotion(id, { isPaused: true });
  }

  /**
   * Resume promotion
   */
  async resumePromotion(id) {
    return this.updatePromotion(id, { isPaused: false });
  }

  /**
   * End promotion (set end date to now)
   */
  async endPromotion(id) {
    return this.updatePromotion(id, { 
      endDate: new Date(),
      isActive: false,
    });
  }

  /**
   * Duplicate promotion
   */
  async duplicatePromotion(id) {
    const promotion = await this.getPromotionById(id);
    if (!promotion) {
      return null;
    }

    const promotionData = promotion.toJSON();
    delete promotionData.id;
    delete promotionData.createdAt;
    delete promotionData.updatedAt;
    
    // Modify title
    promotionData.title = `${promotionData.title} (Copy)`;
    
    // Set to inactive by default
    promotionData.isActive = false;
    promotionData.isPaused = false;
    
    // Reset analytics
    promotionData.views = 0;
    promotionData.salesCount = 0;
    promotionData.revenue = 0;
    
    // For flash deals, reset inventory
    if (promotionData.type === 'flash') {
      promotionData.currentInventory = 0;
    }

    return this.createPromotion(promotionData);
  }

  /**
   * Get promotions for calendar view
   */
  async getPromotionsForCalendar(storeId, startDate, endDate) {
    const promotions = this.promotions.filter(p => 
      p.storeId === parseInt(storeId) &&
      p.isActive
    );

    const calendarPromotions = [];
    
    for (const promo of promotions) {
      const promoStart = new Date(promo.startDate);
      const promoEnd = promo.endDate ? new Date(promo.endDate) : new Date('2099-12-31');
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      // Check if promotion overlaps with date range
      if (promoStart <= rangeEnd && promoEnd >= rangeStart) {
        calendarPromotions.push(promo);
      }
    }

    return calendarPromotions;
  }

  /**
   * Get promotion statistics for seller
   */
  async getPromotionStats(storeId) {
    const promotions = this.promotions.filter(p => p.storeId === parseInt(storeId));
    
    const stats = {
      total: promotions.length,
      active: promotions.filter(p => p.isCurrentlyActive()).length,
      paused: promotions.filter(p => p.isPaused).length,
      scheduled: promotions.filter(p => p.getStatus() === 'scheduled').length,
      expired: promotions.filter(p => p.getStatus() === 'expired').length,
      byType: {},
      totalViews: promotions.reduce((sum, p) => sum + (p.views || 0), 0),
      totalSales: promotions.reduce((sum, p) => sum + (p.salesCount || 0), 0),
      totalRevenue: promotions.reduce((sum, p) => sum + (p.revenue || 0), 0),
    };

    // Count by type
    promotions.forEach(p => {
      stats.byType[p.type] = (stats.byType[p.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get active promotions for a product
   */
  async getActivePromotionsForProduct(productId) {
    return this.promotions.filter(p => 
      p.productIds.includes(parseInt(productId)) &&
      p.isCurrentlyActive()
    );
  }

  /**
   * Increment promotion views
   */
  async incrementViews(id) {
    const promotion = await this.getPromotionById(id);
    if (promotion) {
      promotion.views = (promotion.views || 0) + 1;
      promotion.updatedAt = new Date();
    }
    return promotion;
  }
}

// Export singleton instance
export const PromotionService = new PromotionServiceClass();

