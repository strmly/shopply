import { latLngToCell } from 'h3-js';
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
import { scoreProductText } from '../utils/textSearch.js';
import { GeoIndex } from './GeoIndex.js';
import { TrendingService } from './TrendingService.js';
import CheckoutService from './CheckoutService.js';

/**
 * Hyperlocal Search Service
 * Implements Uber-style radius expansion and hyperlocal ranking
 */

// ---------------------------------------------------------------------------
// Home feed cell-level cache
// ---------------------------------------------------------------------------
const feedCache = new Map(); // key: h3_r6_cell, value: { data, expiresAt }
const FEED_CACHE_TTL_MS = 30_000; // 30 seconds

// ---------------------------------------------------------------------------
// Fallback data cache (used when GeoIndex is not yet initialized)
// ---------------------------------------------------------------------------
let _cachedFallbackEntries = null;
let _cachedFallbackInventories = null;
let _fallbackCacheTime = 0;
const FALLBACK_CACHE_TTL = 60_000; // 1 minute

// ---------------------------------------------------------------------------
// Time-aware boost
// ---------------------------------------------------------------------------

function getTimeBoost(category = '') {
  const hour = new Date().getHours();
  const day = new Date().getDay(); // 0=Sun, 6=Sat
  const cat = category.toLowerCase();
  const isWeekend = day === 0 || day === 6;

  // Morning (6-11): home & lifestyle
  if (hour >= 6 && hour < 11) {
    if (cat.includes('bedroom') || cat.includes('kitchen') || cat.includes('living')) return 1.15;
  }
  // Afternoon (11-17): shopping peak
  if (hour >= 11 && hour < 17) {
    if (cat.includes('furniture') || cat.includes('decor') || cat.includes('outdoor')) return 1.10;
  }
  // Evening (17-21): deals & flash
  if (hour >= 17 && hour < 21) {
    if (cat.includes('flash') || cat.includes('deal') || cat.includes('sale')) return 1.20;
  }
  // Weekend boost for all home/furniture
  if (isWeekend && (cat.includes('furniture') || cat.includes('home') || cat.includes('decor'))) return 1.08;

  return 1.0;
}

// ---------------------------------------------------------------------------
// Personalization scoring
// ---------------------------------------------------------------------------

function getPersonalizationScore(product, userId) {
  if (!userId) return 0;
  try {
    const orders = CheckoutService.getUserOrders ? CheckoutService.getUserOrders(userId) : [];
    if (!orders?.length) return 0;
    const recent = orders.slice(-10); // last 10 orders
    const categoryCounts = new Map();
    for (const order of recent) {
      for (const item of order.items || []) {
        const cat = item.category || item.cat || '';
        if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
      }
    }
    const productCat = (product.category || '').toLowerCase();
    const count = categoryCounts.get(productCat) || 0;
    return Math.min(1, count / 5); // 5 orders in category = full personalization boost
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Core filter + rank
// ---------------------------------------------------------------------------

/**
 * Filter and rank candidate entries for a specific tier.
 *
 * @param {Object} params
 * @param {Array<{product, store, seller}>} params.candidateEntries - Pre-joined entries
 * @param {Array}  params.inventories  - Flat inventory records (may be empty)
 * @param {Array}  params.h3Cells      - H3 cells for this tier
 * @param {Object} params.tier
 * @param {number} params.userLat
 * @param {number} params.userLng
 * @param {string} params.query
 * @param {string|null} params.category
 * @param {Object} params.filters
 * @param {string|null} [params.userId]
 */
function filterAndRankProducts({
  candidateEntries,
  inventories = [],
  h3Cells,
  tier,
  userLat,
  userLng,
  query,
  category,
  filters,
  userId = null,
}) {
  // Build inventory lookup
  const inventoryMap = new Map();
  inventories.forEach(inv => {
    const key = `${inv.storeId}_${inv.productId}`;
    inventoryMap.set(key, inv);
  });

  // H3 set for membership check
  const h3Set = new Set(h3Cells);

  // ── Price competitiveness: scan candidates to get per-category min/max ──
  const categoryPrices = new Map();
  candidateEntries.forEach(({ product, store }) => {
    if (!store) return;
    if (!h3Set.has(store[`h3_r${tier.resolution}`])) return;
    const cat = product.category || 'other';
    if (!categoryPrices.has(cat)) categoryPrices.set(cat, { min: Infinity, max: 0 });
    const cp = categoryPrices.get(cat);
    cp.min = Math.min(cp.min, product.price || 0);
    cp.max = Math.max(cp.max, product.price || 0);
  });

  const results = [];

  candidateEntries.forEach(({ product, store, seller }) => {
    if (!store) return;

    // Check if store is in this tier's H3 cells
    if (!h3Set.has(store[`h3_r${tier.resolution}`])) return;

    // Delivery zone — advisory only: show the product but flag whether delivery is possible
    const buyerCell = latLngToCell(userLat, userLng, tier.resolution);
    const canDeliver = !store.deliveryCells?.length || store.deliveryCells.includes(buyerCell);
    const pickupOnly = !canDeliver;

    // Apply hard filters
    if (!passesFilters(product, store, filters)) return;

    // Inventory availability
    const invKey = `${product.storeId}_${product.id}`;
    const inventory = inventoryMap.get(invKey);

    if (filters.inStockOnly && (!inventory || !inventory.availableNow)) {
      return;
    }

    // Fuzzy text matching via shared utility
    const textScore = scoreProductText(product, query);
    if (query && textScore === 0) return;

    // Category filter
    if (category && product.category !== category) return;

    // Distance
    const distanceKm = calculateDistance(
      userLat,
      userLng,
      store.address.lat,
      store.address.lng
    );

    // Locality score
    const localityScore = calculateLocalityScore(distanceKm, tier);

    // Price competitiveness
    const cat = product.category || 'other';
    const cp = categoryPrices.get(cat) || { min: 0, max: product.price || 1 };
    const priceRange = cp.max - cp.min;
    const priceCompetitiveness = priceRange > 0
      ? 1 - ((product.price || 0) - cp.min) / priceRange
      : 0.5;

    // Personalization
    const personalization = getPersonalizationScore(product, userId);

    // Base ranking score
    const baseRankingScore = calculateRankingScore({
      productQualityScore: product.qualityScore || 0.5,
      sellerQualityScore: seller?.qualityScore || 0.5,
      storeServiceScore: store.serviceScore || 0.5,
      localityScore,
      priceCompetitiveness,
      personalization,
    });

    // Time-aware boost
    const timeBoost = getTimeBoost(product.category);
    const rankingScore = baseRankingScore * timeBoost;

    // Trending boost (neighbourhood-level cell)
    const trendCell = store.h3_r7 || store.h3_r6;
    const trendBoost = trendCell ? (1 + TrendingService.getTrendScore(trendCell, product.id) * 0.15) : 1;
    const finalRankingScore = rankingScore * trendBoost;

    // Why-this explanations
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
      ...(typeof product.toJSON === 'function' ? product.toJSON() : { ...product }),
      distanceKm,
      distanceDisplay: formatDistance(distanceKm),
      tier: tier.id,
      tierLabel: tier.label,
      localityScore,
      rankingScore: finalRankingScore,
      canDeliver,
      pickupOnly,
      unrated: !product.rating || product.rating === 0,
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
        lastRestockedAt: inventory.lastRestockedAt,
        isLowStock: typeof inventory.isLowStock === 'function' ? inventory.isLowStock() : inventory.isLowStock,
      } : null,
    });
  });

  return results;
}

/**
 * Check if product passes all hard filters
 */
function passesFilters(product, store, filters) {
  if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
  // Unrated products are always included — never penalise for having no reviews yet
  if (filters.minRating !== undefined && product.rating > 0 && product.rating < filters.minRating) return false;
  if (filters.openNow && !store.isOpenNow) return false;
  if (product.isVisible === false) return false;
  return true;
}

/**
 * Global fallback: rank ALL indexed products by quality, ignoring H3 cells entirely.
 * Used only when no results survive any tier expansion.
 */
function globalFallbackRank({ candidateEntries, inventories, userLat, userLng, query, category, userId }) {
  const inventoryMap = new Map();
  inventories.forEach(inv => {
    inventoryMap.set(`${inv.storeId}_${inv.productId}`, inv);
  });

  const results = [];

  candidateEntries.forEach(({ product, store, seller }) => {
    if (!store) return;
    if (product.isVisible === false) return;
    if (category && product.category !== category) return;
    if (query && scoreProductText(product, query) === 0) return;

    const distanceKm = (store.address?.lat && store.address?.lng)
      ? calculateDistance(userLat, userLng, store.address.lat, store.address.lng)
      : 9999;

    const sellerDeliveryKm = seller?.deliveryRadiusKm || store?.policies?.deliveryRadiusKm || 0;
    const canDeliver = sellerDeliveryKm > 0 && distanceKm <= sellerDeliveryKm;
    const pickupOnly = distanceKm > 0 && !canDeliver;

    // Simple quality-weighted score for global fallback
    const qualityScore = (
      (product.qualityScore || 0.5) * 0.4 +
      (seller?.qualityScore || 0.5) * 0.3 +
      (store.serviceScore || 0.5) * 0.2 +
      Math.max(0, 1 - distanceKm / 500) * 0.1
    );

    const inventory = inventoryMap.get(`${product.storeId}_${product.id}`);

    results.push({
      ...(typeof product.toJSON === 'function' ? product.toJSON() : { ...product }),
      distanceKm,
      distanceDisplay: formatDistance(distanceKm),
      tier: 'global',
      tierLabel: 'Expanded search',
      rankingScore: qualityScore,
      canDeliver,
      pickupOnly,
      whyThis: ['Top rated nationally'],
      store: { id: store.id, name: store.name, rating: store.rating, reviewCount: store.reviewCount, isOpenNow: store.isOpenNow },
      seller: seller ? { id: seller.id, rating: seller.rating, qualityScore: seller.qualityScore } : null,
      inventory: inventory ? {
        availableNow: inventory.availableNow,
        stockOnHand: inventory.stockOnHand,
        lastRestockedAt: inventory.lastRestockedAt,
        isLowStock: typeof inventory.isLowStock === 'function' ? inventory.isLowStock() : inventory.isLowStock,
      } : null,
    });
  });

  return results.sort((a, b) => b.rankingScore - a.rankingScore);
}

// ---------------------------------------------------------------------------
// Main search entry point
// ---------------------------------------------------------------------------

/**
 * Perform hyperlocal search with automatic radius expansion.
 *
 * @param {Object} params
 * @param {string|null} [params.userId] - Optional buyer ID for personalization
 */
export async function searchWithExpansion({
  query = '',
  category = null,
  userLat,
  userLng,
  minResults = 50,
  maxTier = 4,
  filters = {},
  getAllProducts,
  getAllStores,
  getAllSellers,
  getAllInventories,
  userId = null,
}) {
  if (!userLat || !userLng) {
    throw new Error('User location is required for hyperlocal search');
  }

  const expansionSteps = [];
  let allResults = [];
  let currentTier = null;

  // Pre-fetch full scan data if GeoIndex is not ready (cached to avoid re-fetch every call)
  let fallbackEntries = null;
  let fallbackInventories = null;

  if (!GeoIndex.initialized) {
    if (!_cachedFallbackEntries || Date.now() - _fallbackCacheTime > FALLBACK_CACHE_TTL) {
      const [products, stores, sellers, inventories] = await Promise.all([
        getAllProducts(),
        getAllStores(),
        getAllSellers(),
        getAllInventories(),
      ]);
      const storeMap = new Map(stores.map(s => [s.id, s]));
      const sellerMap = new Map(sellers.map(s => [String(s.id), s]));
      _cachedFallbackEntries = products.map(p => ({
        product: p,
        store: storeMap.get(p.storeId),
        seller: sellerMap.get(String(storeMap.get(p.storeId)?.sellerId)),
      })).filter(e => e.store);
      _cachedFallbackInventories = inventories;
      _fallbackCacheTime = Date.now();
    }
    fallbackEntries = _cachedFallbackEntries;
    fallbackInventories = _cachedFallbackInventories;
  }

  for (let tierIndex = 0; tierIndex <= maxTier; tierIndex++) {
    const tier = RADIUS_TIERS[tierIndex];
    currentTier = tier;

    const h3Cells = getH3CellsForTier(userLat, userLng, tier);

    let candidateEntries;
    let inventories;

    if (GeoIndex.initialized) {
      candidateEntries = GeoIndex.getProductsInCells(h3Cells);
      inventories = await getAllInventories();
    } else {
      candidateEntries = fallbackEntries;
      inventories = fallbackInventories;
    }

    const tierResults = filterAndRankProducts({
      candidateEntries,
      inventories,
      h3Cells,
      tier,
      userLat,
      userLng,
      query,
      category,
      filters,
      userId,
    });

    expansionSteps.push({
      tier: tier.id,
      tierId: tier.id,
      label: tier.label,
      radiusKm: tier.radiusKm,
      resultsFound: tierResults.length,
    });

    allResults = allResults.concat(tierResults);

    if (allResults.length >= minResults) break;
  }

  // ── Phase 2: force-expand beyond maxTier if still empty ──────────────────
  let wasAutoExpanded = false;
  let expansionReason = null;

  if (allResults.length === 0 && maxTier < RADIUS_TIERS.length - 1) {
    wasAutoExpanded = true;
    expansionReason = 'no_local_results';

    for (let tierIndex = maxTier + 1; tierIndex < RADIUS_TIERS.length; tierIndex++) {
      const tier = RADIUS_TIERS[tierIndex];
      currentTier = tier;

      const h3Cells = getH3CellsForTier(userLat, userLng, tier);
      let candidateEntries;
      let inventories;

      if (GeoIndex.initialized) {
        candidateEntries = GeoIndex.getProductsInCells(h3Cells);
        inventories = await getAllInventories();
      } else {
        candidateEntries = fallbackEntries;
        inventories = fallbackInventories;
      }

      const tierResults = filterAndRankProducts({
        candidateEntries,
        inventories,
        h3Cells,
        tier,
        userLat,
        userLng,
        query,
        category,
        filters,
        userId,
      });

      expansionSteps.push({
        tier: tier.id,
        tierId: tier.id,
        label: tier.label,
        radiusKm: tier.radiusKm,
        resultsFound: tierResults.length,
        autoExpanded: true,
      });

      allResults = allResults.concat(tierResults);
      if (allResults.length > 0) break;
    }
  }

  // ── Phase 3: global fallback — show best nationally if all tiers exhausted ─
  if (allResults.length === 0) {
    wasAutoExpanded = true;
    expansionReason = 'global_fallback';
    currentTier = RADIUS_TIERS[RADIUS_TIERS.length - 1];

    const allCandidates = GeoIndex.initialized
      ? [...GeoIndex.products.values()]
      : (fallbackEntries || []);
    const globalInventories = GeoIndex.initialized
      ? await getAllInventories()
      : (fallbackInventories || []);

    allResults = globalFallbackRank({
      candidateEntries: allCandidates,
      inventories: globalInventories,
      userLat,
      userLng,
      query,
      category,
      userId,
    });

    expansionSteps.push({
      tier: 'global',
      tierId: 'global',
      label: 'National',
      radiusKm: null,
      resultsFound: allResults.length,
      autoExpanded: true,
    });
  }

  allResults.sort((a, b) => b.rankingScore - a.rankingScore);
  const finalResults = allResults.slice(0, 100);

  return {
    results: finalResults,
    effectiveTier: currentTier.id,
    effectiveRadiusKm: currentTier.radiusKm,
    tierLabel: currentTier.label,
    expanded: expansionSteps.length > 1,
    wasAutoExpanded,
    expansionReason,
    expansionSteps,
    totalResults: finalResults.length,
    query,
    category,
  };
}

// ---------------------------------------------------------------------------
// Multi-resolution home feed
// ---------------------------------------------------------------------------

/**
 * Get hyperlocal home feed spanning three radius levels.
 */
export async function getHyperlocalHomeFeed({
  userLat,
  userLng,
  tier = RADIUS_TIERS[0],
  getAllProducts,
  getAllStores,
  getAllSellers,
  getAllInventories,
  userId = null,
}) {
  if (!userLat || !userLng) throw new Error('User location is required');

  // ── Cell-level feed cache ─────────────────────────────────────────────────
  const cacheKey = latLngToCell(userLat, userLng, 6);
  const cached = feedCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  // Ensure we have inventory data for the fallback path
  let inventories = [];
  let fallbackEntries = null;

  if (!GeoIndex.initialized) {
    if (!_cachedFallbackEntries || Date.now() - _fallbackCacheTime > FALLBACK_CACHE_TTL) {
      const [products, stores, sellers, invs] = await Promise.all([
        getAllProducts(),
        getAllStores(),
        getAllSellers(),
        getAllInventories(),
      ]);
      inventories = invs;
      const storeMap = new Map(stores.map(s => [s.id, s]));
      const sellerMap = new Map(sellers.map(s => [String(s.id), s]));
      _cachedFallbackEntries = products.map(p => ({
        product: p,
        store: storeMap.get(p.storeId),
        seller: sellerMap.get(String(storeMap.get(p.storeId)?.sellerId)),
      })).filter(e => e.store);
      _cachedFallbackInventories = invs;
      _fallbackCacheTime = Date.now();
    }
    fallbackEntries = _cachedFallbackEntries;
    inventories = _cachedFallbackInventories;
  } else {
    inventories = await getAllInventories();
  }

  // Run three resolution levels in parallel for richer feed
  const baseTiers = [RADIUS_TIERS[0], RADIUS_TIERS[1], RADIUS_TIERS[2]]; // T0 1km, T1 5km, T2 10km
  const [nearResults, hoodResults, cityResults] = await Promise.all(
    baseTiers.map(t => {
      const h3Cells = getH3CellsForTier(userLat, userLng, t);
      const entries = GeoIndex.initialized
        ? GeoIndex.getProductsInCells(h3Cells)
        : (fallbackEntries || []);
      return Promise.resolve(filterAndRankProducts({
        candidateEntries: entries,
        inventories,
        h3Cells,
        tier: t,
        userLat,
        userLng,
        query: '',
        category: null,
        filters: { inStockOnly: false },
        userId,
      }));
    })
  );

  // De-duplicate across resolutions (prefer nearest result for same productId)
  const seen = new Set();
  const dedup = (arr) => arr.filter(p => {
    if (seen.has(String(p.id))) return false;
    seen.add(String(p.id));
    return true;
  });

  let near = dedup(nearResults.sort((a, b) => b.rankingScore - a.rankingScore));
  let hood = dedup(hoodResults.sort((a, b) => b.rankingScore - a.rankingScore));
  let city = dedup(cityResults.sort((a, b) => b.rankingScore - a.rankingScore));

  // ── Never-empty guarantee: expand to T3/T4 if base tiers returned nothing ──
  let wasAutoExpanded = false;
  let expansionReason = null;
  let expandedTierLabel = null;

  const baseTotal = near.length + hood.length + city.length;

  if (baseTotal === 0) {
    wasAutoExpanded = true;
    expansionReason = 'no_local_results';

    // Try T3 (35km) and T4 (110km)
    for (const t of [RADIUS_TIERS[3], RADIUS_TIERS[4]]) {
      if (!t) continue;
      const h3Cells = getH3CellsForTier(userLat, userLng, t);
      const entries = GeoIndex.initialized
        ? GeoIndex.getProductsInCells(h3Cells)
        : (fallbackEntries || []);
      const widerResults = filterAndRankProducts({
        candidateEntries: entries,
        inventories,
        h3Cells,
        tier: t,
        userLat,
        userLng,
        query: '',
        category: null,
        filters: { inStockOnly: false },
        userId,
      });
      if (widerResults.length > 0) {
        city = dedup(widerResults.sort((a, b) => b.rankingScore - a.rankingScore));
        expandedTierLabel = t.label;
        break;
      }
    }

    // Ultimate fallback: global best products regardless of location
    if (city.length === 0) {
      expansionReason = 'global_fallback';
      expandedTierLabel = 'National';
      const allCandidates = GeoIndex.initialized
        ? [...GeoIndex.products.values()]
        : (fallbackEntries || []);
      const global = globalFallbackRank({
        candidateEntries: allCandidates,
        inventories,
        userLat,
        userLng,
        query: '',
        category: null,
        userId,
      });
      city = global.filter(p => {
        if (seen.has(String(p.id))) return false;
        seen.add(String(p.id));
        return true;
      });
    }
  }

  const modules = {
    topNearYou: (near.length > 0 ? near : city).slice(0, 10),
    bestSellersNearby: [...near, ...hood, ...city]
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)
      .slice(0, 10),
    topRatedSellers: getTopRatedSellersProducts([...near, ...hood, ...city]).slice(0, 10),
    freshRestocks: [...near, ...hood, ...city]
      .filter(p => p.inventory?.lastRestockedAt)
      .sort((a, b) => new Date(b.inventory.lastRestockedAt) - new Date(a.inventory.lastRestockedAt))
      .slice(0, 10),
    flashDeals: [...near, ...hood, ...city].filter(p => p.isFlashDeal).slice(0, 10),
    newArrivals: [...near, ...hood, ...city].filter(p => p.isNew).slice(0, 10),
    cityWide: city.slice(0, 10),
  };

  const totalProducts = near.length + hood.length + city.length;

  const result = {
    modules,
    tier: baseTiers[0].id,
    tierLabel: wasAutoExpanded ? (expandedTierLabel || 'Expanded') : baseTiers[0].label,
    radiusKm: baseTiers[0].radiusKm,
    totalProducts,
    wasAutoExpanded,
    expansionReason,
    resolutions: {
      near: { label: 'Within 1km', count: near.length },
      neighbourhood: { label: 'Within 5km', count: hood.length },
      city: { label: wasAutoExpanded ? (expandedTierLabel || 'Expanded area') : 'Within 10km', count: city.length },
    },
  };

  feedCache.set(cacheKey, { data: result, expiresAt: Date.now() + FEED_CACHE_TTL_MS });
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get products from top-rated sellers
 */
function getTopRatedSellersProducts(products) {
  const sellerProducts = new Map();

  products.forEach(p => {
    if (!p.seller) return;
    if (!sellerProducts.has(p.seller.id)) {
      sellerProducts.set(p.seller.id, { seller: p.seller, products: [] });
    }
    sellerProducts.get(p.seller.id).products.push(p);
  });

  const sortedSellers = Array.from(sellerProducts.values())
    .sort((a, b) => (b.seller.qualityScore || 0) - (a.seller.qualityScore || 0));

  const results = [];
  sortedSellers.slice(0, 5).forEach(({ products }) => {
    results.push(...products.slice(0, 2));
  });

  return results;
}

// ---------------------------------------------------------------------------
// Category search
// ---------------------------------------------------------------------------

/**
 * Search products by category with hyperlocal ranking
 */
export async function searchByCategory({
  category,
  userLat,
  userLng,
  tier = RADIUS_TIERS[1],
  getAllProducts,
  getAllStores,
  getAllSellers,
  getAllInventories,
  userId = null,
}) {
  return searchWithExpansion({
    query: '',
    category,
    userLat,
    userLng,
    minResults: 30,
    maxTier: 4,
    filters: { inStockOnly: false },
    getAllProducts,
    getAllStores,
    getAllSellers,
    getAllInventories,
    userId,
  });
}

export default {
  searchWithExpansion,
  getHyperlocalHomeFeed,
  searchByCategory,
};
