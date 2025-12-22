import express from 'express';
import { SearchController } from '../controllers/SearchController.js';

const router = express.Router();
const searchController = new SearchController();

/**
 * Search Routes
 */
router.get('/suggestions', (req, res, next) => searchController.getSuggestions(req, res, next));
router.get('/recent', (req, res, next) => searchController.getRecentSearches(req, res, next));
router.get('/trending', (req, res, next) => searchController.getTrendingSearches(req, res, next));
router.get('/repeat-purchases', (req, res, next) => searchController.getRepeatPurchases(req, res, next));
router.get('/shortcuts', (req, res, next) => searchController.getSmartShortcuts(req, res, next));
router.get('/stores', (req, res, next) => searchController.searchStores(req, res, next));
router.get('/products', (req, res, next) => searchController.searchProducts(req, res, next));
router.delete('/recent', (req, res, next) => searchController.removeRecentSearch(req, res, next));

export default router;

