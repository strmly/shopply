/**
 * Badge Service
 * Determines quality badges for sellers, stores, and products
 * Badges are used in UI and ranking
 */

/**
 * Get seller badges based on quality metrics
 * @param {Object} seller - Seller with quality metrics
 * @param {Object} store - Associated store (optional)
 * @returns {Array} Array of badge objects
 */
export function getSellerBadges(seller, store = null) {
  const badges = [];

  // Top Rated Seller
  // Requires: high quality score + sufficient reviews + low issues
  if (seller.qualityScore >= 0.85 && 
      seller.reviewCount >= 30 &&
      (seller.fulfillmentStats?.cancellationRate || 0) < 0.05 &&
      (seller.disputeRate || 0) < 0.02) {
    badges.push({
      type: 'top_rated_seller',
      label: 'Top Rated Seller',
      icon: '⭐',
      color: '#FFD700',
      priority: 1,
    });
  }

  // Fast Prep (if store data available)
  if (store && store.prepTimeProfile) {
    // Fast if p50 is below category baseline (15 minutes for most)
    const categoryBaseline = 15;
    if (store.prepTimeProfile.p50 < categoryBaseline * 0.7) {
      badges.push({
        type: 'fast_prep',
        label: 'Fast Prep',
        icon: '⚡',
        color: '#FF9500',
        priority: 2,
      });
    }
  }

  // Reliable Stock
  // Low stock mismatch rate (orders failing due to inventory issues)
  if (store && (store.stockMismatchRate || 0) < 0.03) {
    badges.push({
      type: 'reliable_stock',
      label: 'Reliable Stock',
      icon: '✓',
      color: '#4CAF50',
      priority: 3,
    });
  }

  // Verified KYC
  if (seller.kycVerified) {
    badges.push({
      type: 'verified',
      label: 'Verified',
      icon: '✓',
      color: '#2196F3',
      priority: 4,
    });
  }

  // Fast Response
  if (seller.responseStats?.avgResponseMinutes < 5) {
    badges.push({
      type: 'fast_response',
      label: 'Fast Response',
      icon: '💬',
      color: '#9C27B0',
      priority: 5,
    });
  }

  // Sort by priority
  badges.sort((a, b) => a.priority - b.priority);

  return badges;
}

/**
 * Get product badges based on quality and availability
 * @param {Object} product - Product with quality metrics
 * @param {Object} inventory - Product inventory
 * @returns {Array} Array of badge objects
 */
export function getProductBadges(product, inventory = null) {
  const badges = [];

  // Highly Rated Product
  if (product.rating >= 4.5 && product.reviewCount >= 20) {
    badges.push({
      type: 'highly_rated',
      label: 'Highly Rated',
      icon: '⭐',
      color: '#FFD700',
    });
  }

  // Low Returns
  if (product.returnRate !== undefined && product.returnRate < 0.02 && product.reviewCount >= 10) {
    badges.push({
      type: 'low_returns',
      label: 'Low Returns',
      icon: '✓',
      color: '#4CAF50',
    });
  }

  // Popular in Area (would need area-specific sales data)
  if (product.localSalesCount && product.localSalesCount > 50) {
    badges.push({
      type: 'popular_local',
      label: 'Popular Here',
      icon: '🔥',
      color: '#FF5722',
    });
  }

  return badges;
}

/**
 * Get availability badges for display
 * @param {Object} inventory - Inventory object
 * @param {Object} store - Store object
 * @returns {Array} Array of badge objects
 */
export function getAvailabilityBadges(inventory, store) {
  const badges = [];

  if (!inventory) return badges;

  // In Stock
  if (inventory.availableNow && inventory.stockOnHand > inventory.lowStockThreshold) {
    badges.push({
      type: 'in_stock',
      label: 'In Stock',
      icon: '✓',
      color: '#4CAF50',
    });
  }

  // Low Stock Warning
  if (inventory.availableNow && inventory.isLowStock()) {
    badges.push({
      type: 'low_stock',
      label: `Only ${inventory.stockOnHand} left`,
      icon: '⚠️',
      color: '#FF9800',
      urgent: true,
    });
  }

  // Recently Restocked
  if (inventory.lastRestockedAt) {
    const hoursSince = (Date.now() - new Date(inventory.lastRestockedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      badges.push({
        type: 'fresh_restock',
        label: 'Recently Restocked',
        icon: '📦',
        color: '#2196F3',
      });
    }
  }

  // Fast Delivery (if store has fast prep)
  if (store && store.prepTimeProfile?.p50 < 10) {
    badges.push({
      type: 'fast_delivery',
      label: 'Fast Prep',
      icon: '⚡',
      color: '#FF9500',
    });
  }

  return badges;
}

/**
 * Determine if a seller should show badges in search results
 * Only show badges if they're meaningful and verified
 * @param {Object} seller
 * @returns {boolean}
 */
export function shouldShowSellerBadges(seller) {
  return seller.reviewCount >= 10 && seller.qualityScore > 0.6;
}

/**
 * Get all badges for a product result (combines seller + product + availability)
 * @param {Object} product
 * @param {Object} seller
 * @param {Object} store
 * @param {Object} inventory
 * @returns {Object} { sellerBadges, productBadges, availabilityBadges }
 */
export function getAllBadges(product, seller, store, inventory) {
  return {
    sellerBadges: seller ? getSellerBadges(seller, store) : [],
    productBadges: product ? getProductBadges(product, inventory) : [],
    availabilityBadges: inventory ? getAvailabilityBadges(inventory, store) : [],
  };
}

export default {
  getSellerBadges,
  getProductBadges,
  getAvailabilityBadges,
  shouldShowSellerBadges,
  getAllBadges,
};

