import SARetailerSeedingService from '../services/SARetailerSeedingService.js';
import { initializeFurnitureStores } from '../controllers/FurnitureController.js';

/**
 * Seed Furniture Marketplace with SOUTH AFRICAN RETAILER products
 * Products from: Game, Makro, Builders Warehouse, OK Furniture, Lewis, @home, Rochester, Life Home
 * 
 * Features:
 * - Real SA retailer product titles and descriptions
 * - Realistic South African pricing (ZAR)
 * - Multiple high-quality images per product (4 per product)
 * - Proper SA furniture specifications and dimensions
 * - Retailer-specific product styles and naming
 * - Real SA store locations across major cities
 * - 1000-10000 products depending on configuration
 */

export async function seedFurnitureMarketplace() {
  try {
    console.log('\n🇿🇦 ========================================');
    console.log('   SEEDING SA RETAILER PRODUCTS');
    console.log('   (Game, Makro, Builders, OK, Lewis, etc.)');
    console.log('========================================\n');
    
    const seedingService = new SARetailerSeedingService();
    
    // Seed marketplace with SA retailer products
    // Creates stores for each retailer in each region
    const { stores, products } = await seedingService.seedSAMarketplace({
      targetProductCount: 1000,  // 1000 products (can increase to 10000)
      regions: ['johannesburg', 'pretoria', 'capeTown', 'durban', 'gqeberha'],
    });

    console.log('\n📊 SEEDING COMPLETE:');
    console.log(`   ✅ Stores created: ${stores.length}`);
    console.log(`   ✅ Products created: ${products.length}`);
    console.log(`   ✅ Real SA retailer data with exact image matching`);
    console.log(`   ✅ Products ready for display\n`);

    // Initialize furniture stores in controller
    initializeFurnitureStores(stores, products);
    console.log(`✅ Furniture controller initialized\n`);

    console.log('✅ All done! SA retailer products available via /api/products');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error seeding SA retailer marketplace:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Allow running as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFurnitureMarketplace()
    .then(() => {
      console.log('✅ Seeding complete - exiting');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedFurnitureMarketplace;
