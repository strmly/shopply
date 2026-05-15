import { searchWithExpansion, getHyperlocalHomeFeed, searchByCategory } from '../services/HyperlocalSearchService.js';
import { RADIUS_TIERS, getH3CellsForTier, calculateDistance, formatDistance } from '../utils/h3Utils.js';
import { ProductService } from '../services/ProductService.js';
import { SellerService } from '../services/SellerService.js';
import { getAllInventories } from '../services/InventoryService.js';
import { getAllStores } from '../services/StoreService.js';
import { GeoIndex } from '../services/GeoIndex.js';
import { TrendingService } from '../services/TrendingService.js';
import { generateH3Cells } from '../utils/h3Utils.js';

/**
 * Hyperlocal Controller
 * Handles hyperlocal search, feed, and discovery endpoints
 */

/**
 * Get hyperlocal home feed
 * GET /api/hyperlocal/feed/home
 */
export async function getHomeFeed(req, res, next) {
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
    next(error);
  }
}

/**
 * Search with automatic radius expansion
 * GET /api/hyperlocal/search
 */
export async function search(req, res, next) {
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

    // Track views for trending
    if (results.results?.length) {
      const buyerCells = generateH3Cells(userLat, userLng);
      if (buyerCells) {
        const cellArr = Object.values(buyerCells);
        results.results.slice(0, 20).forEach(p => {
          TrendingService.trackView(p.id, cellArr);
        });
      }
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Search by category
 * GET /api/hyperlocal/category/:category
 */
export async function searchCategory(req, res, next) {
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
    next(error);
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
export async function getNearestAvailability(req, res, next) {
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
    next(error);
  }
}

/**
 * GET /api/hyperlocal/trending
 * Top trending products in the buyer's H3 cell
 */
export async function getTrending(req, res, next) {
  try {
    const { lat, lng, tier_index = 0, limit = 20 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const cells = generateH3Cells(userLat, userLng);
    const primaryCell = cells?.h3_r7 || cells?.h3_r6;

    // Real trending from TrendingService
    const topIds = primaryCell ? TrendingService.getTopForCell(primaryCell, parseInt(limit)) : [];

    if (topIds.length >= 5) {
      // Enrich with product data from GeoIndex
      const enriched = topIds.map(({ productId, trendScore }) => {
        const entry = GeoIndex.products.get(String(productId));
        if (!entry) return null;
        const distanceKm = entry.store?.address?.lat
          ? calculateDistance(userLat, userLng, entry.store.address.lat, entry.store.address.lng)
          : null;
        return {
          ...entry.product,
          trendScore,
          distanceKm,
          distanceDisplay: distanceKm != null ? formatDistance(distanceKm) : null,
        };
      }).filter(Boolean);

      return res.json({
        success: true,
        data: {
          products: enriched,
          source: 'live',
          tier: `T${tier_index}`,
          radiusKm: RADIUS_TIERS[parseInt(tier_index)]?.radiusKm,
        },
      });
    }

    // Fallback: score-based trending via search
    const tier = RADIUS_TIERS[parseInt(tier_index)] || RADIUS_TIERS[0];
    const results = await searchWithExpansion({
      query: '',
      category: null,
      userLat,
      userLng,
      minResults: parseInt(limit),
      maxTier: parseInt(tier_index) + 1,
      filters: { inStockOnly: true },
      getAllProducts: async () => ProductService.getAll(),
      getAllStores: async () => getAllStores(),
      getAllSellers: async () => SellerService.getAllSellers(),
      getAllInventories: async () => getAllInventories(),
    });

    const trending = results.results
      .sort((a, b) => {
        const sa = ((a.salesCount || 1) * (a.rating || 3)) / Math.max(a.distanceKm || 1, 0.1);
        const sb = ((b.salesCount || 1) * (b.rating || 3)) / Math.max(b.distanceKm || 1, 0.1);
        return sb - sa;
      })
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { products: trending, source: 'computed', tier: tier.id, radiusKm: tier.radiusKm },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hyperlocal/sellers
 * Top-rated sellers near the buyer
 */
export async function getNearbySellers(req, res, next) {
  try {
    const { lat, lng, tier_index = 0, limit = 20 } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const startTierIndex = parseInt(tier_index);
    const maxLimit = parseInt(limit);

    const stores = getAllStores();
    const sellers = await SellerService.getAllSellers();
    const sellerMap = new Map(sellers.map(s => [String(s.id), s]));

    const scoreStore = (store, seller) => {
      const distanceKm = calculateDistance(userLat, userLng, store.address.lat, store.address.lng);
      return {
        storeId: store.id,
        storeName: store.name,
        distanceKm,
        distanceDisplay: formatDistance(distanceKm),
        rating: store.rating || 0,
        reviewCount: store.reviewCount || 0,
        isOpenNow: store.isOpenNow || false,
        serviceScore: store.serviceScore || 0,
        sellerId: seller?.id,
        qualityScore: seller?.qualityScore || 0,
        address: { suburb: store.address?.suburb, city: store.address?.city },
      };
    };

    const sortByQuality = (arr) => arr.sort((a, b) => {
      const sa = (a.qualityScore * 0.6 + (a.rating / 5) * 0.4) / Math.max(a.distanceKm, 0.1);
      const sb = (b.qualityScore * 0.6 + (b.rating / 5) * 0.4) / Math.max(b.distanceKm, 0.1);
      return sb - sa;
    });

    // Expand tier by tier until we find sellers
    let nearbyStores = [];
    let effectiveTier = null;
    let wasAutoExpanded = false;
    let expansionReason = null;

    for (let tierIndex = startTierIndex; tierIndex < RADIUS_TIERS.length; tierIndex++) {
      const tier = RADIUS_TIERS[tierIndex];
      const h3Cells = getH3CellsForTier(userLat, userLng, tier);
      const h3Set = new Set(h3Cells);
      const cellKey = `h3_r${tier.resolution}`;

      const found = stores
        .filter(store => store.address?.lat && store.address?.lng && h3Set.has(store[cellKey]))
        .map(store => scoreStore(store, sellerMap.get(String(store.sellerId))));

      if (found.length > 0) {
        nearbyStores = found;
        effectiveTier = tier;
        if (tierIndex > startTierIndex) {
          wasAutoExpanded = true;
          expansionReason = 'no_local_sellers';
        }
        break;
      }
    }

    // Global fallback: all sellers sorted by quality
    if (nearbyStores.length === 0) {
      wasAutoExpanded = true;
      expansionReason = 'global_fallback';
      effectiveTier = RADIUS_TIERS[RADIUS_TIERS.length - 1];
      nearbyStores = stores
        .filter(store => store.address?.lat && store.address?.lng)
        .map(store => scoreStore(store, sellerMap.get(String(store.sellerId))));
    }

    sortByQuality(nearbyStores);

    res.json({
      success: true,
      data: {
        sellers: nearbyStores.slice(0, maxLimit),
        tier: effectiveTier?.id,
        tierLabel: effectiveTier?.label || 'National',
        radiusKm: effectiveTier?.radiusKm,
        wasAutoExpanded,
        expansionReason,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hyperlocal/heatmap
 * Returns per-cell product/store counts merged with live activity from TrendingService
 */
export async function getHeatmap(req, res, next) {
  try {
    const cellStats = GeoIndex.getAllCellStats();
    const activityStats = TrendingService.getAllActiveCells();
    const activityMap = new Map(activityStats.map(a => [a.h3Cell, a]));

    const heatmap = cellStats.map(stat => ({
      ...stat,
      ...(activityMap.get(stat.h3Cell) || { views: 0, carts: 0, orders: 0 }),
    })).sort((a, b) => b.productCount - a.productCount);

    res.json({ success: true, data: { cells: heatmap, totalCells: heatmap.length } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hyperlocal/seller-demand?sellerId=xxx
 * Returns top 5 trending categories near the seller's store and the effective tier.
 */
export async function getSellerDemandSignal(req, res, next) {
  try {
    const { sellerId } = req.query;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: 'sellerId query parameter is required',
      });
    }

    const stores = getAllStores();
    const sellerStore = stores.find(s => String(s.sellerId) === String(sellerId));

    if (!sellerStore) {
      return res.status(404).json({
        success: false,
        error: 'No store found for this seller',
      });
    }

    const { lat, lng } = sellerStore.address;
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Seller store has no valid coordinates',
      });
    }

    // Determine the H3 cell for the store and get trending product IDs
    const h3Cells = generateH3Cells(lat, lng);
    const primaryCell = h3Cells?.h3_r7 || h3Cells?.h3_r6;

    const topItems = primaryCell ? TrendingService.getTopForCell(primaryCell, 20) : [];

    // Determine effective tier (smallest tier that has trending data)
    let effectiveTier = RADIUS_TIERS[0];
    if (topItems.length === 0) {
      // Try wider cells
      for (let i = 1; i < RADIUS_TIERS.length; i++) {
        const tier = RADIUS_TIERS[i];
        const tierCells = getH3CellsForTier(lat, lng, tier);
        let found = false;
        for (const cell of tierCells) {
          const items = TrendingService.getTopForCell(cell, 5);
          if (items.length > 0) {
            effectiveTier = tier;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    // Enrich with category info from GeoIndex and aggregate by category
    const categoryCounts = new Map();
    for (const { productId, trendScore } of topItems) {
      const entry = GeoIndex.products.get(String(productId));
      const category = entry?.product?.category || 'Unknown';
      const existing = categoryCounts.get(category) || { category, viewCount: 0, trendScore: 0 };
      existing.viewCount++;
      existing.trendScore += trendScore;
      categoryCounts.set(category, existing);
    }

    const topCategories = Array.from(categoryCounts.values())
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 5)
      .map(c => ({
        category: c.category,
        viewCount: c.viewCount,
        trendScore: parseFloat(c.trendScore.toFixed(4)),
      }));

    res.json({
      success: true,
      data: {
        sellerId,
        storeId: sellerStore.id,
        storeName: sellerStore.name,
        effectiveTier: effectiveTier.id,
        effectiveTierLabel: effectiveTier.label,
        effectiveRadiusKm: effectiveTier.radiusKm,
        topCategories,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/hyperlocal/coverage-batch
 * Accepts { locations: [{lat, lng}] } (max 50) and returns coverage info for each.
 */
export async function getCoverageBatch(req, res, next) {
  try {
    const { locations } = req.body;

    if (!Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Body must contain a non-empty "locations" array',
      });
    }

    if (locations.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 locations allowed per batch request',
      });
    }

    const stores = getAllStores();
    const products = await ProductService.getAll();
    const inventories = getAllInventories();

    const results = [];

    for (const loc of locations) {
      const lat = parseFloat(loc.lat);
      const lng = parseFloat(loc.lng);

      if (isNaN(lat) || isNaN(lng)) {
        results.push({ lat: loc.lat, lng: loc.lng, error: 'invalid_coordinates' });
        continue;
      }

      let found = false;

      for (let tierIndex = 0; tierIndex < RADIUS_TIERS.length; tierIndex++) {
        const tier = RADIUS_TIERS[tierIndex];
        const h3Cells = getH3CellsForTier(lat, lng, tier);
        const h3Set = new Set(h3Cells);

        let count = 0;
        let nearestKm = Infinity;

        for (const product of products) {
          const store = stores.find(s => s.id === product.storeId);
          if (!store) continue;
          if (!h3Set.has(store[`h3_r${tier.resolution}`])) continue;

          const invKey = `${product.storeId}_${product.id}`;
          const inventory = inventories.find(i => `${i.storeId}_${i.productId}` === invKey);
          if (!inventory || !inventory.availableNow) continue;

          count++;
          const dist = calculateDistance(lat, lng, store.address.lat, store.address.lng);
          if (dist < nearestKm) nearestKm = dist;
          if (count >= 5) break;
        }

        if (count > 0) {
          results.push({
            lat,
            lng,
            tier: tier.id,
            tierLabel: tier.label,
            count,
            nearestKm: parseFloat(nearestKm.toFixed(3)),
          });
          found = true;
          break;
        }
      }

      if (!found) {
        results.push({ lat, lng, tier: null, tierLabel: 'No availability', count: 0, nearestKm: null });
      }
    }

    res.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getHomeFeed,
  search,
  searchCategory,
  getTiers,
  getNearestAvailability,
  getTrending,
  getNearbySellers,
  getHeatmap,
  getCoverageBatch,
  getSellerDemandSignal,
};

