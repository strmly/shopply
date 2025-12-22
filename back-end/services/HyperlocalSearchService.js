import { 
  RADIUS_TIERS, 
  getH3CellsForTier, 
  calculateDistance, 
  getTierForDistance,
  formatDistance 
} from '../utils/h3Utils.js';
import {
  calculateLocalityScore,
  calculateRankingScore,
  generateWhyThis,
} from './QualityService.js';

/**
 * Hyperlocal Search Service
 * Implements Uber-style radius expansion and hyperlocal ranking
 */

/**
 * Perform hyperlocal search with automatic radius expansion
 * @param {Object} params - Search parameters
 * @returns {Object} Search results with expansion metadata
 */
export async function searchWithExpansion({
  query = '',
  category = null,
  userLat,
  userLng,
  minResults = 50,
  maxTier = 4, // T4 by default
  filters = {},
  getAllProducts, // Function to fetch products from database
  getAllStores, // Function to fetch stores
  getAllSellers, // Function to fetch sellers
  getAllInventories, // Function to fetch inventories
}) {
  if (!userLat || !userLng) {
    throw new Error('User location is required for hyperlocal search');
  }

  const expansionSteps = [];
  let allResults = [];
  let currentTier = null;

  // Iterate through tiers until we have enough results
  for (let tierIndex = 0; tierIndex <= maxTier; tierIndex++) {
    const tier = RADIUS_TIERS[tierIndex];
    currentTier = tier;

    // Get H3 cells for this tier
    const h3Cells = getH3CellsForTier(userLat, userLng, tier);

    // Fetch products, stores, sellers, inventories
    const products = await getAllProducts();
    const stores = await getAllStores();
    const sellers = await getAllSellers();
    const inventories = await getAllInventories();

    // Filter products within this tier's H3 cells
    const tierResults = filterAndRankProducts({
      products,
      stores,
      sellers,
      inventories,
      h3Cells,
      tier,
      userLat,
      userLng,
      query,
      category,
      filters,
    });

    expansionSteps.push({
      tier: tier.id,
      tierId: tier.id,
      label: tier.label,
      radiusKm: tier.radiusKm,
      resultsFound: tierResults.length,
    });

    allResults = allResults.concat(tierResults);

    // Stop if we have enough results
    if (allResults.length >= minResults) {
      break;
    }
  }

  // Sort all results by ranking score
  allResults.sort((a, b) => b.rankingScore - a.rankingScore);

  // Take top results
  const finalResults = allResults.slice(0, 100); // Cap at 100 results

  return {
    results: finalResults,
    effectiveTier: currentTier.id,
    effectiveRadiusKm: currentTier.radiusKm,
    tierLabel: currentTier.label,
    expanded: expansionSteps.length > 1,
    expansionSteps,
    totalResults: finalResults.length,
    query,
    category,
  };
}

/**
 * Filter and rank products for a specific tier
 */
function filterAndRankProducts({
  products,
  stores,
  sellers,
  inventories,
  h3Cells,
  tier,
  userLat,
  userLng,
  query,
  category,
  filters,
}) {
  // Create lookup maps
  const storeMap = new Map(stores.map(s => [s.id, s]));
  const sellerMap = new Map(sellers.map(s => [s.id, s]));
  const inventoryMap = new Map();
  
  inventories.forEach(inv => {
    const key = `${inv.storeId}_${inv.productId}`;
    inventoryMap.set(key, inv);
  });

  // Convert h3Cells to Set for fast lookup
  const h3Set = new Set(h3Cells);

  const results = [];

  products.forEach(product => {
    const store = storeMap.get(product.storeId);
    if (!store) return;

    // Check if store is in this tier's H3 cells
    const storeInTier = h3Set.has(store[`h3_r${tier.resolution}`]);
    if (!storeInTier) return;

    // Apply hard filters
    if (!passesFilters(product, store, filters)) return;

    // Check inventory availability
    const invKey = `${product.storeId}_${product.id}`;
    const inventory = inventoryMap.get(invKey);
    
    if (filters.inStockOnly && (!inventory || !inventory.availableNow)) {
      return;
    }

    // Check query match (simple text search)
    if (query && !matchesQuery(product, query)) {
      return;
    }

    // Check category match
    if (category && product.category !== category) {
      return;
    }

    const seller = sellerMap.get(store.sellerId);

    // Calculate distance
    const distanceKm = calculateDistance(
      userLat,
      userLng,
      store.address.lat,
      store.address.lng
    );

    // Calculate locality score
    const localityScore = calculateLocalityScore(distanceKm, tier);

    // Calculate ranking score
    const rankingScore = calculateRankingScore({
      productQualityScore: product.qualityScore || 0.5,
      sellerQualityScore: seller?.qualityScore || 0.5,
      storeServiceScore: store.serviceScore || 0.5,
      localityScore,
    });

    // Generate why-this reasons
    const whyThis = generateWhyThis({
      distanceKm,
      tier,
      productQualityScore: product.qualityScore || 0,
      sellerQualityScore: seller?.qualityScore || 0,
      storeServiceScore: store.serviceScore || 0,
      isTopRated: (product.rating || 0) >= 4.5,
      isNew: product.isNew,
      stockQuantity: inventory?.stockOnHand,
    });

    results.push({
      ...product.toJSON(),
      distanceKm,
      distanceDisplay: formatDistance(distanceKm),
      tier: tier.id,
      tierLabel: tier.label,
      localityScore,
      rankingScore,
      whyThis,
      store: {
        id: store.id,
        name: store.name,
        rating: store.rating,
        reviewCount: store.reviewCount,
        isOpenNow: store.isOpenNow,
      },
      seller: seller ? {
        id: seller.id,
        rating: seller.rating,
        qualityScore: seller.qualityScore,
      } : null,
      inventory: inventory ? {
        availableNow: inventory.availableNow,
        stockOnHand: inventory.stockOnHand,
        isLowStock: inventory.isLowStock(),
      } : null,
    });
  });

  return results;
}

/**
 * Check if product passes all filters
 */
function passesFilters(product, store, filters) {
  // Price range
  if (filters.minPrice !== undefined && product.price < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
    return false;
  }

  // Rating
  if (filters.minRating !== undefined && (product.rating || 0) < filters.minRating) {
    return false;
  }

  // Store open now
  if (filters.openNow && !store.isOpenNow) {
    return false;
  }

  // Active/visible
  if (product.isVisible === false) {
    return false;
  }

  return true;
}

/**
 * Check if product matches search query
 */
function matchesQuery(product, query) {
  const searchText = query.toLowerCase();
  const productText = `${product.name} ${product.description || ''} ${product.category || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
  return productText.includes(searchText);
}

/**
 * Get hyperlocal home feed with multiple modules
 */
export async function getHyperlocalHomeFeed({
  userLat,
  userLng,
  tier = RADIUS_TIERS[0], // Default to T0 (1km)
  getAllProducts,
  getAllStores,
  getAllSellers,
  getAllInventories,
}) {
  if (!userLat || !userLng) {
    throw new Error('User location is required');
  }

  // Get H3 cells for tier
  const h3Cells = getH3CellsForTier(userLat, userLng, tier);

  // Fetch all data
  const products = await getAllProducts();
  const stores = await getAllStores();
  const sellers = await getAllSellers();
  const inventories = await getAllInventories();

  // Filter and rank products
  const rankedProducts = filterAndRankProducts({
    products,
    stores,
    sellers,
    inventories,
    h3Cells,
    tier,
    userLat,
    userLng,
    query: '',
    category: null,
    filters: { inStockOnly: true },
  });

  // Create feed modules
  const modules = {
    topNearYou: rankedProducts.slice(0, 10),
    bestSellersNearby: rankedProducts
      .filter(p => p.salesCount > 10)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 10),
    topRatedSellers: getTopRatedSellersProducts(rankedProducts).slice(0, 10),
    freshRestocks: rankedProducts
      .filter(p => p.inventory?.lastRestockedAt)
      .sort((a, b) => new Date(b.inventory.lastRestockedAt) - new Date(a.inventory.lastRestockedAt))
      .slice(0, 10),
    flashDeals: rankedProducts
      .filter(p => p.isFlashDeal)
      .slice(0, 10),
    newArrivals: rankedProducts
      .filter(p => p.isNew)
      .slice(0, 10),
  };

  return {
    modules,
    tier: tier.id,
    tierLabel: tier.label,
    radiusKm: tier.radiusKm,
    totalProducts: rankedProducts.length,
  };
}

/**
 * Get products from top-rated sellers
 */
function getTopRatedSellersProducts(products) {
  // Group by seller, find highest rated sellers
  const sellerProducts = new Map();
  
  products.forEach(p => {
    if (!p.seller) return;
    if (!sellerProducts.has(p.seller.id)) {
      sellerProducts.set(p.seller.id, {
        seller: p.seller,
        products: [],
      });
    }
    sellerProducts.get(p.seller.id).products.push(p);
  });

  // Sort sellers by quality score
  const sortedSellers = Array.from(sellerProducts.values())
    .sort((a, b) => (b.seller.qualityScore || 0) - (a.seller.qualityScore || 0));

  // Take top products from top sellers
  const results = [];
  sortedSellers.slice(0, 5).forEach(({ products }) => {
    results.push(...products.slice(0, 2)); // 2 products per top seller
  });

  return results;
}

/**
 * Search products by category with hyperlocal ranking
 */
export async function searchByCategory({
  category,
  userLat,
  userLng,
  tier = RADIUS_TIERS[1], // Default to T1 (5km) for categories
  getAllProducts,
  getAllStores,
  getAllSellers,
  getAllInventories,
}) {
  return searchWithExpansion({
    query: '',
    category,
    userLat,
    userLng,
    minResults: 30,
    maxTier: 2, // Expand up to T2 for categories
    filters: { inStockOnly: true },
    getAllProducts,
    getAllStores,
    getAllSellers,
    getAllInventories,
  });
}

export default {
  searchWithExpansion,
  getHyperlocalHomeFeed,
  searchByCategory,
};

