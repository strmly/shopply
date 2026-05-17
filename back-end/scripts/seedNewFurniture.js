// Seed new furniture products from generateProducts.js
// Clears old data and seeds with 1000 new products

import { generateProducts } from './generateProducts.js';
import { ProductService } from '../services/ProductService.js';
import { Product } from '../models/Product.js';
import { SellerService } from '../services/SellerService.js';
import { createStore, getAllStores } from '../services/StoreService.js';
import { generateH3Cells } from '../utils/h3Utils.js';

/**
 * Real furniture images from Unsplash (free to use)
 * Organized by category and subcategory
 */
const REAL_FURNITURE_IMAGES = {
  // Sofas
  'sofas': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', // Modern gray sofa
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=600&fit=crop', // Beige sofa
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop', // Blue sectional
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', // White sofa
    'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800&h=600&fit=crop', // Dark sofa
    'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=800&h=600&fit=crop', // Velvet sofa
  ],
  
  // Beds
  'beds': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop', // Modern bed
    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&h=600&fit=crop', // White bed
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop', // Gray bed
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop', // King bed
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', // Platform bed
  ],
  
  // Dressers
  'dressers': [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop', // Wood dresser
    'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&h=600&fit=crop', // Modern dresser
    'https://images.unsplash.com/photo-1616464884170-38468302d98b?w=800&h=600&fit=crop', // White dresser
  ],
  
  // Desks
  'desks': [
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=600&fit=crop', // Modern desk
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop', // Wood desk
    'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&h=600&fit=crop', // White desk
    'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop', // Industrial desk
  ],
  
  // Office Chairs
  'office chairs': [
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=600&fit=crop', // Black office chair
    'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&h=600&fit=crop', // Ergonomic chair
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=600&fit=crop', // Modern chair
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', // White chair
  ],
  
  // Bookcases
  'bookcases': [
    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&h=600&fit=crop', // Wood bookcase
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop', // Modern bookcase
    'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800&h=600&fit=crop', // White bookcase
  ],
  
  // Coffee Tables
  'coffee tables': [
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop', // Wood coffee table
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop', // Modern table
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop', // Glass table
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop', // Industrial table
  ],
  
  // Dining Tables
  'dining tables': [
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop', // Wood dining table
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop', // Modern table
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop', // Farmhouse table
    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&h=600&fit=crop', // Glass table
  ],
  
  // Dining Chairs
  'dining chairs': [
    'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=600&fit=crop', // Modern chair
    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&h=600&fit=crop', // Wood chair
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=600&fit=crop', // Upholstered chair
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=600&fit=crop', // White chair
  ],
  
  // Accent Chairs
  'accent chairs': [
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop', // Velvet chair
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', // Modern chair
    'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&h=600&fit=crop', // Gray chair
    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&h=600&fit=crop', // Leather chair
  ],
};

/**
 * Get real image for product based on subcategory
 */
function getRealImage(subcategory, productId) {
  const categoryKey = subcategory.toLowerCase();
  const images = REAL_FURNITURE_IMAGES[categoryKey] || REAL_FURNITURE_IMAGES['sofas'];
  
  // Use product ID to consistently select an image
  const imageIndex = productId % images.length;
  return images[imageIndex];
}

/**
 * Get multiple real images for product
 */
function getRealImages(subcategory, productId) {
  const categoryKey = subcategory.toLowerCase();
  const images = REAL_FURNITURE_IMAGES[categoryKey] || REAL_FURNITURE_IMAGES['sofas'];
  
  // Get 2-3 images for variety
  const imageCount = Math.min(3, images.length);
  const startIndex = productId % images.length;
  const selectedImages = [];
  
  for (let i = 0; i < imageCount; i++) {
    const index = (startIndex + i) % images.length;
    selectedImages.push(images[index]);
  }
  
  return selectedImages;
}

/**
 * Convert generated furniture product to Product model format
 */
// Deterministic pick from an array using product id as seed (no Math.random — stable across restarts)
function seededPick(arr, id, salt = 1) {
  return arr[((id * salt) >>> 0) % arr.length];
}

const STYLES     = ['modern', 'scandi', 'industrial', 'traditional', 'vintage'];
const CONDITIONS = ['new', 'new', 'new', 'new', 'new', 'like-new', 'like-new', 'refurbished']; // 62% new, 25% like-new, 13% refurbished
const LEAD_TIMES = [[0,3],[0,5],[1,5],[2,7],[0,2]]; // varied delivery windows
const COLORS     = ['Charcoal', 'Ivory', 'Oak', 'Walnut', 'White', 'Grey', 'Black', 'Natural', 'Midnight Blue', 'Sage Green', 'Terracotta', 'Blush'];
const MATERIALS  = ['wood', 'metal', 'fabric', 'leather', 'glass', 'wood', 'fabric', 'wood']; // wood/fabric more common

function convertToProductModel(generatedProduct, storeId, storeName = 'Shopply Home Furniture', storeAddress = {}) {
  const id = generatedProduct.id;
  const catalogStoreId = storeId;

  const realImages = getRealImages(generatedProduct.subcategory, id);
  const mainImage = realImages[0];

  const rating = generatedProduct.rating || 4.0;
  const normalizedRating = Math.min(1, Math.max(0, (rating - 3.5) / 1.5));
  const jitter = ((id * 7919) % 100) / 1000;
  const qualityScore = parseFloat(Math.min(0.92, Math.max(0.60, 0.60 + normalizedRating * 0.32 + jitter)).toFixed(2));
  const salesCount = 10 + ((id * 1009) % 491);

  const style     = seededPick(STYLES, id, 31);
  const condition = seededPick(CONDITIONS, id, 53);
  const [leadMin, leadMax] = seededPick(LEAD_TIMES, id, 17);
  const color     = generatedProduct.color && generatedProduct.color !== 'Various'
    ? generatedProduct.color
    : seededPick(COLORS, id, 71);
  const material  = extractMaterial(generatedProduct.material) || seededPick(MATERIALS, id, 43);

  // Discount on ~20% of products (deterministic)
  const hasDiscount = (id * 37) % 5 === 0;
  const discountPct = hasDiscount ? (5 + ((id * 13) % 26)) : 0; // 5–30%
  const originalPrice = generatedProduct.price;
  const price = hasDiscount
    ? parseFloat((originalPrice * (1 - discountPct / 100)).toFixed(2))
    : originalPrice;

  return {
    id,
    name: generatedProduct.name,
    description: generatedProduct.description || '',
    price,
    originalPrice: hasDiscount ? originalPrice : parseFloat((originalPrice * 1.10).toFixed(2)),
    discount: hasDiscount ? discountPct : null,
    image: mainImage,
    images: realImages,
    category: 'furniture',
    subcategory: generatedProduct.subcategory || generatedProduct.category,
    tags: generatedProduct.tags || [],
    sku: generatedProduct.sku,
    weight: generatedProduct.weight,
    dimensions: parseDimensions(generatedProduct.dimensions),
    stock: generatedProduct.inStock ? 'in' : 'out',
    stockQuantity: generatedProduct.inStock ? (10 + ((id * 97) % 91)) : 0,
    rating,
    reviewCount: generatedProduct.reviewCount || 0,
    qualityScore,
    salesCount,

    // Furniture-specific — now varied
    room: mapCategoryToRoom(generatedProduct.category),
    furnitureCategory: generatedProduct.subcategory || generatedProduct.category.toLowerCase(),
    style,
    condition,
    materialPrimary: material,
    color,
    deliveryEligible: true,
    leadTimeDaysMin: leadMin,
    leadTimeDaysMax: leadMax,
    stockType: generatedProduct.inStock ? 'in_stock' : 'out_of_stock',
    isNew: (id % 8 === 0),        // ~12% of products marked new
    isTrending: (id % 11 === 0),  // ~9% marked trending

    brand: generatedProduct.brand,
    warranty: generatedProduct.warranty,
    features: generatedProduct.features || [],

    storeId: catalogStoreId,
    storeName,
    storeLocation: {
      lat: storeAddress.lat,
      lng: storeAddress.lng,
      suburb: storeAddress.suburb,
      city: storeAddress.city,
    },
  };
}

/**
 * Parse dimensions string to object
 */
function parseDimensions(dimensionsStr) {
  if (!dimensionsStr) return { w: 0, d: 0, h: 0 };
  
  // Try to extract dimensions from strings like: '89 3/4"W x 37 3/8"D x 32 5/8"H'
  const widthMatch = dimensionsStr.match(/([\d\s\/]+)"?\s*W/i);
  const depthMatch = dimensionsStr.match(/([\d\s\/]+)"?\s*D/i);
  const heightMatch = dimensionsStr.match(/([\d\s\/]+)"?\s*H/i);
  
  const parseInches = (str) => {
    if (!str) return 0;
    // Convert inches to cm (1 inch = 2.54 cm)
    const parts = str.trim().split(/\s+/);
    let total = 0;
    parts.forEach(part => {
      if (part.includes('/')) {
        const [num, den] = part.split('/').map(Number);
        total += num / den;
      } else {
        total += parseFloat(part) || 0;
      }
    });
    return Math.round(total * 2.54); // Convert to cm
  };
  
  return {
    w: parseInches(widthMatch?.[1]) || Math.floor(Math.random() * 200 + 50),
    d: parseInches(depthMatch?.[1]) || Math.floor(Math.random() * 100 + 30),
    h: parseInches(heightMatch?.[1]) || Math.floor(Math.random() * 100 + 50),
  };
}

/**
 * Map category to room
 */
function mapCategoryToRoom(category) {
  const mapping = {
    'Living Room': 'living',
    'Bedroom': 'bedroom',
    'Office': 'office',
    'Dining Room': 'dining',
  };
  return mapping[category] || 'living';
}

/**
 * Extract primary material from material string
 */
function extractMaterial(materialStr) {
  if (!materialStr) return 'wood';
  
  const materials = ['wood', 'metal', 'fabric', 'leather', 'glass', 'plastic'];
  const lower = materialStr.toLowerCase();
  
  for (const mat of materials) {
    if (lower.includes(mat)) {
      return mat;
    }
  }
  
  return 'wood'; // Default
}

// Eight real SA store locations — spread across different cities so proximity
// and hyperlocal features actually work with varied distances.
const SA_STORES = [
  { id: 'shopply-jhb-sandton',   name: 'Shopply Sandton',        suburb: 'Sandton',       city: 'Johannesburg', street: '1 Sandton Drive',          lat: -26.1076, lng: 28.0567, rating: 4.6, reviewCount: 214 },
  { id: 'shopply-ct-cbd',        name: 'Shopply Cape Town CBD',  suburb: 'City Bowl',     city: 'Cape Town',    street: '12 Long Street',           lat: -33.9249, lng: 18.4241, rating: 4.5, reviewCount: 178 },
  { id: 'shopply-ct-khayelitsha',name: 'Shopply Khayelitsha',    suburb: 'Khayelitsha',   city: 'Cape Town',    street: '5 Site B Road',             lat: -34.0386, lng: 18.6848, rating: 4.3, reviewCount: 92  },
  { id: 'shopply-dbn-north',     name: 'Shopply Durban North',   suburb: 'Durban North',  city: 'Durban',       street: '22 Kenneth Kaunda Rd',      lat: -29.7469, lng: 31.0218, rating: 4.4, reviewCount: 143 },
  { id: 'shopply-pta-arcadia',   name: 'Shopply Pretoria',       suburb: 'Arcadia',       city: 'Pretoria',     street: '88 Arcadia Street',         lat: -25.7479, lng: 28.2293, rating: 4.5, reviewCount: 106 },
  { id: 'shopply-jhb-soweto',    name: 'Shopply Soweto',         suburb: 'Soweto',        city: 'Johannesburg', street: '30 Vilakazi Street',        lat: -26.2673, lng: 27.8586, rating: 4.2, reviewCount: 67  },
  { id: 'shopply-pe-central',    name: 'Shopply Gqeberha',       suburb: 'Central',       city: 'Gqeberha',     street: '15 Main Street',            lat: -33.9608, lng: 25.6022, rating: 4.3, reviewCount: 88  },
  { id: 'shopply-jhb-midrand',   name: 'Shopply Midrand',        suburb: 'Midrand',       city: 'Johannesburg', street: '3 New Road, Midrand',       lat: -25.9968, lng: 28.1281, rating: 4.4, reviewCount: 119 },
];

/**
 * Main seeding function
 */
export async function seedNewFurniture() {
  try {
    console.log('\n🔄 ========================================');
    console.log('   CLEARING OLD DATA & SEEDING NEW');
    console.log('   (1000 Furniture Products)');
    console.log('========================================\n');

    // Step 0: Ensure default seller exists
    await SellerService.seedDefaultSeller();

    // Create all SA stores (skip any already created)
    const existingStores = getAllStores();
    const stores = [];
    for (const def of SA_STORES) {
      let store = existingStores.find(s => s.id === def.id);
      if (!store) {
        const h3Cells = generateH3Cells(def.lat, def.lng);
        store = createStore({
          id: def.id,
          sellerId: 1,
          name: def.name,
          description: `${def.name} — quality furniture for every home`,
          address: { street: def.street, suburb: def.suburb, city: def.city, lat: def.lat, lng: def.lng },
          rating: def.rating,
          reviewCount: def.reviewCount,
          isOpenNow: true,
          isActive: true,
          serviceScore: 0.80 + Math.random() * 0.15,
          deliveryRadiusKm: 15,
          ...h3Cells,
        });
      }
      stores.push(store);
    }
    console.log(`✅ ${stores.length} stores ready across South Africa\n`);

    // Step 1: Clear existing products
    console.log('🗑️  Clearing existing products...');
    ProductService.clearProducts();
    console.log('✅ Old products cleared\n');

    // Step 2: Generate new products
    console.log('🏗️  Generating 1000 new furniture products...');
    const generatedProducts = generateProducts();
    console.log(`✅ Generated ${generatedProducts.length} products\n`);

    // Step 3: Convert — distribute round-robin across all stores
    console.log('🔄 Converting to Product model format...');
    const productInstances = generatedProducts.map((p, i) => {
      const store = stores[i % stores.length];
      return convertToProductModel(p, store.id, store.name, store.address);
    });
    console.log(`✅ Converted ${productInstances.length} products across ${stores.length} stores\n`);

    // Step 4: Add to ProductService
    console.log('💾 Adding products to ProductService...');
    const count = ProductService.addProducts(productInstances);
    console.log(`✅ Successfully added ${count} products to ProductService\n`);

    // Step 5: Display statistics
    console.log('📊 SEEDING COMPLETE:');
    console.log(`   ✅ Total products: ${count}`);
    console.log(`   ✅ Stores: ${stores.length} across South Africa`);
    console.log(`   ✅ Brands: ${new Set(productInstances.map(p => p.brand).filter(Boolean)).size}`);
    console.log(`   ✅ In stock: ${productInstances.filter(p => p.stock === 'in').length}`);
    console.log(`   ✅ Products ready for use!\n`);

    console.log('========================================\n');

    return { success: true, count, products: productInstances };

  } catch (error) {
    console.error('❌ Error seeding new furniture:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Allow running as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNewFurniture()
    .then(() => {
      console.log('✅ Seeding complete - exiting');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedNewFurniture;

