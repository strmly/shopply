import express from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { addInterest, removeInterest } from '../services/NotificationInterestService.js';

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
router.get('/top-rated', (req, res, next) => productController.getTopRated(req, res, next));
router.get('/fast-delivery', (req, res, next) => productController.getFastDeliveryProducts(req, res, next));
/**
 * POST /api/products/:id/notify-interest
 * Body: { storeId, email }
 * Registers interest in back-in-stock notification for this product at the given store.
 */
router.post('/:id/notify-interest', (req, res, next) => {
  try {
    const productId = req.params.id;
    const { storeId, email } = req.body;

    if (!storeId || !email) {
      return res.status(400).json({ success: false, error: 'storeId and email are required' });
    }

    addInterest(productId, storeId, email);

    res.json({
      success: true,
      message: `You will be notified at ${email} when this product is back in stock.`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/products/:id/notify-interest
 * Body: { storeId, email }
 * Removes a previously registered back-in-stock notification interest.
 */
router.delete('/:id/notify-interest', (req, res, next) => {
  try {
    const productId = req.params.id;
    const { storeId, email } = req.body;

    if (!storeId || !email) {
      return res.status(400).json({ success: false, error: 'storeId and email are required' });
    }

    const removed = removeInterest(productId, storeId, email);

    res.json({
      success: true,
      removed,
      message: removed ? 'Notification interest removed.' : 'No matching interest found.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/related', (req, res, next) => productController.getRelatedProducts(req, res, next));
router.get('/:id/frequently-bought-together', (req, res, next) => productController.getFrequentlyBoughtTogether(req, res, next));
router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));
router.get('/', (req, res, next) => productController.getAllProducts(req, res, next));
router.post('/', (req, res, next) => productController.createProduct(req, res, next));
router.put('/:id', (req, res, next) => productController.updateProduct(req, res, next));
router.delete('/:id', (req, res, next) => productController.deleteProduct(req, res, next));

export default router;

