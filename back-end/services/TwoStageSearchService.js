import { RADIUS_TIERS, getH3CellsForTier, calculateDistance } from '../utils/h3Utils.js';
import { calculateLocalityScore, calculateRankingScore } from './QualityService.js';
import { getAllBadges } from './BadgeService.js';

/**
 * Two-Stage Search Service
 * Stage A: Fast candidate retrieval with lightweight scoring
 * Stage B: Full ranking with all quality signals
 * 
 * This is more performant and scalable than single-stage ranking
 */

/**
 * Stage A: Candidate Retrieval
 * Fast filtering and lightweight scoring to get top N candidates
 * 
 * @param {Object} params
 * @returns {Array} Top candidates for Stage B
 */
export function stageA_retrieveCandidates({
  products,
  stores,
  inventories,
  h3Cells,
  tier,
  userLat,
  userLng,
  query,
  category,
  filters,
  maxCandidates = 500, // Limit candidates for Stage B
}) {
  const storeMap = new Map(stores.map(s => [s.id, s]));
  const inventoryMap = new Map();
  
  inventories.forEach(inv => {
    const key = `${inv.storeId}_${inv.productId}`;
    inventoryMap.set(key, inv);
  });

  const h3Set = new Set(h3Cells);
  const candidates = [];

  // Fast filtering loop
  products.forEach(product => {
    const store = storeMap.get(product.storeId);
    if (!store) return;

    // H3 filter (fastest)
    const storeInTier = h3Set.has(store[`h3_r${tier.resolution}`]);
    if (!storeInTier) return;

    // Hard filters
    if (!passesHardFilters(product, store, filters)) return;

    // Inventory check
    const invKey = `${product.storeId}_${product.id}`;
    const inventory = inventoryMap.get(invKey);
    
    if (filters.inStockOnly && (!inventory || !inventory.availableNow)) {
      return;
    }

    // Query match (simple for Stage A)
    if (query && !simpleTextMatch(product, query)) {
      return;
    }

    // Category match
    if (category && product.category !== category) {
      return;
    }

    // Calculate distance (needed for lightweight scoring)
    const distanceKm = calculateDistance(
      userLat,
      userLng,
      store.address.lat,
      store.address.lng
    );

    // Lightweight score for initial ranking
    const lightweightScore = calculateLightweightScore(
      distanceKm,
      tier,
      product,
      store,
      inventory
    );

    candidates.push({
      product,
      store,
      inventory,
      distanceKm,
      lightweightScore,
    });
  });

  // Sort by lightweight score and take top N
  candidates.sort((a, b) => b.lightweightScore - a.lightweightScore);
  return candidates.slice(0, maxCandidates);
}

/**
 * Stage B: Full Ranking
 * Apply complete ranking algorithm with all signals
 * 
 * @param {Array} candidates - From Stage A
 * @param {Array} sellers - Seller data
 * @param {Object} tier - Current tier
 * @returns {Array} Fully ranked results
 */
export function stageB_fullRanking(candidates, sellers, tier) {
  const sellerMap = new Map(sellers.map(s => [s.id, s]));

  const rankedResults = candidates.map(({ product, store, inventory, distanceKm }) => {
    const seller = sellerMap.get(store.sellerId);

    // Calculate full locality score with tier penalty
    const localityScore = calculateLocalityScore(distanceKm, tier);

    // Calculate complete ranking score
    const rankingScore = calculateRankingScore({
      productQualityScore: product.qualityScore || 0.5,
      sellerQualityScore: seller?.qualityScore || 0.5,
      storeServiceScore: store.serviceScore || 0.5,
      localityScore,
    });

    // Get all badges
    const badges = getAllBadges(product, seller, store, inventory);

    // Generate "why this" explanations
    const whyThis = generateEnhancedWhyThis({
      distanceKm,
      tier,
      seller,
      store,
      product,
      inventory,
      badges,
    });

    return {
      ...product.toJSON(),
      distanceKm,
      tier: tier.id,
      tierLabel: tier.label,
      localityScore,
      rankingScore,
      whyThis,
      badges,
      store: {
        id: store.id,
        name: store.name,
        rating: store.rating,
        reviewCount: store.reviewCount,
        isOpenNow: store.isOpenNow,
        prepTimeP50: store.prepTimeProfile?.p50,
        pinVerified: store.pinVerificationStatus === 'verified',
      },
      seller: seller ? {
        id: seller.id,
        rating: seller.rating,
        qualityScore: seller.qualityScore,
        badges: badges.sellerBadges,
      } : null,
      inventory: inventory ? {
        availableNow: inventory.availableNow,
        stockOnHand: inventory.stockOnHand,
        isLowStock: inventory.isLowStock(),
        lastRestockedAt: inventory.lastRestockedAt,
      } : null,
    };
  });

  // Final sort by ranking score
  rankedResults.sort((a, b) => b.rankingScore - a.rankingScore);

  return rankedResults;
}

/**
 * Lightweight scoring for Stage A
 * Only considers most important factors
 */
function calculateLightweightScore(distanceKm, tier, product, store, inventory) {
  // Distance component (0-1, closer is better)
  const distanceScore = Math.max(0, 1 - (distanceKm / tier.radiusKm));
  
  // Tier penalty
  const tierPenalty = tier.penalty || 0;
  const localityComponent = Math.max(0, distanceScore - tierPenalty);

  // Basic availability
  const availabilityComponent = inventory?.availableNow ? 0.3 : 0;

  // Basic quality (simplified)
  const qualityComponent = (product.rating || 3) / 5 * 0.2;

  return localityComponent * 0.6 + availabilityComponent + qualityComponent;
}

/**
 * Enhanced "why this" generation with badges
 */
function generateEnhancedWhyThis({ distanceKm, tier, seller, store, product, inventory, badges }) {
  const reasons = [];

  // Distance
  if (distanceKm < 0.5) {
    reasons.push('Very close to you');
  } else if (distanceKm < 1.5) {
    reasons.push('Nearby');
  } else if (distanceKm < 5) {
    reasons.push(`${distanceKm.toFixed(1)}km away`);
  }

  // Seller badges
  if (badges.sellerBadges.length > 0) {
    const topBadge = badges.sellerBadges[0];
    reasons.push(topBadge.label);
  }

  // Product quality
  if (product.rating >= 4.5 && product.reviewCount >= 20) {
    reasons.push('Highly rated product');
  }

  // Availability
  if (inventory?.availableNow) {
    if (inventory.isLowStock()) {
      reasons.push(`Only ${inventory.stockOnHand} left`);
    } else {
      reasons.push('In stock');
    }
  }

  // Store specific
  if (store.pinVerificationStatus === 'verified') {
    reasons.push('Verified location');
  }

  if (store.prepTimeProfile?.p50 < 10) {
    reasons.push('Fast prep');
  }

  // New arrival
  if (product.isNew) {
    reasons.push('New arrival');
  }

  // Popular local
  if (product.localSalesCount && product.localSalesCount > 50) {
    reasons.push('Popular in your area');
  }

  return reasons.slice(0, 3); // Top 3 reasons
}

/**
 * Hard filters (must pass)
 */
function passesHardFilters(product, store, filters) {
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

  // Pin verification (optional strict mode)
  if (filters.verifiedOnly && store.pinVerificationStatus !== 'verified') {
    return false;
  }

  return true;
}

/**
 * Simple text matching for Stage A
 * Full-text search would happen in search engine in production
 */
function simpleTextMatch(product, query) {
  const searchText = query.toLowerCase();
  const productText = `${product.name} ${product.description || ''} ${product.category || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
  return productText.includes(searchText);
}

export default {
  stageA_retrieveCandidates,
  stageB_fullRanking,
};

