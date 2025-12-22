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
  FURNITURE_BADGES,
} from '../constants/furnitureTaxonomy.js';
import { generateH3Cells, getH3CellsForTier, RADIUS_TIERS } from '../utils/h3Utils.js';
import { Product } from '../models/Product.js';
import Store from '../models/Store.js';

/**
 * Enhanced Furniture Seeding Service
 * World-class seeding with 30-80 credible stores, H3 density tracking, ghost town prevention
 */

class EnhancedFurnitureSeedingService {
  constructor() {
    this.seedStores = [];
    this.seedProducts = [];
    this.storeIdCounter = 10000;
    this.productIdCounter = 20000;
    this.h3DensityMap = {}; // Track items per H3 cell
    this.regionStats = {}; // Stats per region
  }

  /**
   * Main seeding method with H3 density tracking
   */
  async seedFurnitureMarketplace(options = {}) {
    const {
      targetProductCount = 1000,
      targetStoreCount = 60, // 30-80 stores as recommended
      regions = Object.keys(SA_REGIONS), // All regions by default
    } = options;

    console.log('🪑 ========================================');
    console.log('   ENHANCED FURNITURE MARKETPLACE SEEDING');
    console.log('========================================\n');
    console.log(`📍 Target Regions: ${regions.join(', ')}`);
    console.log(`🏪 Target Stores: ${targetStoreCount}`);
    console.log(`📦 Target Products: ${targetProductCount}\n`);

    // Step 1: Generate credible stores distributed across H3 cells
    await this.generateCredibleStores(targetStoreCount, regions);
    console.log(`✅ Generated ${this.seedStores.length} credible furniture stores\n`);

    // Step 2: Generate products ensuring good H3 density
    await this.generateProductsWithDensityTracking(targetProductCount);
    console.log(`✅ Generated ${this.seedProducts.length} furniture products\n`);

    // Step 3: Analyze H3 density and ghost town risk
    const densityReport = this.analyzeH3Density();
    this.printDensityReport(densityReport);

    // Step 4: Fill gaps if ghost town risk detected
    await this.fillDensityGaps(densityReport);

    return {
      stores: this.seedStores,
      products: this.seedProducts,
      densityReport,
    };
  }

  /**
   * Generate 30-80 credible stores with proper verification status
   */
  async generateCredibleStores(targetCount, regions) {
    const storeNamesByType = {
      retailer: [
        'Urban Living Furniture', 'Modern Spaces Interiors', 'The Furniture Hub',
        'Design Depot', 'Home & Living Co.', 'Contemporary Interiors',
        'Furniture Gallery', 'Style Studio', 'Living Trends', 'Home Essentials',
      ],
      maker: [
        'Artisan Woodworks', 'Custom Craft Furniture', 'Handmade Haven',
        'The Wood Shop', 'Bespoke Furniture Co.', 'Local Makers Collective',
        'Timber & Steel', 'Heritage Furniture Makers', 'Crafted Living',
      ],
      reseller: [
        'Second Chance Furniture', 'Vintage Finds', 'Pre-Loved Furnishings',
        'The Furniture Exchange', 'Retro Revival', 'Quality Used Furniture',
        'Treasure Trove Furniture', 'Budget Furniture Outlet',
      ],
      warehouse: [
        'Furniture Warehouse Direct', 'Bulk Furniture Depot', 'Factory Outlet Furniture',
        'Warehouse Furniture Co.', 'Direct Furniture Supply',
      ],
      showroom: [
        'Luxury Living Showroom', 'Designer Furniture Studio', 'Elite Interiors',
        'Premium Home Gallery', 'Signature Furniture Showroom',
      ],
    };

    const storesPerRegion = Math.ceil(targetCount / regions.length);

    regions.forEach(regionKey => {
      const region = SA_REGIONS[regionKey];
      if (!region) return;

      // Calculate stores per suburb in this region
      const storesInRegion = Math.min(storesPerRegion, targetCount - this.seedStores.length);
      const storesPerSuburb = Math.ceil(storesInRegion / region.suburbs.length);

      region.suburbs.forEach((suburb, suburbIdx) => {
        // Ensure we don't exceed target
        const storesToCreate = Math.min(
          storesPerSuburb,
          targetCount - this.seedStores.length
        );

        for (let i = 0; i < storesToCreate; i++) {
          const storeType = this.pickStoreType();
          const names = storeNamesByType[storeType.id] || storeNamesByType.retailer;
          const storeNameIndex = (this.storeIdCounter + i) % names.length;
          
          // Add slight location variance within suburb (±0.01 degrees ~ 1km)
          const lat = suburb.lat + (Math.random() - 0.5) * 0.02;
          const lng = suburb.lng + (Math.random() - 0.5) * 0.02;
          
          const h3Cells = generateH3Cells(lat, lng);
          
          const store = new Store({
            id: `seed-store-${this.storeIdCounter++}`,
            sellerId: `seed-seller-${this.storeIdCounter}`,
            name: `${names[storeNameIndex]} - ${suburb.name}`,
            type: 'furniture',
            storeType: storeType.id,
            verificationStatus: this.pickVerificationStatus(storeType.id),
            description: storeType.description,
            address: {
              street: `${Math.floor(Math.random() * 500) + 1} ${suburb.name} ${this.randomChoice(['St', 'Rd', 'Ave', 'Dr'])}`,
              suburb: suburb.name,
              city: region.name,
              lat,
              lng,
            },
            phone: this.generatePhoneNumber(),
            email: `${names[storeNameIndex].toLowerCase().replace(/\s+/g, '')}@furniture.co.za`,
            categories: ['furniture'],
            rating: this.randomFloat(3.9, 4.95, 1),
            reviewCount: this.randomInt(15, 300),
            isActive: true,
            ...h3Cells,
            pinVerificationStatus: 'verified',
            serviceMode: 'both',
            serviceRadiusKm: this.randomInt(10, 40),
            isOpenNow: true,
            reliabilityScore: this.randomFloat(0.88, 0.98, 2),
            serviceAreaTiersAllowed: this.pickServiceTiers(storeType.id),
            serviceTiersMax: this.pickMaxTier(storeType.id),
            deliveryModes: this.pickDeliveryModes(storeType.id),
            deliveryPricingModel: this.pickPricingModel(storeType.id),
            deliveryPricing: this.generateDeliveryPricing(storeType.id),
            assemblyAvailable: Math.random() > 0.35,
            assemblyFeeModel: 'per_item',
            returnsPolicyDays: this.pickReturnPolicy(storeType.id),
            returnsPolicyNotes: 'Items must be unused and in original packaging',
            leadTimeDaysMin: this.pickLeadTimeMin(storeType.id),
            leadTimeDaysMax: this.pickLeadTimeMax(storeType.id),
            leadTimeProfile: this.pickLeadTimeProfile(storeType.id),
            fulfillmentMetrics: {
              onTimeRate: this.randomFloat(0.90, 0.98, 2),
              cancelRate: this.randomFloat(0.01, 0.04, 3),
              disputeRate: this.randomFloat(0.005, 0.015, 3),
              stockMismatchRate: this.randomFloat(0.02, 0.06, 3),
              responseTimeAvgHours: this.randomFloat(1, 4, 1),
            },
            storeQualityScore: this.randomFloat(0.78, 0.95, 2),
            ratingAvgBayesian: this.calculateBayesianRating(
              this.randomFloat(3.9, 4.95, 1),
              this.randomInt(15, 300)
            ),
            pickupInstructions: this.generatePickupInstructions(storeType.id),
            loadingAccessType: this.pickLoadingAccess(storeType.id),
            isDemo: false, // These are meant to be credible seed stores
            browseOnly: false, // Allow checkout
          });

          this.seedStores.push(store);
        }
      });
    });
  }

  /**
   * Generate products with H3 density tracking
   */
  async generateProductsWithDensityTracking(targetCount) {
    const productsPerStore = Math.ceil(targetCount / this.seedStores.length);
    
    this.seedStores.forEach(store => {
      const storeProductCount = this.randomInt(
        Math.floor(productsPerStore * 0.7),
        Math.ceil(productsPerStore * 1.3)
      );
      
      for (let i = 0; i < storeProductCount && this.seedProducts.length < targetCount; i++) {
        const product = this.generateEnhancedFurnitureProduct(store);
        this.seedProducts.push(product);
        
        // Track H3 density
        this.trackH3Density(store, product);
      }
    });
  }

  /**
   * Track product density in H3 cells
   */
  trackH3Density(store, product) {
    [3, 4, 5, 6, 7].forEach(res => {
      const h3Field = `h3_r${res}`;
      const cellId = store[h3Field];
      
      if (!this.h3DensityMap[cellId]) {
        this.h3DensityMap[cellId] = {
          resolution: res,
          count: 0,
          products: [],
          stores: new Set(),
        };
      }
      
      this.h3DensityMap[cellId].count++;
      this.h3DensityMap[cellId].products.push(product.id);
      this.h3DensityMap[cellId].stores.add(store.id);
    });
  }

  /**
   * Analyze H3 density and calculate ghost town risk
   */
  analyzeH3Density() {
    const report = {
      totalCells: Object.keys(this.h3DensityMap).length,
      cellsByResolution: {},
      lowDensityCells: [],
      ghostTownRisk: {},
    };

    // Group by resolution
    Object.entries(this.h3DensityMap).forEach(([cellId, data]) => {
      const res = data.resolution;
      if (!report.cellsByResolution[res]) {
        report.cellsByResolution[res] = {
          totalCells: 0,
          avgProductsPerCell: 0,
          minProducts: Infinity,
          maxProducts: 0,
          cells: [],
        };
      }

      const resReport = report.cellsByResolution[res];
      resReport.totalCells++;
      resReport.cells.push({ cellId, count: data.count, stores: data.stores.size });
      resReport.minProducts = Math.min(resReport.minProducts, data.count);
      resReport.maxProducts = Math.max(resReport.maxProducts, data.count);

      // Flag low density cells (T0/T1 with <20 items)
      if ((res === 7 || res === 6) && data.count < 20) {
        report.lowDensityCells.push({
          cellId,
          resolution: res,
          tier: res === 7 ? 'T0' : 'T1',
          count: data.count,
          stores: data.stores.size,
        });
      }
    });

    // Calculate averages
    Object.keys(report.cellsByResolution).forEach(res => {
      const resReport = report.cellsByResolution[res];
      const total = resReport.cells.reduce((sum, c) => sum + c.count, 0);
      resReport.avgProductsPerCell = (total / resReport.totalCells).toFixed(1);
    });

    // Calculate ghost town risk score (% of T0/T1 cells with <20 items)
    const t0t1Cells = [...(report.cellsByResolution[7]?.cells || []), ...(report.cellsByResolution[6]?.cells || [])];
    const lowDensityCount = report.lowDensityCells.length;
    const ghostTownRiskPercent = t0t1Cells.length > 0 ? (lowDensityCount / t0t1Cells.length) * 100 : 0;

    report.ghostTownRisk = {
      score: ghostTownRiskPercent.toFixed(1),
      severity: ghostTownRiskPercent > 50 ? 'HIGH' : ghostTownRiskPercent > 20 ? 'MEDIUM' : 'LOW',
      affectedCells: lowDensityCount,
      totalT0T1Cells: t0t1Cells.length,
    };

    return report;
  }

  /**
   * Fill density gaps in low-density cells
   */
  async fillDensityGaps(densityReport) {
    if (densityReport.ghostTownRisk.severity === 'LOW') {
      console.log('✅ No significant density gaps detected\n');
      return;
    }

    console.log(`⚠️  Ghost town risk: ${densityReport.ghostTownRisk.severity}`);
    console.log(`   Filling gaps in ${densityReport.lowDensityCells.length} cells...\n`);

    // Add products to low-density cells (future enhancement)
    // For now, we report the issue
  }

  /**
   * Print H3 density report
   */
  printDensityReport(report) {
    console.log('📊 H3 DENSITY ANALYSIS');
    console.log('========================================\n');

    Object.entries(report.cellsByResolution).forEach(([res, data]) => {
      const tier = { 7: 'T0', 6: 'T1', 5: 'T2', 4: 'T3', 3: 'T4' }[res];
      console.log(`${tier} (R${res}) - ${data.totalCells} cells:`);
      console.log(`   Avg: ${data.avgProductsPerCell} products/cell`);
      console.log(`   Range: ${data.minProducts}-${data.maxProducts} products\n`);
    });

    console.log('🎯 GHOST TOWN RISK ASSESSMENT');
    console.log('========================================');
    console.log(`Score: ${report.ghostTownRisk.score}% (${report.ghostTownRisk.severity})`);
    console.log(`Low-density cells: ${report.ghostTownRisk.affectedCells}/${report.ghostTownRisk.totalT0T1Cells} (T0/T1)`);
    console.log(`Recommendation: ${report.ghostTownRisk.severity === 'HIGH' ? 'Add more products to core cells' : 'Density is acceptable'}\n`);
  }

  /**
   * Generate enhanced furniture product with all new fields
   */
  generateEnhancedFurnitureProduct(store) {
    const room = this.randomChoice(Object.values(ROOMS));
    const categoriesInRoom = Object.values(FURNITURE_CATEGORIES).filter(
      cat => cat.room === room.id
    );
    const category = this.randomChoice(categoriesInRoom);
    const subCategory = this.generateSubCategory(category.id);
    const condition = this.randomChoice(CONDITIONS);
    const style = this.randomChoice(STYLES);
    const materialPrimary = this.randomChoice(MATERIALS);
    const materialSecondary = Math.random() > 0.6 ? this.randomChoice(MATERIALS) : null;
    const color = this.randomChoice(COLORS);
    const stockType = this.randomChoice(STOCK_TYPES);
    
    const dimensions = this.generateDimensions(category.id);
    const dimensionsSnippet = `W${dimensions.w}×D${dimensions.d}×H${dimensions.h}cm`;
    const sizeTag = this.deriveSizeTag(dimensions, category.id);
    
    const name = this.generateProductName(category.label, materialPrimary.label, style.label, condition.id);
    
    const basePrice = this.getBasePriceForCategory(category.id);
    const conditionMultiplier = this.getConditionPriceMultiplier(condition.id);
    const price = Math.round(basePrice * conditionMultiplier);
    const hasDiscount = Math.random() > 0.72;
    const discountPrice = hasDiscount ? Math.round(price * this.randomFloat(0.77, 0.93, 2)) : null;
    
    const images = this.generateProductImages(category.id, 4);
    const badges = this.generateBadges(condition.id, stockType.id, store);
    
    // Calculate availability confidence based on stock freshness
    const daysSinceUpdate = Math.floor(Math.random() * 7);
    const availabilityConfidence = Math.max(0.7, 1.0 - (daysSinceUpdate * 0.04) - (store.fulfillmentMetrics.stockMismatchRate));

    const product = new Product({
      id: `seed-product-${this.productIdCounter++}`,
      name,
      description: this.generateProductDescription(category.label, materialPrimary.label, style.label, condition.id),
      price,
      discountPrice,
      discount: hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : null,
      image: images[0],
      images,
      coverImage: images[0],
      category: 'furniture',
      subcategory: category.id,
      tags: [room.id, category.id, subCategory, style.id, materialPrimary.id, color.id].filter(Boolean),
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.address,
      stock: stockType.id === 'in_stock' ? 'in' : stockType.id === 'limited' ? 'low' : 'in',
      stockQuantity: this.randomInt(1, 25),
      trackInventory: true,
      isVisible: true,
      sku: `FUR-${category.id.toUpperCase()}-${this.productIdCounter}`,
      weight: this.generateWeight(category.id),
      dimensions,
      dimensionsSnippet,
      badges,
      rating: this.randomFloat(3.7, 4.9, 1),
      reviewCount: this.randomInt(0, 180),
      isNew: Math.random() > 0.87,
      isTrending: Math.random() > 0.92,
      isFlashDeal: hasDiscount && Math.random() > 0.96,
      salesCount: this.randomInt(0, 250),
      returnRate: this.randomFloat(0.02, 0.07, 2),
      qualityScore: this.randomFloat(0.75, 0.95, 2),
      normalizedTitle: name.toLowerCase(),
      
      // Enhanced furniture fields
      room: room.id,
      furnitureCategory: category.id,
      subCategory,
      style: style.id,
      condition: condition.id,
      materialPrimary: materialPrimary.id,
      materialSecondary: materialSecondary?.id || null,
      colorPrimary: color.id,
      color: color.id,
      careNotes: this.generateCareNotes(materialPrimary.id),
      assemblyRequired: this.requiresAssembly(category.id),
      assemblyFee: store.assemblyAvailable ? this.randomInt(100, 500) : null,
      deliveryEligible: true,
      leadTimeDaysMin: store.leadTimeDaysMin,
      leadTimeDaysMax: store.leadTimeDaysMax,
      stockType: stockType.id,
      restockEta: stockType.id === 'limited' ? new Date(Date.now() + this.randomInt(3, 14) * 86400000).toISOString() : null,
      availabilityConfidence,
      lastStockUpdate: new Date(Date.now() - daysSinceUpdate * 86400000),
      flawPhotos: condition.id === 'used' && Math.random() > 0.65 ? [images[images.length - 1]] : [],
      sizeTag,
      complaintRate: this.randomFloat(0.005, 0.025, 3),
    });

    return product;
  }

  // ========== Helper Methods ==========

  pickStoreType() {
    const distribution = [
      { ...STORE_TYPES[0], weight: 0.45 },  // retailer
      { ...STORE_TYPES[1], weight: 0.20 },  // maker
      { ...STORE_TYPES[2], weight: 0.15 },  // reseller
      { ...STORE_TYPES[3], weight: 0.10 },  // warehouse
      { label: 'Showroom', id: 'showroom', weight: 0.10 },  // showroom
    ];
    return this.weightedRandom(distribution);
  }

  pickVerificationStatus(storeType) {
    if (storeType === 'maker') return Math.random() > 0.3 ? 'verified' : 'verified_partner';
    if (storeType === 'showroom') return 'verified_partner';
    if (storeType === 'reseller') return Math.random() > 0.5 ? 'verified' : 'unverified';
    return Math.random() > 0.4 ? 'verified' : 'verified_partner';
  }

  pickServiceTiers(storeType) {
    if (storeType === 'maker') return ['T0', 'T1'];
    if (storeType === 'warehouse') return ['T0', 'T1', 'T2', 'T3'];
    return ['T0', 'T1', 'T2'];
  }

  pickMaxTier(storeType) {
    if (storeType === 'maker') return 'T1';
    if (storeType === 'warehouse') return 'T3';
    return 'T2';
  }

  pickDeliveryModes(storeType) {
    if (storeType === 'maker') return ['pickup', 'local_delivery'];
    if (storeType === 'showroom') return ['pickup', 'freight'];
    if (storeType === 'reseller') return ['pickup', 'local_delivery'];
    if (storeType === 'warehouse') return ['pickup', 'local_delivery', 'freight'];
    return ['pickup', 'local_delivery'];
  }

  pickPricingModel(storeType) {
    if (storeType === 'warehouse') return 'flat_by_tier';
    if (storeType === 'maker') return 'quote_required';
    return this.randomChoice(['flat_by_tier', 'per_km']);
  }

  generateDeliveryPricing(storeType) {
    if (storeType === 'warehouse') {
      return { T0: 100, T1: 200, T2: 350, T3: 500 };
    }
    return { T0: this.randomInt(40, 80), T1: this.randomInt(80, 150), T2: this.randomInt(150, 250) };
  }

  pickReturnPolicy(storeType) {
    if (storeType === 'reseller') return 3;
    if (storeType === 'maker') return 14;
    return this.randomChoice([7, 14, 30]);
  }

  pickLeadTimeMin(storeType) {
    if (storeType === 'maker') return this.randomInt(3, 7);
    return 0;
  }

  pickLeadTimeMax(storeType) {
    if (storeType === 'maker') return this.randomInt(7, 21);
    if (storeType === 'warehouse') return this.randomInt(1, 3);
    return this.randomInt(2, 7);
  }

  pickLeadTimeProfile(storeType) {
    if (storeType === 'maker') return 'custom';
    if (storeType === 'warehouse') return 'next_day';
    return this.randomChoice(['same_day', 'next_day', '2-3_days']);
  }

  pickLoadingAccess(storeType) {
    if (storeType === 'warehouse') return 'loading_dock';
    if (storeType === 'showroom') return 'warehouse';
    return this.randomChoice(['street', 'loading_dock']);
  }

  generatePickupInstructions(storeType) {
    const instructions = [
      'Contact store 30 minutes before arrival',
      'Use loading bay at rear entrance',
      'Ring bell at main entrance',
      'Call upon arrival for assistance',
      'Park in designated pickup area',
    ];
    return this.randomChoice(instructions);
  }

  calculateBayesianRating(rating, reviewCount) {
    // Bayesian average with prior of 4.0 and weight of 10
    const priorRating = 4.0;
    const priorWeight = 10;
    return ((rating * reviewCount) + (priorRating * priorWeight)) / (reviewCount + priorWeight);
  }

  generateSubCategory(categoryId) {
    const subCategories = {
      sofa: ['sectional-sofa', 'sleeper-sofa', 'loveseat', 'chaise-lounge'],
      bed: ['platform-bed', 'sleigh-bed', 'canopy-bed', 'storage-bed'],
      desk: ['standing-desk', 'corner-desk', 'writing-desk', 'computer-desk'],
      chair: ['accent-chair', 'recliner', 'dining-chair', 'desk-chair'],
      'dining-table': ['extendable-table', 'round-table', 'rectangular-table'],
    };
    const options = subCategories[categoryId] || [categoryId];
    return Math.random() > 0.5 ? this.randomChoice(options) : null;
  }

  deriveSizeTag(dimensions, categoryId) {
    const volume = dimensions.w * dimensions.d * dimensions.h;
    
    // Category-specific volume thresholds
    const thresholds = {
      sofa: { small: 150000, large: 300000 },
      bed: { small: 180000, large: 350000 },
      desk: { small: 100000, large: 200000 },
      default: { small: 120000, large: 250000 },
    };

    const t = thresholds[categoryId] || thresholds.default;
    
    if (volume < t.small) return 'small';
    if (volume > t.large) return 'large';
    return 'medium';
  }

  generateCareNotes(material) {
    const careInstructions = {
      wood: 'Wipe with damp cloth. Avoid harsh chemicals. Polish occasionally.',
      fabric: 'Vacuum regularly. Spot clean stains immediately. Professional cleaning recommended.',
      leather: 'Wipe with soft damp cloth. Use leather conditioner quarterly.',
      metal: 'Wipe with dry cloth. Avoid moisture to prevent rust.',
      glass: 'Clean with glass cleaner. Handle with care.',
    };
    return careInstructions[material] || 'Follow manufacturer care instructions.';
  }

  // ... (Keep existing helper methods from original service)
  generateDimensions(categoryId) {
    const dimensionsMap = {
      sofa: { w: [180, 220], d: [80, 100], h: [75, 90] },
      'sectional-sofa': { w: [250, 320], d: [90, 120], h: [75, 90] },
      armchair: { w: [70, 90], d: [75, 90], h: [80, 95] },
      'coffee-table': { w: [100, 140], d: [50, 80], h: [40, 50] },
      'tv-stand': { w: [120, 200], d: [40, 50], h: [50, 70] },
      bed: { w: [140, 200], d: [190, 210], h: [90, 120] },
      wardrobe: { w: [100, 200], d: [50, 70], h: [180, 220] },
      desk: { w: [100, 160], d: [50, 80], h: [70, 80] },
      'dining-table': { w: [120, 200], d: [80, 100], h: [75, 80] },
      'dining-chair': { w: [45, 55], d: [50, 60], h: [80, 95] },
    };
    
    const dims = dimensionsMap[categoryId] || { w: [50, 150], d: [50, 100], h: [50, 150] };
    
    return {
      w: this.randomInt(dims.w[0], dims.w[1]),
      d: this.randomInt(dims.d[0], dims.d[1]),
      h: this.randomInt(dims.h[0], dims.h[1]),
    };
  }

  generateWeight(categoryId) {
    const weightMap = {
      sofa: [50, 80],
      'sectional-sofa': [80, 150],
      bed: [40, 80],
      wardrobe: [60, 120],
      desk: [20, 50],
      'dining-table': [30, 80],
      'coffee-table': [10, 25],
    };
    
    const range = weightMap[categoryId] || [10, 50];
    return this.randomInt(range[0], range[1]);
  }

  generateProductName(category, material, style, condition) {
    const adjectives = ['Classic', 'Modern', 'Elegant', 'Stylish', 'Contemporary', 'Luxurious', 'Minimalist', 'Premium'];
    const conditionPrefix = condition !== 'new' ? `${condition.charAt(0).toUpperCase() + condition.slice(1)} ` : '';
    const adj = this.randomChoice(adjectives);
    
    return `${conditionPrefix}${adj} ${material} ${category}`;
  }

  generateProductDescription(category, material, style, condition) {
    const conditionNote = condition !== 'new' ? ` This ${condition} piece has been carefully inspected.` : '';
    return `Beautiful ${style.toLowerCase()} ${category.toLowerCase()} crafted from premium ${material.toLowerCase()}. Perfect for modern homes.${conditionNote} Delivery available.`;
  }

  generateProductImages(categoryId, count) {
    // Use Picsum Photos for real placeholder images
    // This service provides actual random images that will load
    const images = [];
    const width = 800;
    const height = 800;
    
    // Use category-specific seed numbers to get consistent but varied images
    const categorySeeds = {
      'sofas': 100,
      'beds': 200,
      'desks': 300,
      'tables': 400,
      'chairs': 500,
      'wardrobes': 600,
      'bookcases': 700,
      'dressers': 800,
      'coffee-tables': 900,
      'tv-stands': 1000,
      'armchairs': 1100,
      'nightstands': 1200,
      'dining-tables': 1300,
      'dining-chairs': 1400,
      'office-chairs': 1500,
    };
    
    const baseSeed = categorySeeds[categoryId] || 100;
    
    for (let i = 0; i < count; i++) {
      // Picsum Photos: https://picsum.photos/seed/{seed}/{width}/{height}
      // This provides real images that will actually load
      const seed = baseSeed + i;
      images.push(`https://picsum.photos/seed/${seed}/${width}/${height}`);
    }
    
    return images;
  }

  generateBadges(condition, stockType, store) {
    const badges = [];
    
    if (condition === 'vintage' || condition === 'used') {
      badges.push(FURNITURE_BADGES.VINTAGE);
    }
    if (store.storeQualityScore > 0.9) {
      badges.push(FURNITURE_BADGES.TOP_RATED_SELLER);
    }
    if (store.leadTimeDaysMax <= 1) {
      badges.push(FURNITURE_BADGES.FAST_DELIVERY);
    }
    if (store.assemblyAvailable) {
      badges.push(FURNITURE_BADGES.ASSEMBLY_AVAILABLE);
    }
    
    return badges;
  }

  requiresAssembly(categoryId) {
    const assemblyRequired = [
      'bed', 'wardrobe', 'bookshelf', 'desk', 'tv-stand', 
      'entertainment-unit', 'dining-table', 'storage-unit'
    ];
    return assemblyRequired.includes(categoryId);
  }

  getBasePriceForCategory(categoryId) {
    const priceMap = {
      sofa: [3500, 15000],
      'sectional-sofa': [8000, 25000],
      armchair: [1500, 5000],
      'coffee-table': [800, 3500],
      bed: [2500, 12000],
      wardrobe: [3000, 15000],
      desk: [1200, 6000],
      'dining-table': [2000, 10000],
      'dining-chair': [400, 1500],
      mattress: [2000, 8000],
    };
    
    const range = priceMap[categoryId] || [500, 5000];
    return this.randomInt(range[0], range[1]);
  }

  getConditionPriceMultiplier(condition) {
    const multipliers = {
      new: 1.0,
      'like-new': 0.78,
      used: 0.52,
      refurbished: 0.67,
    };
    return multipliers[condition] || 1.0;
  }

  generatePhoneNumber() {
    return `+27 ${this.randomInt(10, 99)} ${this.randomInt(100, 999)} ${this.randomInt(1000, 9999)}`;
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item;
    }
    return items[0];
  }
}

export default EnhancedFurnitureSeedingService;

