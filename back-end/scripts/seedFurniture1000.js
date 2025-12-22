// Main Furniture Database Seeder with Image Download
// Generates 1000 products and downloads all images locally

import { generateProducts } from './generateProducts.js';
import ImageDownloader from './imageDownloader.js';
import fs from 'fs';
import path from 'path';

class FurnitureDatabaseSeeder {
  constructor() {
    this.imageDownloader = new ImageDownloader('./public/images/products');
    this.products = [];
  }

  /**
   * Generate 1000 furniture products
   */
  generateAllProducts() {
    console.log('🏗️  Generating 1000 furniture products...\n');
    this.products = generateProducts();
    console.log(`✅ Generated ${this.products.length} products\n`);
    
    // Display statistics
    this.displayStatistics();
    
    return this.products;
  }

  /**
   * Download all product images
   */
  async downloadAllImages() {
    console.log('\n📥 Downloading product images...\n');
    console.log('⚠️  Note: This will download images for real products only.');
    console.log('   Generated variations will use placeholder paths.\n');
    
    // Filter products with real image URLs (from actual retailers)
    const productsWithRealImages = this.products.filter(p => 
      p.imageUrl && (
        p.imageUrl.includes('ikea.com') ||
        p.imageUrl.includes('weimgs.com') ||
        p.imageUrl.includes('wfcdn.com')
      )
    );
    
    console.log(`📊 ${productsWithRealImages.length} products have real images to download`);
    console.log(`📊 ${this.products.length - productsWithRealImages.length} products use generated placeholder paths\n`);
    
    // Download real images
    const updatedRealProducts = await this.imageDownloader.downloadAllProducts(productsWithRealImages);
    
    // Create a map for quick lookup
    const updatedMap = new Map(updatedRealProducts.map(p => [p.id, p]));
    
    // Update all products
    this.products = this.products.map(product => {
      if (updatedMap.has(product.id)) {
        return updatedMap.get(product.id);
      }
      // For generated products, use local placeholder paths
      return {
        ...product,
        imageUrl: `/images/products/${product.id}/main.jpg`,
        images: [`/images/products/${product.id}/main.jpg`]
      };
    });
    
    console.log('✅ Image processing complete!\n');
    
    return this.products;
  }

  /**
   * Seed MongoDB database
   */
  async seedMongoDB(connectionString = 'mongodb://localhost:27017/furniture_store') {
    try {
      console.log('\n🔌 Connecting to MongoDB...\n');
      
      // Dynamically import mongoose only when needed
      const mongoose = await import('mongoose');
      
      await mongoose.default.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      console.log('✅ Connected to MongoDB\n');

      // Define schema
      const productSchema = new mongoose.default.Schema({
        id: Number,
        name: String,
        sku: String,
        category: String,
        subcategory: String,
        brand: String,
        price: Number,
        salePrice: Number,
        originalPrice: Number,
        description: String,
        material: String,
        dimensions: String,
        color: String,
        weight: String,
        inStock: Boolean,
        imageUrl: String,
        images: [String],
        warranty: String,
        features: [String],
        tags: [String],
        rating: Number,
        reviewCount: Number,
        retailerUrl: String,
        originalImageUrl: String,
        originalImages: [String],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      });

      // Create indexes for better query performance
      productSchema.index({ category: 1, subcategory: 1 });
      productSchema.index({ brand: 1 });
      productSchema.index({ price: 1 });
      productSchema.index({ tags: 1 });
      productSchema.index({ name: 'text', description: 'text' });

      const Product = mongoose.default.model('Product', productSchema);

      // Clear existing products
      console.log('🗑️  Clearing existing products...\n');
      await Product.deleteMany({});

      // Insert new products in batches
      console.log('💾 Inserting products into database...\n');
      const batchSize = 100;
      for (let i = 0; i < this.products.length; i += batchSize) {
        const batch = this.products.slice(i, i + batchSize);
        await Product.insertMany(batch);
        console.log(`   Inserted ${Math.min(i + batchSize, this.products.length)}/${this.products.length} products`);
      }

      console.log('\n✅ Database seeded successfully!\n');
      
      // Verify
      const count = await Product.countDocuments();
      console.log(`📊 Total products in database: ${count}\n`);

      const mongooseModule = await import('mongoose');
      await mongooseModule.default.connection.close();
      console.log('🔌 MongoDB connection closed\n');

    } catch (error) {
      console.error('❌ Error seeding MongoDB:', error);
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        console.error('💡 Tip: Install mongoose with: npm install mongoose');
      }
      throw error;
    }
  }

  /**
   * Seed PostgreSQL database
   */
  async seedPostgreSQL(config = {
    user: 'your_username',
    host: 'localhost',
    database: 'furniture_store',
    password: 'your_password',
    port: 5432
  }) {
    const pg = await import('pg');
    const { Pool } = pg.default;
    const pool = new Pool(config);

    try {
      console.log('\n🔌 Connecting to PostgreSQL...\n');

      // Create table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          product_id INTEGER UNIQUE,
          name VARCHAR(500),
          sku VARCHAR(100),
          category VARCHAR(100),
          subcategory VARCHAR(100),
          brand VARCHAR(100),
          price DECIMAL(10, 2),
          sale_price DECIMAL(10, 2),
          original_price DECIMAL(10, 2),
          description TEXT,
          material VARCHAR(500),
          dimensions VARCHAR(200),
          color VARCHAR(100),
          weight VARCHAR(50),
          in_stock BOOLEAN,
          image_url TEXT,
          images TEXT[],
          warranty VARCHAR(200),
          features TEXT[],
          tags TEXT[],
          rating DECIMAL(2, 1),
          review_count INTEGER,
          retailer_url TEXT,
          original_image_url TEXT,
          original_images TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_category ON products(category, subcategory);
        CREATE INDEX IF NOT EXISTS idx_brand ON products(brand);
        CREATE INDEX IF NOT EXISTS idx_price ON products(price);
        CREATE INDEX IF NOT EXISTS idx_tags ON products USING GIN(tags);
      `);

      console.log('✅ Table created/verified\n');

      // Clear existing data
      console.log('🗑️  Clearing existing products...\n');
      await pool.query('DELETE FROM products');

      // Insert products
      console.log('💾 Inserting products into database...\n');
      
      for (let i = 0; i < this.products.length; i++) {
        const p = this.products[i];
        
        await pool.query(`
          INSERT INTO products (
            product_id, name, sku, category, subcategory, brand, price, description,
            material, dimensions, color, weight, in_stock, image_url, images,
            warranty, features, tags, rating, review_count, retailer_url,
            original_image_url, original_images
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        `, [
          p.id, p.name, p.sku, p.category, p.subcategory, p.brand, p.price,
          p.description, p.material, p.dimensions, p.color, p.weight, p.inStock,
          p.imageUrl, p.images, p.warranty, p.features, p.tags, p.rating,
          p.reviewCount, p.retailerUrl, p.originalImageUrl, p.originalImages
        ]);

        if ((i + 1) % 100 === 0) {
          console.log(`   Inserted ${i + 1}/${this.products.length} products`);
        }
      }

      console.log('\n✅ Database seeded successfully!\n');

      // Verify
      const result = await pool.query('SELECT COUNT(*) FROM products');
      console.log(`📊 Total products in database: ${result.rows[0].count}\n`);

      await pool.end();
      console.log('🔌 PostgreSQL connection closed\n');

    } catch (error) {
      console.error('❌ Error seeding PostgreSQL:', error);
      await pool.end();
      throw error;
    }
  }

  /**
   * Save products to JSON file
   */
  saveToJSON(filename = 'products-final.json') {
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, JSON.stringify(this.products, null, 2));
    console.log(`💾 Saved products to: ${filepath}\n`);
    return filepath;
  }

  /**
   * Display statistics
   */
  displayStatistics() {
    const stats = {
      total: this.products.length,
      byCategory: {},
      byBrand: {},
      priceRange: {
        min: Math.min(...this.products.map(p => p.price)),
        max: Math.max(...this.products.map(p => p.price)),
        avg: this.products.reduce((sum, p) => sum + p.price, 0) / this.products.length
      },
      inStock: this.products.filter(p => p.inStock).length,
      avgRating: this.products.reduce((sum, p) => sum + p.rating, 0) / this.products.length
    };

    this.products.forEach(p => {
      stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
      stats.byBrand[p.brand] = (stats.byBrand[p.brand] || 0) + 1;
    });

    console.log('📊 STATISTICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Products: ${stats.total}`);
    console.log(`In Stock: ${stats.inStock} (${(stats.inStock / stats.total * 100).toFixed(1)}%)`);
    console.log(`\nPrice Range:`);
    console.log(`  Min: $${stats.priceRange.min.toFixed(2)}`);
    console.log(`  Max: $${stats.priceRange.max.toFixed(2)}`);
    console.log(`  Avg: $${stats.priceRange.avg.toFixed(2)}`);
    console.log(`\nAverage Rating: ${stats.avgRating.toFixed(1)} / 5.0`);
    
    console.log(`\nBy Category:`);
    Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });

    console.log(`\nBy Brand:`);
    Object.entries(stats.byBrand)
      .sort((a, b) => b[1] - a[1])
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count}`);
      });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Run complete seeding process
   */
  async runComplete(options = {}) {
    const {
      downloadImages = true,
      saveJSON = true,
      seedMongo = false,
      seedPostgres = false,
      mongoConnection = 'mongodb://localhost:27017/furniture_store',
      postgresConfig = null
    } = options;

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║     Furniture Database Seeder - Complete Setup      ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    try {
      // Step 1: Generate products
      this.generateAllProducts();

      // Step 2: Download images (optional)
      if (downloadImages) {
        await this.downloadAllImages();
      }

      // Step 3: Save to JSON (optional)
      if (saveJSON) {
        this.saveToJSON();
      }

      // Step 4: Seed MongoDB (optional)
      if (seedMongo) {
        await this.seedMongoDB(mongoConnection);
      }

      // Step 5: Seed PostgreSQL (optional)
      if (seedPostgres && postgresConfig) {
        await this.seedPostgreSQL(postgresConfig);
      }

      console.log('✅ ALL DONE!\n');
      console.log('📁 Your images are in: ./public/images/products/');
      console.log('📄 Your JSON file is in: ./products-final.json\n');

    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }
}

export default FurnitureDatabaseSeeder;

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new FurnitureDatabaseSeeder();
  
  // Run with options
  seeder.runComplete({
    downloadImages: false,  // Set to true to download real images
    saveJSON: true,
    seedMongo: false,      // Set to true to seed MongoDB
    seedPostgres: false,   // Set to true to seed PostgreSQL
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

