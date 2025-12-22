/**
 * Quality Scoring Service
 * Calculates quality scores for sellers, stores, and products
 * Used for hyperlocal ranking
 */

/**
 * Calculate Bayesian rating average
 * Prevents "5 stars from 2 reviews" from beating "4.7 from 300 reviews"
 * @param {number} rating - Current rating (0-5)
 * @param {number} count - Number of reviews
 * @param {number} globalAvg - Global average rating (default 4.0)
 * @param {number} minCount - Minimum review count for full weight (default 10)
 * @returns {number} Bayesian average (0-5)
 */
export function calculateBayesianRating(rating, count, globalAvg = 4.0, minCount = 10) {
  if (count === 0) return globalAvg;
  return (rating * count + globalAvg * minCount) / (count + minCount);
}

/**
 * Calculate seller quality score (0-1)
 * Enhanced with better Bayesian rating and stock reliability
 * Factors: rating, fulfillment, response time, trust, stock reliability
 */
export function calculateSellerQualityScore(seller, store = null) {
  const weights = {
    rating: 0.30,
    fulfillment: 0.25,
    response: 0.15,
    trust: 0.15,
    stockReliability: 0.15,
  };

  // Rating score (0-1, using Bayesian average)
  const bayesianRating = calculateBayesianRating(
    seller.rating || 0,
    seller.reviewCount || 0,
    4.0, // global average
    30   // need 30 reviews for full weight
  );
  const ratingScore = bayesianRating / 5.0;

  // Fulfillment score (on-time rate, low cancellation)
  const onTimeRate = seller.fulfillmentStats?.onTimeRate || 0.95;
  const cancellationRate = seller.fulfillmentStats?.cancellationRate || 0.05;
  const fulfillmentScore = Math.max(0, onTimeRate - cancellationRate);

  // Response score (fast chat responses)
  const avgResponseMinutes = seller.responseStats?.avgResponseMinutes || 30;
  const responseScore = Math.max(0, 1 - (avgResponseMinutes / 120)); // Perfect score at <0min, 0 at 120min+

  // Trust score (KYC verified, low disputes)
  let trustScore = 0;
  if (seller.kycVerified) trustScore += 0.5;
  if (seller.disputeRate !== undefined) {
    trustScore += Math.max(0, 0.5 * (1 - seller.disputeRate * 10)); // 10% dispute = 0 score
  } else {
    trustScore += 0.4; // Default if no disputes
  }

  // Stock reliability score (critical for hyperlocal trust)
  // Penalize sellers whose inventory data causes order failures
  let stockReliabilityScore = 1.0;
  if (store && store.stockMismatchRate !== undefined) {
    stockReliabilityScore = Math.max(0, 1 - store.stockMismatchRate * 10); // 10% mismatch = 0 score
  }

  // Calculate weighted score
  const qualityScore = 
    ratingScore * weights.rating +
    fulfillmentScore * weights.fulfillment +
    responseScore * weights.response +
    trustScore * weights.trust +
    stockReliabilityScore * weights.stockReliability;

  return Math.max(0, Math.min(1, qualityScore));
}

/**
 * Calculate product quality score (0-1)
 * Factors: rating, return rate, availability, freshness
 */
export function calculateProductQualityScore(product, inventory = null) {
  const weights = {
    rating: 0.40,
    returnRate: 0.25,
    availability: 0.20,
    freshness: 0.15,
  };

  // Rating score (Bayesian average)
  const minReviews = 3;
  const globalAvg = 4.0;
  const ratingScore = product.reviewCount > 0
    ? (product.rating * product.reviewCount + globalAvg * minReviews) / (product.reviewCount + minReviews) / 5.0
    : globalAvg / 5.0;

  // Return rate score (lower is better)
  const returnRate = product.returnRate || 0.05;
  const returnScore = Math.max(0, 1 - returnRate * 2); // 0% returns = 1.0, 50% returns = 0

  // Availability score
  let availabilityScore = 0.5; // Default
  if (inventory) {
    if (inventory.availableNow && inventory.stockOnHand > 0) {
      const stockDepth = Math.min(inventory.stockOnHand, 20) / 20; // Full score at 20+ units
      availabilityScore = 0.5 + stockDepth * 0.5;
    } else {
      availabilityScore = 0;
    }
  }

  // Freshness score (recent inventory updates boost ranking)
  let freshnessScore = 0.5;
  if (inventory && inventory.lastRestockedAt) {
    const hoursSinceRestock = (Date.now() - new Date(inventory.lastRestockedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceRestock < 24) {
      freshnessScore = 1.0; // Recently restocked
    } else if (hoursSinceRestock < 72) {
      freshnessScore = 0.8;
    } else {
      freshnessScore = 0.6;
    }
  }

  const qualityScore = 
    ratingScore * weights.rating +
    returnScore * weights.returnRate +
    availabilityScore * weights.availability +
    freshnessScore * weights.freshness;

  return Math.max(0, Math.min(1, qualityScore));
}

/**
 * Calculate store service score (0-1)
 * Factors: rating, open now, fulfillment capacity
 */
export function calculateStoreServiceScore(store) {
  const weights = {
    rating: 0.50,
    openNow: 0.30,
    capacity: 0.20,
  };

  // Rating score
  const minReviews = 5;
  const globalAvg = 4.0;
  const ratingScore = store.reviewCount > 0
    ? (store.rating * store.reviewCount + globalAvg * minReviews) / (store.reviewCount + minReviews) / 5.0
    : globalAvg / 5.0;

  // Open now score
  const openScore = store.isOpenNow ? 1.0 : 0.3; // Penalize closed stores but don't eliminate

  // Capacity score (based on order volume handling)
  const capacityScore = store.capacityScore || 0.8; // Default good capacity

  const serviceScore = 
    ratingScore * weights.rating +
    openScore * weights.openNow +
    capacityScore * weights.capacity;

  return Math.max(0, Math.min(1, serviceScore));
}

/**
 * Calculate locality score based on distance and tier
 * @param {number} distanceKm - Distance in kilometers
 * @param {Object} tier - Radius tier object
 * @returns {number} Locality score (0-1)
 */
export function calculateLocalityScore(distanceKm, tier) {
  // Base score from distance (closer is better)
  const maxDistanceInTier = tier.radiusKm;
  const distanceScore = Math.max(0, 1 - (distanceKm / maxDistanceInTier));

  // Apply tier penalty
  const tierPenalty = tier.penalty || 0;
  const localityScore = Math.max(0, distanceScore - tierPenalty);

  return localityScore;
}

/**
 * Calculate final ranking score for a product
 * Combines all factors into a single score for sorting
 */
export function calculateRankingScore({
  productQualityScore,
  sellerQualityScore,
  storeServiceScore,
  localityScore,
  priceCompetitiveness = 0.5, // Optional, normalized 0-1
  personalization = 0, // Optional, user preference boost
}) {
  const weights = {
    locality: 0.30,
    productQuality: 0.25,
    sellerQuality: 0.20,
    storeService: 0.15,
    price: 0.05,
    personalization: 0.05,
  };

  const rankingScore = 
    localityScore * weights.locality +
    productQualityScore * weights.productQuality +
    sellerQualityScore * weights.sellerQuality +
    storeServiceScore * weights.storeService +
    priceCompetitiveness * weights.price +
    personalization * weights.personalization;

  return Math.max(0, Math.min(1, rankingScore));
}

/**
 * Generate "Why this" explanations for a ranked product
 */
export function generateWhyThis({
  distanceKm,
  tier,
  productQualityScore,
  sellerQualityScore,
  storeServiceScore,
  isTopRated,
  isNew,
  stockQuantity,
}) {
  const reasons = [];

  // Distance/locality
  if (distanceKm < 1) {
    reasons.push('Very close to you');
  } else if (distanceKm < 3) {
    reasons.push('Nearby');
  }

  // Seller quality
  if (sellerQualityScore > 0.85) {
    reasons.push('Top-rated seller');
  } else if (sellerQualityScore > 0.75) {
    reasons.push('Highly rated seller');
  }

  // Product quality
  if (isTopRated || productQualityScore > 0.85) {
    reasons.push('Highly rated product');
  }

  // Store service
  if (storeServiceScore > 0.9) {
    reasons.push('Excellent service');
  }

  // Availability
  if (stockQuantity && stockQuantity > 0) {
    if (stockQuantity <= 3) {
      reasons.push(`Only ${stockQuantity} left`);
    } else {
      reasons.push('In stock');
    }
  }

  // New arrival
  if (isNew) {
    reasons.push('New arrival');
  }

  return reasons.slice(0, 3); // Return top 3 reasons
}

export default {
  calculateSellerQualityScore,
  calculateProductQualityScore,
  calculateStoreServiceScore,
  calculateLocalityScore,
  calculateRankingScore,
  generateWhyThis,
};

