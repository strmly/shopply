import { ProductService } from '../services/ProductService.js';

const SA_STORE_CITIES = [
  { suburb: 'Sandton', city: 'Johannesburg', province: 'Gauteng', lat: -26.1076, lng: 28.0567 },
  { suburb: 'Cape Town CBD', city: 'Cape Town', province: 'Western Cape', lat: -33.9249, lng: 18.4241 },
  { suburb: 'Durban CBD', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218 },
  { suburb: 'Pretoria CBD', city: 'Pretoria', province: 'Gauteng', lat: -25.7459, lng: 28.1878 },
  { suburb: 'Bloemfontein CBD', city: 'Bloemfontein', province: 'Free State', lat: -29.0852, lng: 26.1596 },
  { suburb: 'Gqeberha CBD', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9608, lng: 25.6022 },
  { suburb: 'East London CBD', city: 'East London', province: 'Eastern Cape', lat: -33.0292, lng: 27.8793 },
  { suburb: 'Polokwane CBD', city: 'Polokwane', province: 'Limpopo', lat: -23.9045, lng: 29.4688 },
  { suburb: 'Mbombela CBD', city: 'Mbombela', province: 'Mpumalanga', lat: -25.4753, lng: 30.9694 },
  { suburb: 'Rustenburg CBD', city: 'Rustenburg', province: 'North West', lat: -25.6671, lng: 27.2419 },
  { suburb: 'Kimberley CBD', city: 'Kimberley', province: 'Northern Cape', lat: -28.7282, lng: 24.7499 },
  { suburb: 'Pietermaritzburg CBD', city: 'Pietermaritzburg', province: 'KwaZulu-Natal', lat: -29.6180, lng: 30.3920 },
];

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getStoreLocation(storeId) {
  return SA_STORE_CITIES[(storeId || 0) % SA_STORE_CITIES.length];
}

function enrichProduct(product, userLoc) {
  if (!userLoc) return product;
  const storeLoc = (product.storeLocation?.lat && product.storeLocation?.lng)
    ? product.storeLocation
    : getStoreLocation(product.storeId);
  const km = haversineKm(userLoc.lat, userLoc.lng, storeLoc.lat, storeLoc.lng);
  const days = km < 30 ? '1–2' : km < 100 ? '2–3' : km < 400 ? '3–5' : '5–7';
  return { ...product, storeLocation: storeLoc, distanceKm: km, deliveryDays: `${days} days` };
}

function parseUserLoc(query) {
  const { lat, lng } = query;
  return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
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

      if (userLoc) {
        // With location: fetch all, sort by distance, then paginate — keeps page ordering stable
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const allResult = await ProductService.getAllProducts({ ...req.query, page: 1, limit: 99999 });
        let products = allResult.products.map(p => p.toJSON());
        products = products.map(p => enrichProduct(p, userLoc)).sort((a, b) => a.distanceKm - b.distanceKm);
        const startIndex = (page - 1) * limit;
        const pageProducts = products.slice(startIndex, startIndex + limit);
        res.json({
          success: true,
          data: pageProducts,
          count: pageProducts.length,
          pagination: {
            page,
            limit,
            total: products.length,
            totalPages: Math.ceil(products.length / limit),
            hasMore: startIndex + limit < products.length,
          },
        });
      } else {
        const result = await ProductService.getAllProducts(req.query);
        res.json({
          success: true,
          data: result.products.map(p => p.toJSON()),
          count: result.products.length,
          pagination: result.pagination,
        });
      }
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
      const userLoc = parseUserLoc(req.query);
      const products = await ProductService.getHotProductsNearLocation(userLoc, parseInt(req.query.limit) || 10);
      let data = products.map(p => p.toJSON());
      if (userLoc) {
        data = data.map(p => enrichProduct(p, userLoc)).sort((a, b) => a.distanceKm - b.distanceKm);
      }
      res.json({ success: true, data, count: data.length });
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
      const products = await ProductService.getNewArrivals(parseInt(req.query.limit) || 10);
      let data = products.map(p => p.toJSON());
      if (userLoc) {
        data = data.map(p => enrichProduct(p, userLoc)).sort((a, b) => a.distanceKm - b.distanceKm);
      }
      res.json({ success: true, data, count: data.length });
    } catch (error) {
      next(error);
    }
  }

  async getRecommended(req, res, next) {
    try {
      const userLoc = parseUserLoc(req.query);
      const products = await ProductService.getRecommendedProducts(req.query.userId, parseInt(req.query.limit) || 10);
      let data = products.map(p => p.toJSON());
      if (userLoc) {
        data = data.map(p => enrichProduct(p, userLoc)).sort((a, b) => a.distanceKm - b.distanceKm);
      }
      res.json({ success: true, data, count: data.length });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top-rated products
   */
  async getTopRated(req, res, next) {
    try {
      const userLoc = parseUserLoc(req.query);
      const products = await ProductService.getTopRated(parseInt(req.query.limit) || 10);
      let data = products.map(p => p.toJSON());
      if (userLoc) {
        data = data.map(p => enrichProduct(p, userLoc)).sort((a, b) => a.distanceKm - b.distanceKm);
      }
      res.json({ success: true, data, count: data.length });
    } catch (error) {
      next(error);
    }
  }

  async getBundles(req, res, next) {
    try {
      const userLoc = parseUserLoc(req.query);
      const result = await ProductService.getBundles({
        limit: req.query.limit,
        page: req.query.page,
        room: req.query.room,
        sort: req.query.sort,
      });
      let data = result.products;
      if (userLoc) {
        data = data.map(p => enrichProduct(p, userLoc)).sort((a, b) => a.distanceKm - b.distanceKm);
      }
      res.json({
        success: true,
        data,
        count: data.length,
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

