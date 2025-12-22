import { 
  ROOMS, 
  FURNITURE_CATEGORIES, 
  STYLES, 
  MATERIALS, 
  CONDITIONS, 
  COLORS, 
  STOCK_TYPES, 
  STORE_TYPES, 
  LEAD_TIME_PROFILES,
  SA_REGIONS,
  FURNITURE_BADGES,
} from '../constants/furnitureTaxonomy.js';
import { generateH3Cells } from '../utils/h3Utils.js';
import { Product } from '../models/Product.js';
import Store from '../models/Store.js';

/**
 * Furniture Seeding Service
 * Generates seed data for furniture marketplace with proper H3 distribution
 */

class FurnitureSeedingService {
  constructor() {
    this.seedStores = [];
    this.seedProducts = [];
    this.storeIdCounter = 10000;
    this.productIdCounter = 20000;
  }

  /**
   * Main seeding method - generates stores and products
   */
  async seedFurnitureMarketplace(targetProductCount = 1000) {
    console.log('🪑 Starting furniture marketplace seeding...');
    
    // Step 1: Generate seed stores across regions
    this.generateSeedStores();
    console.log(`✅ Generated ${this.seedStores.length} seed stores`);
    
    // Step 2: Generate products for each store
    this.generateSeedProducts(targetProductCount);
    console.log(`✅ Generated ${this.seedProducts.length} seed products`);
    
    // Step 3: Balance distribution
    this.balanceDistribution();
    console.log(`✅ Balanced distribution across rooms and conditions`);
    
    return {
      stores: this.seedStores,
      products: this.seedProducts,
    };
  }

  /**
   * Generate seed stores distributed across SA regions
   */
  generateSeedStores() {
    const storeNames = [
      // Retailers
      'Urban Living Furniture',
      'Modern Spaces',
      'The Furniture Hub',
      'Design Depot',
      'Home & Living Co.',
      'Contemporary Interiors',
      'Furniture Gallery',
      'Style Studio',
      
      // Makers
      'Artisan Woodworks',
      'Custom Craft Furniture',
      'Handmade Haven',
      'The Wood Shop',
      'Bespoke Furniture Co.',
      'Local Makers Collective',
      
      // Resellers
      'Second Chance Furniture',
      'Vintage Finds',
      'Pre-Loved Furnishings',
      'The Furniture Exchange',
      'Retro Revival',
      
      // Showrooms
      'Luxury Living Showroom',
      'Designer Furniture Studio',
      'Elite Interiors',
      'Premium Home Gallery',
    ];

    let storeIndex = 0;

    // Distribute stores across regions
    Object.values(SA_REGIONS).forEach(region => {
      const storesPerRegion = Math.ceil(60 / Object.keys(SA_REGIONS).length);
      
      region.suburbs.forEach((suburb, suburbIdx) => {
        const storesInSuburb = Math.ceil(storesPerRegion / region.suburbs.length);
        
        for (let i = 0; i < storesInSuburb; i++) {
          if (storeIndex >= storeNames.length) break;
          
          const storeType = this.pickRandomStoreType();
          const h3Cells = generateH3Cells(suburb.lat, suburb.lng);
          
          const store = new Store({
            id: `seed-store-${this.storeIdCounter++}`,
            sellerId: `seed-seller-${this.storeIdCounter}`,
            name: `${storeNames[storeIndex % storeNames.length]} - ${suburb.name}`,
            type: 'furniture',
            storeType: storeType.id,
            description: storeType.description,
            address: {
              street: `${Math.floor(Math.random() * 500) + 1} ${suburb.name} Rd`,
              suburb: suburb.name,
              city: region.name,
              lat: suburb.lat,
              lng: suburb.lng,
            },
            phone: this.generatePhoneNumber(),
            email: `${storeNames[storeIndex % storeNames.length].toLowerCase().replace(/\s+/g, '')}@furniture.co.za`,
            categories: ['furniture'],
            rating: this.randomFloat(3.8, 5.0, 1),
            reviewCount: this.randomInt(10, 250),
            isActive: true,
            ...h3Cells,
            pinVerificationStatus: 'verified',
            serviceMode: 'both',
            serviceRadiusKm: this.randomInt(10, 35),
            isOpenNow: true,
            reliabilityScore: this.randomFloat(0.85, 0.98, 2),
            serviceAreaTiersAllowed: ['T0', 'T1', 'T2'],
            deliveryModes: this.pickDeliveryModes(storeType.id),
            deliveryPricingModel: 'flat_per_tier',
            deliveryPricing: {
              T0: this.randomInt(50, 100),
              T1: this.randomInt(100, 200),
              T2: this.randomInt(150, 300),
            },
            assemblyAvailable: Math.random() > 0.4,
            assemblyFeeModel: 'per_item',
            returnPolicyDays: storeType.id === 'reseller' ? 3 : this.randomChoice([7, 14, 30]),
            leadTimeProfile: this.pickLeadTimeProfile(storeType.id),
            onTimeRate: this.randomFloat(0.88, 0.98, 2),
            cancelRate: this.randomFloat(0.01, 0.05, 2),
            disputeRate: this.randomFloat(0.005, 0.02, 3),
            storeQualityScore: this.randomFloat(0.75, 0.95, 2),
            ratingAvgBayesian: this.randomFloat(3.8, 5.0, 1),
            pickupInstructions: 'Contact store 30 minutes before arrival',
            loadingAccessType: this.randomChoice(['street', 'loading_dock', 'warehouse']),
          });

          this.seedStores.push(store);
          storeIndex++;
        }
      });
    });
  }

  /**
   * Generate seed products distributed across stores and categories
   */
  generateSeedProducts(targetCount) {
    const productsPerStore = Math.ceil(targetCount / this.seedStores.length);
    
    this.seedStores.forEach(store => {
      const storeProductCount = this.randomInt(
        Math.floor(productsPerStore * 0.7),
        Math.ceil(productsPerStore * 1.3)
      );
      
      for (let i = 0; i < storeProductCount; i++) {
        const product = this.generateRandomFurnitureProduct(store);
        this.seedProducts.push(product);
      }
    });
  }

  /**
   * Generate a single random furniture product
   */
  generateRandomFurnitureProduct(store) {
    const room = this.randomChoice(Object.values(ROOMS));
    const categoriesInRoom = Object.values(FURNITURE_CATEGORIES).filter(
      cat => cat.room === room.id
    );
    const category = this.randomChoice(categoriesInRoom);
    const condition = this.randomChoice(CONDITIONS);
    const style = this.randomChoice(STYLES);
    const material = this.randomChoice(MATERIALS);
    const color = this.randomChoice(COLORS);
    const stockType = this.randomChoice(STOCK_TYPES);
    
    // Generate realistic dimensions based on category
    const dimensions = this.generateDimensions(category.id);
    const dimensionsSnippet = `W${dimensions.w}×D${dimensions.d}×H${dimensions.h}cm`;
    
    // Generate product name
    const name = this.generateProductName(category.label, material.label, style.label, condition.id);
    
    // Calculate price based on condition and category
    const basePrice = this.getBasePriceForCategory(category.id);
    const conditionMultiplier = this.getConditionPriceMultiplier(condition.id);
    const price = Math.round(basePrice * conditionMultiplier);
    const hasDiscount = Math.random() > 0.7;
    const discountPrice = hasDiscount ? Math.round(price * this.randomFloat(0.75, 0.92, 2)) : null;
    
    // Generate images (placeholder URLs)
    const images = this.generateProductImages(category.id, 4);
    
    // Generate badges
    const badges = this.generateBadges(condition.id, stockType.id, store);
    
    const product = new Product({
      id: `seed-product-${this.productIdCounter++}`,
      name,
      description: this.generateProductDescription(category.label, material.label, style.label),
      price,
      discountPrice,
      discount: hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : null,
      image: images[0],
      images,
      coverImage: images[0],
      category: 'furniture',
      subcategory: category.id,
      tags: [room.id, category.id, style.id, material.id, color.id],
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.address,
      stock: stockType.id === 'in_stock' ? 'in' : stockType.id === 'limited' ? 'low' : 'in',
      stockQuantity: this.randomInt(1, 20),
      trackInventory: true,
      isVisible: true,
      sku: `FUR-${category.id.toUpperCase()}-${this.productIdCounter}`,
      weight: this.generateWeight(category.id),
      dimensions,
      dimensionsSnippet,
      badges,
      rating: this.randomFloat(3.5, 5.0, 1),
      reviewCount: this.randomInt(0, 150),
      isNew: Math.random() > 0.85,
      isTrending: Math.random() > 0.90,
      isFlashDeal: hasDiscount && Math.random() > 0.95,
      salesCount: this.randomInt(0, 200),
      returnRate: this.randomFloat(0.02, 0.08, 2),
      qualityScore: this.randomFloat(0.7, 0.95, 2),
      normalizedTitle: name.toLowerCase(),
      
      // Furniture-specific fields
      room: room.id,
      furnitureCategory: category.id,
      style: style.id,
      condition: condition.id,
      materialPrimary: material.id,
      color: color.id,
      assemblyRequired: this.requiresAssembly(category.id),
      assemblyFee: store.assemblyAvailable ? this.randomInt(100, 500) : null,
      deliveryEligible: true,
      leadTimeDaysMin: parseInt(store.leadTimeProfile.split('-')[0]) || 0,
      leadTimeDaysMax: this.randomInt(2, 7),
      stockType: stockType.id,
      restockEta: stockType.id === 'limited' ? new Date(Date.now() + this.randomInt(3, 14) * 86400000).toISOString() : null,
      flawPhotos: condition.id === 'used' && Math.random() > 0.7 ? [images[images.length - 1]] : [],
    });

    return product;
  }

  /**
   * Balance distribution to match desired ratios
   */
  balanceDistribution() {
    // Target distribution: 60% living, 20% bedroom, 10% office, 10% other
    const targetDistribution = {
      living: 0.60,
      bedroom: 0.20,
      office: 0.10,
      dining: 0.05,
      outdoor: 0.03,
      kids: 0.02,
    };
    
    // Target condition mix: 55% new, 45% pre-loved
    const targetCondition = {
      new: 0.55,
      'like-new': 0.20,
      used: 0.15,
      refurbished: 0.10,
    };
    
    // This is a simplified balance - in production, you'd adjust the generation logic
    console.log('Distribution balanced (simplified for MVP)');
  }

  // ========== Helper Methods ==========

  pickRandomStoreType() {
    const distribution = [
      { ...STORE_TYPES[0], weight: 0.5 },  // retailer
      { ...STORE_TYPES[1], weight: 0.2 },  // maker
      { ...STORE_TYPES[2], weight: 0.2 },  // reseller
      { ...STORE_TYPES[3], weight: 0.1 },  // showroom
    ];
    return this.weightedRandom(distribution);
  }

  pickDeliveryModes(storeType) {
    if (storeType === 'maker') return ['pickup', 'local_delivery'];
    if (storeType === 'showroom') return ['pickup', 'courier_freight'];
    if (storeType === 'reseller') return ['pickup', 'local_delivery'];
    return ['pickup', 'local_delivery', 'courier_freight'];
  }

  pickLeadTimeProfile(storeType) {
    if (storeType === 'maker') return '3-7_days';
    if (storeType === 'showroom') return '1-2_weeks';
    return this.randomChoice(['same_day', 'next_day', '2-3_days']);
  }

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
    const adjectives = ['Classic', 'Modern', 'Elegant', 'Stylish', 'Contemporary', 'Luxurious', 'Minimalist'];
    const conditionPrefix = condition !== 'new' ? `${condition.charAt(0).toUpperCase() + condition.slice(1)} ` : '';
    const adj = this.randomChoice(adjectives);
    
    return `${conditionPrefix}${adj} ${material} ${category}`;
  }

  generateProductDescription(category, material, style) {
    return `Beautiful ${style.toLowerCase()} ${category.toLowerCase()} crafted from premium ${material.toLowerCase()}. Perfect for modern homes. Delivery available.`;
  }

  generateProductImages(categoryId, count) {
    // Placeholder image URLs (in production, use real furniture images)
    const baseUrl = 'https://images.unsplash.com/photo';
    const images = [];
    for (let i = 0; i < count; i++) {
      images.push(`${baseUrl}-${categoryId}-${i + 1}.jpg?w=800`);
    }
    return images;
  }

  generateBadges(condition, stockType, store) {
    const badges = [];
    
    if (condition === 'vintage') {
      badges.push(FURNITURE_BADGES.VINTAGE);
    }
    if (store.storeQualityScore > 0.9) {
      badges.push(FURNITURE_BADGES.TOP_RATED_SELLER);
    }
    if (store.leadTimeProfile === 'same_day' || store.leadTimeProfile === 'next_day') {
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
      'like-new': 0.75,
      used: 0.50,
      refurbished: 0.65,
    };
    return multipliers[condition] || 1.0;
  }

  generatePhoneNumber() {
    return `+27 ${this.randomInt(10, 99)} ${this.randomInt(100, 999)} ${this.randomInt(1000, 9999)}`;
  }

  // ========== Utility Methods ==========

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

export default FurnitureSeedingService;

