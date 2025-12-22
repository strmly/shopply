import express from 'express';
import { ReviewController } from '../controllers/ReviewController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
const reviewController = new ReviewController();

// Get pending reviews for a user
router.get('/user/:userId/pending', asyncHandler((req, res, next) => 
  reviewController.getPendingReviews(req, res, next)
));

// Get review summary for quick action card
router.get('/user/:userId/summary', asyncHandler((req, res, next) => 
  reviewController.getReviewSummary(req, res, next)
));

// Get user's reviews
router.get('/user/:userId', asyncHandler((req, res, next) => 
  reviewController.getUserReviews(req, res, next)
));

// Get reviews for a product
router.get('/product/:productId', asyncHandler((req, res, next) => 
  reviewController.getProductReviews(req, res, next)
));

// Get review by ID
router.get('/:reviewId', asyncHandler((req, res, next) => 
  reviewController.getReviewById(req, res, next)
));

// Create a new review
router.post('/', asyncHandler((req, res, next) => 
  reviewController.createReview(req, res, next)
));

// Update a review
router.put('/:reviewId', asyncHandler((req, res, next) => 
  reviewController.updateReview(req, res, next)
));

// Delete a review
router.delete('/:reviewId', asyncHandler((req, res, next) => 
  reviewController.deleteReview(req, res, next)
));

export default router;

