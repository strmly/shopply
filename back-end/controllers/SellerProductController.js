import { ProductService } from '../services/ProductService.js';

/**
 * Seller Product Controller
 * Handles seller-specific product management operations
 */
export class SellerProductController {
  /**
   * Get all products for a seller with filtering and sorting
   */
  async getSellerProducts(req, res, next) {
    try {
      const { storeId } = req.params;
      const result = await ProductService.getSellerProducts(storeId, req.query);

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
   * Get product by ID (seller's own product)
   */
  async getSellerProductById(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Verify product belongs to seller
      if (product.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this product',
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
   * Create a new product for seller
   */
  async createSellerProduct(req, res, next) {
    try {
      const { storeId } = req.params;
      const productData = {
        ...req.body,
        storeId: parseInt(storeId),
      };

      const product = await ProductService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: product.toJSON(),
        message: 'Product created successfully',
      });
    } catch (error) {
      // Handle specific error types
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Update seller's product
   */
  async updateSellerProduct(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Verify product belongs to seller
      if (product.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this product',
        });
      }

      const updatedProduct = await ProductService.updateProduct(id, req.body);

      res.json({
        success: true,
        data: updatedProduct.toJSON(),
        message: 'Product updated successfully',
      });
    } catch (error) {
      // Handle specific error types
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Delete seller's product
   */
  async deleteSellerProduct(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Verify product belongs to seller
      if (product.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this product',
        });
      }

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
   * Update product visibility
   */
  async updateProductVisibility(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const { isVisible } = req.body;

      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (product.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this product',
        });
      }

      const updatedProduct = await ProductService.updateProductVisibility(id, isVisible);

      res.json({
        success: true,
        data: updatedProduct.toJSON(),
        message: `Product ${isVisible ? 'published' : 'hidden'} successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product stock
   */
  async updateProductStock(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const { stockQuantity } = req.body;

      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (product.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this product',
        });
      }

      const updatedProduct = await ProductService.updateProductStock(id, stockQuantity);

      res.json({
        success: true,
        data: updatedProduct.toJSON(),
        message: 'Stock updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product price
   */
  async updateProductPrice(req, res, next) {
    try {
      const { storeId, id } = req.params;
      const { price, discountPrice } = req.body;

      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (product.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this product',
        });
      }

      const updatedProduct = await ProductService.updateProductPrice(id, price, discountPrice);

      res.json({
        success: true,
        data: updatedProduct.toJSON(),
        message: 'Price updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duplicate product
   */
  async duplicateProduct(req, res, next) {
    try {
      const { storeId, id } = req.params;

      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (product.storeId !== parseInt(storeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to duplicate this product',
        });
      }

      const duplicatedProduct = await ProductService.duplicateProduct(id);

      res.status(201).json({
        success: true,
        data: duplicatedProduct.toJSON(),
        message: 'Product duplicated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(req, res, next) {
    try {
      const { storeId } = req.params;
      const { productIds, updates } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product IDs array is required',
        });
      }

      // Verify all products belong to seller
      for (const id of productIds) {
        const product = await ProductService.getProductById(id);
        if (!product || product.storeId !== parseInt(storeId)) {
          return res.status(403).json({
            success: false,
            message: `Product ${id} not found or does not belong to you`,
          });
        }
      }

      const results = await ProductService.bulkUpdateProducts(productIds, updates);

      res.json({
        success: true,
        data: results,
        message: 'Bulk update completed',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(req, res, next) {
    try {
      const { storeId } = req.params;
      const { productIds } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product IDs array is required',
        });
      }

      // Verify all products belong to seller
      for (const id of productIds) {
        const product = await ProductService.getProductById(id);
        if (!product || product.storeId !== parseInt(storeId)) {
          return res.status(403).json({
            success: false,
            message: `Product ${id} not found or does not belong to you`,
          });
        }
      }

      const results = await ProductService.bulkDeleteProducts(productIds);

      res.json({
        success: true,
        data: results,
        message: 'Bulk delete completed',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product statistics for seller
   */
  async getSellerProductStats(req, res, next) {
    try {
      const { storeId } = req.params;
      const stats = await ProductService.getSellerProductStats(storeId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

