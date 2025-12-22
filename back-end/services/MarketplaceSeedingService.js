import { REAL_MARKETPLACE_PRODUCTS } from '../data/realMarketplaceProducts.js';
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
import { Product } from '../models/Product.js';
import Store from '../models/Store.js';
import { ProductService } from './ProductService.js';

/**
 * Marketplace Seeding Service
 * Seeds REAL furniture products mimicking Amazon/eBay marketplace data
 * Each product has exact image-description matching
 */
class MarketplaceSeedingService {
  constructor() {
    this.seedStores = [];
    this.seedProducts = [];
    this.storeIdCounter = 30000;
    this.productIdCounter = 40000;
  }

  /**
   * Main seeding method - generates 1000-10000 real marketplace products
   */
  async seedMarketplace(options = {}) {
    const {
      targetProductCount = 1000,
      targetStoreCount = 50,
      regions = Object.keys(SA_REGIONS),
    } = options;

    console.log('\n🛒 ========================================');
    console.log('   REAL MARKETPLACE SEEDING');
    console.log('   (Amazon/eBay-style Products)');
    console.log('========================================\n');
    console.log(`📍 Target Regions: ${regions.join(', ')}`);
    console.log(`🏪 Target Stores: ${targetStoreCount}`);
    console.log(`📦 Products: ${targetProductCount} real furniture items`);
    console.log(`🖼️  Each with exact matching images & descriptions\n`);

    // Step 0: Clear existing products
    ProductService.clearProducts();
    console.log('✅ Cleared old products\n');

    // Step 1: Generate stores
    await this.generateStores(targetStoreCount, regions);
    console.log(`✅ Generated ${this.seedStores.length} stores\n`);

    // Step 2: Generate products from real marketplace templates
    await this.generateMarketplaceProducts(targetProductCount);
    console.log(`✅ Generated ${this.seedProducts.length} marketplace products\n`);

    // Step 3: Add products to ProductService
    try {
      const addedCount = ProductService.addProducts(this.seedProducts);
      console.log(`✅ Added ${addedCount} products to ProductService`);
      console.log(`   ProductService now has ${ProductService.products.length} total products`);
    } catch (error) {
      console.error('❌ Error adding products to ProductService:', error);
      throw error;
    }

    // Step 4: Generate summary report
    this.generateReport();

    console.log('\n✅ Marketplace seeded successfully!');
    console.log('========================================\n');

    return {
      stores: this.seedStores,
      products: this.seedProducts,
    };
  }

  /**
   * Generate stores (furniture sellers)
   */
  async generateStores(targetCount, regions) {
    const storesPerRegion = Math.ceil(targetCount / regions.length);

    const furnitureStoreNames = [
      "Home Comfort Furniture",
      "Urban Living Co.",
      "Classic Oak Furniture",
      "Modern Space Interiors",
      "The Furniture Warehouse",
      "Elite Home Furnishings",
      "Comfort Zone Furniture",
      "Style & Comfort",
      "Premium Home Solutions",
      "Quality Furniture Direct",
      "Designer Living SA",
      "Affordable Furniture Outlet",
      "Luxury Home Decor",
      "Contemporary Furniture Hub",
      "Family Furniture Store",
      "Office Furniture Specialists",
      "Bedroom World",
      "Dining Room Essentials",
      "Living Room Experts",
      "Workspace Solutions",
    ];

    for (const regionName of regions) {
      const region = SA_REGIONS[regionName];
      if (!region) continue;

      for (let i = 0; i < storesPerRegion && this.seedStores.length < targetCount; i++) {
        const storeName = `${this.randomChoice(furnitureStoreNames)} - ${region.name}`;
        const storeLocation = `${region.name}, South Africa`;

        const latitude = region.latitude + this.randomFloat(-0.05, 0.05);
        const longitude = region.longitude + this.randomFloat(-0.05, 0.05);

        const store = new Store({
          id: this.storeIdCounter++,
          name: storeName,
          description: `Quality furniture retailer specializing in modern and traditional home furnishings in ${region.name}.`,
          location: storeLocation,
          latitude,
          longitude,
          h3Index: null,
          storeType: this.randomChoice(['showroom', 'warehouse', 'maker']),
          contact: `contact@${storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.za`,
          rating: this.randomFloat(4.0, 4.9, 1),
          reviewCount: this.randomInt(80, 850),
          deliveryAvailable: Math.random() > 0.05,
          assemblyAvailable: Math.random() > 0.25,
          returnPolicy: this.randomChoice(['30-day returns', '14-day returns', '60-day returns']),
          leadTimeDaysMin: 0,
          leadTimeDaysMax: this.randomInt(5, 14),
          verificationStatus: 'verified',
          fulfillmentMetrics: {
            onTimeRate: this.randomFloat(0.90, 0.99, 2),
            cancelRate: this.randomFloat(0.01, 0.04, 2),
            disputeRate: this.randomFloat(0.005, 0.015, 2),
            stockMismatchRate: this.randomFloat(0.01, 0.025, 2),
          },
        });

        this.seedStores.push(store);
      }
    }
  }

  /**
   * Generate marketplace products from real templates
   */
  async generateMarketplaceProducts(targetCount) {
    const productsPerStore = Math.ceil(targetCount / this.seedStores.length);
    let productCount = 0;

    // Calculate how many times we need to cycle through templates
    const cyclesNeeded = Math.ceil(targetCount / REAL_MARKETPLACE_PRODUCTS.length);

    for (const store of this.seedStores) {
      const storeProductCount = Math.min(
        this.randomInt(Math.floor(productsPerStore * 0.8), Math.ceil(productsPerStore * 1.2)),
        targetCount - productCount
      );

      for (let i = 0; i < storeProductCount && productCount < targetCount; i++) {
        // Cycle through real product templates
        const templateIndex = productCount % REAL_MARKETPLACE_PRODUCTS.length;
        const template = REAL_MARKETPLACE_PRODUCTS[templateIndex];
        
        // Create product with optional variations
        const product = this.createMarketplaceProduct(store, template, productCount);
        
        if (product) {
          this.seedProducts.push(product);
          productCount++;
        }
      }

      if (productCount >= targetCount) break;
    }
  }

  /**
   * Create a single marketplace product from template
   */
  createMarketplaceProduct(store, template, index) {
    // Randomly select from template's color/style options
    const color = this.randomChoice(template.colors);
    const style = this.randomChoice(template.styles);
    const material = template.material;
    
    // Add slight variation to title for uniqueness while keeping core description
    const variationSuffix = index % 3 === 0 ? '' : 
                           index % 3 === 1 ? ' - Premium Edition' : 
                           ' - Deluxe Model';
    
    const productTitle = `${template.title}${variationSuffix}`;

    // Price variation
    const basePrice = this.randomInt(template.priceRange[0], template.priceRange[1]);
    const hasDiscount = Math.random() > 0.55;
    const discountPercentage = hasDiscount ? this.randomInt(10, 35) : 0;
    const discountPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercentage / 100)) : null;

    // Dimensions with slight variation
    const dimensions = {
      w: this.randomInt(template.dimensions.w[0], template.dimensions.w[1]),
      d: this.randomInt(template.dimensions.d[0], template.dimensions.d[1]),
      h: this.randomInt(template.dimensions.h[0], template.dimensions.h[1]),
    };

    const weight = this.randomInt(template.weight[0], template.weight[1]);

    // Stock status
    const stockType = this.randomChoice([
      { id: 'in_stock', qty: [15, 45] },
      { id: 'limited', qty: [3, 8] },
      { id: 'in_stock', qty: [10, 30] }, // More likely to be in stock
    ]);

    const product = new Product({
      id: this.productIdCounter++,
      name: productTitle,
      subtitle: template.features ? `${template.features.slice(0, 2).join(' • ')}` : '',
      description: template.description, // EXACT description from template
      price: basePrice,
      originalPrice: hasDiscount ? basePrice : null,
      discountPrice: discountPrice,
      discount: discountPercentage,
      image: template.images[0], // Use template's exact images
      images: template.images, // All 4 images from template
      category: 'furniture',
      subcategory: template.category,
      tags: [
        template.room,
        template.category,
        style,
        material,
        color,
        template.condition,
      ],
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.location,
      distance: this.randomInt(1, 40),
      stock: stockType.id === 'in_stock' ? 'in' : (stockType.id === 'limited' ? 'low' : 'out'),
      stockQuantity: this.randomInt(stockType.qty[0], stockType.qty[1]),
      lowStockThreshold: 5,
      trackInventory: true,
      isVisible: true,
      sku: `${template.category.toUpperCase()}-${this.productIdCounter}`,
      weight: weight,
      dimensions,
      dimensionsSnippet: `W${dimensions.w}×D${dimensions.d}×H${dimensions.h}cm`,
      rating: this.randomFloat(4.0, 4.9, 1),
      reviewCount: this.randomInt(15, 420),
      isNew: Math.random() > 0.60,
      isTrending: Math.random() > 0.50,
      isFlashDeal: hasDiscount && Math.random() > 0.70,
      salesCount: this.randomInt(20, 450),

      // Furniture-specific fields
      room: template.room,
      furnitureCategory: template.category,
      subCategory: null,
      style: style,
      condition: template.condition,
      materialPrimary: material,
      materialSecondary: null,
      colorPrimary: color,
      color: color,
      careNotes: this.generateCareNotes(material),
      assemblyRequired: template.assemblyRequired,
      assemblyFee: store.assemblyAvailable && template.assemblyRequired ? this.randomInt(200, 950) : null,
      deliveryEligible: true,
      leadTimeDaysMin: 0,
      leadTimeDaysMax: store.leadTimeDaysMax,
      stockType: stockType.id,
      restockEta: stockType.id === 'limited' ? new Date(Date.now() + this.randomInt(7, 21) * 86400000).toISOString() : null,
      availabilityConfidence: this.randomFloat(0.88, 1.0, 2),
      lastStockUpdate: new Date(Date.now() - this.randomInt(0, 5) * 86400000),
      sizeTag: this.deriveSizeTag(dimensions),
      complaintRate: this.randomFloat(0.002, 0.018, 3),
      returnRate: this.randomFloat(0.015, 0.065, 2),
      qualityScore: this.randomFloat(0.80, 0.97, 2),
      normalizedTitle: productTitle.toLowerCase(),
    });

    return product;
  }

  /**
   * Generate care notes based on material
   */
  generateCareNotes(material) {
    const careGuides = {
      wood: "Wipe with a damp cloth. Avoid harsh chemicals. Polish occasionally with furniture polish.",
      fabric: "Vacuum regularly. Spot clean stains immediately. Professional cleaning recommended annually.",
      leather: "Wipe with soft dry cloth. Use leather conditioner monthly. Avoid direct sunlight.",
      metal: "Clean with mild soap and water. Dry thoroughly to prevent rust. Polish with metal cleaner.",
      glass: "Clean with glass cleaner and soft cloth. Avoid abrasive materials.",
      velvet: "Brush regularly to maintain pile. Vacuum gently. Professional dry clean only.",
      plastic: "Wipe with damp cloth and mild detergent. Avoid harsh chemicals.",
      mesh: "Vacuum regularly. Spot clean with mild soap. Air dry completely.",
    };

    return careGuides[material] || "Clean with appropriate products for the material.";
  }

  /**
   * Derive size tag from dimensions
   */
  deriveSizeTag(dimensions) {
    const volume = dimensions.w * dimensions.d * dimensions.h;
    if (volume < 100000) return 'compact';
    if (volume < 500000) return 'standard';
    return 'large';
  }

  /**
   * Generate summary report
   */
  generateReport() {
    console.log('\n📊 MARKETPLACE SEEDING REPORT:');
    console.log(`   - Total Stores: ${this.seedStores.length}`);
    console.log(`   - Total Products: ${this.seedProducts.length}`);
    
    // Category distribution
    const categoryDist = {};
    const roomDist = {};
    const conditionDist = {};
    
    this.seedProducts.forEach(product => {
      categoryDist[product.furnitureCategory] = (categoryDist[product.furnitureCategory] || 0) + 1;
      roomDist[product.room] = (roomDist[product.room] || 0) + 1;
      conditionDist[product.condition] = (conditionDist[product.condition] || 0) + 1;
    });

    console.log('\n📈 Category Distribution:');
    Object.entries(categoryDist).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   - ${cat}: ${count} (${percentage}%)`);
    });

    console.log('\n📈 Room Distribution:');
    Object.entries(roomDist).sort((a, b) => b[1] - a[1]).forEach(([room, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   - ${room}: ${count} (${percentage}%)`);
    });

    console.log('\n📈 Condition Distribution:');
    Object.entries(conditionDist).forEach(([condition, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   - ${condition}: ${count} (${percentage}%)`);
    });

    // Price analysis
    const prices = this.seedProducts.map(p => p.price);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    console.log('\n💰 Price Analysis:');
    console.log(`   - Average: R${avgPrice.toLocaleString()}`);
    console.log(`   - Range: R${minPrice.toLocaleString()} - R${maxPrice.toLocaleString()}`);

    // Stock analysis
    const inStock = this.seedProducts.filter(p => p.stock === 'in').length;
    const lowStock = this.seedProducts.filter(p => p.stock === 'low').length;
    const outOfStock = this.seedProducts.filter(p => p.stock === 'out').length;

    console.log('\n📦 Stock Status:');
    console.log(`   - In Stock: ${inStock} (${((inStock / this.seedProducts.length) * 100).toFixed(1)}%)`);
    console.log(`   - Low Stock: ${lowStock} (${((lowStock / this.seedProducts.length) * 100).toFixed(1)}%)`);
    console.log(`   - Out of Stock: ${outOfStock} (${((outOfStock / this.seedProducts.length) * 100).toFixed(1)}%)`);
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max, decimals = 2) {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

export default MarketplaceSeedingService;

