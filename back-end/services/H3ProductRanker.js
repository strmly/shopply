// Shared H3-aware product ranking used by all product feed endpoints.
// Expands geographic tiers until minResults candidates are found, then
// scores each by: proximity × quality × (1 + trend_boost).

import { GeoIndex } from './GeoIndex.js';
import { TrendingService } from './TrendingService.js';
import { RADIUS_TIERS, getH3CellsForTier, calculateDistance } from '../utils/h3Utils.js';

function proximityScore(distanceKm) {
  if (distanceKm <= 1)   return 1.00;
  if (distanceKm <= 5)   return 0.85;
  if (distanceKm <= 15)  return 0.65;
  if (distanceKm <= 35)  return 0.45;
  if (distanceKm <= 100) return 0.25;
  return 0.10;
}

function deliveryDaysLabel(distanceKm) {
  if (distanceKm < 30)  return '1–2 days';
  if (distanceKm < 100) return '2–3 days';
  if (distanceKm < 400) return '3–5 days';
  return '5–7 days';
}

/**
 * Return H3-ranked products from the GeoIndex with tier expansion.
 *
 * Returns null when GeoIndex is not ready or coordinates are missing —
 * callers should fall back to the flat ProductService path in that case.
 *
 * @param {number}   lat
 * @param {number}   lng
 * @param {Function} filterFn  (plainProductObject) => boolean
 * @param {object}   opts
 * @param {number}   opts.limit       max results returned
 * @param {number}   opts.minResults  stop tier expansion once this many candidates found
 */
export async function getRanked(lat, lng, filterFn = () => true, { limit = 10, minResults } = {}) {
  if (!GeoIndex.initialized || !lat || !lng) return null;
  minResults = minResults ?? limit;

  const seen = new Set();
  const candidates = [];

  for (const tier of RADIUS_TIERS) {
    const cells = getH3CellsForTier(lat, lng, tier);
    const entries = GeoIndex.getProductsInCells(cells);

    for (const { product, store } of entries) {
      const pid = String(product.id ?? product.productId);
      if (seen.has(pid)) continue;
      seen.add(pid);

      const p = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };
      if (!filterFn(p)) continue;

      const sLat = store.address?.lat;
      const sLng = store.address?.lng;
      if (!sLat || !sLng) continue;

      const distKm = calculateDistance(lat, lng, sLat, sLng);
      const proxScore = proximityScore(distKm);

      const qualScore = p.qualityScore
        ?? ((p.rating || 0) / 5 * 0.7 + Math.min(1, (p.reviewCount || 0) / 200) * 0.3);

      const trendCell = store.h3_r7 || store.h3_r6;
      const trendBoost = trendCell ? TrendingService.getTrendScore(trendCell, p.id) : 0;

      candidates.push({
        ...p,
        distanceKm: distKm,
        deliveryDays: deliveryDaysLabel(distKm),
        storeLocation: {
          lat: sLat,
          lng: sLng,
          suburb: store.address?.suburb,
          city: store.address?.city,
        },
        _rankScore: proxScore * qualScore * (1 + trendBoost * 0.5),
      });
    }

    if (candidates.length >= minResults) break;
  }

  return candidates
    .sort((a, b) => b._rankScore - a._rankScore)
    .slice(0, limit)
    .map(({ _rankScore, ...p }) => p);
}
