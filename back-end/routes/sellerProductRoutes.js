import express from 'express';
import { SellerProductController } from '../controllers/SellerProductController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();
const sellerProductController = new SellerProductController();
const sellerAuth = authorize('seller', 'admin');

router.get('/:storeId/products/stats', (req, res, next) => sellerProductController.getSellerProductStats(req, res, next));
router.get('/:storeId/products', (req, res, next) => sellerProductController.getSellerProducts(req, res, next));
router.post('/:storeId/products', sellerAuth, (req, res, next) => sellerProductController.createSellerProduct(req, res, next));
router.post('/:storeId/products/bulk-update', sellerAuth, (req, res, next) => sellerProductController.bulkUpdateProducts(req, res, next));
router.post('/:storeId/products/bulk-delete', sellerAuth, (req, res, next) => sellerProductController.bulkDeleteProducts(req, res, next));
router.get('/:storeId/products/:id', (req, res, next) => sellerProductController.getSellerProductById(req, res, next));
router.put('/:storeId/products/:id', sellerAuth, (req, res, next) => sellerProductController.updateSellerProduct(req, res, next));
router.delete('/:storeId/products/:id', sellerAuth, (req, res, next) => sellerProductController.deleteSellerProduct(req, res, next));
router.post('/:storeId/products/:id/duplicate', sellerAuth, (req, res, next) => sellerProductController.duplicateProduct(req, res, next));
router.patch('/:storeId/products/:id/visibility', sellerAuth, (req, res, next) => sellerProductController.updateProductVisibility(req, res, next));
router.patch('/:storeId/products/:id/stock', sellerAuth, (req, res, next) => sellerProductController.updateProductStock(req, res, next));
router.patch('/:storeId/products/:id/price', sellerAuth, (req, res, next) => sellerProductController.updateProductPrice(req, res, next));

export default router;
