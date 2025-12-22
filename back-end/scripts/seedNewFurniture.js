// Seed new furniture products from generateProducts.js
// Clears old data and seeds with 1000 new products

import { generateProducts } from './generateProducts.js';
import { ProductService } from '../services/ProductService.js';
import { Product } from '../models/Product.js';

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
function convertToProductModel(generatedProduct) {
  // Get real images that match the product subcategory
  const realImages = getRealImages(generatedProduct.subcategory, generatedProduct.id);
  const mainImage = realImages[0];
  
  // Map the generated product format to Product model format
  return {
    id: generatedProduct.id,
    name: generatedProduct.name,
    description: generatedProduct.description || '',
    price: generatedProduct.price,
    originalPrice: generatedProduct.price * 1.1, // Add 10% original price for discount calculation
    image: mainImage,
    images: realImages,
    category: 'furniture',
    subcategory: generatedProduct.subcategory || generatedProduct.category,
    tags: generatedProduct.tags || [],
    sku: generatedProduct.sku,
    weight: generatedProduct.weight,
    dimensions: parseDimensions(generatedProduct.dimensions),
    stock: generatedProduct.inStock ? 'in' : 'out',
    stockQuantity: generatedProduct.inStock ? Math.floor(Math.random() * 50 + 10) : 0,
    rating: generatedProduct.rating || 4.0,
    reviewCount: generatedProduct.reviewCount || 0,
    
    // Furniture-specific fields
    room: mapCategoryToRoom(generatedProduct.category),
    furnitureCategory: generatedProduct.subcategory || generatedProduct.category.toLowerCase(),
    style: 'modern', // Default style
    condition: 'new',
    materialPrimary: extractMaterial(generatedProduct.material),
    color: generatedProduct.color || 'Various',
    deliveryEligible: true,
    leadTimeDaysMin: 0,
    leadTimeDaysMax: 7,
    stockType: generatedProduct.inStock ? 'in_stock' : 'out_of_stock',
    
    // Additional metadata
    brand: generatedProduct.brand,
    warranty: generatedProduct.warranty,
    features: generatedProduct.features || [],
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

/**
 * Main seeding function
 */
export async function seedNewFurniture() {
  try {
    console.log('\n🔄 ========================================');
    console.log('   CLEARING OLD DATA & SEEDING NEW');
    console.log('   (1000 Furniture Products)');
    console.log('========================================\n');
    
    // Step 1: Clear existing products
    console.log('🗑️  Clearing existing products...');
    ProductService.clearProducts();
    console.log('✅ Old products cleared\n');
    
    // Step 2: Generate new products
    console.log('🏗️  Generating 1000 new furniture products...');
    const generatedProducts = generateProducts();
    console.log(`✅ Generated ${generatedProducts.length} products\n`);
    
    // Step 3: Convert to Product model format
    console.log('🔄 Converting to Product model format...');
    const productInstances = generatedProducts.map(convertToProductModel);
    console.log(`✅ Converted ${productInstances.length} products\n`);
    
    // Step 4: Add to ProductService
    console.log('💾 Adding products to ProductService...');
    const count = ProductService.addProducts(productInstances);
    console.log(`✅ Successfully added ${count} products to ProductService\n`);
    
    // Step 5: Display statistics
    console.log('📊 SEEDING COMPLETE:');
    console.log(`   ✅ Total products: ${count}`);
    console.log(`   ✅ Categories: ${new Set(productInstances.map(p => p.category)).size}`);
    console.log(`   ✅ Brands: ${new Set(productInstances.map(p => p.brand).filter(Boolean)).size}`);
    console.log(`   ✅ In stock: ${productInstances.filter(p => p.stock === 'in').length}`);
    console.log(`   ✅ Products ready for use!\n`);
    
    console.log('========================================\n');
    
    return {
      success: true,
      count,
      products: productInstances
    };
    
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

