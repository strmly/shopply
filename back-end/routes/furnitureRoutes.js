import express from 'express';
import {
  getFurnitureHome,
  searchFurniture,
  getProductsByRoom,
  getProductDetails,
  getSellerProfile,
  getFilterOptions,
  getTaxonomy,
} from '../controllers/FurnitureController.js';

const router = express.Router();

/**
 * Furniture Marketplace Routes
 * All routes are prefixed with /api/furniture
 */

// Home feed with hyperlocal modules
router.get('/home', getFurnitureHome);

// Search furniture with filters and H3 expansion
router.get('/search', searchFurniture);

// Browse by room
router.get('/room/:roomId', getProductsByRoom);

// Product details
router.get('/product/:productId', getProductDetails);

// Seller profile
router.get('/seller/:sellerId', getSellerProfile);

// Filter options (for UI dropdowns)
router.get('/filters', getFilterOptions);

// Complete taxonomy
router.get('/taxonomy', getTaxonomy);

export default router;

