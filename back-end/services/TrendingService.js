// back-end/services/TrendingService.js

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = join(__dirname, '../../.trending-snapshot.json');
const SNAPSHOT_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

const WINDOW_MS = 60 * 60 * 1000; // 1-hour rolling window

class TrendingServiceClass {
  constructor() {
    // Map<`${h3Cell}:${productId}`, EventEntry>
    this.events = new Map();
    this._loadSnapshot();
    setInterval(() => this._saveSnapshot(), 5 * 60 * 1000); // every 5 minutes
  }

  _key(h3Cell, productId) { return `${h3Cell}:${String(productId)}`; }

  _entry(h3Cell, productId) {
    const key = this._key(h3Cell, productId);
    let e = this.events.get(key);
    if (!e) {
      e = { h3Cell, productId: String(productId), views: 0, carts: 0, orders: 0, windowStart: Date.now() };
      this.events.set(key, e);
    }
    // Reset if window expired
    if (Date.now() - e.windowStart > WINDOW_MS) {
      e.views = 0; e.carts = 0; e.orders = 0; e.windowStart = Date.now();
    }
    return e;
  }

  // Call with an array of h3 cells (all resolutions of the buyer's location)
  trackView(productId, h3Cells = []) {
    h3Cells.forEach(cell => { this._entry(cell, productId).views++; });
  }

  trackCart(productId, h3Cells = []) {
    h3Cells.forEach(cell => { const e = this._entry(cell, productId); e.carts++; e.views++; });
  }

  trackOrder(productId, h3Cells = []) {
    h3Cells.forEach(cell => { const e = this._entry(cell, productId); e.orders++; e.carts++; });
  }

  // Returns 0-1 trend score for a product in a given cell
  getTrendScore(h3Cell, productId) {
    const e = this.events.get(this._key(h3Cell, String(productId)));
    if (!e || Date.now() - e.windowStart > WINDOW_MS) return 0;
    const raw = e.views * 1 + e.carts * 3 + e.orders * 10;
    return Math.min(1, raw / 100); // normalize — 100 weighted events = 1.0
  }

  // Top trending product IDs for a cell
  getTopForCell(h3Cell, limit = 20) {
    const results = [];
    for (const [, e] of this.events) {
      if (e.h3Cell !== h3Cell) continue;
      const score = this.getTrendScore(h3Cell, e.productId);
      if (score > 0) results.push({ productId: e.productId, trendScore: score, ...e });
    }
    return results.sort((a, b) => b.trendScore - a.trendScore).slice(0, limit);
  }

  // Summary stats per cell (for admin heatmap)
  getCellActivity(h3Cell) {
    let views = 0, carts = 0, orders = 0;
    for (const [, e] of this.events) {
      if (e.h3Cell !== h3Cell) continue;
      if (Date.now() - e.windowStart > WINDOW_MS) continue;
      views += e.views; carts += e.carts; orders += e.orders;
    }
    return { h3Cell, views, carts, orders };
  }

  getAllActiveCells() {
    const cells = new Set();
    for (const [, e] of this.events) {
      if (Date.now() - e.windowStart <= WINDOW_MS) cells.add(e.h3Cell);
    }
    return Array.from(cells).map(cell => this.getCellActivity(cell));
  }

  _loadSnapshot() {
    try {
      if (!existsSync(SNAPSHOT_PATH)) return;
      const raw = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
      if (Date.now() - raw.savedAt > SNAPSHOT_MAX_AGE_MS) return; // too old
      // restore events map: raw.events is array of [key, eventList]
      for (const [key, events] of raw.events || []) {
        this.events.set(key, events);
      }
    } catch { /* ignore corrupt snapshot */ }
  }

  _saveSnapshot() {
    try {
      const payload = {
        savedAt: Date.now(),
        events: [...this.events.entries()],
      };
      writeFileSync(SNAPSHOT_PATH, JSON.stringify(payload), 'utf8');
    } catch { /* ignore write errors */ }
  }
}

export const TrendingService = new TrendingServiceClass();
export default TrendingService;
