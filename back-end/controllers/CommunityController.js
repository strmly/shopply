import { ProductService } from '../services/ProductService.js';
import { BundleService } from '../services/BundleService.js';
import ReviewService from '../services/ReviewService.js';

/**
 * Community Controller
 * Handles HTTP requests and responses for community operations
 */
export class CommunityController {
  constructor() {
    this.questions = new Map(); // productId -> array of questions
  }

  /**
   * Get community feed
   */
  async getFeed(req, res, next) {
    try {
      // TODO: Implement get feed
      res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get post by ID
   */
  async getPost(req, res, next) {
    try {
      // TODO: Implement get post
      res.json({
        success: true,
        data: { id: req.params.id },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create post
   */
  async createPost(req, res, next) {
    try {
      // TODO: Implement create post
      res.json({
        success: true,
        message: 'Post created successfully',
        data: { id: 'temp-' + Date.now() },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get community recommendations
   */
  async getRecommendations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      let location = null;
      
      if (req.query.location) {
        try {
          location = JSON.parse(decodeURIComponent(req.query.location));
        } catch (e) {
          // Invalid location format, continue with null
        }
      }

      // Bundle type configurations
      const bundleConfigs = {
        'grocery-stores': {
          id: '1',
          title: 'Best Grocery Stores Near You',
          description: 'Local shoppers recommend these stores for fresh produce and great prices',
          category: 'Grocery',
        },
        'electronics': {
          id: '2',
          title: 'Top Rated Electronics',
          description: 'Community favorites for tech and gadgets',
          category: 'Electronics',
        },
        'food-favorites': {
          id: '3',
          title: 'Local Food Favorites',
          description: 'Restaurants and food items loved by your neighbors',
          category: 'Food',
        },
      };

      // Get all bundles that have been curated (have at least one curator)
      const recommendations = [];
      
      for (const [bundleType, config] of Object.entries(bundleConfigs)) {
        try {
          // Get curator count for this bundle
          const curatorCount = await BundleService.getCuratorCount(bundleType, location);
          
          // Only include bundles that have been curated (at least one curator)
          if (curatorCount > 0) {
            recommendations.push({
              id: config.id,
              title: config.title,
              description: config.description,
              curatorCount,
              category: config.category,
              bundleType,
              location: location?.suburb || 'Your Area',
            });
          }
        } catch (error) {
          console.error(`Error getting curator count for ${bundleType}:`, error);
          // Continue with other bundles
        }
      }

      // Sort by curator count (most curated first) and limit
      recommendations.sort((a, b) => b.curatorCount - a.curatorCount);
      const limitedRecommendations = recommendations.slice(0, limit);

      res.json({
        success: true,
        data: limitedRecommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bundle products by type
   */
  async getBundleProducts(req, res, next) {
    try {
      const { bundleType } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      let location = null;
      
      if (req.query.location) {
        try {
          location = JSON.parse(decodeURIComponent(req.query.location));
        } catch (e) {
          // Invalid location format, continue with null
        }
      }

      let products = [];
      let bundleInfo = null;

      // Map bundle types to categories and filters
      const bundleConfig = {
        'grocery-stores': {
          category: 'Groceries',
          sortBy: 'popular',
          description: 'Best grocery stores recommended by your neighbors',
        },
        'electronics': {
          category: 'Electronics',
          sortBy: 'popular',
          description: 'Top-rated electronics loved by the community',
        },
        'food-favorites': {
          category: 'Braai', // Food items are in Braai category or Groceries
          sortBy: 'popular',
          description: 'Local food favorites from your neighborhood',
        },
      };

      const config = bundleConfig[bundleType];
      if (config) {
        // Get curated products first (prioritize community recommendations)
        let curatedProducts = [];
        try {
          curatedProducts = await BundleService.getCuratedProducts(bundleType, location, limit);
          // Ensure curatedProducts is an array
          if (!Array.isArray(curatedProducts)) {
            curatedProducts = [];
          }
        } catch (error) {
          console.error('Error loading curated products:', error);
          curatedProducts = [];
        }
        
        // Get products filtered by category, sorted by popularity (review count)
        let categoryProducts = await ProductService.getAllProducts({
          category: config.category,
          sortBy: config.sortBy,
        });

        // For food favorites, also include Groceries category items
        if (bundleType === 'food-favorites') {
          const groceryProducts = await ProductService.getAllProducts({
            category: 'Groceries',
            sortBy: config.sortBy,
          });
          // Merge and deduplicate
          const allProducts = [...categoryProducts, ...groceryProducts];
          const uniqueProducts = Array.from(
            new Map(allProducts.map(p => [p.id, p])).values()
          );
          categoryProducts = uniqueProducts;
        }

        // Sort by review count (popularity) and rating
        categoryProducts.sort((a, b) => {
          const ratingA = (a.rating || 0) * (a.reviewCount || 0);
          const ratingB = (b.rating || 0) * (b.reviewCount || 0);
          return ratingB - ratingA;
        });

        // Merge curated products with category products
        // Prioritize curated items, then add category products that aren't already curated
        const curatedProductIds = new Set(curatedProducts.map(p => p.id));
        const additionalProducts = categoryProducts
          .filter(p => !curatedProductIds.has(p.id))
          .slice(0, Math.max(0, limit - curatedProducts.length));

        products = [...curatedProducts, ...additionalProducts].slice(0, limit);

        // Get curator count
        let curatorCount = 0;
        try {
          curatorCount = await BundleService.getCuratorCount(bundleType, location);
        } catch (error) {
          console.error('Error getting curator count:', error);
        }

        bundleInfo = {
          bundleType,
          title: bundleType === 'grocery-stores' 
            ? 'Best Grocery Stores Near You'
            : bundleType === 'electronics'
            ? 'Top Rated Electronics'
            : 'Local Food Favorites',
          description: config.description,
          curatorCount,
        };
      }

      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        bundleInfo,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to bundle (curate)
   */
  async addItemToBundle(req, res, next) {
    try {
      const { bundleType } = req.params;
      const { productId, userId = 'default', userName = 'Local Shopper', reason = '' } = req.body;
      let location = null;

      if (req.body.location) {
        location = req.body.location;
      } else if (req.query.location) {
        try {
          location = JSON.parse(decodeURIComponent(req.query.location));
        } catch (e) {
          // Invalid location format
        }
      }

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      // Verify product exists
      const product = await ProductService.getProductById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const bundleItem = await BundleService.addItemToBundle(
        bundleType,
        productId,
        userId,
        userName,
        location,
        reason
      );

      res.json({
        success: true,
        data: bundleItem.toJSON(),
        message: 'Item added to bundle successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from bundle
   */
  async removeItemFromBundle(req, res, next) {
    try {
      const { bundleType, productId } = req.params;
      const { userId = 'default' } = req.body;

      const removed = await BundleService.removeItemFromBundle(
        bundleType,
        productId,
        userId
      );

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in bundle',
        });
      }

      res.json({
        success: true,
        message: 'Item removed from bundle successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get curated items for a bundle
   */
  async getCuratedItems(req, res, next) {
    try {
      const { bundleType } = req.params;
      let location = null;

      if (req.query.location) {
        try {
          location = JSON.parse(decodeURIComponent(req.query.location));
        } catch (e) {
          // Invalid location format
        }
      }

      const items = await BundleService.getBundleItems(bundleType, location);

      res.json({
        success: true,
        data: items,
        count: items.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user has curated a product
   */
  async checkUserCurated(req, res, next) {
    try {
      const { bundleType, productId } = req.params;
      const { userId = 'default' } = req.query;

      const hasCurated = await BundleService.hasUserCurated(
        bundleType,
        productId,
        userId
      );

      res.json({
        success: true,
        hasCurated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending items in area
   */
  async getTrending(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      let location = null;
      
      if (req.query.location) {
        try {
          location = JSON.parse(decodeURIComponent(req.query.location));
        } catch (e) {
          // Invalid location format, continue with null
        }
      }

      // Get trending products from ProductService
      const { products: allProducts = [] } = await ProductService.getAllProducts({});
      
      // Filter and analyze products for trending
      const trendingItems = [];
      
      for (const product of allProducts) {
        if (!product || !product.id) continue;
        
        let trend = null;
        let reason = '';
        let trendPercent = null;
        
        // Determine trend based on product properties
        // Priority: isNew > isTrending > high demand indicators
        
        if (product.isNew) {
          trend = 'restocked';
          // More specific reasons for new items
          if (product.name.toLowerCase().includes('milk') || 
              product.name.toLowerCase().includes('chicken') ||
              product.name.toLowerCase().includes('stock')) {
            reason = 'Just restocked';
          } else {
            reason = 'New stock';
          }
        } else if (product.isTrending) {
          trend = 'up';
          // Determine reason based on product data
          if (product.socialProof && product.socialProof.includes('times today')) {
            reason = 'Popular in your area';
          } else if (product.reviewCount > 20) {
            reason = 'High demand';
          } else if (product.rating >= 4.5 && product.reviewCount > 10) {
            reason = 'Trending nearby';
          } else if (product.name.toLowerCase().includes('vegetable') ||
                     product.name.toLowerCase().includes('fruit')) {
            reason = 'Seasonal favorite';
          } else {
            reason = 'Popular in your area';
          }
        } else if (product.stock === 'low' && product.stockQuantity && product.stockQuantity < 10) {
          trend = 'up';
          reason = 'High demand';
        } else if (product.reviewCount > 15 && product.rating >= 4.5) {
          trend = 'up';
          if (product.name.toLowerCase().includes('coffee')) {
            reason = 'High demand';
          } else {
            reason = 'Trending nearby';
          }
        } else if (product.socialProof) {
          trend = 'up';
          reason = 'Popular in your area';
        } else if (product.name.toLowerCase().includes('bread') || 
                   product.name.toLowerCase().includes('pastry')) {
          trend = 'up';
          reason = 'Trending nearby';
        } else if (product.name.toLowerCase().includes('vegetable') ||
                   product.name.toLowerCase().includes('fruit')) {
          trend = 'up';
          reason = 'Seasonal favorite';
        }
        
        // Skip if no trend detected
        if (!trend) continue;
        
        // Calculate trend percentage based on various factors
        if (product.reviewCount > 0) {
          const popularityScore = (product.rating || 0) * (product.reviewCount || 0);
          trendPercent = Math.min(99, Math.floor(popularityScore / 10));
        }
        
        trendingItems.push({
          productId: product.id,
          productName: product.name,
          reason: reason,
          trend: trend,
          trendPercent: trendPercent,
          product: product.toJSON(), // Include full product data
        });
      }
      
      // Sort by trend priority and popularity
      trendingItems.sort((a, b) => {
        // Prioritize restocked items
        if (a.trend === 'restocked' && b.trend !== 'restocked') return -1;
        if (b.trend === 'restocked' && a.trend !== 'restocked') return 1;
        
        // Then by trend percent
        if (a.trendPercent !== b.trendPercent) {
          return (b.trendPercent || 0) - (a.trendPercent || 0);
        }
        
        // Then by review count
        const aReviews = a.product?.reviewCount || 0;
        const bReviews = b.product?.reviewCount || 0;
        return bReviews - aReviews;
      });
      
      // Filter by location if provided
      let filteredItems = trendingItems;
      if (location && location.suburb) {
        filteredItems = trendingItems.filter(item => {
          const productLocation = item.product?.storeLocation;
          return !productLocation || productLocation.suburb === location.suburb;
        });
        
        // If no items match location, return general trending
        if (filteredItems.length === 0) {
          filteredItems = trendingItems;
        }
      }
      
      // Limit results and ensure all required fields
      const result = filteredItems.slice(0, limit)
        .filter(item => item.productId && item.productName) // Ensure valid items
        .map(item => ({
          productId: item.productId,
          productName: item.productName,
          reason: item.reason || 'Trending in your area',
          trend: item.trend || 'up',
          trendPercent: item.trendPercent || null,
        }));

      res.json({
        success: true,
        data: result,
        count: result.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews for a product
   * GET /api/community/products/:id/reviews
   */
  async getProductReviews(req, res, next) {
    try {
      const { id: productId } = req.params;
      let location = null;

      if (req.query.location) {
        try {
          location = JSON.parse(decodeURIComponent(req.query.location));
        } catch (e) {
          // Invalid location format, continue with null
        }
      }

      const reviews = ReviewService.getProductReviews(productId);

      // Apply filters if provided
      let filteredReviews = reviews;
      if (req.query.verified === 'true') {
        filteredReviews = filteredReviews.filter(r => r.verified);
      }
      if (req.query.images === 'true') {
        filteredReviews = filteredReviews.filter(r => r.images && r.images.length > 0);
      }
      if (req.query.rating) {
        const rating = parseInt(req.query.rating);
        filteredReviews = filteredReviews.filter(r => r.rating === rating);
      }

      res.json({
        success: true,
        data: filteredReviews,
        count: filteredReviews.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get rating summary for a product
   * GET /api/community/products/:id/rating
   */
  async getProductRating(req, res, next) {
    try {
      const { id: productId } = req.params;
      let location = null;

      if (req.query.location) {
        try {
          location = JSON.parse(decodeURIComponent(req.query.location));
        } catch (e) {
          // Invalid location format, continue with null
        }
      }

      const reviews = ReviewService.getProductReviews(productId);

      // Calculate rating summary
      const totalReviews = reviews.length;
      const ratings = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      let totalRating = 0;
      reviews.forEach(review => {
        const rating = review.rating || 0;
        if (rating >= 1 && rating <= 5) {
          ratings[rating]++;
          totalRating += rating;
        }
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      res.json({
        success: true,
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          localReviews: Math.floor(totalReviews * 0.4), // approximate local reviews
          ratingDistribution: ratings,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get questions for a product
   * GET /api/community/products/:id/questions
   */
  async getProductQuestions(req, res, next) {
    try {
      const { id: productId } = req.params;
      const questions = this.questions.get(String(productId)) || [];
      res.json({
        success: true,
        data: questions,
        count: questions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a question for a product
   * POST /api/community/products/:id/questions
   */
  async createQuestion(req, res, next) {
    try {
      const { id: productId } = req.params;
      const { question, userId = 'default', userName = 'Local Shopper' } = req.body;

      if (!question?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Question text is required',
        });
      }

      const newQuestion = {
        id: `q-${Date.now()}`,
        productId: String(productId),
        question: question.trim(),
        userId,
        userName,
        answers: [],
        createdAt: new Date().toISOString(),
      };

      const key = String(productId);
      if (!this.questions.has(key)) {
        this.questions.set(key, []);
      }
      this.questions.get(key).unshift(newQuestion);

      res.status(201).json({
        success: true,
        data: newQuestion,
        message: 'Question posted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
