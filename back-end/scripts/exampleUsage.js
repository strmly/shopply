// Example Usage of Furniture Database Seeder
// This file demonstrates different ways to use the seeder

import FurnitureDatabaseSeeder from './seedFurniture1000.js';

// ============================================
// Example 1: Generate and Save to JSON Only
// ============================================
async function example1_JsonOnly() {
  console.log('\n📝 EXAMPLE 1: Generate and save to JSON only\n');
  
  const seeder = new FurnitureDatabaseSeeder();
  
  await seeder.runComplete({
    downloadImages: false,
    saveJSON: true,
    seedMongo: false,
    seedPostgres: false
  });
  
  console.log('✅ Example 1 complete!\n');
}

// ============================================
// Example 2: Generate Products Programmatically
// ============================================
async function example2_Programmatic() {
  console.log('\n📝 EXAMPLE 2: Generate products programmatically\n');
  
  const seeder = new FurnitureDatabaseSeeder();
  
  // Generate products
  const products = seeder.generateAllProducts();
  
  // Access the products array
  console.log(`Generated ${products.length} products`);
  console.log('\nFirst 3 products:');
  products.slice(0, 3).forEach(p => {
    console.log(`  - ${p.name} (${p.brand}) - $${p.price}`);
  });
  
  // Filter products by category
  const sofas = products.filter(p => p.subcategory === 'Sofas');
  console.log(`\nFound ${sofas.length} sofas`);
  
  // Save to custom location
  seeder.saveToJSON('custom-products.json');
  
  console.log('\n✅ Example 2 complete!\n');
}

// ============================================
// Example 3: Seed MongoDB (requires MongoDB running)
// ============================================
async function example3_MongoDB() {
  console.log('\n📝 EXAMPLE 3: Seed MongoDB\n');
  console.log('⚠️  Make sure MongoDB is running first!\n');
  
  const seeder = new FurnitureDatabaseSeeder();
  
  try {
    await seeder.runComplete({
      downloadImages: false,
      saveJSON: true,
      seedMongo: true,
      mongoConnection: 'mongodb://localhost:27017/tsenga_furniture',
      seedPostgres: false
    });
    
    console.log('✅ Example 3 complete!\n');
  } catch (error) {
    console.error('❌ MongoDB seeding failed. Is MongoDB running?');
    console.error('   Error:', error.message);
  }
}

// ============================================
// Example 4: Download Images (slow, may fail)
// ============================================
async function example4_WithImages() {
  console.log('\n📝 EXAMPLE 4: Generate with image download\n');
  console.log('⚠️  This may take 5-10 minutes and some downloads may fail\n');
  
  const seeder = new FurnitureDatabaseSeeder();
  
  await seeder.runComplete({
    downloadImages: true,  // Enable image download
    saveJSON: true,
    seedMongo: false,
    seedPostgres: false
  });
  
  console.log('✅ Example 4 complete!\n');
}

// ============================================
// Example 5: Custom Product Filtering
// ============================================
async function example5_CustomFiltering() {
  console.log('\n📝 EXAMPLE 5: Custom product filtering\n');
  
  const seeder = new FurnitureDatabaseSeeder();
  const allProducts = seeder.generateAllProducts();
  
  // Filter by price range
  const affordableProducts = allProducts.filter(p => p.price < 300);
  console.log(`Products under $300: ${affordableProducts.length}`);
  
  // Filter by brand
  const ikeaProducts = allProducts.filter(p => p.brand === 'IKEA');
  console.log(`IKEA products: ${ikeaProducts.length}`);
  
  // Filter by category and in-stock
  const availableBedroom = allProducts.filter(p => 
    p.category === 'Bedroom' && p.inStock
  );
  console.log(`Available bedroom furniture: ${availableBedroom.length}`);
  
  // High-rated products
  const highRated = allProducts.filter(p => p.rating >= 4.5);
  console.log(`Products rated 4.5+: ${highRated.length}`);
  
  // Save filtered products
  seeder.products = affordableProducts;
  seeder.saveToJSON('affordable-products.json');
  
  console.log('\n✅ Example 5 complete!\n');
}

// ============================================
// Example 6: Integration with Express API
// ============================================
async function example6_ExpressIntegration() {
  console.log('\n📝 EXAMPLE 6: Integration with Express API\n');
  
  const seeder = new FurnitureDatabaseSeeder();
  const products = seeder.generateAllProducts();
  
  // Simulate Express route handler
  const getProducts = (req, res) => {
    const { category, minPrice, maxPrice, brand } = req.query;
    
    let filtered = products;
    
    if (category) {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    if (brand) {
      filtered = filtered.filter(p => 
        p.brand.toLowerCase() === brand.toLowerCase()
      );
    }
    
    return filtered;
  };
  
  // Test the filter
  const mockReq = {
    query: {
      category: 'Living Room',
      minPrice: '500',
      maxPrice: '1500',
      brand: 'West Elm'
    }
  };
  
  const results = getProducts(mockReq, null);
  console.log(`Filtered products: ${results.length}`);
  console.log('\nSample results:');
  results.slice(0, 3).forEach(p => {
    console.log(`  - ${p.name} - $${p.price}`);
  });
  
  console.log('\n✅ Example 6 complete!\n');
}

// ============================================
// Run Examples
// ============================================
async function runExamples() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Furniture Seeder - Example Usage     ║');
  console.log('╚════════════════════════════════════════╝');
  
  // Uncomment the example you want to run:
  
  await example1_JsonOnly();           // ✅ Safe, fast
  // await example2_Programmatic();       // ✅ Safe, fast
  // await example3_MongoDB();            // ⚠️  Requires MongoDB
  // await example4_WithImages();         // ⚠️  Slow, may fail
  // await example5_CustomFiltering();    // ✅ Safe, fast
  // await example6_ExpressIntegration(); // ✅ Safe, fast
  
  console.log('🎉 All done!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

export {
  example1_JsonOnly,
  example2_Programmatic,
  example3_MongoDB,
  example4_WithImages,
  example5_CustomFiltering,
  example6_ExpressIntegration
};

