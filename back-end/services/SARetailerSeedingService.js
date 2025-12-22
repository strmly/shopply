import { SA_RETAILER_PRODUCTS, SA_PRODUCT_VARIANTS } from '../data/saRetailerProducts.js';
import {
  ROOMS,
  FURNITURE_CATEGORIES,
  STYLES,
  MATERIALS,
  CONDITIONS,
  COLORS,
  STOCK_TYPES,
  SA_REGIONS,
} from '../constants/furnitureTaxonomy.js';
import { Product } from '../models/Product.js';
import Store from '../models/Store.js';
import { ProductService } from './ProductService.js';

/**
 * South African Retailer Seeding Service
 * Seeds furniture products from real SA retailers:
 * Game, Makro, Builders Warehouse, OK Furniture, Lewis, @home, Rochester, Life Home
 */
class SARetailerSeedingService {
  constructor() {
    this.seedStores = [];
    this.seedProducts = [];
    this.storeIdCounter = 50000;
    this.productIdCounter = 60000;
  }

  /**
   * Main seeding method - generates SA retailer products
   */
  async seedSAMarketplace(options = {}) {
    const {
      targetProductCount = 1000,
      regions = Object.keys(SA_REGIONS),
    } = options;

    console.log('\n🇿🇦 ========================================');
    console.log('   SOUTH AFRICAN RETAILER SEEDING');
    console.log('   (Game, Makro, Builders, etc.)');
    console.log('========================================\n');
    console.log(`📍 Regions: ${regions.join(', ')}`);
    console.log(`📦 Target: ${targetProductCount} products`);
    console.log(`🏪 Retailers: Game, Makro, Builders, OK, Lewis, @home, Rochester, Life Home\n`);

    // Step 0: Clear existing products
    ProductService.clearProducts();
    console.log('✅ Cleared old products\n');

    // Step 1: Generate retailer stores
    await this.generateRetailerStores(regions);
    console.log(`✅ Generated ${this.seedStores.length} retailer stores\n`);

    // Step 2: Generate products from SA retailers
    await this.generateSAProducts(targetProductCount);
    console.log(`✅ Generated ${this.seedProducts.length} SA retailer products\n`);

    // Step 3: Add products to ProductService
    try {
      const addedCount = ProductService.addProducts(this.seedProducts);
      console.log(`✅ Added ${addedCount} products to ProductService`);
      console.log(`   ProductService now has ${ProductService.products.length} total products`);
    } catch (error) {
      console.error('❌ Error adding products to ProductService:', error);
      throw error;
    }

    // Step 4: Generate report
    this.generateReport();

    console.log('\n✅ SA marketplace seeded successfully!');
    console.log('========================================\n');

    return {
      stores: this.seedStores,
      products: this.seedProducts,
    };
  }

  /**
   * Generate retailer stores across SA regions
   */
  async generateRetailerStores(regions) {
    const retailers = [
      { name: "Game", type: "showroom", description: "Leading South African retailer offering quality furniture and home goods at affordable prices." },
      { name: "Makro", type: "warehouse", description: "Wholesale and retail warehouse offering furniture, appliances, and home essentials." },
      { name: "Builders Warehouse", type: "warehouse", description: "Home improvement and furniture warehouse with DIY and ready-made solutions." },
      { name: "OK Furniture", type: "showroom", description: "Trusted furniture retailer providing stylish and affordable home furnishings." },
      { name: "Lewis", type: "showroom", description: "Premium furniture and homeware retailer with modern contemporary designs." },
      { name: "@home", type: "showroom", description: "Stylish furniture and decor retailer for every room in your home." },
      { name: "Rochester", type: "showroom", description: "Quality furniture specialist with classic and contemporary collections." },
      { name: "Life Home", type: "warehouse", description: "Affordable furniture and home essentials for South African families." },
    ];

    for (const region of regions) {
      const regionData = SA_REGIONS[region];
      if (!regionData) continue;

      for (const retailer of retailers) {
        // Create store for each retailer in each region
        const store = new Store({
          id: this.storeIdCounter++,
          name: `${retailer.name} ${regionData.name}`,
          description: retailer.description,
          location: `${regionData.name}, South Africa`,
          latitude: regionData.latitude + this.randomFloat(-0.02, 0.02),
          longitude: regionData.longitude + this.randomFloat(-0.02, 0.02),
          h3Index: null,
          storeType: retailer.type,
          contact: `${regionData.name.toLowerCase()}@${retailer.name.toLowerCase().replace(/[^a-z]/g, '')}.co.za`,
          rating: this.randomFloat(4.2, 4.8, 1),
          reviewCount: this.randomInt(150, 2500),
          deliveryAvailable: true,
          assemblyAvailable: Math.random() > 0.3,
          returnPolicy: retailer.name === "Builders Warehouse" ? "14-day returns with receipt" : "30-day returns",
          leadTimeDaysMin: 0,
          leadTimeDaysMax: this.randomInt(3, 10),
          verificationStatus: 'verified',
          fulfillmentMetrics: {
            onTimeRate: this.randomFloat(0.92, 0.98, 2),
            cancelRate: this.randomFloat(0.01, 0.03, 2),
            disputeRate: this.randomFloat(0.003, 0.012, 3),
            stockMismatchRate: this.randomFloat(0.008, 0.02, 2),
          },
        });

        this.seedStores.push(store);
      }
    }
  }

  /**
   * Generate SA retailer products
   */
  async generateSAProducts(targetCount) {
    let productCount = 0;
    const storesPerRetailer = {};
    
    // Group stores by retailer
    this.seedStores.forEach(store => {
      const retailerName = store.name.split(' ')[0];
      if (!storesPerRetailer[retailerName]) {
        storesPerRetailer[retailerName] = [];
      }
      storesPerRetailer[retailerName].push(store);
    });

    // Generate products cycling through retailers
    while (productCount < targetCount) {
      for (const template of SA_RETAILER_PRODUCTS) {
        if (productCount >= targetCount) break;

        // Get stores for this retailer
        const retailerStores = storesPerRetailer[template.retailer] || [];
        if (retailerStores.length === 0) continue;

        // Pick a random store from this retailer
        const store = this.randomChoice(retailerStores);

        // Create product with variations
        const product = this.createSAProduct(store, template, productCount);
        
        if (product) {
          this.seedProducts.push(product);
          productCount++;
        }
      }
    }
  }

  /**
   * Create a single SA retailer product
   */
  createSAProduct(store, template, index) {
    // Select color variant
    const color = this.randomChoice(template.colors);
    const style = this.randomChoice(template.styles);
    const material = template.material;

    // Create variation in title (some products are standard, some have size variants)
    let productTitle = template.title;
    if (index % 4 === 0 && SA_PRODUCT_VARIANTS.sizes[template.category]) {
      const sizeVariant = this.randomChoice(SA_PRODUCT_VARIANTS.sizes[template.category]);
      productTitle = productTitle.replace(/\d+ Seater|\d+cm|King|Queen/i, sizeVariant);
    }

    // Price calculation (SA pricing)
    const basePrice = this.randomInt(template.priceRange[0], template.priceRange[1]);
    const hasDiscount = Math.random() > 0.60;  // 40% have discounts
    const discountPercentage = hasDiscount ? this.randomChoice([10, 15, 20, 25, 30]) : 0;
    const discountPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercentage / 100)) : null;

    // Dimensions with variation
    const dimensions = {
      w: this.randomInt(template.dimensions.w[0], template.dimensions.w[1]),
      d: this.randomInt(template.dimensions.d[0], template.dimensions.d[1]),
      h: this.randomInt(template.dimensions.h[0], template.dimensions.h[1]),
    };

    const weight = this.randomInt(template.weight[0], template.weight[1]);

    // Stock status (mostly in stock)
    const stockRandom = Math.random();
    const stockType = stockRandom > 0.75 ? 'limited' : 'in_stock';
    const stockQuantity = stockType === 'in_stock' ? this.randomInt(8, 35) : this.randomInt(1, 5);

    // Create product
    const product = new Product({
      id: this.productIdCounter++,
      name: productTitle,
      subtitle: template.features ? template.features[0] : '',
      description: template.description,
      price: basePrice,
      originalPrice: hasDiscount ? basePrice : null,
      discountPrice: discountPrice,
      discount: discountPercentage,
      image: template.images[0],
      images: template.images,
      category: 'furniture',
      subcategory: template.category,
      tags: [
        template.room,
        template.category,
        style,
        material,
        color,
        template.condition,
        template.retailer.toLowerCase(),
      ],
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.location,
      distance: this.randomInt(2, 45),
      stock: stockType === 'in_stock' ? 'in' : 'low',
      stockQuantity: stockQuantity,
      lowStockThreshold: 5,
      trackInventory: true,
      isVisible: true,
      sku: `${template.sku_prefix}-${this.productIdCounter}`,
      weight: weight,
      dimensions,
      dimensionsSnippet: `${dimensions.w}cm W × ${dimensions.d}cm D × ${dimensions.h}cm H`,
      rating: this.randomFloat(4.1, 4.8, 1),
      reviewCount: this.randomInt(25, 850),
      isNew: Math.random() > 0.65,  // 35% new
      isTrending: Math.random() > 0.55,  // 45% trending
      isFlashDeal: hasDiscount && Math.random() > 0.70,  // 30% of discounted items
      salesCount: this.randomInt(35, 650),

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
      assemblyFee: store.assemblyAvailable && template.assemblyRequired ? this.randomInt(150, 650) : null,
      deliveryEligible: true,
      leadTimeDaysMin: 0,
      leadTimeDaysMax: store.leadTimeDaysMax,
      stockType: stockType,
      restockEta: stockType === 'limited' ? new Date(Date.now() + this.randomInt(5, 14) * 86400000).toISOString() : null,
      availabilityConfidence: this.randomFloat(0.90, 0.99, 2),
      lastStockUpdate: new Date(Date.now() - this.randomInt(0, 3) * 86400000),
      sizeTag: this.deriveSizeTag(dimensions),
      complaintRate: this.randomFloat(0.001, 0.012, 3),
      returnRate: this.randomFloat(0.01, 0.05, 2),
      qualityScore: this.randomFloat(0.85, 0.96, 2),
      normalizedTitle: productTitle.toLowerCase(),
    });

    return product;
  }

  /**
   * Generate care notes based on material
   */
  generateCareNotes(material) {
    const careGuides = {
      wood: "Wipe with soft damp cloth. Avoid harsh chemicals. Polish occasionally with wood polish.",
      fabric: "Vacuum regularly. Spot clean stains with mild detergent. Professional clean yearly.",
      leather: "Wipe with soft cloth. Use leather conditioner. Avoid direct sunlight.",
      metal: "Clean with damp cloth. Dry thoroughly. Polish with metal cleaner.",
      glass: "Clean with glass cleaner. Use soft cloth. Avoid abrasive cleaners.",
      mesh: "Vacuum gently. Spot clean with mild soap solution. Air dry.",
    };
    return careGuides[material] || "Clean with appropriate products for the material.";
  }

  /**
   * Derive size tag from dimensions
   */
  deriveSizeTag(dimensions) {
    const volume = dimensions.w * dimensions.d * dimensions.h;
    if (volume < 150000) return 'compact';
    if (volume < 600000) return 'standard';
    return 'large';
  }

  /**
   * Generate summary report
   */
  generateReport() {
    console.log('\n📊 SA RETAILER SEEDING REPORT:');
    console.log(`   - Total Stores: ${this.seedStores.length}`);
    console.log(`   - Total Products: ${this.seedProducts.length}`);
    
    // Retailer distribution
    const retailerDist = {};
    const categoryDist = {};
    const roomDist = {};
    
    this.seedProducts.forEach(product => {
      const retailer = product.storeName.split(' ')[0];
      retailerDist[retailer] = (retailerDist[retailer] || 0) + 1;
      categoryDist[product.furnitureCategory] = (categoryDist[product.furnitureCategory] || 0) + 1;
      roomDist[product.room] = (roomDist[product.room] || 0) + 1;
    });

    console.log('\n🏪 Retailer Distribution:');
    Object.entries(retailerDist).sort((a, b) => b[1] - a[1]).forEach(([retailer, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   - ${retailer}: ${count} (${percentage}%)`);
    });

    console.log('\n📈 Category Distribution:');
    Object.entries(categoryDist).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([cat, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   - ${cat}: ${count} (${percentage}%)`);
    });

    console.log('\n🏠 Room Distribution:');
    Object.entries(roomDist).sort((a, b) => b[1] - a[1]).forEach(([room, count]) => {
      const percentage = ((count / this.seedProducts.length) * 100).toFixed(1);
      console.log(`   - ${room}: ${count} (${percentage}%)`);
    });

    // Price analysis
    const prices = this.seedProducts.map(p => p.price);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    console.log('\n💰 Price Analysis (ZAR):');
    console.log(`   - Average: R${avgPrice.toLocaleString()}`);
    console.log(`   - Range: R${minPrice.toLocaleString()} - R${maxPrice.toLocaleString()}`);

    // Discount analysis
    const discounted = this.seedProducts.filter(p => p.discount > 0).length;
    console.log('\n🏷️  Discount Analysis:');
    console.log(`   - Products on sale: ${discounted} (${((discounted / this.seedProducts.length) * 100).toFixed(1)}%)`);
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

export default SARetailerSeedingService;

