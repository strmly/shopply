import express from 'express';
import { CommunityController } from '../controllers/CommunityController.js';

const router = express.Router();
const communityController = new CommunityController();

/**
 * Community Routes
 */
router.get('/feed', (req, res, next) => communityController.getFeed(req, res, next));
router.get('/posts/:id', (req, res, next) => communityController.getPost(req, res, next));
router.post('/posts', (req, res, next) => communityController.createPost(req, res, next));
router.get('/recommendations', (req, res, next) => communityController.getRecommendations(req, res, next));
router.get('/bundles/:bundleType', (req, res, next) => communityController.getBundleProducts(req, res, next));
router.get('/bundles/:bundleType/curated', (req, res, next) => communityController.getCuratedItems(req, res, next));
router.post('/bundles/:bundleType/items', (req, res, next) => communityController.addItemToBundle(req, res, next));
router.delete('/bundles/:bundleType/items/:productId', (req, res, next) => communityController.removeItemFromBundle(req, res, next));
router.get('/bundles/:bundleType/items/:productId/curated', (req, res, next) => communityController.checkUserCurated(req, res, next));
router.get('/trending', (req, res, next) => communityController.getTrending(req, res, next));

// Product-specific community routes
router.get('/products/:id/reviews', (req, res, next) => communityController.getProductReviews(req, res, next));
router.get('/products/:id/rating', (req, res, next) => communityController.getProductRating(req, res, next));
router.get('/products/:id/questions', (req, res, next) => communityController.getProductQuestions(req, res, next));

export default router;
