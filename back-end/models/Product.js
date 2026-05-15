import { BaseModel } from './BaseModel.js';

/**
 * Product Model
 */
export class Product extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || null;
    this.name = data.name || '';
    this.subtitle = data.subtitle || ''; // Optional subtitle
    this.description = data.description || '';
    this.price = data.price || 0;
    this.originalPrice = data.originalPrice || null;
    this.discountPrice = data.discountPrice || null; // Discount price (sale price)
    this.discount = data.discount || null;
    this.image = data.image || null;
    this.images = data.images || [];
    this.category = data.category || '';
    this.subcategory = data.subcategory || null;
    this.tags = data.tags || []; // Array of tag strings
    this.storeId = data.storeId || null;
    this.storeName = data.storeName || '';
    this.storeLocation = data.storeLocation || null; // { lat, lng, suburb, city }
    this.distance = data.distance || null; // in km
    this.stock = data.stock || 'in'; // 'in', 'low', 'out'
    this.stockQuantity = data.stockQuantity || null;
    this.lowStockThreshold = data.lowStockThreshold || 5; // Default threshold for low stock
    this.trackInventory = data.trackInventory !== undefined ? data.trackInventory : true; // Whether to track inventory
    this.isVisible = data.isVisible !== undefined ? data.isVisible : true; // Product visibility toggle
    this.sku = data.sku || null; // Stock Keeping Unit
    this.barcode = data.barcode || null; // Barcode/UPC
    this.weight = data.weight || null; // Weight in kg
    this.dimensions = data.dimensions || null; // { length, width, height } in cm (for furniture: w, h, d)
    this.preparationTime = data.preparationTime || null; // For food sellers, in minutes
    this.expiryDate = data.expiryDate || null; // For groceries
    this.batchNumber = data.batchNumber || null; // Optional batch number
    this.inventoryLocation = data.inventoryLocation || null; // Store address or warehouse
    this.badges = data.badges || []; // [{ type: 'deal', text: 'FLASH' }, { type: 'new', text: 'NEW' }]
    this.rating = data.rating || null;
    this.reviewCount = data.reviewCount || 0;
    this.socialProof = data.socialProof || null; // "Bought 27 times today"
    
    // Furniture-specific attributes
    this.room = data.room || null; // 'living', 'bedroom', 'office', 'outdoor', 'dining', 'kids', 'storage'
    this.furnitureCategory = data.furnitureCategory || null; // 'sofa', 'bed', 'desk', 'chair', etc.
    this.subCategory = data.subCategory || null; // 'sectional-sofa', 'sleeper-sofa', 'standing-desk'
    this.style = data.style || null; // 'modern', 'scandi', 'industrial', 'traditional', 'vintage'
    this.condition = data.condition || 'new'; // 'new', 'like-new', 'used', 'refurbished'
    this.materialPrimary = data.materialPrimary || null; // 'wood', 'metal', 'fabric', 'leather', 'glass'
    this.materialSecondary = data.materialSecondary || null; // Secondary material if applicable
    this.colorPrimary = data.colorPrimary || data.color || null; // Primary color
    this.color = data.color || data.colorPrimary || null; // Alias for backward compatibility
    this.careNotes = data.careNotes || null; // Care instructions
    this.assemblyRequired = data.assemblyRequired || false; // Boolean
    this.assemblyFee = data.assemblyFee || null; // Optional assembly service fee
    this.deliveryEligible = data.deliveryEligible !== undefined ? data.deliveryEligible : true;
    this.leadTimeDaysMin = data.leadTimeDaysMin || 0; // Minimum lead time
    this.leadTimeDaysMax = data.leadTimeDaysMax || 3; // Maximum lead time
    this.stockType = data.stockType || 'in_stock'; // 'in_stock', 'limited', 'made_to_order', 'preorder'
    this.restockEta = data.restockEta || null; // For out of stock items
    this.availabilityConfidence = data.availabilityConfidence || 1.0; // 0-1 based on freshness + mismatch history
    this.lastStockUpdate = data.lastStockUpdate || new Date();
    this.coverImage = data.coverImage || data.image; // Primary cover image
    this.flawPhotos = data.flawPhotos || []; // Photos showing flaws for used items
    this.dimensionsSnippet = data.dimensionsSnippet || null; // "W120×D80×H75cm"
    this.sizeTag = data.sizeTag || null; // 'small', 'medium', 'large' - derived from dimensions
    this.complaintRate = data.complaintRate || 0; // Product complaint rate
    this.isNew = data.isNew || false;
    this.isTrending = data.isTrending || false;
    this.isFlashDeal = data.isFlashDeal || false;
    this.flashDealEndsAt = data.flashDealEndsAt || null;
    this.variants = data.variants || []; // [{ name: 'Size', value: 'Large', stock: 'in', price: 29.00 }]
    this.salesCount = data.salesCount || 0; // Number of times sold (for best sellers sorting)
    
    // Quality and hyperlocal fields
    this.returnRate = data.returnRate || 0.05; // Product return rate
    this.qualityScore = data.qualityScore || 0; // Computed product quality score
    this.normalizedTitle = data.normalizedTitle || null; // For search matching
    this.moderationStatus = data.moderationStatus || 'approved'; // 'pending', 'approved', 'hidden', 'suspended', 'featured'
    this.moderationReason = data.moderationReason || '';
    this.moderatedAt = data.moderatedAt || null;
    this.isFeatured = Boolean(data.isFeatured);
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    const effectivePrice = this.discountPrice !== null && this.discountPrice !== undefined 
      ? this.discountPrice 
      : this.price;

    if (effectivePrice <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (this.discountPrice !== null && this.discountPrice !== undefined && this.price > 0) {
      if (this.discountPrice > this.price) {
        errors.push('Discount price cannot be higher than base price');
      }
    }

    if (!this.category || this.category.trim().length === 0) {
      errors.push('Product category is required');
    }

    if (!this.storeId) {
      errors.push('Store ID is required');
    }

    if (this.trackInventory && this.stockQuantity !== null && this.stockQuantity < 0) {
      errors.push('Stock quantity cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update stock status based on quantity and threshold
   */
  updateStockStatus() {
    if (!this.trackInventory) {
      this.stock = 'in';
      return;
    }

    if (this.stockQuantity === null || this.stockQuantity === undefined) {
      this.stock = 'out';
      return;
    }

    if (this.stockQuantity === 0) {
      this.stock = 'out';
    } else if (this.stockQuantity <= this.lowStockThreshold) {
      this.stock = 'low';
    } else {
      this.stock = 'in';
    }
  }

  /**
   * Generate SKU if not provided
   */
  generateSKU() {
    if (this.sku) return this.sku;
    
    const prefix = this.storeId ? `ST${this.storeId}` : 'PR';
    const categoryCode = this.category ? this.category.substring(0, 3).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${prefix}-${categoryCode}-${timestamp}`;
    return this.sku;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      subtitle: this.subtitle,
      description: this.description,
      price: this.price,
      originalPrice: this.originalPrice,
      discountPrice: this.discountPrice,
      discount: this.discount,
      image: this.image,
      images: this.images,
      category: this.category,
      subcategory: this.subcategory,
      tags: this.tags,
      storeId: this.storeId,
      storeName: this.storeName,
      storeLocation: this.storeLocation,
      distance: this.distance,
      stock: this.stock,
      stockQuantity: this.stockQuantity,
      lowStockThreshold: this.lowStockThreshold,
      trackInventory: this.trackInventory,
      isVisible: this.isVisible,
      sku: this.sku,
      barcode: this.barcode,
      weight: this.weight,
      dimensions: this.dimensions,
      preparationTime: this.preparationTime,
      expiryDate: this.expiryDate,
      batchNumber: this.batchNumber,
      inventoryLocation: this.inventoryLocation,
      badges: this.badges,
      rating: this.rating,
      reviewCount: this.reviewCount,
      socialProof: this.socialProof,
      isNew: this.isNew,
      isTrending: this.isTrending,
      isFlashDeal: this.isFlashDeal,
      flashDealEndsAt: this.flashDealEndsAt,
      variants: this.variants,
      salesCount: this.salesCount,
      returnRate: this.returnRate,
      qualityScore: this.qualityScore,
      normalizedTitle: this.normalizedTitle,
      moderationStatus: this.moderationStatus,
      moderationReason: this.moderationReason,
      moderatedAt: this.moderatedAt,
      isFeatured: this.isFeatured,
      room: this.room,
      furnitureCategory: this.furnitureCategory,
      subCategory: this.subCategory,
      style: this.style,
      condition: this.condition,
      materialPrimary: this.materialPrimary,
      materialSecondary: this.materialSecondary,
      colorPrimary: this.colorPrimary,
      color: this.color,
      careNotes: this.careNotes,
      assemblyRequired: this.assemblyRequired,
      assemblyFee: this.assemblyFee,
      deliveryEligible: this.deliveryEligible,
      leadTimeDaysMin: this.leadTimeDaysMin,
      leadTimeDaysMax: this.leadTimeDaysMax,
      stockType: this.stockType,
      restockEta: this.restockEta,
      availabilityConfidence: this.availabilityConfidence,
      lastStockUpdate: this.lastStockUpdate,
      coverImage: this.coverImage,
      flawPhotos: this.flawPhotos,
      dimensionsSnippet: this.dimensionsSnippet,
      sizeTag: this.sizeTag,
      complaintRate: this.complaintRate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

