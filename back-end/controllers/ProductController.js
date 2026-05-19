import { ProductService } from '../services/ProductService.js';
import { SellerService } from '../services/SellerService.js';
import { getStoreById } from '../services/StoreService.js';
import { TrendingService } from '../services/TrendingService.js';
import { getRanked } from '../services/H3ProductRanker.js';

function parseUserLoc(query) {
  const { lat, lng } = query;
  return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
}

async function getSellerContactForProduct(product) {
  const storeId = product?.storeId;
  const store = getStoreById(storeId) || getStoreById(String(storeId));
  let seller = null;

  if (store?.sellerId) {
    seller = await SellerService.getSellerById(store.sellerId);
  }

  if (!seller && storeId) {
    seller = await SellerService.getSellerById(storeId);
  }

  if (!seller && parseInt(storeId, 10) === 1) {
    seller = await SellerService.seedDefaultSeller();
  }

  const whatsappNumber = seller?.storeBasicInfo?.storePhone
    || seller?.phone
    || store?.phone
    || product?.sellerPhone
    || product?.storePhone
    || '';

  return {
    sellerId: seller?.id || store?.sellerId || storeId || null,
    storePhone: store?.phone || seller?.storeBasicInfo?.storePhone || seller?.phone || '',
    whatsappNumber,
    contactEmail: seller?.storeBasicInfo?.contactEmail || seller?.email || store?.email || '',
    responseMinutes: seller?.responseStats?.avgResponseMinutes || null,
  };
}

/**
 * Product Controller
 */
export class ProductController {
  /**
   * Get all products
   */
  async getAllProducts(req, res, next) {
    try {
      const userLoc = parseUserLoc(req.query);
      const page  = parseInt(req.query.page)  || 1;
      const limit = parseInt(req.query.limit) || 20;

      if (userLoc) {
        const all = await getRanked(userLoc.lat, userLoc.lng, () => true, { limit: 99999 });
        if (all) {
          const startIndex = (page - 1) * limit;
          const pageProducts = all.slice(startIndex, startIndex + limit);
          return res.json({
            success: true,
            data: pageProducts,
            count: pageProducts.length,
            pagination: {
              page, limit,
              total: all.length,
              totalPages: Math.ceil(all.length / limit),
              hasMore: startIndex + limit < all.length,
            },
          });
        }
      }

      const result = await ProductService.getAllProducts(req.query);
      res.json({
        success: true,
        data: result.products.map(p => p.toJSON ? p.toJSON() : p),
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

      const productData = product.toJSON();
      const sellerContact = await getSellerContactForProduct(productData);

      // Track view in TrendingService using the store's H3 cells
      try {
        const store = getStoreById(productData.storeId) || getStoreById(String(productData.storeId));
        if (store) {
          const cells = [store.h3_r6, store.h3_r7, store.h3_r8].filter(Boolean);
          if (cells.length) TrendingService.trackView(productData.id, cells);
        }
      } catch { /* non-fatal */ }

      res.json({
        success: true,
        data: { ...productData, sellerContact },
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
      const userLoc = parseUserLoc(req.query);
      const limit = parseInt(req.query.limit) || 10;
      if (userLoc) {
        const ranked = await getRanked(
          userLoc.lat, userLoc.lng,
          p => p.isTrending || p.isNew || (p.reviewCount || 0) > 50,
          { limit },
        );
        if (ranked?.length) return res.json({ success: true, data: ranked, count: ranked.length });
      }
      const products = await ProductService.getHotProductsNearLocation(userLoc, limit);
      res.json({ success: true, data: products.map(p => p.toJSON ? p.toJSON() : p), count: products.length });
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
      const userLoc = parseUserLoc(req.query);
      const limit = parseInt(req.query.limit) || 10;
      if (userLoc) {
        const ranked = await getRanked(userLoc.lat, userLoc.lng, p => p.isNew, { limit });
        if (ranked?.length) return res.json({ success: true, data: ranked, count: ranked.length });
      }
      const products = await ProductService.getNewArrivals(limit);
      res.json({ success: true, data: products.map(p => p.toJSON ? p.toJSON() : p), count: products.length });
    } catch (error) {
      next(error);
    }
  }

  async getRecommended(req, res, next) {
    try {
      const userLoc = parseUserLoc(req.query);
      const limit = parseInt(req.query.limit) || 10;
      if (userLoc) {
        const ranked = await getRanked(
          userLoc.lat, userLoc.lng,
          p => (p.rating || 0) >= 4.0 || (p.reviewCount || 0) > 20,
          { limit },
        );
        if (ranked?.length) return res.json({ success: true, data: ranked, count: ranked.length });
      }
      const products = await ProductService.getRecommendedProducts(req.query.userId, limit);
      res.json({ success: true, data: products.map(p => p.toJSON ? p.toJSON() : p), count: products.length });
    } catch (error) {
      next(error);
    }
  }

  async getTopRated(req, res, next) {
    try {
      const userLoc = parseUserLoc(req.query);
      const limit = parseInt(req.query.limit) || 10;
      if (userLoc) {
        const ranked = await getRanked(
          userLoc.lat, userLoc.lng,
          p => (p.rating || 0) >= 4.0 && p.stock !== 'out',
          { limit },
        );
        if (ranked?.length) return res.json({ success: true, data: ranked, count: ranked.length });
      }
      const products = await ProductService.getTopRated(limit);
      res.json({ success: true, data: products.map(p => p.toJSON ? p.toJSON() : p), count: products.length });
    } catch (error) {
      next(error);
    }
  }

  async getBundles(req, res, next) {
    try {
      // Bundles are curated catalog items with computed metadata (roomLabel, bundleSavings, etc.)
      // that only ProductService.getBundles() produces — always use it as the primary source.
      const result = await ProductService.getBundles({
        limit: req.query.limit, page: req.query.page,
        room: req.query.room, sort: req.query.sort,
      });
      res.json({
        success: true,
        data: result.products,
        count: result.products.length,
        summary: result.summary,
        featured: result.featured,
        pagination: result.pagination,
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

