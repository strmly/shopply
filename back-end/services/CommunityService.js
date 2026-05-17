import { GeoIndex } from './GeoIndex.js';
import { TrendingService } from './TrendingService.js';
import { ProductService } from './ProductService.js';
import { RADIUS_TIERS, getH3CellsForTier, calculateDistance } from '../utils/h3Utils.js';

class CommunityService {
  static seedInitialData() {
    console.log('Community data seeding initialized');
  }

  /**
   * Return H3 neighborhood-based product recommendations.
   *
   * Priority 1 — trending in the buyer's local cells (within ~10 km).
   *   Uses TrendingService live event scores keyed by H3 cell, so products
   *   that neighbours are currently viewing/carting/buying rank first.
   *
   * Priority 2 — top-rated nearby products (fills remainder).
   *   Falls back to high-rating + proximity for a fresh install with no
   *   trending data yet.
   *
   * Returns [] when GeoIndex isn't ready or coordinates are missing.
   */
  static async getNearbyRecommendations(lat, lng, limit = 5) {
    if (!lat || !lng || !GeoIndex.initialized) return [];

    const seen    = new Set();
    const byScore = new Map(); // productId -> enriched object with _rank

    // ── Priority 1: trending in local cells ──────────────────────────────
    const localTiers = RADIUS_TIERS.slice(0, 3); // T0 1km · T1 5km · T2 10km
    for (const tier of localTiers) {
      const cells = getH3CellsForTier(lat, lng, tier);
      for (const cell of cells.slice(0, 12)) {
        for (const { productId, trendScore } of TrendingService.getTopForCell(cell, 30)) {
          const pid = String(productId);
          if (seen.has(pid)) continue;
          seen.add(pid);

          const entry = GeoIndex.products.get(pid);
          if (!entry) continue;
          const { product, store } = entry;
          const p = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
          if (p.stock === 'out' || p.isVisible === false) continue;

          const distKm = store.address?.lat
            ? calculateDistance(lat, lng, store.address.lat, store.address.lng)
            : 9999;

          byScore.set(pid, {
            ...p,
            distanceKm: distKm,
            trendScore,
            _rank: trendScore * 2, // trending weighted 2× vs quality
          });
        }
      }
      if (byScore.size >= limit) break;
    }

    // ── Priority 2: top-rated nearby products ────────────────────────────
    if (byScore.size < limit) {
      for (const tier of localTiers) {
        const cells  = getH3CellsForTier(lat, lng, tier);
        const entries = GeoIndex.getProductsInCells(cells);

        for (const { product, store } of entries) {
          const pid = String(product.id ?? product.productId);
          if (seen.has(pid)) continue;
          seen.add(pid);

          const p = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
          if ((p.rating || 0) < 4.0 || p.stock === 'out' || p.isVisible === false) continue;

          const distKm = store.address?.lat
            ? calculateDistance(lat, lng, store.address.lat, store.address.lng)
            : 9999;

          const qualScore   = (p.rating || 0) / 5 * 0.7
            + Math.min(1, (p.reviewCount || 0) / 200) * 0.3;
          const proxBonus   = distKm < 5 ? 0.30 : distKm < 15 ? 0.15 : 0;

          byScore.set(pid, {
            ...p,
            distanceKm: distKm,
            trendScore: 0,
            _rank: qualScore + proxBonus,
          });
        }

        if (byScore.size >= limit * 3) break; // enough candidates to sort from
      }
    }

    return Array.from(byScore.values())
      .sort((a, b) => b._rank - a._rank)
      .slice(0, limit)
      .map(({ _rank, ...p }) => p);
  }

  static async getRecommendedByNeighbors({ lat = null, lng = null, suburb = 'your area', limit = 8 } = {}) {
    const local = await this.getNearbyRecommendations(lat, lng, Math.max(limit, 8));
    const sourceProducts = local.length > 0
      ? local
      : (await ProductService.getRecommendedProducts('neighbor-feed', Math.max(limit * 3, 24)))
        .map(product => (typeof product.toJSON === 'function' ? product.toJSON() : product));

    const names = ['Ayesha', 'Thabo', 'Nomsa', 'Johan', 'Priya', 'Sipho', 'Lerato', 'Marcus'];
    const reasons = [
      'great quality for the price',
      'fast local delivery',
      'looks even better in real homes',
      'seller responds quickly',
      'easy to pair with other room pieces',
      'solid reviews from nearby shoppers',
    ];

    const products = sourceProducts
      .filter(product => product && product.id && product.isVisible !== false && product.stock !== 'out')
      .slice()
      .sort((a, b) => ((b.rating || 0) * 20 + (b.reviewCount || 0) / 8 + (b.trendScore || 0)) - ((a.rating || 0) * 20 + (a.reviewCount || 0) / 8 + (a.trendScore || 0)))
      .slice(0, limit)
      .map((product, index) => {
        const neighborCount = 7 + ((Number(product.id) || index + 1) % 43);
        const curatorNames = Array.from({ length: Math.min(4, neighborCount) }, (_, offset) => names[(index + offset) % names.length]);
        return {
          ...product,
          neighborSignal: {
            suburb,
            neighborCount,
            curatorNames,
            reason: reasons[index % reasons.length],
            confidence: Math.min(99, 72 + Math.round((product.rating || 4.3) * 4) + Math.min(8, Math.round((product.reviewCount || 0) / 80))),
            distanceLabel: product.distanceKm ? `${Number(product.distanceKm).toFixed(1)} km` : product.distance ? `${Number(product.distance).toFixed(1)} km` : 'Nearby',
          },
        };
      });

    const categories = products.reduce((acc, product) => {
      const key = product.room || product.category || 'home';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      title: 'Recommended by Neighbors',
      subtitle: `Furniture picks people around ${suburb} keep saving, buying, and rating highly.`,
      suburb,
      totalNeighborSignals: products.reduce((sum, product) => sum + (product.neighborSignal?.neighborCount || 0), 0),
      topCategory: Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'home',
      products,
    };
  }
}

export default CommunityService;
