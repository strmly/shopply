import { 
  ROOMS, 
  FURNITURE_CATEGORIES, 
  STYLES, 
  MATERIALS, 
  CONDITIONS, 
  COLORS, 
  STOCK_TYPES, 
  STORE_TYPES, 
  SA_REGIONS,
} from '../constants/furnitureTaxonomy.js';
import { FURNITURE_PRODUCT_TEMPLATES, PEXELS_SEARCH_TERMS } from '../constants/realFurnitureData.js';
import { generateH3Cells, getH3CellsForTier, RADIUS_TIERS } from '../utils/h3Utils.js';
import { Product } from '../models/Product.js';
import Store from '../models/Store.js';

/**
 * Real Furniture Seeding Service
 * Seeds 1000-10000 REAL furniture products with actual names, descriptions, and images
 */

class RealFurnitureSeedingService {
  constructor() {
    this.seedStores = [];
    this.seedProducts = [];
    this.storeIdCounter = 10000;
    this.productIdCounter = 20000;
    this.h3DensityMap = {};
    this.regionStats = {};
    this.usedProductNames = new Set(); // Track used names to avoid exact duplicates
  }

  /**
   * Main seeding method - generates 1000-10000 real furniture products
   */
  async seedRealFurnitureMarketplace(options = {}) {
    const {
      targetProductCount = 5000, // Default to 5000 products
      targetStoreCount = 100,     // More stores for more variety
      regions = Object.keys(SA_REGIONS),
    } = options;

    console.log('🪑 ========================================');
    console.log('   REAL FURNITURE MARKETPLACE SEEDING');
    console.log('   (Actual Products with Real Images)');
    console.log('========================================\n');
    console.log(`📍 Target Regions: ${regions.join(', ')}`);
    console.log(`🏪 Target Stores: ${targetStoreCount}`);
    console.log(`📦 Target Products: ${targetProductCount}`);
    console.log(`🖼️  Using Real Furniture Images\n`);

    // Step 1: Generate credible stores
    await this.generateCredibleStores(targetStoreCount, regions);
    console.log(`✅ Generated ${this.seedStores.length} furniture stores\n`);

    // Step 2: Generate REAL furniture products with actual names and descriptions
    await this.generateRealFurnitureProducts(targetProductCount);
    console.log(`✅ Generated ${this.seedProducts.length} real furniture products\n`);

    // Step 3: Analyze distribution
    const densityReport = this.analyzeDistribution();
    this.printDistributionReport(densityReport);

    return {
      stores: this.seedStores,
      products: this.seedProducts,
      densityReport,
    };
  }

  /**
   * Generate credible furniture stores
   */
  async generateCredibleStores(targetCount, regions) {
    const storeNamesByType = {
      retailer: [
        'Urban Living Furniture', 'Modern Spaces Interiors', 'The Furniture Hub',
        'Design Depot', 'Home & Living Co.', 'Contemporary Interiors',
        'Furniture Gallery', 'Style Studio', 'Living Trends', 'Home Essentials',
        'Comfort Zone Furniture', 'Elite Home Furnishings', 'Signature Furniture',
        'The Furniture Warehouse', 'Premium Living Spaces', 'Casa Bella Furniture',
      ],
      maker: [
        'Artisan Woodworks', 'Custom Craft Furniture', 'Handmade Haven',
        'The Wood Shop', 'Bespoke Furniture Co.', 'Local Makers Collective',
        'Timber & Steel', 'Heritage Furniture Makers', 'Crafted Living',
        'Master Craftsmen', 'Woodwork Studio', 'Artisan Furniture Co.',
      ],
      reseller: [
        'Second Chance Furniture', 'Vintage Finds', 'Pre-Loved Furniture Market',
        'The Furniture Exchange', 'Resale Furniture Depot', 'Quality Used Furniture',
        'Restored & Renewed', 'Furniture Revival', 'Thrift Furniture Store',
      ],
      warehouse: [
        'Furniture Warehouse Direct', 'Bulk Furniture Outlet', 'Wholesale Furniture Co.',
        'Factory Direct Furniture', 'Warehouse Furniture Deals', 'Direct Import Furniture',
      ],
      showroom: [
        'Luxury Furniture Showroom', 'Designer Furniture Gallery', 'Premium Showroom',
        'Elite Furniture Displays', 'High-End Furniture Showroom', 'Exclusive Designs',
      ],
    };

    const storesPerRegion = Math.ceil(targetCount / regions.length);

    for (const regionKey of regions) {
      const region = SA_REGIONS[regionKey];
      if (!region) continue;

      for (let i = 0; i < storesPerRegion && this.seedStores.length < targetCount; i++) {
        const storeType = this.pickStoreType();
        const names = storeNamesByType[storeType];
        const storeName = `${this.randomChoice(names)} - ${region.city}`;

        // Generate H3 cells for this store location
        const h3Cells = generateH3Cells(region.lat, region.lng);

        // Small random offset for store location (within 5km radius)
        const latOffset = this.randomFloat(-0.02, 0.02, 4);
        const lngOffset = this.randomFloat(-0.02, 0.02, 4);
        const storeLat = region.lat + latOffset;
        const storeLng = region.lng + lngOffset;

        // Generate H3 cells for the adjusted store location
        const storeH3Cells = generateH3Cells(storeLat, storeLng);

        const store = new Store({
          id: this.storeIdCounter++,
          name: storeName,
          description: `Quality furniture store in ${region.city}`,
          address: `${region.suburb}, ${region.city}`,
          lat: storeLat,
          lng: storeLng,
          ...storeH3Cells,
          storeType,
          serviceAreaTiersAllowed: this.getServiceTiers(storeType),
          deliveryModes: this.getDeliveryModes(storeType),
          deliveryPricingModel: 'flat_per_tier',
          deliveryPricing: { T0: 50, T1: 100, T2: 150, T3: 200 },
          assemblyAvailable: Math.random() > 0.3,
          assemblyFeeModel: 'per_item',
          returnPolicyDays: [7, 14, 30][Math.floor(Math.random() * 3)],
          leadTimeProfile: this.randomChoice(['same_day', 'next_day', '3-7_days']),
          leadTimeDaysMin: 0,
          leadTimeDaysMax: 7,
          onTimeRate: this.randomFloat(0.88, 0.98, 2),
          cancelRate: this.randomFloat(0.01, 0.05, 2),
          disputeRate: this.randomFloat(0.005, 0.02, 3),
          storeQualityScore: this.randomFloat(0.75, 0.95, 2),
          ratingAvgBayesian: this.randomFloat(3.8, 4.9, 1),
          verificationStatus: Math.random() > 0.2 ? 'verified' : 'unverified',
          fulfillmentMetrics: {
            onTimeRate: this.randomFloat(0.88, 0.98, 2),
            cancelRate: this.randomFloat(0.01, 0.05, 2),
            disputeRate: this.randomFloat(0.005, 0.02, 3),
            stockMismatchRate: this.randomFloat(0.02, 0.08, 2),
            responseTimeAvgHours: this.randomInt(2, 48),
          },
        });

        this.seedStores.push(store);
      }
    }
  }

  /**
   * Generate REAL furniture products with actual names and descriptions
   */
  async generateRealFurnitureProducts(targetCount) {
    const productsPerStore = Math.ceil(targetCount / this.seedStores.length);
    let productCount = 0;

    // Get all product templates
    const allTemplates = Object.entries(FURNITURE_PRODUCT_TEMPLATES);

    for (const store of this.seedStores) {
      const storeProductCount = this.randomInt(
        Math.floor(productsPerStore * 0.7),
        Math.ceil(productsPerStore * 1.3)
      );

      for (let i = 0; i < storeProductCount && productCount < targetCount; i++) {
        // Pick a random category template
        const [categoryId, categoryData] = this.randomChoice(allTemplates);
        const productTemplate = this.randomChoice(categoryData.products);

        // Generate product from template
        const product = this.generateProductFromTemplate(
          store,
          categoryId,
          productTemplate
        );

        this.seedProducts.push(product);
        productCount++;
      }
    }
  }

  /**
   * Generate a product from a real furniture template
   */
  generateProductFromTemplate(store, categoryId, template) {
    // Pick a name variant
    const baseName = this.randomChoice(template.names);
    
    // Add variation to avoid exact duplicates
    let productName = baseName;
    let counter = 1;
    while (this.usedProductNames.has(productName) && counter < 100) {
      const style = this.randomChoice(STYLES);
      const color = this.randomChoice(COLORS);
      productName = `${style.label} ${baseName} in ${color.label}`;
      counter++;
    }
    this.usedProductNames.add(productName);

    // Pick a description variant
    const description = this.randomChoice(template.descriptions);

    // Generate dimensions from template range
    const dimensions = {
      w: this.randomInt(template.dimensions.w[0], template.dimensions.w[1]),
      d: this.randomInt(template.dimensions.d[0], template.dimensions.d[1]),
      h: this.randomInt(template.dimensions.h[0], template.dimensions.h[1]),
    };

    // Generate price from template range
    const basePrice = this.randomInt(template.priceRange[0], template.priceRange[1]);
    const condition = this.randomChoice(CONDITIONS);
    const conditionMultiplier = this.getConditionPriceMultiplier(condition.id);
    const price = Math.round(basePrice * conditionMultiplier);

    // Generate discount
    const hasDiscount = Math.random() > 0.7;
    const discountPrice = hasDiscount ? Math.round(price * this.randomFloat(0.75, 0.92, 2)) : null;

    // Generate REAL images using Pexels search terms
    const searchTerm = this.randomChoice(template.searchTerms);
    const images = this.generateRealImages(categoryId, searchTerm, 4);

    // Get room and category info
    const room = this.getRoomForCategory(categoryId);
    const style = this.randomChoice(STYLES);
    const materialPrimary = this.randomChoice(MATERIALS);
    const color = this.randomChoice(COLORS);
    const stockType = this.randomChoice(STOCK_TYPES);

    const product = new Product({
      id: this.productIdCounter++,
      name: productName,
      description,
      price,
      discountPrice,
      discount: hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : null,
      image: images[0],
      images,
      coverImage: images[0],
      category: 'furniture',
      subcategory: categoryId,
      tags: [room, categoryId, style.id, materialPrimary.id, color.id, condition.id].filter(Boolean),
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.address,
      stock: stockType.id === 'in_stock' ? 'in' : stockType.id === 'limited' ? 'low' : 'in',
      stockQuantity: this.randomInt(1, 50),
      trackInventory: true,
      isVisible: true,
      sku: `FUR-${categoryId.toUpperCase()}-${this.productIdCounter}`,
      weight: this.generateWeight(categoryId),
      dimensions,
      dimensionsSnippet: `W${dimensions.w}×D${dimensions.d}×H${dimensions.h}cm`,
      rating: this.randomFloat(3.5, 4.9, 1),
      reviewCount: this.randomInt(0, 200),
      isNew: Math.random() > 0.85,
      isTrending: Math.random() > 0.90,
      isFlashDeal: hasDiscount && Math.random() > 0.95,
      salesCount: this.randomInt(0, 300),

      // Furniture-specific fields
      room,
      furnitureCategory: categoryId,
      subCategory: this.generateSubCategory(categoryId),
      style: style.id,
      condition: condition.id,
      materialPrimary: materialPrimary.id,
      materialSecondary: Math.random() > 0.6 ? this.randomChoice(MATERIALS).id : null,
      colorPrimary: color.id,
      color: color.id,
      careNotes: this.generateCareNotes(materialPrimary.id),
      assemblyRequired: this.requiresAssembly(categoryId),
      assemblyFee: store.assemblyAvailable ? this.randomInt(100, 800) : null,
      deliveryEligible: true,
      leadTimeDaysMin: store.leadTimeDaysMin,
      leadTimeDaysMax: store.leadTimeDaysMax,
      stockType: stockType.id,
      restockEta: stockType.id === 'limited' ? new Date(Date.now() + this.randomInt(3, 14) * 86400000).toISOString() : null,
      availabilityConfidence: this.randomFloat(0.85, 1.0, 2),
      lastStockUpdate: new Date(Date.now() - this.randomInt(0, 7) * 86400000),
      sizeTag: this.deriveSizeTag(dimensions, categoryId),
      complaintRate: this.randomFloat(0.005, 0.025, 3),
      returnRate: this.randomFloat(0.02, 0.08, 2),
      qualityScore: this.randomFloat(0.75, 0.95, 2),
      normalizedTitle: productName.toLowerCase(),
    });

    return product;
  }

  /**
   * Generate REAL furniture images using Pexels API format
   * In production, you'd fetch from Pexels API. For now, using Pexels photo URLs
   */
  generateRealImages(categoryId, searchTerm, count) {
    const images = [];
    
    // Use Pexels photo IDs for real furniture images
    // These are actual photo IDs from Pexels furniture collections
    const pexelsPhotoIds = {
      'sofas': [1350789, 1866149, 2062431, 2724749, 3155666, 3757055, 4352247, 5490966],
      'coffee-tables': [1866149, 2079249, 2724749, 3155666, 4352247, 5490966, 6782567],
      'beds': [164595, 271743, 1454806, 2029667, 2082090, 2724749, 3155666, 4352247],
      'wardrobes': [1454806, 2082090, 2724749, 3155666, 4352247, 5490966, 6782567],
      'dining-tables': [1080696, 1395964, 1866149, 2079249, 2724749, 3155666, 4352247],
      'dining-chairs': [1080696, 1395964, 1866149, 2079249, 2724749, 3155666, 4352247],
      'desks': [667838, 1181406, 1181416, 1957478, 4050315, 5052875, 6782567],
      'office-chairs': [667838, 1181406, 1181416, 1957478, 4050315, 5052875, 6782567],
      'patio-sets': [1080696, 1395964, 2079249, 3155666, 4352247, 5490966, 6782567],
      'kids-beds': [164595, 271743, 1454806, 2029667, 2082090, 2724749, 3155666],
    };

    const photoIds = pexelsPhotoIds[categoryId] || pexelsPhotoIds['sofas'];
    
    for (let i = 0; i < count; i++) {
      // Use actual Pexels photo URLs
      const photoId = photoIds[i % photoIds.length];
      const variation = Math.floor(Math.random() * 1000); // Add variation
      
      // Pexels photo URL format
      images.push(`https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&dpr=1&v=${variation}`);
    }

    return images;
  }

  /**
   * Get room for category
   */
  getRoomForCategory(categoryId) {
    const categoryMap = {
      'sofas': 'living',
      'coffee-tables': 'living',
      'tv-stands': 'living',
      'armchairs': 'living',
      'beds': 'bedroom',
      'wardrobes': 'bedroom',
      'dressers': 'bedroom',
      'nightstands': 'bedroom',
      'desks': 'office',
      'office-chairs': 'office',
      'bookcases': 'office',
      'dining-tables': 'dining',
      'dining-chairs': 'dining',
      'patio-sets': 'outdoor',
      'kids-beds': 'kids',
      'toy-storage': 'kids',
    };

    return categoryMap[categoryId] || 'living';
  }

  // ========== Helper Methods ==========

  pickStoreType() {
    const types = ['retailer', 'retailer', 'retailer', 'maker', 'reseller', 'warehouse', 'showroom'];
    return this.randomChoice(types);
  }

  getServiceTiers(storeType) {
    if (storeType === 'warehouse') return ['T0', 'T1', 'T2', 'T3'];
    if (storeType === 'showroom') return ['T0', 'T1'];
    return ['T0', 'T1', 'T2'];
  }

  getDeliveryModes(storeType) {
    if (storeType === 'warehouse') return ['pickup', 'local_delivery', 'courier_freight'];
    if (storeType === 'showroom') return ['pickup', 'local_delivery'];
    return ['pickup', 'local_delivery'];
  }

  getConditionPriceMultiplier(condition) {
    const multipliers = {
      'new': 1.0,
      'like-new': 0.85,
      'used': 0.60,
      'refurbished': 0.75,
    };
    return multipliers[condition] || 1.0;
  }

  generateWeight(categoryId) {
    const weights = {
      'sofas': [40, 80],
      'beds': [30, 70],
      'desks': [20, 50],
      'tables': [15, 40],
      'chairs': [5, 15],
      'wardrobes': [50, 100],
    };

    const range = weights[categoryId] || [10, 30];
    return this.randomInt(range[0], range[1]);
  }

  generateSubCategory(categoryId) {
    const subCategories = {
      'sofas': ['sectional', '3-seater', 'loveseat', 'sleeper'],
      'beds': ['platform', 'storage', 'four-poster', 'upholstered'],
      'desks': ['executive', 'l-shaped', 'standing', 'compact'],
      'dining-tables': ['rectangular', 'round', 'extendable', 'square'],
    };

    const options = subCategories[categoryId];
    return options ? this.randomChoice(options) : null;
  }

  generateCareNotes(material) {
    const notes = {
      'wood': 'Wipe with damp cloth. Avoid harsh chemicals. Polish occasionally.',
      'fabric': 'Vacuum regularly. Spot clean stains immediately. Professional cleaning recommended.',
      'leather': 'Wipe with leather cleaner. Condition every 6 months. Avoid direct sunlight.',
      'metal': 'Wipe with damp cloth. Dry immediately to prevent rust.',
      'glass': 'Clean with glass cleaner. Avoid abrasive materials.',
    };

    return notes[material] || 'Clean with appropriate cleaner for material type.';
  }

  requiresAssembly(categoryId) {
    const requiresAssembly = ['beds', 'desks', 'wardrobes', 'bookcases', 'dining-tables'];
    return requiresAssembly.some(cat => categoryId.includes(cat)) && Math.random() > 0.3;
  }

  deriveSizeTag(dimensions, categoryId) {
    const volume = dimensions.w * dimensions.d * dimensions.h;
    if (volume < 200000) return 'small';
    if (volume < 500000) return 'medium';
    return 'large';
  }

  analyzeDistribution() {
    const roomDist = {};
    const categoryDist = {};
    const conditionDist = {};

    this.seedProducts.forEach(product => {
      roomDist[product.room] = (roomDist[product.room] || 0) + 1;
      categoryDist[product.furnitureCategory] = (categoryDist[product.furnitureCategory] || 0) + 1;
      conditionDist[product.condition] = (conditionDist[product.condition] || 0) + 1;
    });

    return { roomDist, categoryDist, conditionDist };
  }

  printDistributionReport(report) {
    console.log('\n📊 PRODUCT DISTRIBUTION REPORT');
    console.log('========================================\n');

    console.log('By Room:');
    Object.entries(report.roomDist).forEach(([room, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   ${room}: ${count} (${percentage}%)`);
    });

    console.log('\nBy Category (Top 10):');
    const topCategories = Object.entries(report.categoryDist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    topCategories.forEach(([category, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   ${category}: ${count} (${percentage}%)`);
    });

    console.log('\nBy Condition:');
    Object.entries(report.conditionDist).forEach(([condition, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   ${condition}: ${count} (${percentage}%)`);
    });

    console.log('\n========================================\n');
  }

  // Random helpers
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

export default RealFurnitureSeedingService;

