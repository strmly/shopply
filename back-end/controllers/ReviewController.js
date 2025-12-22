import ReviewService from '../services/ReviewService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Review Controller
 * Handles HTTP requests and responses for reviews
 */
export class ReviewController {
  /**
   * Get pending reviews for a user
   * GET /api/reviews/user/:userId/pending
   */
  async getPendingReviews(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const pendingReviews = await ReviewService.getPendingReviews(userId);

      res.json({
        success: true,
        data: pendingReviews,
      });
    } catch (error) {
      if (error.message.includes('Failed to retrieve')) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get user's reviews
   * GET /api/reviews/user/:userId
   */
  async getUserReviews(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const reviews = await ReviewService.getUserReviews(userId);

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get review summary for quick action card
   * GET /api/reviews/user/:userId/summary
   */
  async getReviewSummary(req, res, next) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const summary = await ReviewService.getReviewSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews for a product
   * GET /api/reviews/product/:productId
   */
  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      const reviews = ReviewService.getProductReviews(productId);

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get review by ID
   * GET /api/reviews/:reviewId
   */
  async getReviewById(req, res, next) {
    try {
      const { reviewId } = req.params;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: 'Review ID is required',
        });
      }

      const review = ReviewService.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      res.json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new review
   * POST /api/reviews
   */
  async createReview(req, res, next) {
    try {
      const {
        userId,
        productId,
        storeId,
        orderId,
        orderItemId,
        rating,
        content,
        title,
        photos,
        userName,
        userAvatar,
        userLocation,
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      if (!productId && !storeId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID or Store ID is required',
        });
      }

      if (!rating || rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5',
        });
      }

      // Validate content length
      if (content && content.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Review content cannot exceed 1000 characters',
        });
      }

      const reviewData = {
        userId,
        productId,
        storeId,
        orderId,
        orderItemId,
        rating,
        content: content || '',
        title: title || '',
        photos: photos || [],
        userName,
        userAvatar,
        userLocation,
      };

      const review = await ReviewService.createReview(reviewData);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Unauthorized: Order does not belong to user') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message === 'Can only review delivered orders') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Validation failed')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Update a review
   * PUT /api/reviews/:reviewId
   */
  async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { userId, rating, content, title, photos } = req.body;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: 'Review ID is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
      }

      const updateData = {};
      if (rating !== undefined) updateData.rating = rating;
      if (content !== undefined) updateData.content = content;
      if (title !== undefined) updateData.title = title;
      if (photos !== undefined) updateData.photos = photos;

      const review = await ReviewService.updateReview(reviewId, userId, updateData);

      res.json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      if (error.message === 'Review not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('can only be edited')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Delete a review
   * DELETE /api/reviews/:reviewId
   */
  async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { userId } = req.body;

      if (!reviewId) {
        return res.status(400).json({
          success: false,
          message: 'Review ID is required',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      await ReviewService.deleteReview(reviewId, userId);

      res.json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Review not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

