import express from 'express';
import { SellerProductController } from '../controllers/SellerProductController.js';

const router = express.Router();
const sellerProductController = new SellerProductController();

/**
 * Seller Product Routes
 * All routes are prefixed with /sellers/:storeId/products
 */

// Get product statistics
router.get('/:storeId/products/stats', (req, res, next) => 
  sellerProductController.getSellerProductStats(req, res, next)
);

// Get all products for seller (with filtering and sorting)
router.get('/:storeId/products', (req, res, next) => 
  sellerProductController.getSellerProducts(req, res, next)
);

// Create new product
router.post('/:storeId/products', (req, res, next) => 
  sellerProductController.createSellerProduct(req, res, next)
);

// Bulk operations
router.post('/:storeId/products/bulk-update', (req, res, next) => 
  sellerProductController.bulkUpdateProducts(req, res, next)
);

router.post('/:storeId/products/bulk-delete', (req, res, next) => 
  sellerProductController.bulkDeleteProducts(req, res, next)
);

// Get product by ID
router.get('/:storeId/products/:id', (req, res, next) => 
  sellerProductController.getSellerProductById(req, res, next)
);

// Update product
router.put('/:storeId/products/:id', (req, res, next) => 
  sellerProductController.updateSellerProduct(req, res, next)
);

// Delete product
router.delete('/:storeId/products/:id', (req, res, next) => 
  sellerProductController.deleteSellerProduct(req, res, next)
);

// Duplicate product
router.post('/:storeId/products/:id/duplicate', (req, res, next) => 
  sellerProductController.duplicateProduct(req, res, next)
);

// Quick update operations
router.patch('/:storeId/products/:id/visibility', (req, res, next) => 
  sellerProductController.updateProductVisibility(req, res, next)
);

router.patch('/:storeId/products/:id/stock', (req, res, next) => 
  sellerProductController.updateProductStock(req, res, next)
);

router.patch('/:storeId/products/:id/price', (req, res, next) => 
  sellerProductController.updateProductPrice(req, res, next)
);

export default router;


