import express from 'express';
import { ProductController } from '../controllers/ProductController.js';

const router = express.Router();
const productController = new ProductController();

/**
 * Product Routes
 */
router.get('/hot', (req, res, next) => productController.getHotProducts(req, res, next));
router.get('/flash-deals', (req, res, next) => productController.getFlashDeals(req, res, next));
router.get('/new-arrivals', (req, res, next) => productController.getNewArrivals(req, res, next));
router.get('/recommended', (req, res, next) => productController.getRecommended(req, res, next));
router.get('/bundles', (req, res, next) => productController.getBundles(req, res, next));
router.get('/fast-delivery', (req, res, next) => productController.getFastDeliveryProducts(req, res, next));
router.get('/:id/related', (req, res, next) => productController.getRelatedProducts(req, res, next));
router.get('/:id/frequently-bought-together', (req, res, next) => productController.getFrequentlyBoughtTogether(req, res, next));
router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));
router.get('/', (req, res, next) => productController.getAllProducts(req, res, next));
router.post('/', (req, res, next) => productController.createProduct(req, res, next));
router.put('/:id', (req, res, next) => productController.updateProduct(req, res, next));
router.delete('/:id', (req, res, next) => productController.deleteProduct(req, res, next));

export default router;

