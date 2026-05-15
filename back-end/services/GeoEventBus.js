import { indexStore as h3IndexStore } from './H3IndexingService.js';
import { indexProduct as h3IndexProduct } from './H3IndexingService.js';
import { calculateSellerQualityScore } from './QualityService.js';
import { GeoIndex } from './GeoIndex.js';

const listeners = new Map();

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(fn);
}

export function emit(event, data) {
  (listeners.get(event) || []).forEach(fn => { try { fn(data); } catch(e) { console.error('[GeoEventBus]', e.message); } });
}

// ── Pre-wired reactions ────────────────────────────────────

// Re-index store in H3IndexingService and GeoIndex when store changes
on('store:updated', ({ store, seller }) => {
  if (store?.address?.lat && store?.address?.lng) {
    h3IndexStore(store, seller);
    GeoIndex.indexStore(store, seller);
  }
});

// Re-index product in GeoIndex when product changes
on('product:updated', ({ product, store, seller }) => {
  if (store) {
    h3IndexProduct(product, store, seller, null);
    GeoIndex.indexProduct(product, store, seller);
  }
});

// Remove product from GeoIndex when deleted
on('product:deleted', ({ productId }) => {
  GeoIndex.removeProduct(productId);
});

// Precompute seller quality score and store it
on('seller:scored', ({ seller, store }) => {
  if (seller) {
    seller.qualityScore = calculateSellerQualityScore(seller, store);
  }
});

// Full index rebuild (called at server startup)
on('index:rebuild', async ({ getAllProducts, getAllStores, getAllSellers }) => {
  await GeoIndex.rebuild(getAllProducts, getAllStores, getAllSellers);
});

export default { on, emit };
