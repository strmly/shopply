import { 
  getH3CellsForTier, 
  calculateDistance, 
  RADIUS_TIERS,
  getTierForDistance,
  formatDistance,
} from '../utils/h3Utils.js';
import { SEARCH_SYNONYMS } from '../constants/furnitureTaxonomy.js';

/**
 * Furniture Search and Ranking Service
 * Implements Uber-style H3 expansion with furniture-specific ranking
 */

class FurnitureSearchService {
  constructor(productsStore, storesStore) {
    this.productsStore = productsStore;
    this.storesStore = storesStore;
  }

  /**
   * Main search method with H3 tier expansion
   */
  async search(options) {
    const {
      query = '',
      lat,
      lng,
      filters = {},
      minResults = 30,
      maxResults = 100,
      tierMode = 'auto', // 'auto' | 'T0' | 'T1' | 'T2' | 'T3' | 'T4'
    } = options;

    if (!lat || !lng) {
      throw new Error('User location (lat, lng) is required for furniture search');
    }

    let results = [];
    let currentTierIndex = 0;
    let expandedToTier = null;

    // If specific tier requested, use it directly
    if (tierMode !== 'auto') {
      const tier = RADIUS_TIERS.find(t => t.id === tierMode);
      if (tier) {
        results = await this.searchInTier(lat, lng, tier, query, filters);
        expandedToTier = tier;
      }
    } else {
      // Auto-expand through tiers until minResults reached
      while (currentTierIndex < RADIUS_TIERS.length && results.length < minResults) {
        const tier = RADIUS_TIERS[currentTierIndex];
        const tierResults = await this.searchInTier(lat, lng, tier, query, filters);
        
        // Merge with existing results (deduplicate)
        tierResults.forEach(product => {
          if (!results.find(p => p.id === product.id)) {
            results.push(product);
          }
        });

        expandedToTier = tier;
        currentTierIndex++;

        // Early exit if we have enough results
        if (results.length >= minResults) break;
      }
    }

    // Rank and score all results
    const rankedResults = this.rankProducts(results, { lat, lng, query, filters });

    // Limit to maxResults
    const finalResults = rankedResults.slice(0, maxResults);

    return {
      products: finalResults,
      metadata: {
        totalFound: results.length,
        returned: finalResults.length,
        tierUsed: expandedToTier?.id || 'T0',
        tierLabel: expandedToTier?.label || 'Within 1km',
        radiusKm: expandedToTier?.radiusKm || 1,
        query,
        filters,
      },
    };
  }

  /**
   * Search within a specific H3 tier
   */
  async searchInTier(lat, lng, tier, query, filters) {
    // Get H3 cells for this tier
    const h3Cells = getH3CellsForTier(lat, lng, tier);
    const h3FieldName = `h3_r${tier.resolution}`;

    // Get all stores in these H3 cells
    const storesInCells = this.storesStore.filter(store => 
      h3Cells.includes(store[h3FieldName]) && store.isActive
    );

    if (storesInCells.length === 0) {
      return [];
    }

    const storeIds = storesInCells.map(s => s.id);

    // Get products from these stores
    let products = this.productsStore.filter(product => 
      storeIds.includes(product.storeId) && product.isVisible
    );

    // Apply search query
    if (query && query.trim()) {
      products = this.applyTextSearch(products, query);
    }

    // Apply filters
    products = this.applyFilters(products, filters);

    // Attach store data and calculate distance
    products = products.map(product => {
      const store = storesInCells.find(s => s.id === product.storeId);
      if (!store) return null;

      const distance = calculateDistance(
        lat, lng,
        store.address.lat, store.address.lng
      );

      return {
        ...product.toJSON(),
        store: store.toJSON(),
        distance,
        distanceFormatted: formatDistance(distance),
        tierOrigin: tier.id,
      };
    }).filter(p => p !== null);

    return products;
  }

  /**
   * Apply text search with synonym expansion
   */
  applyTextSearch(products, query) {
    const queryLower = query.toLowerCase().trim();
    const queryTerms = queryLower.split(/\s+/);

    // Expand with synonyms
    const expandedTerms = [...queryTerms];
    Object.entries(SEARCH_SYNONYMS).forEach(([key, synonyms]) => {
      if (queryTerms.some(term => synonyms.includes(term) || term === key)) {
        expandedTerms.push(key, ...synonyms);
      }
    });

    return products.filter(product => {
      const searchText = [
        product.name,
        product.description,
        product.room,
        product.furnitureCategory,
        product.style,
        product.materialPrimary,
        product.tags?.join(' '),
      ].join(' ').toLowerCase();

      return expandedTerms.some(term => searchText.includes(term));
    });
  }

  /**
   * Apply filters (room, category, condition, material, price, etc.)
   */
  applyFilters(products, filters) {
    let filtered = [...products];

    if (filters.room) {
      filtered = filtered.filter(p => p.room === filters.room);
    }

    if (filters.furnitureCategory) {
      filtered = filtered.filter(p => p.furnitureCategory === filters.furnitureCategory);
    }

    if (filters.condition) {
      filtered = filtered.filter(p => p.condition === filters.condition);
    }

    if (filters.style) {
      filtered = filtered.filter(p => p.style === filters.style);
    }

    if (filters.materialPrimary) {
      filtered = filtered.filter(p => p.materialPrimary === filters.materialPrimary);
    }

    if (filters.color) {
      filtered = filtered.filter(p => p.color === filters.color);
    }

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(p => {
        const price = p.discountPrice || p.price;
        return price >= filters.priceMin;
      });
    }

    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(p => {
        const price = p.discountPrice || p.price;
        return price <= filters.priceMax;
      });
    }

    if (filters.assemblyRequired !== undefined) {
      filtered = filtered.filter(p => p.assemblyRequired === filters.assemblyRequired);
    }

    if (filters.deliveryEligible !== undefined) {
      filtered = filtered.filter(p => p.deliveryEligible === filters.deliveryEligible);
    }

    if (filters.stockType) {
      filtered = filtered.filter(p => p.stockType === filters.stockType);
    }

    if (filters.leadTimeMaxDays !== undefined) {
      filtered = filtered.filter(p => p.leadTimeDaysMax <= filters.leadTimeMaxDays);
    }

    return filtered;
  }

  /**
   * Two-stage ranking: Quality + Locality + Relevance + Logistics
   */
  rankProducts(products, context) {
    const { lat, lng, query, filters } = context;

    const scoredProducts = products.map(product => {
      const scores = {
        locality: this.calculateLocalityScore(product, lat, lng),
        sellerQuality: this.calculateSellerQualityScore(product.store),
        productQuality: this.calculateProductQualityScore(product),
        logistics: this.calculateLogisticsScore(product),
        relevance: this.calculateRelevanceScore(product, query, filters),
        freshness: this.calculateFreshnessScore(product),
        priceValue: this.calculatePriceValueScore(product),
      };

      // Weighted final score
      const finalScore = (
        scores.locality * 0.25 +
        scores.sellerQuality * 0.20 +
        scores.productQuality * 0.20 +
        scores.logistics * 0.15 +
        scores.relevance * 0.10 +
        scores.freshness * 0.05 +
        scores.priceValue * 0.05
      );

      return {
        ...product,
        rankingScores: scores,
        finalScore,
      };
    });

    // Sort by final score (descending)
    scoredProducts.sort((a, b) => b.finalScore - a.finalScore);

    return scoredProducts;
  }

  /**
   * Locality Score: Distance + Tier Penalty
   */
  calculateLocalityScore(product, userLat, userLng) {
    const distance = product.distance;
    const tier = getTierForDistance(distance);
    
    // Base score: inverse of distance (closer = higher)
    let score = 1 - (distance / 100); // Normalize to 100km max
    
    // Apply tier penalty
    score = score * (1 - tier.penalty);
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Seller Quality Score: Rating + Reliability
   */
  calculateSellerQualityScore(store) {
    if (!store) return 0.5;
    
    const ratingScore = (store.ratingAvgBayesian || store.rating || 3.5) / 5.0;
    const reliabilityScore = store.reliabilityScore || 0.9;
    const onTimeScore = store.onTimeRate || 0.9;
    
    return (ratingScore * 0.4 + reliabilityScore * 0.3 + onTimeScore * 0.3);
  }

  /**
   * Product Quality Score: Rating + Return Rate
   */
  calculateProductQualityScore(product) {
    const ratingScore = (product.rating || 4.0) / 5.0;
    const returnRateScore = 1 - (product.returnRate || 0.05);
    const reviewCountBoost = Math.min(product.reviewCount / 100, 0.2); // Max 0.2 boost
    
    return Math.min(1, ratingScore * 0.6 + returnRateScore * 0.3 + reviewCountBoost);
  }

  /**
   * Logistics Score: Delivery + Lead Time + Stock
   */
  calculateLogisticsScore(product) {
    let score = 0.7; // Base score
    
    // Delivery eligible bonus
    if (product.deliveryEligible) {
      score += 0.1;
    }
    
    // Lead time bonus (faster = better)
    const leadTime = product.leadTimeDaysMax || 3;
    if (leadTime <= 1) {
      score += 0.15;
    } else if (leadTime <= 3) {
      score += 0.10;
    } else if (leadTime <= 7) {
      score += 0.05;
    }
    
    // Stock type bonus
    if (product.stockType === 'in_stock') {
      score += 0.05;
    }
    
    // Penalty for missing dimensions
    if (!product.dimensions || !product.dimensionsSnippet) {
      score -= 0.1;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Relevance Score: Query match quality
   */
  calculateRelevanceScore(product, query, filters) {
    if (!query || !query.trim()) {
      return 0.5; // Neutral if no query
    }
    
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Exact match in name (highest)
    if (product.name.toLowerCase().includes(queryLower)) {
      score += 0.5;
    }
    
    // Match in category
    if (product.furnitureCategory?.includes(queryLower)) {
      score += 0.3;
    }
    
    // Match in tags
    if (product.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 0.2;
    }
    
    return Math.min(1, score);
  }

  /**
   * Freshness Score: New arrivals boost
   */
  calculateFreshnessScore(product) {
    if (product.isNew) return 1.0;
    
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    
    if (ageInDays <= 7) return 0.9;
    if (ageInDays <= 30) return 0.7;
    if (ageInDays <= 90) return 0.5;
    return 0.3;
  }

  /**
   * Price Value Score: Relative value within category
   */
  calculatePriceValueScore(product) {
    // Simplified: Favor discounted items
    if (product.discountPrice && product.discount > 0) {
      return 0.5 + (product.discount / 200); // Max 0.5 bonus for 100% discount
    }
    return 0.5; // Neutral
  }

  /**
   * Get products for home feed modules
   */
  async getHomeFeedModules(lat, lng) {
    const modules = {};

    // Best near you (T0 + T1)
    const bestNearby = await this.search({
      lat,
      lng,
      minResults: 20,
      maxResults: 20,
      tierMode: 'T1',
    });
    modules.bestNearYou = bestNearby.products;

    // Top rated sellers nearby
    modules.topRatedSellers = await this.getTopRatedSellers(lat, lng);

    // New arrivals near you
    const newArrivals = await this.search({
      lat,
      lng,
      filters: { /* could add isNew filter */ },
      minResults: 15,
      maxResults: 15,
      tierMode: 'T1',
    });
    modules.newArrivals = newArrivals.products.filter(p => p.isNew);

    // Pre-loved near you
    const preLoved = await this.search({
      lat,
      lng,
      filters: { condition: 'used' },
      minResults: 12,
      maxResults: 12,
      tierMode: 'T2',
    });
    modules.preLoved = preLoved.products;

    // Trending in your suburb
    const trending = await this.search({
      lat,
      lng,
      minResults: 12,
      maxResults: 12,
      tierMode: 'T0',
    });
    modules.trending = trending.products.filter(p => p.isTrending);

    return modules;
  }

  /**
   * Get top-rated sellers near user
   */
  async getTopRatedSellers(lat, lng) {
    const tier = RADIUS_TIERS[1]; // T1
    const h3Cells = getH3CellsForTier(lat, lng, tier);
    const h3FieldName = `h3_r${tier.resolution}`;

    const stores = this.storesStore
      .filter(store => h3Cells.includes(store[h3FieldName]) && store.isActive)
      .map(store => {
        const distance = calculateDistance(lat, lng, store.address.lat, store.address.lng);
        return {
          ...store.toJSON(),
          distance,
          distanceFormatted: formatDistance(distance),
        };
      })
      .sort((a, b) => {
        const scoreA = (a.storeQualityScore || 0) * (a.ratingAvgBayesian || 0);
        const scoreB = (b.storeQualityScore || 0) * (b.ratingAvgBayesian || 0);
        return scoreB - scoreA;
      })
      .slice(0, 10);

    return stores;
  }
}

export default FurnitureSearchService;

