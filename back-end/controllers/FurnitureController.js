import FurnitureSearchService from '../services/FurnitureSearchService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  ROOMS,
  FURNITURE_CATEGORIES,
  STYLES,
  MATERIALS,
  CONDITIONS,
  COLORS,
  PRICE_RANGES,
} from '../constants/furnitureTaxonomy.js';

// In-memory stores (will be populated by seeding)
let productsStore = [];
let storesStore = [];

// Initialize search service
let searchService = null;

/**
 * Initialize furniture stores with seeded data
 */
export function initializeFurnitureStores(stores, products) {
  storesStore = stores;
  productsStore = products;
  searchService = new FurnitureSearchService(productsStore, storesStore);
  console.log(`✅ Furniture stores initialized: ${storesStore.length} stores, ${productsStore.length} products`);
}

/**
 * Get furniture home feed
 * GET /api/furniture/home
 */
export const getFurnitureHome = asyncHandler(async (req, res) => {
  const { lat, lng, tier = 'auto' } = req.query;

  if (!lat || !lng) {
    return sendError(res, 'Location (lat, lng) is required', 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Get home feed modules
  const modules = await searchService.getHomeFeedModules(latitude, longitude);

  // Build response
  const response = {
    location: { lat: latitude, lng: longitude },
    tier,
    modules: [
      {
        id: 'best-near-you',
        title: 'Best Near You',
        subtitle: `Top-rated furniture within ${modules.bestNearYou[0]?.tierOrigin || 'your area'}`,
        type: 'products',
        items: modules.bestNearYou,
      },
      {
        id: 'shop-by-room',
        title: 'Shop by Room',
        subtitle: 'Find furniture for every space',
        type: 'rooms',
        items: Object.values(ROOMS),
      },
      {
        id: 'top-rated-sellers',
        title: 'Top-Rated Sellers Nearby',
        subtitle: 'Trusted local furniture stores',
        type: 'sellers',
        items: modules.topRatedSellers,
      },
      {
        id: 'new-arrivals',
        title: 'New Arrivals Near You',
        subtitle: 'Fresh finds from local sellers',
        type: 'products',
        items: modules.newArrivals,
      },
      {
        id: 'pre-loved',
        title: 'Vintage & Pre-Loved Near You',
        subtitle: 'Quality second-hand furniture',
        type: 'products',
        items: modules.preLoved,
      },
    ],
  };

  return sendSuccess(res, response, 'Home feed loaded successfully');
});

/**
 * Search furniture with H3 expansion
 * GET /api/furniture/search
 */
export const searchFurniture = asyncHandler(async (req, res) => {
  const {
    q = '',
    lat,
    lng,
    room,
    furnitureCategory,
    condition,
    style,
    materialPrimary,
    color,
    priceMin,
    priceMax,
    assemblyRequired,
    deliveryEligible,
    stockType,
    leadTimeMaxDays,
    tier = 'auto',
    minResults = 30,
    maxResults = 100,
  } = req.query;

  if (!lat || !lng) {
    return sendError(res, 'Location (lat, lng) is required', 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  const filters = {};
  if (room) filters.room = room;
  if (furnitureCategory) filters.furnitureCategory = furnitureCategory;
  if (condition) filters.condition = condition;
  if (style) filters.style = style;
  if (materialPrimary) filters.materialPrimary = materialPrimary;
  if (color) filters.color = color;
  if (priceMin) filters.priceMin = parseFloat(priceMin);
  if (priceMax) filters.priceMax = parseFloat(priceMax);
  if (assemblyRequired !== undefined) filters.assemblyRequired = assemblyRequired === 'true';
  if (deliveryEligible !== undefined) filters.deliveryEligible = deliveryEligible === 'true';
  if (stockType) filters.stockType = stockType;
  if (leadTimeMaxDays) filters.leadTimeMaxDays = parseInt(leadTimeMaxDays);

  const results = await searchService.search({
    query: q,
    lat: latitude,
    lng: longitude,
    filters,
    minResults: parseInt(minResults),
    maxResults: parseInt(maxResults),
    tierMode: tier,
  });

  return sendSuccess(res, results, 'Search completed successfully');
});

/**
 * Get products by room
 * GET /api/furniture/room/:roomId
 */
export const getProductsByRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { lat, lng, tier = 'auto' } = req.query;

  if (!lat || !lng) {
    return sendError(res, 'Location (lat, lng) is required', 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  const results = await searchService.search({
    query: '',
    lat: latitude,
    lng: longitude,
    filters: { room: roomId },
    minResults: 40,
    maxResults: 100,
    tierMode: tier,
  });

  const room = ROOMS[roomId.toUpperCase()] || { id: roomId, label: roomId };

  return sendSuccess(res, {
    room,
    ...results,
  }, `${room.label} products loaded successfully`);
});

/**
 * Get product details
 * GET /api/furniture/product/:productId
 */
export const getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { lat, lng } = req.query;

  const product = productsStore.find(p => p.id === productId);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  const store = storesStore.find(s => s.id === product.storeId);

  if (!store) {
    return sendError(res, 'Store not found', 404);
  }

  // Calculate distance if user location provided
  let distance = null;
  let deliveryEstimate = null;

  if (lat && lng) {
    const { calculateDistance, getTierForDistance, formatDistance } = await import('../utils/h3Utils.js');
    distance = calculateDistance(parseFloat(lat), parseFloat(lng), store.address.lat, store.address.lng);
    const tier = getTierForDistance(distance);
    
    deliveryEstimate = {
      distance,
      distanceFormatted: formatDistance(distance),
      tier: tier.id,
      earliestDelivery: calculateEarliestDelivery(product.leadTimeDaysMin),
      latestDelivery: calculateEarliestDelivery(product.leadTimeDaysMax),
      deliveryFeeEstimate: store.deliveryPricing?.[tier.id] || null,
      deliveryModes: store.deliveryModes || [],
    };
  }

  const response = {
    product: product.toJSON(),
    store: store.toJSON(),
    distance,
    deliveryEstimate,
  };

  return sendSuccess(res, response, 'Product details loaded successfully');
});

/**
 * Get seller profile with products
 * GET /api/furniture/seller/:sellerId
 */
export const getSellerProfile = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { lat, lng } = req.query;

  const stores = storesStore.filter(s => s.sellerId === sellerId);

  if (stores.length === 0) {
    return sendError(res, 'Seller not found', 404);
  }

  const store = stores[0]; // Take first store for this seller
  const products = productsStore.filter(p => p.storeId === store.id && p.isVisible);

  let distance = null;
  if (lat && lng) {
    const { calculateDistance, formatDistance } = await import('../utils/h3Utils.js');
    distance = calculateDistance(parseFloat(lat), parseFloat(lng), store.address.lat, store.address.lng);
  }

  return sendSuccess(res, {
    seller: {
      id: sellerId,
      name: store.name,
      store: store.toJSON(),
      distance,
      productCount: products.length,
    },
    products: products.map(p => p.toJSON()),
  }, 'Seller profile loaded successfully');
});

/**
 * Get filter options (for UI)
 * GET /api/furniture/filters
 */
export const getFilterOptions = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    rooms: Object.values(ROOMS),
    categories: Object.values(FURNITURE_CATEGORIES),
    styles: STYLES,
    materials: MATERIALS,
    conditions: CONDITIONS,
    colors: COLORS,
    priceRanges: PRICE_RANGES,
  }, 'Filter options loaded successfully');
});

/**
 * Get furniture taxonomy (complete)
 * GET /api/furniture/taxonomy
 */
export const getTaxonomy = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    rooms: ROOMS,
    categories: FURNITURE_CATEGORIES,
    styles: STYLES,
    materials: MATERIALS,
    conditions: CONDITIONS,
    colors: COLORS,
    priceRanges: PRICE_RANGES,
  }, 'Taxonomy loaded successfully');
});

// Helper functions

function calculateEarliestDelivery(leadTimeDays) {
  const date = new Date();
  date.setDate(date.getDate() + leadTimeDays);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default {
  initializeFurnitureStores,
  getFurnitureHome,
  searchFurniture,
  getProductsByRoom,
  getProductDetails,
  getSellerProfile,
  getFilterOptions,
  getTaxonomy,
};

