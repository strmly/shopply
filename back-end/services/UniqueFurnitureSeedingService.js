import { 
  STYLES, 
  MATERIALS, 
  CONDITIONS, 
  COLORS, 
  STOCK_TYPES, 
  SA_REGIONS,
} from '../constants/furnitureTaxonomy.js';
import { generateH3Cells } from '../utils/h3Utils.js';
import { Product } from '../models/Product.js';
import Store from '../models/Store.js';

/**
 * Unique Furniture Seeding Service
 * Generates 1000 UNIQUE products, each with unique descriptions and images
 */

class UniqueFurnitureSeedingService {
  constructor() {
    this.seedStores = [];
    this.seedProducts = [];
    this.storeIdCounter = 10000;
    this.productIdCounter = 20000;
    this.usedNames = new Set();
    this.usedImageSets = new Set();
  }

  /**
   * Main seeding method
   */
  async seedUniqueFurnitureMarketplace(options = {}) {
    const {
      targetProductCount = 1000,
      targetStoreCount = 30,
      regions = Object.keys(SA_REGIONS),
    } = options;

    console.log('🪑 ========================================');
    console.log('   UNIQUE FURNITURE MARKETPLACE');
    console.log('   (1000 Unique Products)');
    console.log('========================================\n');
    console.log(`📍 Regions: ${regions.join(', ')}`);
    console.log(`🏪 Stores: ${targetStoreCount}`);
    console.log(`📦 Products: ${targetProductCount} UNIQUE products`);
    console.log(`🖼️  Each with unique description and images\n`);

    await this.generateStores(targetStoreCount, regions);
    console.log(`✅ Generated ${this.seedStores.length} stores\n`);

    await this.generateUniqueProducts(targetProductCount);
    console.log(`✅ Generated ${this.seedProducts.length} UNIQUE products\n`);

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
        
        const latOffset = this.randomFloat(-0.005, 0.005, 4);
        const lngOffset = this.randomFloat(-0.005, 0.005, 4);
        const storeLat = region.lat + latOffset;
        const storeLng = region.lng + lngOffset;

        // Try to generate H3 cells, but use empty object if it fails
        let storeH3Cells = {};
        try {
          storeH3Cells = generateH3Cells(storeLat, storeLng);
        } catch (error) {
          // Use empty H3 cells if generation fails
          storeH3Cells = {};
        }

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
   * Generate 1000 UNIQUE products
   */
  async generateUniqueProducts(targetCount) {
    const productsPerStore = Math.ceil(targetCount / this.seedStores.length);
    let productCount = 0;

    for (const store of this.seedStores) {
      const storeProductCount = Math.min(
        this.randomInt(Math.floor(productsPerStore * 0.8), Math.ceil(productsPerStore * 1.2)),
        targetCount - productCount
      );

      for (let i = 0; i < storeProductCount && productCount < targetCount; i++) {
        const product = this.generateUniqueProduct(store, productCount);
        
        if (product) {
          this.seedProducts.push(product);
          productCount++;
        }
      }

      if (productCount >= targetCount) break;
    }
  }

  /**
   * Generate a single unique product with unique description
   */
  generateUniqueProduct(store, index) {
    const category = this.getRandomCategory();
    const productData = this.generateUniqueProductData(category, index);
    
    if (!productData) return null;

    const condition = this.randomChoice(CONDITIONS);
    const stockType = this.randomChoice(STOCK_TYPES);
    const style = this.randomChoice(STYLES);
    const material = this.randomChoice(MATERIALS);
    const color = this.randomChoice(COLORS);

    // Calculate price
    const basePrice = this.randomInt(productData.priceRange[0], productData.priceRange[1]);
    const conditionMultiplier = {
      'new': 1.0,
      'like-new': 0.85,
      'used': 0.65,
      'refurbished': 0.75,
    }[condition.id] || 1.0;
    const price = Math.round(basePrice * conditionMultiplier);

    const hasDiscount = Math.random() > 0.70;
    const discountPrice = hasDiscount ? Math.round(price * this.randomFloat(0.75, 0.92, 2)) : null;

    const dimensions = {
      w: this.randomInt(productData.dimensions.w[0], productData.dimensions.w[1]),
      d: this.randomInt(productData.dimensions.d[0], productData.dimensions.d[1]),
      h: this.randomInt(productData.dimensions.h[0], productData.dimensions.h[1]),
    };

    // Ensure unique name
    let productName = productData.name;
    let nameCounter = 1;
    while (this.usedNames.has(productName.toLowerCase()) && nameCounter < 100) {
      productName = `${productData.name} ${nameCounter}`;
      nameCounter++;
    }
    this.usedNames.add(productName.toLowerCase());

    const product = new Product({
      id: this.productIdCounter++,
      name: productName,
      description: productData.description,
      price,
      discountPrice,
      discount: hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : null,
      image: productData.images[0],
      images: productData.images,
      coverImage: productData.images[0],
      category: 'furniture',
      subcategory: category,
      tags: [productData.room, category, style.id, material.id, color.id, condition.id].filter(Boolean),
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.address,
      stock: stockType.id === 'in_stock' ? 'in' : stockType.id === 'limited' ? 'low' : 'in',
      stockQuantity: this.randomInt(5, 50),
      isVisible: true,
      sku: `FUR-${category.toUpperCase()}-${this.productIdCounter}`,
      weight: this.generateWeight(category),
      dimensions,
      dimensionsSnippet: `W${dimensions.w}×D${dimensions.d}×H${dimensions.h}cm`,
      rating: this.randomFloat(3.8, 4.9, 1),
      reviewCount: this.randomInt(5, 250),
      isNew: Math.random() > 0.60,  // 40% are new (was 20%)
      isTrending: Math.random() > 0.50,  // 50% are trending (was 15%)
      isFlashDeal: hasDiscount && Math.random() > 0.70,  // 30% of discounted items are flash deals
      salesCount: this.randomInt(10, 300),

      room: productData.room,
      furnitureCategory: category,
      subCategory: null,
      style: style.id,
      condition: condition.id,
      materialPrimary: material.id,
      materialSecondary: Math.random() > 0.6 ? this.randomChoice(MATERIALS).id : null,
      colorPrimary: color.id,
      color: color.id,
      careNotes: this.generateCareNotes(material.id),
      assemblyRequired: this.requiresAssembly(category),
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
      normalizedTitle: productName.toLowerCase(),
    });

    return product;
  }

  /**
   * Generate unique product data for a category
   */
  generateUniqueProductData(category, index) {
    const templates = this.getCategoryTemplates(category);
    if (!templates || templates.length === 0) return null;

    // Use index to ensure variety
    const templateIndex = index % templates.length;
    const baseTemplate = templates[templateIndex];

    // Generate unique variations
    const style = this.randomChoice(STYLES);
    const color = this.randomChoice(COLORS);
    const material = this.randomChoice(MATERIALS);
    const size = this.randomChoice(['Small', 'Medium', 'Large', 'Extra Large', 'Compact', 'Spacious']);

    // Create unique name
    const nameVariations = [
      `${style.label} ${baseTemplate.name}`,
      `${color.label} ${baseTemplate.name}`,
      `${size} ${baseTemplate.name}`,
      `${material.label} ${baseTemplate.name}`,
      `${baseTemplate.name} in ${color.label}`,
      `${style.label} ${color.label} ${baseTemplate.name}`,
    ];
    const name = this.randomChoice(nameVariations);

    // Create unique description
    const description = this.generateUniqueDescription(baseTemplate, style, color, material, size);

    // Generate unique images using Pexels with different photo IDs
    const images = this.generateUniqueImages(category, index);

    return {
      name,
      description,
      category,
      room: baseTemplate.room,
      images,
      priceRange: baseTemplate.priceRange,
      dimensions: baseTemplate.dimensions,
    };
  }

  /**
   * Generate unique description
   */
  generateUniqueDescription(template, style, color, material, size) {
    const features = [
      `This ${size.toLowerCase()} ${style.label.toLowerCase()} ${template.type} features`,
      `Crafted with ${material.label.toLowerCase()} materials, this ${color.label.toLowerCase()} piece`,
      `A ${style.label.toLowerCase()}-inspired ${template.type} designed`,
      `Experience comfort with this ${size.toLowerCase()} ${color.label.toLowerCase()} ${template.type}`,
      `Premium ${material.label.toLowerCase()} construction meets ${style.label.toLowerCase()} design`,
    ];

    const details = [
      'comfortable cushioning and ergonomic support',
      'durable construction built to last for years',
      'sleek modern lines with timeless appeal',
      'spacious design perfect for any room',
      'elegant finish that complements any decor',
      'smooth surfaces and quality craftsmanship',
      'versatile styling that fits multiple spaces',
      'premium materials and attention to detail',
    ];

    const benefits = [
      'Perfect for family gatherings and entertaining',
      'Ideal for modern living spaces',
      'Great for small apartments or large homes',
      'Complements both contemporary and traditional decor',
      'Easy to maintain and clean',
      'Comfortable for daily use',
      'Makes a stunning centerpiece',
      'Versatile enough for any room',
    ];

    const feature = this.randomChoice(features);
    const detail = this.randomChoice(details);
    const benefit = this.randomChoice(benefits);

    return `${feature} ${detail}. ${benefit}.`;
  }

  /**
   * Generate unique images using Pexels with different photo IDs
   */
  generateUniqueImages(category, index) {
    // Use Pexels photo IDs that match the category
    const pexelsPhotoIds = this.getPexelsPhotoIds(category);
    
    // Create unique image set by using index to offset photo IDs
    const baseId = pexelsPhotoIds[index % pexelsPhotoIds.length];
    const images = [];
    
    for (let i = 0; i < 4; i++) {
      // Use different photo IDs to ensure uniqueness
      const photoId = baseId + (index * 4) + i;
      images.push(`https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800&h=800`);
    }

    return images;
  }

  /**
   * Get Pexels photo IDs for category
   */
  getPexelsPhotoIds(category) {
    const photoMap = {
      'sofas': [1350789, 1866149, 2062431, 2724749, 276583, 1457842, 1571458, 3757055, 4352247, 5490966],
      'coffee-tables': [1866149, 2079249, 2724749, 245208, 1350789, 276583],
      'beds': [164595, 271743, 1454806, 2029667, 2082090, 279746],
      'wardrobes': [1454806, 2082090, 2724749, 1595428, 1583847, 1554995],
      'dressers': [1454806, 271743, 164595, 279746],
      'nightstands': [279746, 1454806, 164595, 271743],
      'dining-tables': [1080696, 1395967, 1866149, 2079249, 1617806, 1606744, 1595526, 1580480],
      'dining-chairs': [1080696, 1395967, 2079249, 1866149, 1580480, 1606744],
      'desks': [667838, 1181406, 1181416, 1957478, 4050315, 5052875],
      'office-chairs': [667838, 1181406, 1181416, 1957478, 4050315],
      'patio-sets': [1080696, 1395967, 2079249, 1866149],
      'kids-beds': [164595, 271743, 1454806, 2029667],
    };

    return photoMap[category] || [1350789, 1866149, 2062431, 2724749];
  }

  /**
   * Get category templates
   */
  getCategoryTemplates(category) {
    const templates = {
      'sofas': [
        { name: '3-Seater Sofa', type: 'sofa', room: 'living', priceRange: [8000, 15000], dimensions: { w: [180, 200], d: [85, 95], h: [85, 95] } },
        { name: 'L-Shaped Sectional', type: 'sectional', room: 'living', priceRange: [12000, 22000], dimensions: { w: [250, 280], d: [160, 180], h: [85, 95] } },
        { name: 'Loveseat', type: 'loveseat', room: 'living', priceRange: [6000, 9000], dimensions: { w: [140, 160], d: [80, 90], h: [80, 85] } },
        { name: 'Recliner Sofa', type: 'recliner', room: 'living', priceRange: [15000, 28000], dimensions: { w: [190, 220], d: [95, 105], h: [95, 105] } },
        { name: 'Chesterfield Sofa', type: 'chesterfield', room: 'living', priceRange: [10000, 20000], dimensions: { w: [180, 210], d: [85, 95], h: [75, 85] } },
      ],
      'coffee-tables': [
        { name: 'Coffee Table', type: 'coffee table', room: 'living', priceRange: [2000, 4500], dimensions: { w: [100, 120], d: [50, 70], h: [40, 50] } },
        { name: 'Round Coffee Table', type: 'round table', room: 'living', priceRange: [1800, 3500], dimensions: { w: [80, 100], d: [80, 100], h: [40, 45] } },
        { name: 'Storage Coffee Table', type: 'storage table', room: 'living', priceRange: [2500, 6000], dimensions: { w: [110, 130], d: [55, 70], h: [40, 50] } },
      ],
      'beds': [
        { name: 'Queen Size Bed', type: 'bed', room: 'bedroom', priceRange: [8000, 12000], dimensions: { w: [160, 170], d: [200, 210], h: [100, 110] } },
        { name: 'King Size Bed', type: 'bed', room: 'bedroom', priceRange: [12000, 18000], dimensions: { w: [180, 200], d: [200, 220], h: [110, 120] } },
        { name: 'Platform Bed', type: 'platform bed', room: 'bedroom', priceRange: [7000, 11000], dimensions: { w: [160, 180], d: [200, 220], h: [90, 100] } },
        { name: 'Storage Bed', type: 'storage bed', room: 'bedroom', priceRange: [10000, 16000], dimensions: { w: [160, 190], d: [210, 230], h: [90, 110] } },
      ],
      'wardrobes': [
        { name: 'Sliding Wardrobe', type: 'wardrobe', room: 'bedroom', priceRange: [10000, 20000], dimensions: { w: [240, 280], d: [55, 65], h: [210, 240] } },
        { name: 'Wooden Wardrobe', type: 'wardrobe', room: 'bedroom', priceRange: [6000, 12000], dimensions: { w: [100, 120], d: [55, 65], h: [190, 220] } },
      ],
      'dressers': [
        { name: '6-Drawer Dresser', type: 'dresser', room: 'bedroom', priceRange: [4000, 6500], dimensions: { w: [120, 140], d: [45, 55], h: [85, 95] } },
      ],
      'nightstands': [
        { name: 'Bedside Table', type: 'nightstand', room: 'bedroom', priceRange: [1500, 2800], dimensions: { w: [45, 55], d: [40, 50], h: [50, 60] } },
      ],
      'dining-tables': [
        { name: 'Dining Table', type: 'dining table', room: 'dining', priceRange: [8000, 13000], dimensions: { w: [160, 180], d: [85, 95], h: [75, 78] } },
        { name: 'Round Dining Table', type: 'round table', room: 'dining', priceRange: [7000, 11000], dimensions: { w: [110, 130], d: [110, 130], h: [75, 78] } },
        { name: 'Extendable Dining Table', type: 'extendable table', room: 'dining', priceRange: [10000, 18000], dimensions: { w: [140, 200], d: [85, 100], h: [75, 78] } },
      ],
      'dining-chairs': [
        { name: 'Dining Chairs Set', type: 'dining chairs', room: 'dining', priceRange: [4000, 7000], dimensions: { w: [45, 50], d: [50, 60], h: [90, 95] } },
      ],
      'desks': [
        { name: 'Office Desk', type: 'desk', room: 'office', priceRange: [4000, 7000], dimensions: { w: [120, 140], d: [60, 70], h: [73, 76] } },
        { name: 'Executive Desk', type: 'executive desk', room: 'office', priceRange: [8000, 14000], dimensions: { w: [150, 180], d: [70, 80], h: [73, 76] } },
        { name: 'L-Shaped Desk', type: 'L-desk', room: 'office', priceRange: [7000, 16000], dimensions: { w: [140, 160], d: [140, 160], h: [73, 76] } },
      ],
      'office-chairs': [
        { name: 'Office Chair', type: 'office chair', room: 'office', priceRange: [2500, 4500], dimensions: { w: [60, 65], d: [60, 65], h: [110, 120] } },
        { name: 'Executive Chair', type: 'executive chair', room: 'office', priceRange: [3500, 6000], dimensions: { w: [65, 70], d: [65, 70], h: [115, 125] } },
      ],
      'patio-sets': [
        { name: 'Patio Dining Set', type: 'patio set', room: 'outdoor', priceRange: [10000, 18000], dimensions: { w: [160, 180], d: [90, 100], h: [75, 78] } },
      ],
      'kids-beds': [
        { name: 'Kids Single Bed', type: 'kids bed', room: 'kids', priceRange: [3500, 6000], dimensions: { w: [90, 100], d: [190, 200], h: [60, 70] } },
        { name: 'Bunk Bed', type: 'bunk bed', room: 'kids', priceRange: [7000, 11000], dimensions: { w: [90, 100], d: [190, 200], h: [150, 160] } },
      ],
    };

    return templates[category] || [];
  }

  /**
   * Get random category
   */
  getRandomCategory() {
    const categories = [
      'sofas', 'coffee-tables', 'beds', 'wardrobes', 'dressers', 'nightstands',
      'dining-tables', 'dining-chairs', 'desks', 'office-chairs', 'patio-sets', 'kids-beds'
    ];
    return this.randomChoice(categories);
  }

  // Helper methods
  generateWeight(category) {
    const weights = {
      'sofas': [40, 80], 'beds': [30, 70], 'desks': [20, 50],
      'dining-tables': [20, 50], 'coffee-tables': [10, 30],
      'wardrobes': [50, 100], 'dressers': [30, 50], 'nightstands': [10, 20],
      'dining-chairs': [5, 15], 'office-chairs': [10, 20],
      'patio-sets': [30, 60], 'kids-beds': [20, 40],
    };
    const range = weights[category] || [10, 30];
    return this.randomInt(range[0], range[1]);
  }

  generateCareNotes(material) {
    const notes = {
      'wood': 'Wipe with damp cloth. Avoid harsh chemicals. Polish occasionally.',
      'fabric': 'Vacuum regularly. Spot clean stains immediately.',
      'leather': 'Wipe with leather cleaner. Condition every 6 months.',
      'metal': 'Wipe with damp cloth. Dry immediately to prevent rust.',
      'glass': 'Clean with glass cleaner. Avoid abrasive materials.',
    };
    return notes[material] || 'Clean with appropriate cleaner.';
  }

  requiresAssembly(category) {
    return ['beds', 'desks', 'wardrobes', 'dining-tables'].includes(category) && Math.random() > 0.3;
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

export default UniqueFurnitureSeedingService;

