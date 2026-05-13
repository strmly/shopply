import { BaseModel } from './BaseModel.js';

/**
 * Promotion Model
 * Represents various types of promotions: discounts, flash deals, bundles, buy X get Y, free delivery
 */
export class Promotion extends BaseModel {
  constructor(data = {}) {
    const cleanData = { ...data };
    delete cleanData.status;
    delete cleanData.isCurrentlyActive;
    super(cleanData);
    this.id = data.id || null;
    this.storeId = data.storeId || null;
    this.sellerId = data.sellerId || null;
    this.type = data.type || 'percentage'; // 'percentage', 'amount', 'flash', 'bundle', 'buy_x_get_y', 'free_delivery'
    this.title = data.title || '';
    this.description = data.description || '';
    this.productIds = data.productIds || []; // Array of product IDs
    this.discountValue = data.discountValue || 0; // percentage or amount
    this.discountType = data.discountType || 'percentage'; // 'percentage', 'amount', 'new_price'
    this.minPurchase = data.minPurchase || 0;
    this.maxDiscount = data.maxDiscount || null;
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isPaused = data.isPaused !== undefined ? data.isPaused : false;
    
    // Flash deal specific
    this.maxInventory = data.maxInventory || null; // Maximum units available for flash deal
    this.currentInventory = data.currentInventory || null; // Current units sold/available
    
    // Bundle specific
    this.bundlePrice = data.bundlePrice || null; // Fixed bundle price
    this.bundleImage = data.bundleImage || null; // Bundle cover image
    this.bundleName = data.bundleName || null; // Custom bundle name
    
    // Buy X Get Y specific
    this.buyX = data.buyX || null; // Buy X quantity
    this.getY = data.getY || null; // Get Y quantity
    this.getYDiscount = data.getYDiscount || null; // Discount on Y items
    
    // Free delivery specific
    this.freeDeliveryThreshold = data.freeDeliveryThreshold || null; // Minimum order amount
    
    // Visibility settings
    this.showAsDeal = data.showAsDeal !== undefined ? data.showAsDeal : true; // Show "Deal" badge
    this.showOnHomePage = data.showOnHomePage !== undefined ? data.showOnHomePage : false;
    this.showOnCategoryPage = data.showOnCategoryPage !== undefined ? data.showOnCategoryPage : true;
    this.boostInSearch = data.boostInSearch !== undefined ? data.boostInSearch : false;
    
    // Analytics
    this.views = data.views || 0;
    this.salesCount = data.salesCount || 0;
    this.revenue = data.revenue || 0;
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.storeId) {
      errors.push('Store ID is required');
    }

    if (!this.sellerId) {
      errors.push('Seller ID is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Promotion title is required');
    }

    // Type-specific validation
    switch (this.type) {
      case 'percentage':
      case 'amount':
        if (this.discountValue <= 0) {
          errors.push('Discount value must be greater than zero');
        }
        if (this.type === 'percentage' && this.discountValue > 100) {
          errors.push('Percentage discount cannot exceed 100%');
        }
        if (this.productIds.length === 0) {
          errors.push('At least one product must be selected');
        }
        break;
      
      case 'flash':
        if (this.discountValue <= 0) {
          errors.push('Flash deal discount value must be greater than zero');
        }
        if (this.productIds.length === 0) {
          errors.push('At least one product must be selected for flash deal');
        }
        if (!this.maxInventory || this.maxInventory <= 0) {
          errors.push('Maximum inventory must be set for flash deals');
        }
        if (!this.endDate) {
          errors.push('End date is required for flash deals');
        }
        // Flash deals should not exceed 48 hours
        if (this.endDate && this.startDate) {
          const duration = new Date(this.endDate) - new Date(this.startDate);
          const hours = duration / (1000 * 60 * 60);
          if (hours > 48) {
            errors.push('Flash deals cannot exceed 48 hours');
          }
        }
        break;
      
      case 'bundle':
        if (this.productIds.length < 2) {
          errors.push('Bundles must contain at least 2 products');
        }
        if (!this.bundlePrice || this.bundlePrice <= 0) {
          errors.push('Bundle price must be greater than zero');
        }
        if (!this.bundleName || this.bundleName.trim().length === 0) {
          errors.push('Bundle name is required');
        }
        break;
      
      case 'buy_x_get_y':
        if (!this.buyX || this.buyX <= 0) {
          errors.push('Buy X quantity must be greater than zero');
        }
        if (!this.getY || this.getY <= 0) {
          errors.push('Get Y quantity must be greater than zero');
        }
        if (this.productIds.length === 0) {
          errors.push('At least one product must be selected');
        }
        break;
      
      case 'free_delivery':
        if (!this.freeDeliveryThreshold || this.freeDeliveryThreshold <= 0) {
          errors.push('Free delivery threshold must be greater than zero');
        }
        break;
      
      default:
        errors.push(`Invalid promotion type: ${this.type}`);
    }

    // Date validation
    if (this.endDate && new Date(this.endDate) < new Date(this.startDate)) {
      errors.push('End date must be after start date');
    }

    if (this.startDate && new Date(this.startDate) < new Date()) {
      // Allow past start dates for existing promotions
      // Only warn if it's a new promotion
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if promotion is currently active (not paused, within date range)
   */
  isCurrentlyActive() {
    if (!this.isActive || this.isPaused) {
      return false;
    }
    
    const now = new Date();
    const start = new Date(this.startDate);
    const end = this.endDate ? new Date(this.endDate) : null;
    
    if (now < start) {
      return false; // Not started yet
    }
    
    if (end && now > end) {
      return false; // Expired
    }
    
    // For flash deals, check inventory
    if (this.type === 'flash' && this.maxInventory !== null) {
      const sold = this.currentInventory || 0;
      if (sold >= this.maxInventory) {
        return false; // Sold out
      }
    }
    
    return true;
  }

  /**
   * Get status string
   */
  getStatus() {
    if (!this.isActive) {
      return 'inactive';
    }
    if (this.isPaused) {
      return 'paused';
    }
    
    const now = new Date();
    const start = new Date(this.startDate);
    const end = this.endDate ? new Date(this.endDate) : null;
    
    if (now < start) {
      return 'scheduled';
    }
    if (end && now > end) {
      return 'expired';
    }
    if (this.type === 'flash' && this.maxInventory !== null) {
      const sold = this.currentInventory || 0;
      if (sold >= this.maxInventory) {
        return 'sold_out';
      }
    }
    
    return 'active';
  }

  toJSON() {
    return {
      id: this.id,
      storeId: this.storeId,
      sellerId: this.sellerId,
      type: this.type,
      title: this.title,
      description: this.description,
      productIds: this.productIds,
      discountValue: this.discountValue,
      discountType: this.discountType,
      minPurchase: this.minPurchase,
      maxDiscount: this.maxDiscount,
      startDate: this.startDate,
      endDate: this.endDate,
      isActive: this.isActive,
      isPaused: this.isPaused,
      maxInventory: this.maxInventory,
      currentInventory: this.currentInventory,
      bundlePrice: this.bundlePrice,
      bundleImage: this.bundleImage,
      bundleName: this.bundleName,
      buyX: this.buyX,
      getY: this.getY,
      getYDiscount: this.getYDiscount,
      freeDeliveryThreshold: this.freeDeliveryThreshold,
      showAsDeal: this.showAsDeal,
      showOnHomePage: this.showOnHomePage,
      showOnCategoryPage: this.showOnCategoryPage,
      boostInSearch: this.boostInSearch,
      views: this.views,
      salesCount: this.salesCount,
      revenue: this.revenue,
      status: this.getStatus(),
      isCurrentlyActive: this.isCurrentlyActive(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}











