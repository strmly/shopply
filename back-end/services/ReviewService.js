import Review from '../models/Review.js';
import CheckoutService from './CheckoutService.js';
import { ProductService } from './ProductService.js';

/**
 * Review Service
 * Handles review creation, updates, deletion, and retrieval
 * Manages pending reviews from delivered orders
 */
class ReviewService {
  constructor() {
    this.reviews = new Map(); // In-memory storage for reviews
  }

  /**
   * Get pending reviews for a user
   * Returns items from delivered orders that haven't been reviewed yet
   * @param {string} userId - User ID
   * @returns {Array} Array of pending review items
   */
  async getPendingReviews(userId) {
    try {
      // Get all delivered orders for the user
      const orders = CheckoutService.getUserOrders(userId);
      const deliveredOrders = orders.filter(order => order.status === 'delivered');
      
      const pendingItems = [];
      const reviewedProductIds = new Set();

      // Get all existing reviews for this user to filter out already reviewed items
      const userReviews = await this.getUserReviews(userId);
      userReviews.forEach(review => {
        if (review.productId) {
          reviewedProductIds.add(review.productId);
        }
      });

      // Collect items from delivered orders that haven't been reviewed
      for (const order of deliveredOrders) {
        if (!order.items || order.items.length === 0) continue;

        // Check if order was delivered (allow reviews immediately after delivery)
        const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
        const now = new Date();
        const hoursSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60);
        
        // Only show items delivered (no minimum wait time, but hide after 90 days)
        if (hoursSinceDelivery < 0) continue; // Not delivered yet
        if (hoursSinceDelivery > 24 * 90) continue; // Too old (90 days)

        for (const item of order.items) {
          // Skip if already reviewed
          if (reviewedProductIds.has(item.productId)) continue;

          // Get product details
          let product = null;
          try {
            product = await ProductService.getProductById(item.productId);
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
          }

          pendingItems.push({
            orderId: order.id,
            orderItemId: item.productId, // Using productId as orderItemId for simplicity
            productId: item.productId,
            productName: product?.name || item.name || 'Product',
            productImage: product?.images?.[0] || product?.image || null,
            storeId: item.storeId || order.storeGroups?.[0]?.storeId || null,
            storeName: item.storeName || order.storeGroups?.[0]?.storeName || 'Store',
            orderDate: order.deliveredAt || order.createdAt,
            deliveredAt: order.deliveredAt,
          });
        }
      }

      // Sort by delivery date (most recent first)
      pendingItems.sort((a, b) => {
        const dateA = new Date(a.deliveredAt || a.orderDate);
        const dateB = new Date(b.deliveredAt || b.orderDate);
        return dateB - dateA;
      });

      return pendingItems;
    } catch (error) {
      console.error('Error getting pending reviews:', error);
      throw new Error(`Failed to retrieve pending reviews: ${error.message}`);
    }
  }

  /**
   * Get all reviews by a user with enriched product data
   * @param {string} userId - User ID
   * @returns {Array} Array of reviews with product info
   */
  async getUserReviews(userId) {
    const reviews = Array.from(this.reviews.values())
      .filter(review => review.userId === userId)
      .map(review => review.toJSON ? review.toJSON() : review);
    
    // Enrich reviews with product data
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        if (review.productId) {
          try {
            const product = await ProductService.getProductById(review.productId);
            return {
              ...review,
              productName: product?.name || 'Product',
              productImage: product?.images?.[0] || product?.image || null,
              storeName: product?.storeName || review.storeId || 'Store',
            };
          } catch (error) {
            console.error(`Error fetching product ${review.productId}:`, error);
            return {
              ...review,
              productName: 'Product',
              productImage: null,
              storeName: 'Store',
            };
          }
        }
        return review;
      })
    );
    
    // Sort by creation date (most recent first)
    return enrichedReviews.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  }

  /**
   * Get review by ID
   * @param {string} reviewId - Review ID
   * @returns {Review|null} Review or null if not found
   */
  getReviewById(reviewId) {
    const review = this.reviews.get(reviewId);
    return review ? review.toJSON() : null;
  }

  /**
   * Get reviews for a product
   * @param {string} productId - Product ID
   * @returns {Array} Array of reviews
   */
  getProductReviews(productId) {
    const reviews = Array.from(this.reviews.values())
      .filter(review => review.productId === productId)
      .map(review => review.toJSON ? review.toJSON() : review);
    
    return reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  }

  /**
   * Create a new review
   * @param {Object} reviewData - Review data
   * @returns {Review} Created review
   */
  async createReview(reviewData) {
    try {
      // Check if user already reviewed this product from this order
      if (reviewData.orderId && reviewData.productId) {
        const existingReview = Array.from(this.reviews.values()).find(
          review => 
            review.userId === reviewData.userId &&
            review.productId === reviewData.productId &&
            review.orderId === reviewData.orderId
        );
        
        if (existingReview) {
          throw new Error('You have already reviewed this product from this order');
        }
      }

      // Verify order ownership if orderId is provided
      if (reviewData.orderId) {
        const order = CheckoutService.getOrder(reviewData.orderId);
        if (!order) {
          throw new Error('Order not found');
        }
        if (order.userId !== reviewData.userId) {
          throw new Error('Unauthorized: Order does not belong to user');
        }
        if (order.status !== 'delivered') {
          throw new Error('Can only review delivered orders');
        }
        reviewData.verifiedPurchase = true;
      }

      // Sanitize content
      if (reviewData.content) {
        reviewData.content = reviewData.content.trim().substring(0, 1000); // Max 1000 chars
      }

      // Get user info if not provided
      if (!reviewData.userName) {
        // In production, fetch from UserService
        reviewData.userName = 'User';
      }

      const review = new Review(reviewData);
      const validation = review.validate();
      
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      this.reviews.set(review.id, review);

      // Update product rating
      if (review.productId) {
        await this.updateProductRating(review.productId);
      }

      return review.toJSON();
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Review} Updated review
   */
  async updateReview(reviewId, userId, updateData) {
    const review = this.reviews.get(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized: Cannot update another user\'s review');
    }

    // Check if review is editable (within 7 days)
    const createdAt = new Date(review.createdAt);
    const now = new Date();
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation > 7) {
      throw new Error('Review can only be edited within 7 days of creation');
    }

    // Validate rating if provided
    if (updateData.rating !== undefined) {
      if (updateData.rating < 1 || updateData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      review.rating = updateData.rating;
    }

    // Sanitize and update content
    if (updateData.content !== undefined) {
      review.content = updateData.content.trim().substring(0, 1000); // Max 1000 chars
    }
    
    if (updateData.title !== undefined) {
      review.title = updateData.title.trim().substring(0, 200); // Max 200 chars
    }
    
    if (updateData.photos !== undefined) {
      review.photos = Array.isArray(updateData.photos) ? updateData.photos.slice(0, 5) : []; // Max 5 photos
    }
    
    review.updatedAt = new Date();

    // Update product rating
    if (review.productId) {
      await this.updateProductRating(review.productId);
    }

    return review.toJSON();
  }

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID (for authorization)
   * @returns {boolean} Success status
   */
  async deleteReview(reviewId, userId) {
    const review = this.reviews.get(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized: Cannot delete another user\'s review');
    }

    const productId = review.productId;
    this.reviews.delete(reviewId);

    // Update product rating
    if (productId) {
      await this.updateProductRating(productId);
    }

    return true;
  }

  /**
   * Update product rating based on all reviews
   * @param {string} productId - Product ID
   */
  async updateProductRating(productId) {
    try {
      const reviews = this.getProductReviews(productId);
      
      if (reviews.length === 0) {
        // No reviews, set rating to null
        await ProductService.updateProduct(productId, {
          rating: null,
          reviewCount: 0,
        });
        return;
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      // Round to 1 decimal place
      const roundedRating = Math.round(averageRating * 10) / 10;

      // Update product
      await ProductService.updateProduct(productId, {
        rating: roundedRating,
        reviewCount: reviews.length,
      });
    } catch (error) {
      console.error(`Error updating product rating for ${productId}:`, error);
    }
  }

  /**
   * Get review summary for quick action card
   * @param {string} userId - User ID
   * @returns {Object} Summary data
   */
  async getReviewSummary(userId) {
    try {
      const pendingReviews = await this.getPendingReviews(userId);
      const userReviews = await this.getUserReviews(userId);
      
      // Get most recent review
      const mostRecentReview = userReviews.length > 0 ? userReviews[0] : null;
      
      let subtext = '';
      if (pendingReviews.length > 0) {
        subtext = `${pendingReviews.length} item${pendingReviews.length > 1 ? 's' : ''} to review`;
      } else if (userReviews.length > 0) {
        const daysSinceReview = mostRecentReview 
          ? Math.floor((new Date() - new Date(mostRecentReview.createdAt)) / (1000 * 60 * 60 * 24))
          : null;
        
        if (daysSinceReview === 0) {
          subtext = 'Last review submitted today';
        } else if (daysSinceReview === 1) {
          subtext = 'Last review submitted yesterday';
        } else {
          subtext = `${userReviews.length} review${userReviews.length > 1 ? 's' : ''} written`;
        }
      } else {
        subtext = 'No reviews yet';
      }

      return {
        pendingCount: pendingReviews.length,
        totalReviews: userReviews.length,
        subtext,
        badgeCount: pendingReviews.length > 0 ? pendingReviews.length : null,
      };
    } catch (error) {
      console.error('Error getting review summary:', error);
      return {
        pendingCount: 0,
        totalReviews: 0,
        subtext: 'No reviews yet',
        badgeCount: null,
      };
    }
  }
}

// Export singleton instance
export default new ReviewService();

