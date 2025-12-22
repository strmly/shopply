import { searchWithExpansion, getHyperlocalHomeFeed, searchByCategory } from '../services/HyperlocalSearchService.js';
import { RADIUS_TIERS, getH3CellsForTier, calculateDistance } from '../utils/h3Utils.js';
import { ProductService } from '../services/ProductService.js';
import { SellerService } from '../services/SellerService.js';
import { getAllInventories } from '../services/InventoryService.js';
import { getAllStores } from '../services/StoreService.js';

/**
 * Hyperlocal Controller
 * Handles hyperlocal search, feed, and discovery endpoints
 */

/**
 * Get hyperlocal home feed
 * GET /api/hyperlocal/feed/home
 */
export async function getHomeFeed(req, res) {
  try {
    const { lat, lng, tier_index } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'User location (lat, lng) is required',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const tierIndex = tier_index ? parseInt(tier_index) : 0;
    const tier = RADIUS_TIERS[tierIndex] || RADIUS_TIERS[0];

    // Get all stores (in production, this would be from database)
    const stores = getAllStores();

    const feed = await getHyperlocalHomeFeed({
      userLat,
      userLng,
      tier,
      getAllProducts: async () => ProductService.getAll(),
      getAllStores: async () => getAllStores(),
      getAllSellers: async () => SellerService.getAllSellers(),
      getAllInventories: async () => getAllInventories(),
    });

    res.json({
      success: true,
      data: feed,
    });
  } catch (error) {
    console.error('Error getting home feed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Search with automatic radius expansion
 * GET /api/hyperlocal/search
 */
export async function search(req, res) {
  try {
    const { 
      q, 
      category, 
      lat, 
      lng, 
      min_results, 
      max_tier,
      min_price,
      max_price,
      min_rating,
      open_now,
      in_stock_only,
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'User location (lat, lng) is required',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const minResults = min_results ? parseInt(min_results) : 50;
    const maxTierIndex = max_tier ? parseInt(max_tier) : 4;

    // Build filters
    const filters = {
      inStockOnly: in_stock_only === 'true' || in_stock_only === '1',
    };

    if (min_price) filters.minPrice = parseFloat(min_price);
    if (max_price) filters.maxPrice = parseFloat(max_price);
    if (min_rating) filters.minRating = parseFloat(min_rating);
    if (open_now) filters.openNow = open_now === 'true' || open_now === '1';

    const stores = getAllStores();

    const results = await searchWithExpansion({
      query: q || '',
      category: category || null,
      userLat,
      userLng,
      minResults,
      maxTier: maxTierIndex,
      filters,
      getAllProducts: async () => ProductService.getAll(),
      getAllStores: async () => getAllStores(),
      getAllSellers: async () => SellerService.getAllSellers(),
      getAllInventories: async () => getAllInventories(),
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Search by category
 * GET /api/hyperlocal/category/:category
 */
export async function searchCategory(req, res) {
  try {
    const { category } = req.params;
    const { lat, lng, tier_index } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'User location (lat, lng) is required',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const tierIndex = tier_index ? parseInt(tier_index) : 1;
    const tier = RADIUS_TIERS[tierIndex] || RADIUS_TIERS[1];

    const stores = getAllStores();

    const results = await searchByCategory({
      category,
      userLat,
      userLng,
      tier,
      getAllProducts: async () => ProductService.getAll(),
      getAllStores: async () => getAllStores(),
      getAllSellers: async () => SellerService.getAllSellers(),
      getAllInventories: async () => getAllInventories(),
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error searching category:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get available tiers
 * GET /api/hyperlocal/tiers
 */
export function getTiers(req, res) {
  res.json({
    success: true,
    data: RADIUS_TIERS.map(tier => ({
      id: tier.id,
      label: tier.label,
      radiusKm: tier.radiusKm,
      index: RADIUS_TIERS.indexOf(tier),
    })),
  });
}


/**
 * Get nearest availability for a query (fast check for UI animation)
 * GET /api/hyperlocal/nearest-availability
 */
export async function getNearestAvailability(req, res) {
  try {
    const { q, lat, lng, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'User location (lat, lng) is required',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const stores = getAllStores();
    const products = await ProductService.getAll();
    const inventories = getAllInventories();

    // Check each tier until we find availability
    for (let tierIndex = 0; tierIndex < RADIUS_TIERS.length; tierIndex++) {
      const tier = RADIUS_TIERS[tierIndex];
      const h3Cells = getH3CellsForTier(userLat, userLng, tier);
      const h3Set = new Set(h3Cells);

      // Quick check for any matching products in this tier
      let foundCount = 0;
      let nearestDistance = Infinity;

      for (const product of products) {
        const store = stores.find(s => s.id === product.storeId);
        if (!store) continue;

        // Check H3 membership
        if (!h3Set.has(store[`h3_r${tier.resolution}`])) continue;

        // Check query match
        if (q && !product.name.toLowerCase().includes(q.toLowerCase())) continue;
        if (category && product.category !== category) continue;

        // Check availability
        const invKey = `${product.storeId}_${product.id}`;
        const inventory = inventories.find(i => `${i.storeId}_${i.productId}` === invKey);
        if (!inventory || !inventory.availableNow) continue;

        foundCount++;
        
        // Calculate distance
        const distance = calculateDistance(userLat, userLng, store.address.lat, store.address.lng);
        if (distance < nearestDistance) {
          nearestDistance = distance;
        }

        // Early exit if we found enough
        if (foundCount >= 5) break;
      }

      // If found any, return this tier
      if (foundCount > 0) {
        return res.json({
          success: true,
          data: {
            nearestTier: tier.id,
            tierLabel: tier.label,
            radiusKm: tier.radiusKm,
            nearestDistanceKm: nearestDistance,
            estimatedResults: foundCount,
          },
        });
      }
    }

    // No availability found
    res.json({
      success: true,
      data: {
        nearestTier: null,
        tierLabel: 'No availability',
        message: 'No products found within maximum radius',
      },
    });
  } catch (error) {
    console.error('Error checking nearest availability:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default {
  getHomeFeed,
  search,
  searchCategory,
  getTiers,
  getNearestAvailability,
};

