import { ProductService } from '../services/ProductService.js';

/**
 * Product Controller
 */
export class ProductController {
  /**
   * Get all products
   */
  async getAllProducts(req, res, next) {
    try {
      const result = await ProductService.getAllProducts(req.query);
      res.json({
        success: true,
        data: result.products.map(p => p.toJSON()),
        count: result.products.length,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get hot products near location
   */
  async getHotProducts(req, res, next) {
    try {
      const { lat, lng, limit } = req.query;
      const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
      const products = await ProductService.getHotProductsNearLocation(location, parseInt(limit) || 10);
      
      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get flash deals
   */
  async getFlashDeals(req, res, next) {
    try {
      const { limit } = req.query;
      const products = await ProductService.getFlashDeals(parseInt(limit) || 10);
      
      // Products are already plain objects with flash deal info
      res.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(req, res, next) {
    try {
      const { limit } = req.query;
      const products = await ProductService.getNewArrivals(parseInt(limit) || 10);
      
      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recommended products
   */
  async getRecommended(req, res, next) {
    try {
      const { userId, limit } = req.query;
      const products = await ProductService.getRecommendedProducts(userId, parseInt(limit) || 10);
      
      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top-rated products
   */
  async getTopRated(req, res, next) {
    try {
      const { limit } = req.query;
      const products = await ProductService.getTopRated(parseInt(limit) || 10);
      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bundles (products with discounts or special offers)
   */
  async getBundles(req, res, next) {
    try {
      const { limit } = req.query;
      const products = await ProductService.getBundles(parseInt(limit) || 10);
      
      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get fast delivery products (within 2km)
   */
  async getFastDeliveryProducts(req, res, next) {
    try {
      const { lat, lng, limit } = req.query;
      const location = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
      const products = await ProductService.getFastDeliveryProducts(location, parseInt(limit) || 10);
      
      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new product
   */
  async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product.toJSON(),
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product.toJSON(),
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await ProductService.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(req, res, next) {
    try {
      const { id } = req.params;
      const { limit, page } = req.query;
      const result = await ProductService.getRelatedProducts(
        parseInt(id), 
        parseInt(limit) || 8,
        parseInt(page) || 1
      );
      
      res.json({
        success: true,
        data: result.products.map(p => p.toJSON()),
        count: result.products.length,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get frequently bought together
   */
  async getFrequentlyBoughtTogether(req, res, next) {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      const products = await ProductService.getFrequentlyBoughtTogether(parseInt(id), parseInt(limit) || 4);
      
      res.json({
        success: true,
        data: products.map(p => p.toJSON()),
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

