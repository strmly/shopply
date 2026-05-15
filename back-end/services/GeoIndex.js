// back-end/services/GeoIndex.js
import { generateH3Cells } from '../utils/h3Utils.js';

class GeoIndexClass {
  constructor() {
    // Map<h3Cell, Set<productId>>  — one entry per resolution per store
    this.productsByCell = new Map();
    // Map<productId, { product, store, seller }>  — enriched data
    this.products = new Map();
    // Map<h3Cell, Set<storeId>>
    this.sellersByCell = new Map();
    // Map<storeId, { store, seller }>
    this.stores = new Map();
    this.initialized = false;
    this.ready = false;
  }

  /* ── Internal helpers ─────────────────────────────────── */

  _storeH3Keys(store) {
    return ['h3_r3','h3_r4','h3_r5','h3_r6','h3_r7','h3_r8','h3_r9']
      .map(k => store[k]).filter(Boolean);
  }

  /* ── Product indexing ─────────────────────────────────── */

  indexProduct(product, store, seller) {
    if (!store) return;
    const pid = String(product.id ?? product.productId);
    this.products.set(pid, { product, store, seller });
    for (const cell of this._storeH3Keys(store)) {
      if (!this.productsByCell.has(cell)) this.productsByCell.set(cell, new Set());
      this.productsByCell.get(cell).add(pid);
    }
    // Also index into delivery cells if seller has a delivery radius
    if (store.deliveryCells?.length) {
      for (const cell of store.deliveryCells) {
        if (!this.productsByCell.has(cell)) this.productsByCell.set(cell, new Set());
        this.productsByCell.get(cell).add(pid);
      }
    }
  }

  removeProduct(productId) {
    const pid = String(productId);
    const entry = this.products.get(pid);
    if (!entry) return;
    for (const cell of this._storeH3Keys(entry.store)) {
      this.productsByCell.get(cell)?.delete(pid);
    }
    if (entry.store.deliveryCells?.length) {
      for (const cell of entry.store.deliveryCells) {
        this.productsByCell.get(cell)?.delete(pid);
      }
    }
    this.products.delete(pid);
  }

  /* ── Store/seller indexing ────────────────────────────── */

  indexStore(store, seller) {
    const sid = String(store.id);
    this.stores.set(sid, { store, seller });
    for (const cell of this._storeH3Keys(store)) {
      if (!this.sellersByCell.has(cell)) this.sellersByCell.set(cell, new Set());
      this.sellersByCell.get(cell).add(sid);
    }
  }

  removeStore(storeId) {
    const sid = String(storeId);
    const entry = this.stores.get(sid);
    if (!entry) return;
    for (const cell of this._storeH3Keys(entry.store)) {
      this.sellersByCell.get(cell)?.delete(sid);
    }
    this.stores.delete(sid);
  }

  /* ── Queries ──────────────────────────────────────────── */

  getProductsInCells(h3Cells) {
    const seen = new Set();
    const results = [];
    for (const cell of h3Cells) {
      const ids = this.productsByCell.get(cell);
      if (!ids) continue;
      for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        const entry = this.products.get(id);
        if (entry) results.push(entry);
      }
    }
    return results;
  }

  getStoresInCells(h3Cells) {
    const seen = new Set();
    const results = [];
    for (const cell of h3Cells) {
      const ids = this.sellersByCell.get(cell);
      if (!ids) continue;
      for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        const entry = this.stores.get(id);
        if (entry) results.push(entry);
      }
    }
    return results;
  }

  // Stats for a set of cells (used by heatmap)
  getCellStats(h3Cell) {
    return {
      h3Cell,
      productCount: this.productsByCell.get(h3Cell)?.size ?? 0,
      storeCount: this.sellersByCell.get(h3Cell)?.size ?? 0,
    };
  }

  // All indexed cells with stats (for admin heatmap)
  getAllCellStats() {
    const cells = new Set([
      ...this.productsByCell.keys(),
      ...this.sellersByCell.keys(),
    ]);
    return Array.from(cells).map(cell => this.getCellStats(cell))
      .filter(s => s.productCount > 0 || s.storeCount > 0);
  }

  /* ── Full rebuild ─────────────────────────────────────── */

  async rebuild(getAllProducts, getAllStores, getAllSellers) {
    this.productsByCell.clear();
    this.products.clear();
    this.sellersByCell.clear();
    this.stores.clear();

    const [products, stores, sellers] = await Promise.all([
      getAllProducts(), getAllStores(), getAllSellers(),
    ]);

    const storeMap = new Map(stores.map(s => [String(s.id), s]));
    const sellerMap = new Map(sellers.map(s => [String(s.id), s]));

    for (const store of stores) {
      const seller = sellerMap.get(String(store.sellerId));
      this.indexStore(store, seller);
    }
    for (const product of products) {
      const store = storeMap.get(String(product.storeId));
      if (!store) continue;
      const seller = sellerMap.get(String(store.sellerId));
      this.indexProduct(product, store, seller);
    }
    this.initialized = true;
    this.ready = true;
    console.log(`[GeoIndex] Rebuilt: ${this.products.size} products across ${this.productsByCell.size} cells`);
  }
}

export const GeoIndex = new GeoIndexClass();
export default GeoIndex;
