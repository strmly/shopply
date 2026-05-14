import express from 'express';
import { SellerController } from '../controllers/SellerController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();
const sellerController = new SellerController();

router.get('/', (req, res, next) => sellerController.getAllSellers(req, res, next));
router.get('/learn-more', (req, res, next) => sellerController.getSellerLearnMoreContent(req, res, next));
router.get('/become-a-seller/stats', (req, res, next) => sellerController.getBecomeSellerStats(req, res, next));
router.post('/become-a-seller', requireAuth, (req, res, next) => sellerController.createBecomeSellerApplication(req, res, next));
router.post('/onboarding', requireAuth, (req, res, next) => sellerController.createOnboarding(req, res, next));
router.get('/onboarding/:id', requireAuth, (req, res, next) => sellerController.getOnboarding(req, res, next));
router.patch('/onboarding/:id', authorize('seller', 'admin'), (req, res, next) => sellerController.updateOnboarding(req, res, next));
router.post('/onboarding/:id/complete', authorize('seller', 'admin'), (req, res, next) => sellerController.completeOnboarding(req, res, next));
router.get('/:id/hours', (req, res, next) => sellerController.getStoreHours(req, res, next));
router.put('/:id/hours', authorize('seller', 'admin'), (req, res, next) => sellerController.updateStoreHours(req, res, next));
router.get('/:id', (req, res, next) => sellerController.getSellerById(req, res, next));
router.get('/:id/products', (req, res, next) => sellerController.getSellerProducts(req, res, next));

export default router;
