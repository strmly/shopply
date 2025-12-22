import { generateH3Cells, isStoreOpenNow } from '../utils/h3Utils.js';
import { calculateSellerQualityScore, calculateProductQualityScore, calculateStoreServiceScore } from './QualityService.js';

/**
 * H3 Indexing Service
 * Handles indexing of stores and products into H3 geospatial cells
 */

/**
 * Index a store with H3 cells
 * @param {Object} store - Store object
 * @param {Object} seller - Associated seller object (optional)
 * @returns {Object} Store with H3 cells and computed scores
 */
export function indexStore(store, seller = null) {
  if (!store.address || !store.address.lat || !store.address.lng) {
    throw new Error('Store must have valid lat/lng coordinates');
  }

  // Generate H3 cells at multiple resolutions
  const h3Cells = generateH3Cells(store.address.lat, store.address.lng);
  
  if (!h3Cells) {
    throw new Error('Failed to generate H3 cells for store');
  }

  // Update store with H3 cells
  Object.assign(store, h3Cells);

  // Calculate if store is open now
  store.isOpenNow = isStoreOpenNow(store.hours);

  // Calculate store service score
  store.serviceScore = calculateStoreServiceScore(store);

  store.updatedAt = new Date();

  return store;
}

/**
 * Index a product with store's H3 data
 * @param {Object} product - Product object
 * @param {Object} store - Associated store object
 * @param {Object} seller - Associated seller object
 * @param {Object} inventory - Product inventory data (optional)
 * @returns {Object} Enriched product with H3 data and scores
 */
export function indexProduct(product, store, seller = null, inventory = null) {
  if (!store) {
    throw new Error('Product must be associated with a store');
  }

  // Normalize title for search
  product.normalizedTitle = normalizeText(product.name);

  // Calculate product quality score
  product.qualityScore = calculateProductQualityScore(product, inventory);

  // Attach store location data
  if (store.address) {
    product.storeLocation = {
      lat: store.address.lat,
      lng: store.address.lng,
      suburb: store.address.suburb,
      city: store.address.city,
    };
  }

  product.storeName = store.name;
  product.updatedAt = new Date();

  return product;
}

/**
 * Create search index document for a product
 * This document would be indexed in a search engine (Elasticsearch, etc.)
 */
export function createProductSearchDocument(product, store, seller, inventory) {
  return {
    // Product identifiers
    productId: product.id,
    storeId: store.id,
    sellerId: seller?.id || store.sellerId,

    // Product data
    name: product.name,
    normalizedTitle: product.normalizedTitle || normalizeText(product.name),
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    tags: product.tags || [],

    // Pricing
    price: product.price,
    discountPrice: product.discountPrice,
    discount: product.discount,

    // Store location and H3 cells
    location: {
      lat: store.address?.lat,
      lng: store.address?.lng,
    },
    h3_r3: store.h3_r3,
    h3_r4: store.h3_r4,
    h3_r5: store.h3_r5,
    h3_r6: store.h3_r6,
    h3_r7: store.h3_r7,
    h3_r8: store.h3_r8,
    h3_r9: store.h3_r9,
    h3_r10: store.h3_r10,

    // Inventory
    availableNow: inventory?.availableNow || false,
    stockOnHand: inventory?.stockOnHand || 0,
    isLowStock: inventory?.isLowStock() || false,
    lastRestockedAt: inventory?.lastRestockedAt,

    // Quality scores
    productQualityScore: product.qualityScore || 0,
    sellerQualityScore: seller?.qualityScore || 0,
    storeServiceScore: store.serviceScore || 0,

    // Ratings
    productRating: product.rating || 0,
    productReviewCount: product.reviewCount || 0,
    storeRating: store.rating || 0,
    storeReviewCount: store.reviewCount || 0,
    sellerRating: seller?.rating || 0,

    // Flags
    isActive: product.isVisible !== undefined ? product.isVisible : true,
    isNew: product.isNew || false,
    isTrending: product.isTrending || false,
    isFlashDeal: product.isFlashDeal || false,
    isOpenNow: store.isOpenNow || false,

    // Metadata
    createdAt: product.createdAt,
    updatedAt: product.updatedAt || new Date(),
  };
}

/**
 * Batch index multiple products
 */
export function batchIndexProducts(products, stores, sellers, inventories) {
  const storeMap = new Map(stores.map(s => [s.id, s]));
  const sellerMap = new Map(sellers.map(s => [s.id, s]));
  const inventoryMap = new Map();
  
  // Create inventory lookup
  if (inventories) {
    inventories.forEach(inv => {
      const key = `${inv.storeId}_${inv.productId}`;
      inventoryMap.set(key, inv);
    });
  }

  return products.map(product => {
    const store = storeMap.get(product.storeId);
    if (!store) return null;

    const seller = sellerMap.get(store.sellerId);
    const invKey = `${product.storeId}_${product.productId}`;
    const inventory = inventoryMap.get(invKey);

    try {
      return createProductSearchDocument(
        indexProduct(product, store, seller, inventory),
        store,
        seller,
        inventory
      );
    } catch (error) {
      console.error(`Error indexing product ${product.id}:`, error);
      return null;
    }
  }).filter(doc => doc !== null);
}

/**
 * Normalize text for search matching
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Update inventory in search index (lightweight update)
 */
export function updateInventoryIndex(storeId, productId, inventory) {
  return {
    storeId,
    productId,
    availableNow: inventory.availableNow,
    stockOnHand: inventory.stockOnHand,
    isLowStock: inventory.isLowStock(),
    lastRestockedAt: inventory.lastRestockedAt,
    updatedAt: new Date(),
  };
}

/**
 * Update seller quality score in search index
 */
export function updateSellerScoreIndex(sellerId, qualityScore) {
  return {
    sellerId,
    sellerQualityScore: qualityScore,
    updatedAt: new Date(),
  };
}

export default {
  indexStore,
  indexProduct,
  createProductSearchDocument,
  batchIndexProducts,
  updateInventoryIndex,
  updateSellerScoreIndex,
};

