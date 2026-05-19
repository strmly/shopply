import express from 'express';
import { getHomeFeed, search, searchCategory, getTiers, getNearestAvailability, getTrending, getNearbySellers, getHeatmap, getCoverageBatch, confirmDeliveryArea, getSellerDemandSignal } from '../controllers/HyperlocalController.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * Hyperlocal routes
 * Handles hyperlocal search, feed, and discovery
 */

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // 30 requests per minute per IP
  message: 'Too many requests, please slow down.',
});

// Get hyperlocal home feed
router.get('/feed/home', getHomeFeed);

// Search with radius expansion
router.get('/search', searchLimiter, search);

// Search by category
router.get('/category/:category', searchCategory);

// Get available tiers
router.get('/tiers', getTiers);

// Get nearest availability (for progressive expansion UI)
router.get('/nearest-availability', getNearestAvailability);

// Trending products near the buyer
router.get('/trending', getTrending);

// Top-rated sellers near the buyer
router.get('/sellers', getNearbySellers);

// Cell-level heatmap (product counts + live activity)
router.get('/heatmap', getHeatmap);

// Batch coverage check for multiple locations (max 50)
router.post('/coverage-batch', getCoverageBatch);

router.post('/delivery-area/confirm', confirmDeliveryArea);

// Seller demand signal — trending categories near seller's store
router.get('/seller-demand', getSellerDemandSignal);

export default router;

