import { 
  STYLES, 
  MATERIALS, 
  CONDITIONS, 
  COLORS, 
  STOCK_TYPES, 
  SA_REGIONS,
} from '../constants/furnitureTaxonomy.js';
import { CURATED_FURNITURE_PRODUCTS } from '../data/curatedFurnitureProducts.js';
import { generateH3Cells } from '../utils/h3Utils.js';
import { Product } from '../models/Product.js';
import Store from '../models/Store.js';

/**
 * Realistic Furniture Seeding Service
 * Uses curated furniture products with matching images and descriptions
 */

class RealisticFurnitureSeedingService {
  constructor() {
    this.seedStores = [];
    this.seedProducts = [];
    this.storeIdCounter = 10000;
    this.productIdCounter = 20000;
  }

  /**
   * Main seeding method
   */
  async seedRealisticFurnitureMarketplace(options = {}) {
    const {
      targetProductCount = 1000,
      targetStoreCount = 30,
      regions = Object.keys(SA_REGIONS),
    } = options;

    console.log('🪑 ========================================');
    console.log('   REALISTIC FURNITURE MARKETPLACE');
    console.log('   (Curated Products with Matching Images)');
    console.log('========================================\n');
    console.log(`📍 Regions: ${regions.join(', ')}`);
    console.log(`🏪 Stores: ${targetStoreCount}`);
    console.log(`📦 Products: ${targetProductCount}`);
    console.log(`🖼️  Images match descriptions exactly\n`);

    await this.generateStores(targetStoreCount, regions);
    console.log(`✅ Generated ${this.seedStores.length} stores\n`);

    await this.generateRealisticProducts(targetProductCount);
    console.log(`✅ Generated ${this.seedProducts.length} realistic products\n`);

    return {
      stores: this.seedStores,
      products: this.seedProducts,
    };
  }

  /**
   * Generate furniture stores
   */
  async generateStores(targetCount, regions) {
    const storeNames = [
      'Modern Living Furniture', 'The Furniture Studio', 'Home Essentials',
      'Contemporary Spaces', 'Classic Furniture Co.', 'Urban Home Store',
      'Style & Comfort', 'Furniture Gallery', 'Living Trends',
      'The Home Store', 'Comfort Zone', 'Design Depot',
      'Elite Furnishings', 'Premium Living', 'Casa Bella',
    ];

    const storesPerRegion = Math.ceil(targetCount / regions.length);

    for (const regionKey of regions) {
      const region = SA_REGIONS[regionKey];
      if (!region) continue;

      for (let i = 0; i < storesPerRegion && this.seedStores.length < targetCount; i++) {
        const storeName = `${this.randomChoice(storeNames)} - ${region.city}`;
        
        const latOffset = this.randomFloat(-0.01, 0.01, 4);
        const lngOffset = this.randomFloat(-0.01, 0.01, 4);
        const storeLat = region.lat + latOffset;
        const storeLng = region.lng + lngOffset;

        const storeH3Cells = generateH3Cells(storeLat, storeLng);

        const store = new Store({
          id: this.storeIdCounter++,
          name: storeName,
          description: `Quality furniture store in ${region.city}`,
          address: `${region.suburb}, ${region.city}`,
          lat: storeLat,
          lng: storeLng,
          ...storeH3Cells,
          storeType: this.randomChoice(['retailer', 'retailer', 'maker', 'warehouse']),
          deliveryModes: ['pickup', 'local_delivery'],
          assemblyAvailable: Math.random() > 0.3,
          returnPolicyDays: this.randomChoice([7, 14, 30]),
          onTimeRate: this.randomFloat(0.90, 0.98, 2),
          ratingAvgBayesian: this.randomFloat(4.0, 4.9, 1),
        });

        this.seedStores.push(store);
      }
    }
  }

  /**
   * Generate realistic furniture products from curated database
   */
  async generateRealisticProducts(targetCount) {
    const productsPerStore = Math.ceil(targetCount / this.seedStores.length);
    let productCount = 0;

    for (const store of this.seedStores) {
      const storeProductCount = Math.min(
        this.randomInt(Math.floor(productsPerStore * 0.8), Math.ceil(productsPerStore * 1.2)),
        targetCount - productCount
      );

      for (let i = 0; i < storeProductCount && productCount < targetCount; i++) {
        // Cycle through curated products
        const productData = CURATED_FURNITURE_PRODUCTS[productCount % CURATED_FURNITURE_PRODUCTS.length];
        const product = this.createProductFromData(store, productData);
        
        this.seedProducts.push(product);
        productCount++;
      }

      if (productCount >= targetCount) break;
    }
  }

  /**
   * Create product instance from curated product data
   */
  createProductFromData(store, productData) {
    const condition = this.randomChoice(CONDITIONS);
    const stockType = this.randomChoice(STOCK_TYPES);
    const style = this.randomChoice(STYLES);
    const material = this.randomChoice(MATERIALS);
    const color = this.randomChoice(COLORS);

    // Calculate price based on condition
    const basePrice = this.randomInt(productData.priceRange[0], productData.priceRange[1]);
    const conditionMultiplier = {
      'new': 1.0,
      'like-new': 0.85,
      'used': 0.65,
      'refurbished': 0.75,
    }[condition.id] || 1.0;
    const price = Math.round(basePrice * conditionMultiplier);

    // Generate discount
    const hasDiscount = Math.random() > 0.70;
    const discountPrice = hasDiscount ? Math.round(price * this.randomFloat(0.75, 0.92, 2)) : null;

    // Generate dimensions
    const dimensions = {
      w: this.randomInt(productData.dimensions.w[0], productData.dimensions.w[1]),
      d: this.randomInt(productData.dimensions.d[0], productData.dimensions.d[1]),
      h: this.randomInt(productData.dimensions.h[0], productData.dimensions.h[1]),
    };

    const product = new Product({
      id: this.productIdCounter++,
      name: productData.name,
      description: productData.description,
      price,
      discountPrice,
      discount: hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : null,
      image: productData.images[0],
      images: productData.images,
      coverImage: productData.images[0],
      category: 'furniture',
      subcategory: productData.category,
      tags: [productData.room, productData.category, style.id, material.id, color.id, condition.id].filter(Boolean),
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.address,
      stock: stockType.id === 'in_stock' ? 'in' : stockType.id === 'limited' ? 'low' : 'in',
      stockQuantity: this.randomInt(5, 50),
      isVisible: true,
      sku: `FUR-${productData.category.toUpperCase()}-${this.productIdCounter}`,
      weight: this.generateWeight(productData.category),
      dimensions,
      dimensionsSnippet: `W${dimensions.w}×D${dimensions.d}×H${dimensions.h}cm`,
      rating: this.randomFloat(3.8, 4.9, 1),
      reviewCount: this.randomInt(5, 250),
      isNew: Math.random() > 0.80,
      isTrending: Math.random() > 0.85,
      isFlashDeal: hasDiscount && Math.random() > 0.90,
      salesCount: this.randomInt(10, 300),

      // Furniture-specific
      room: productData.room,
      furnitureCategory: productData.category,
      subCategory: null,
      style: style.id,
      condition: condition.id,
      materialPrimary: material.id,
      materialSecondary: Math.random() > 0.6 ? this.randomChoice(MATERIALS).id : null,
      colorPrimary: color.id,
      color: color.id,
      careNotes: this.generateCareNotes(material.id),
      assemblyRequired: this.requiresAssembly(productData.category),
      assemblyFee: store.assemblyAvailable ? this.randomInt(150, 800) : null,
      deliveryEligible: true,
      leadTimeDaysMin: 0,
      leadTimeDaysMax: 7,
      stockType: stockType.id,
      restockEta: stockType.id === 'limited' ? new Date(Date.now() + this.randomInt(5, 14) * 86400000).toISOString() : null,
      availabilityConfidence: this.randomFloat(0.85, 1.0, 2),
      lastStockUpdate: new Date(Date.now() - this.randomInt(0, 7) * 86400000),
      sizeTag: this.deriveSizeTag(dimensions),
      complaintRate: this.randomFloat(0.005, 0.025, 3),
      returnRate: this.randomFloat(0.02, 0.08, 2),
      qualityScore: this.randomFloat(0.75, 0.95, 2),
      normalizedTitle: productData.name.toLowerCase(),
    });

    return product;
  }

  // Helper methods
  generateWeight(category) {
    const weights = {
      'sofas': [40, 80],
      'beds': [30, 70],
      'desks': [20, 50],
      'dining-tables': [20, 50],
      'coffee-tables': [10, 30],
      'wardrobes': [50, 100],
      'dressers': [30, 50],
      'nightstands': [10, 20],
      'dining-chairs': [5, 15],
      'office-chairs': [10, 20],
      'patio-sets': [30, 60],
      'kids-beds': [20, 40],
    };
    const range = weights[category] || [10, 30];
    return this.randomInt(range[0], range[1]);
  }

  generateCareNotes(material) {
    const notes = {
      'wood': 'Wipe with damp cloth. Avoid harsh chemicals. Polish occasionally.',
      'fabric': 'Vacuum regularly. Spot clean stains immediately. Professional cleaning recommended.',
      'leather': 'Wipe with leather cleaner. Condition every 6 months. Avoid direct sunlight.',
      'metal': 'Wipe with damp cloth. Dry immediately to prevent rust.',
      'glass': 'Clean with glass cleaner. Avoid abrasive materials.',
      'rattan': 'Wipe with damp cloth. Avoid excessive moisture.',
    };
    return notes[material] || 'Clean with appropriate cleaner for material type.';
  }

  requiresAssembly(category) {
    const requiresAssembly = ['beds', 'desks', 'wardrobes', 'dining-tables'];
    return requiresAssembly.includes(category) && Math.random() > 0.3;
  }

  deriveSizeTag(dimensions) {
    const volume = dimensions.w * dimensions.d * dimensions.h;
    if (volume < 200000) return 'small';
    if (volume < 500000) return 'medium';
    return 'large';
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }
}

export default RealisticFurnitureSeedingService;
