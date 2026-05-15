import { Product } from '../models/Product.js';
import { indexProduct } from './H3IndexingService.js';
import { getAllStores } from './StoreService.js';
import { SellerService } from './SellerService.js';

/**
 * Product Service
 * Handles business logic for products
 * Using singleton pattern to share data across requests
 */
class ProductServiceClass {
  constructor() {
    this.products = [];
    this.nextId = 1;
  }

  /**
   * Get all products (simple method for compatibility with HyperlocalSearchService)
   * Returns array of product objects (not Product instances)
   */
  async getAll() {
    return this.products.map(p => {
      if (p && typeof p.toJSON === 'function') {
        return p.toJSON();
      }
      // If it's already a plain object, return as is
      return p;
    });
  }

  /**
   * Get all products
   */
  async getAllProducts(filters = {}) {
    let products = [...this.products];

    // Apply filters
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }

    // Furniture room filter
    if (filters.room) {
      products = products.filter(p => p.room && p.room.toLowerCase() === filters.room.toLowerCase());
    }

    if (filters.storeId) {
      products = products.filter(p => p.storeId === parseInt(filters.storeId));
    }

    if (filters.isNew) {
      products = products.filter(p => p.isNew === true);
    }

    if (filters.isTrending) {
      products = products.filter(p => p.isTrending === true);
    }

    if (filters.isFlashDeal) {
      products = products.filter(p => p.isFlashDeal === true);
    }

    if (filters.minPrice) {
      products = products.filter(p => p.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          products.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
        default:
          break;
      }
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products.length,
        totalPages: Math.ceil(products.length / limit),
        hasMore: endIndex < products.length,
      },
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const numId = parseInt(id);
    // Use loose equality fallback to handle any string/number mismatch
    return this.products.find(p => p.id === numId || String(p.id) === String(id));
  }

  /**
   * Get products by store ID
   */
  async getProductsByStoreId(storeId) {
    return this.products.filter(product => product.storeId === parseInt(storeId));
  }

  /**
   * Get hot/trending products near location
   */
  async getHotProductsNearLocation(location, limit = 10) {
    // In production, calculate distance and filter
    // For now, return trending products
    return this.products
      .filter(p => p.isTrending || p.isNew)
      .slice(0, limit);
  }

  /**
   * Get flash deals
   * Fetches products that are part of active flash deal promotions
   */
  async getFlashDeals(limit = 10) {
    // Import PromotionService dynamically to avoid circular dependency
    const { PromotionService } = await import('./PromotionService.js');

    // Get all active flash deal promotions
    const result = await PromotionService.getPromotions({
      type: 'flash',
      activeOnly: true,
      limit: 100,
    });

    const flashDealPromotions = result.promotions.filter(p => p.isCurrentlyActive());

    // Build a map from productId (as string) → promotion for type-safe lookup
    const promotionByProductId = new Map();
    for (const promotion of flashDealPromotions) {
      for (const productId of promotion.productIds) {
        const key = String(productId);
        if (!promotionByProductId.has(key)) {
          promotionByProductId.set(key, promotion);
        }
      }
    }

    // Find matching products — search directly to avoid parseInt type issues
    const products = [];
    const usedIds = new Set();

    for (const product of this.products) {
      if (products.length >= limit) break;
      const key = String(product.id);
      if (!promotionByProductId.has(key)) continue;
      if (usedIds.has(key)) continue;
      usedIds.add(key);

      try {
        const promotion = promotionByProductId.get(key);
        const productJson = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };

        productJson.flashDeal = {
          promotionId: promotion.id,
          discountValue: promotion.discountValue,
          discountType: promotion.discountType,
          endDate: promotion.endDate,
          maxInventory: promotion.maxInventory,
          currentInventory: promotion.currentInventory || 0,
          remaining: promotion.maxInventory
            ? Math.max(0, promotion.maxInventory - (promotion.currentInventory || 0))
            : null,
        };

        if (promotion.discountType === 'percentage') {
          productJson.flashDealPrice = parseFloat(
            (productJson.price * (1 - promotion.discountValue / 100)).toFixed(2)
          );
        } else if (promotion.discountType === 'amount') {
          productJson.flashDealPrice = Math.max(0, productJson.price - promotion.discountValue);
        } else {
          productJson.flashDealPrice = productJson.price;
        }

        products.push(productJson);
      } catch (err) {
        console.warn(`⚠️  getFlashDeals: error processing product ${product.id}:`, err.message);
      }
    }

    // Sort by end date (soonest first — highest urgency)
    products.sort((a, b) => {
      const aEnd = a.flashDeal?.endDate ? new Date(a.flashDeal.endDate) : Infinity;
      const bEnd = b.flashDeal?.endDate ? new Date(b.flashDeal.endDate) : Infinity;
      return aEnd - bEnd;
    });

    if (products.length >= limit) {
      return products.slice(0, limit);
    }

    // Fallback: pad with any discounted in-stock products
    const existingIds = new Set(products.map(p => String(p.id)));
    const need = limit - products.length;
    let fallbackIdx = 0;

    const fallbackDeals = this.products
      .filter(p => {
        if (p.stock === 'out' || p.isVisible === false) return false;
        if (existingIds.has(String(p.id))) return false;
        return p.originalPrice > p.price || p.discountPrice || p.discount || p.isFlashDeal;
      })
      .slice(0, need)
      .map((p, idx) => {
        try {
          const productJson = typeof p.toJSON === 'function' ? p.toJSON() : { ...p };
          const salePrice = productJson.discountPrice || productJson.price;
          const basePrice = productJson.originalPrice > salePrice ? productJson.originalPrice : productJson.price;
          const discountValue = basePrice > salePrice
            ? Math.round(((basePrice - salePrice) / basePrice) * 100)
            : Number(productJson.discount) || 10;
          const maxInventory = productJson.stockQuantity || 20;
          const currentInventory = Math.min(idx + 2, maxInventory - 1);
          const endDate = new Date(Date.now() + (idx + 3) * 60 * 60 * 1000);
          return {
            ...productJson,
            price: basePrice,
            originalPrice: basePrice,
            flashDealPrice: salePrice,
            isFlashDeal: true,
            flashDeal: {
              promotionId: `fallback-flash-${productJson.id}`,
              discountValue,
              discountType: 'percentage',
              endDate,
              maxInventory,
              currentInventory,
              remaining: Math.max(0, maxInventory - currentInventory),
            },
          };
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);

    return [...products, ...fallbackDeals].slice(0, limit);
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit = 10) {
    return this.products
      .filter(p => p.isNew)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  /**
   * Get top-rated products
   */
  async getTopRated(limit = 10) {
    return this.products
      .filter(p => p.rating >= 4.0 && p.stock !== 'out')
      .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, limit);
  }

  /**
   * Get recommended products
   */
  async getRecommendedProducts(userId = null, limit = 10) {
    // In production, use AI/ML for recommendations
    // For now, return popular products
    return this.products
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, limit);
  }

  /**
   * Get furniture bundles with catalog metadata.
   */
  async getBundles(options = {}) {
    if (typeof options === 'number') {
      options = { limit: options };
    }
    const limit = Math.max(1, parseInt(options.limit, 10) || 10);
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const room = options.room && options.room !== 'all' ? String(options.room).toLowerCase() : null;
    const sort = options.sort || 'featured';

    const isBundle = (product) => {
      const tags = Array.isArray(product.tags) ? product.tags.map(tag => String(tag).toLowerCase()) : [];
      const name = String(product.name || '').toLowerCase();
      return tags.includes('bundle') || name.includes('bundle');
    };

    const roomLabels = {
      living: 'Living Room',
      bedroom: 'Bedroom',
      dining: 'Dining',
      office: 'Office',
      outdoor: 'Outdoor',
      kids: 'Kids',
      storage: 'Storage',
    };

    const defaultItemsByRoom = {
      living: ['Anchor sofa', 'Coffee table', 'Accent lighting'],
      bedroom: ['Bed frame', 'Storage piece', 'Bedside table'],
      dining: ['Dining table', 'Chair set', 'Serving storage'],
      office: ['Work desk', 'Ergonomic chair', 'Storage or lighting'],
      outdoor: ['Outdoor seating', 'Side table', 'Weather-friendly accent'],
      kids: ['Study desk', 'Storage', 'Comfort seating'],
      storage: ['Shelving', 'Drawer storage', 'Room organiser'],
    };

    const enrichBundle = (product) => {
      const data = product.toJSON();
      const originalPrice = Number(data.originalPrice || data.price || 0);
      const price = Number(data.discountPrice || data.price || 0);
      const savings = Math.max(0, originalPrice - price);
      const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : Number(data.discount || 0);
      const bundleRoom = data.room || 'living';

      return {
        ...data,
        type: 'bundle',
        bundleName: data.name,
        bundleRoom,
        roomLabel: roomLabels[bundleRoom] || 'Home',
        includedItems: data.includedItems || defaultItemsByRoom[bundleRoom] || ['Curated furniture', 'Matching accent', 'Delivery-ready set'],
        bundleSavings: savings,
        savingsPercent,
        availabilityLabel: data.stock === 'out' ? 'Sold out' : data.stock === 'low' ? 'Low stock' : 'Available nearby',
        deliveryPromise: data.leadTimeDaysMax ? `${data.leadTimeDaysMin || 1}-${data.leadTimeDaysMax} day delivery` : 'Local delivery available',
        curationScore: Math.min(99, Math.round(((data.rating || 4.5) * 18) + Math.min(data.reviewCount || 0, 120) / 10)),
      };
    };

    let bundles = this.products
      .filter(product => isBundle(product) && product.isVisible !== false)
      .map(enrichBundle);

    if (room) {
      bundles = bundles.filter(bundle => String(bundle.bundleRoom || '').toLowerCase() === room);
    }

    const allBundles = this.products
      .filter(product => isBundle(product) && product.isVisible !== false)
      .map(enrichBundle);

    const rooms = Object.values(allBundles.reduce((acc, bundle) => {
      const key = bundle.bundleRoom || 'living';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          label: bundle.roomLabel,
          count: 0,
        };
      }
      acc[key].count += 1;
      return acc;
    }, {})).sort((a, b) => a.label.localeCompare(b.label));

    bundles.sort((a, b) => {
      if (sort === 'savings') return (b.bundleSavings || 0) - (a.bundleSavings || 0);
      if (sort === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.curationScore || 0) - (a.curationScore || 0) || (b.savingsPercent || 0) - (a.savingsPercent || 0);
    });

    const total = bundles.length;
    const startIndex = (page - 1) * limit;
    const paginated = bundles.slice(startIndex, startIndex + limit);
    const highestSavings = allBundles.reduce((max, bundle) => Math.max(max, bundle.bundleSavings || 0), 0);

    return {
      products: paginated,
      summary: {
        total: allBundles.length,
        filteredTotal: total,
        highestSavings,
        averageSavingsPercent: allBundles.length
          ? Math.round(allBundles.reduce((sum, bundle) => sum + (bundle.savingsPercent || 0), 0) / allBundles.length)
          : 0,
        rooms,
      },
      featured: allBundles
        .slice()
        .sort((a, b) => (b.bundleSavings || 0) - (a.bundleSavings || 0))
        .slice(0, 3),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: startIndex + limit < total,
      },
    };
  }

  /**
   * Get fast delivery products (products within 2km distance)
   */
  async getFastDeliveryProducts(location = null, limit = 10) {
    // Filter products with distance < 2km for fast delivery
    return this.products
      .filter(p => p.distance && p.distance < 2 && p.stock === 'in')
      .sort((a, b) => {
        // Sort by distance (closest first), then by popularity
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      })
      .slice(0, limit);
  }

  /**
   * Get related products (same category, different product)
   */
  async getRelatedProducts(productId, limit = 8, page = 1) {
    const product = await this.getProductById(productId);
    if (!product) return { products: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false } };

    const filtered = this.products.filter(p => 
      p.id !== productId && 
      (p.category === product.category || p.storeId === product.storeId)
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        hasMore: endIndex < filtered.length,
      },
    };
  }

  /**
   * Get frequently bought together products
   */
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    const product = await this.getProductById(productId);
    if (!product) return [];

    // In production, use ML to find actual frequently bought together items
    // For now, return products from same store or complementary categories
    const complementaryCategories = {
      'Groceries': ['Groceries', 'Home & Kitchen'],
      'Braai': ['Braai', 'Groceries'],
      'Electronics': ['Electronics', 'Home & Kitchen'],
      'Home & Kitchen': ['Home & Kitchen', 'Groceries'],
      'Fashion': ['Fashion'],
      'Baby & Kids': ['Baby & Kids', 'Health'],
      'Health': ['Health', 'Baby & Kids'],
    };

    const categories = complementaryCategories[product.category] || [product.category];

    return this.products
      .filter(p => 
        p.id !== productId && 
        (categories.includes(p.category) || p.storeId === product.storeId) &&
        p.stock === 'in'
      )
      .slice(0, limit);
  }

  /**
   * Clear all products (for re-seeding)
   */
  clearProducts() {
    const previousCount = this.products.length;
    this.products = [];
    this.nextId = 1;
    console.log(`🗑️  Cleared ${previousCount} products from ProductService`);
    return previousCount;
  }

  /**
   * Bulk add products (for seeding)
   */
  addProducts(products) {
    if (!Array.isArray(products)) {
      throw new Error('Products must be an array');
    }
    
    if (products.length === 0) {
      console.warn('⚠️ addProducts called with empty array');
      return this.products.length;
    }
    
    let addedCount = 0;
    let skippedCount = 0;
    
    products.forEach((product, index) => {
      try {
        // If it's already a Product instance, use it
        if (product instanceof Product) {
          // Ensure unique ID
          if (!product.id || this.products.find(p => p.id === product.id)) {
            product.id = this.nextId++;
          }
          this.products.push(product);
          addedCount++;
        } else {
          // If it's a plain object, create Product instance
          const productInstance = new Product({
            ...product,
            id: product.id || this.nextId++,
          });
          this.products.push(productInstance);
          addedCount++;
        }
      } catch (error) {
        console.error(`⚠️ Error adding product at index ${index}:`, error.message);
        skippedCount++;
      }
    });
    
    // Update nextId to avoid conflicts
    if (this.products.length > 0) {
      const maxId = Math.max(...this.products.map(p => p.id || 0));
      this.nextId = Math.max(this.nextId, maxId + 1);
    }
    
    if (skippedCount > 0) {
      console.warn(`⚠️ Skipped ${skippedCount} products due to errors`);
    }
    
    console.log(`✅ Successfully added ${addedCount} products to ProductService`);
    return this.products.length;
  }

  /**
   * Create a new product
   */
  async createProduct(productData) {
    // Check for duplicate product name in same store
    if (productData.name && productData.storeId) {
      const existingProduct = this.products.find(
        p => p.storeId === parseInt(productData.storeId) &&
        p.name.toLowerCase().trim() === productData.name.toLowerCase().trim()
      );
      if (existingProduct) {
        const error = new Error('A product with this name already exists in your store');
        error.statusCode = 409;
        throw error;
      }
    }

    // Check for duplicate SKU if provided
    if (productData.sku) {
      const existingSKU = this.products.find(p => p.sku === productData.sku);
      if (existingSKU) {
        const error = new Error('A product with this SKU already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    // Check for duplicate barcode if provided
    if (productData.barcode) {
      const existingBarcode = this.products.find(p => p.barcode === productData.barcode);
      if (existingBarcode) {
        const error = new Error('A product with this barcode already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    while (this.products.some(p => String(p.id) === String(this.nextId))) {
      this.nextId += 1;
    }

    const product = new Product({
      ...productData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate SKU if not provided
    if (!product.sku) {
      product.generateSKU();
      // Ensure SKU is unique
      let attempts = 0;
      while (this.products.some(p => p.sku === product.sku) && attempts < 10) {
        product.generateSKU();
        attempts++;
      }
    }

    // Update stock status
    product.updateStockStatus();

    const validation = product.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    this.products.push(product);

    // H3 indexing: attach store location data and compute quality score
    try {
      const stores = getAllStores();
      const store = stores.find(s => String(s.id) === String(product.storeId));
      if (store) {
        const sellers = await SellerService.getAllSellers();
        const seller = sellers.find(s => String(s.id) === String(store.sellerId));
        indexProduct(product, store, seller || null, null);
      }
    } catch (indexErr) {
      console.warn('H3 indexProduct (create) failed silently:', indexErr.message);
    }

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id, productData) {
    const productIndex = this.products.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) {
      return null;
    }

    const existingProduct = this.products[productIndex];

    // Check for duplicate product name in same store (excluding current product)
    if (productData.name && existingProduct.storeId) {
      const duplicate = this.products.find(
        p => p.id !== parseInt(id) &&
        p.storeId === existingProduct.storeId &&
        p.name.toLowerCase().trim() === productData.name.toLowerCase().trim()
      );
      if (duplicate) {
        const error = new Error('A product with this name already exists in your store');
        error.statusCode = 409;
        throw error;
      }
    }

    // Check for duplicate SKU if provided (excluding current product)
    if (productData.sku) {
      const duplicateSKU = this.products.find(p => p.id !== parseInt(id) && p.sku === productData.sku);
      if (duplicateSKU) {
        const error = new Error('A product with this SKU already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    // Check for duplicate barcode if provided (excluding current product)
    if (productData.barcode) {
      const duplicateBarcode = this.products.find(p => p.id !== parseInt(id) && p.barcode === productData.barcode);
      if (duplicateBarcode) {
        const error = new Error('A product with this barcode already exists');
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedProduct = new Product({
      ...existingProduct,
      ...productData,
      id: parseInt(id),
      updatedAt: new Date(),
    });

    // Update stock status after changes
    updatedProduct.updateStockStatus();

    const validation = updatedProduct.validate();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    this.products[productIndex] = updatedProduct;

    // H3 indexing: re-index after update
    try {
      const stores = getAllStores();
      const store = stores.find(s => String(s.id) === String(updatedProduct.storeId));
      if (store) {
        const sellers = await SellerService.getAllSellers();
        const seller = sellers.find(s => String(s.id) === String(store.sellerId));
        indexProduct(updatedProduct, store, seller || null, null);
      }
    } catch (indexErr) {
      console.warn('H3 indexProduct (update) failed silently:', indexErr.message);
    }

    return updatedProduct;
  }

  /**
   * Delete product
   */
  async deleteProduct(id) {
    const productIndex = this.products.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) {
      return false;
    }

    this.products.splice(productIndex, 1);
    return true;
  }

  /**
   * Get seller products with advanced filtering and sorting
   */
  async getSellerProducts(storeId, filters = {}) {
    let products = this.products.filter(p => p.storeId === parseInt(storeId));

    // Filter by visibility if specified
    if (filters.visibility !== undefined) {
      const isVisible = filters.visibility === 'true' || filters.visibility === true;
      products = products.filter(p => p.isVisible === isVisible);
    }

    // Filter by stock status
    if (filters.stockStatus) {
      products = products.filter(p => p.stock === filters.stockStatus);
    }

    // Filter by low stock
    if (filters.lowStock === 'true' || filters.lowStock === true) {
      products = products.filter(p => p.stock === 'low' || p.stock === 'out');
    }

    // Search by name, SKU, barcode, or category
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm)) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm)) ||
        (p.category && p.category.toLowerCase().includes(searchTerm)) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Filter by category
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }

    // Filter by tags
    if (filters.tags) {
      const tagArray = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      products = products.filter(p =>
        p.tags && tagArray.some(tag => p.tags.includes(tag))
      );
    }

    // Sort products
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'best_sellers':
          products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
          break;
        case 'low_stock':
          products.sort((a, b) => {
            const aQty = a.stockQuantity || 0;
            const bQty = b.stockQuantity || 0;
            if (a.stock === 'out' && b.stock !== 'out') return -1;
            if (a.stock !== 'out' && b.stock === 'out') return 1;
            return aQty - bQty;
          });
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'category':
          products.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
          break;
        case 'price_asc':
          products.sort((a, b) => {
            const aPrice = a.discountPrice !== null && a.discountPrice !== undefined ? a.discountPrice : a.price;
            const bPrice = b.discountPrice !== null && b.discountPrice !== undefined ? b.discountPrice : b.price;
            return aPrice - bPrice;
          });
          break;
        case 'price_desc':
          products.sort((a, b) => {
            const aPrice = a.discountPrice !== null && a.discountPrice !== undefined ? a.discountPrice : a.price;
            const bPrice = b.discountPrice !== null && b.discountPrice !== undefined ? b.discountPrice : b.price;
            return bPrice - aPrice;
          });
          break;
        case 'name_asc':
          products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          break;
        case 'name_desc':
          products.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case 'oldest':
          products.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
          break;
        default:
          // Default: newest first
          products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
      }
    } else {
      // Default sort: newest first
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products.length,
        totalPages: Math.ceil(products.length / limit),
        hasMore: endIndex < products.length,
      },
    };
  }

  /**
   * Update product visibility
   */
  async updateProductVisibility(id, isVisible) {
    return this.updateProduct(id, { isVisible });
  }

  /**
   * Update product stock quantity
   */
  async updateProductStock(id, stockQuantity) {
    const product = await this.getProductById(id);
    if (!product) return null;

    const updated = await this.updateProduct(id, { stockQuantity });
    return updated;
  }

  /**
   * Update product price
   */
  async updateProductPrice(id, price, discountPrice = null) {
    return this.updateProduct(id, { price, discountPrice });
  }

  /**
   * Duplicate product
   */
  async duplicateProduct(id) {
    const product = await this.getProductById(id);
    if (!product) return null;

    const productData = product.toJSON();
    delete productData.id;
    delete productData.sku;
    delete productData.barcode;
    const baseName = productData.name.replace(/\s+\(Copy(?: \d+)?\)$/i, '');
    let copyName = `${baseName} (Copy)`;
    let copyNumber = 2;
    while (this.products.some(p =>
      p.storeId === product.storeId &&
      p.name.toLowerCase().trim() === copyName.toLowerCase().trim()
    )) {
      copyName = `${baseName} (Copy ${copyNumber})`;
      copyNumber += 1;
    }
    productData.name = copyName;
    productData.isVisible = false; // Hide duplicated product by default
    productData.salesCount = 0;
    productData.createdAt = new Date();
    productData.updatedAt = new Date();

    return this.createProduct(productData);
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(productIds, updates) {
    const results = [];
    for (const id of productIds) {
      try {
        const updated = await this.updateProduct(id, updates);
        if (updated) {
          results.push({ id, success: true, product: updated });
        } else {
          results.push({ id, success: false, error: 'Product not found' });
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(productIds) {
    const results = [];
    for (const id of productIds) {
      const deleted = await this.deleteProduct(id);
      results.push({ id, success: deleted });
    }
    return results;
  }

  /**
   * Get product statistics for seller
   */
  async getSellerProductStats(storeId) {
    const products = this.products.filter(p => p.storeId === parseInt(storeId));
    
    const stats = {
      total: products.length,
      visible: products.filter(p => p.isVisible).length,
      hidden: products.filter(p => !p.isVisible).length,
      inStock: products.filter(p => p.stock === 'in').length,
      lowStock: products.filter(p => p.stock === 'low').length,
      outOfStock: products.filter(p => p.stock === 'out').length,
      categories: {},
      totalSales: products.reduce((sum, p) => sum + (p.salesCount || 0), 0),
    };

    // Count by category
    products.forEach(p => {
      if (p.category) {
        stats.categories[p.category] = (stats.categories[p.category] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Seed products (for development)
   */
  async seedProducts(productsData) {
    this.products = [];
    this.nextId = 1;
    
    for (const data of productsData) {
      await this.createProduct(data);
    }
    
    return this.products.length;
  }
}

// Export singleton instance
export const ProductService = new ProductServiceClass();

