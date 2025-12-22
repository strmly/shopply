import express from 'express';
import HyperlocalController from '../controllers/HyperlocalController.js';

const router = express.Router();

/**
 * Hyperlocal routes
 * Handles hyperlocal search, feed, and discovery
 */

// Get hyperlocal home feed
router.get('/feed/home', HyperlocalController.getHomeFeed);

// Search with radius expansion
router.get('/search', HyperlocalController.search);

// Search by category
router.get('/category/:category', HyperlocalController.searchCategory);

// Get available tiers
router.get('/tiers', HyperlocalController.getTiers);

// Get nearest availability (for progressive expansion UI)
router.get('/nearest-availability', HyperlocalController.getNearestAvailability);

export default router;

