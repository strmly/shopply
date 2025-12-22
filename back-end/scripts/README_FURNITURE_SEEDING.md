# Furniture Database Seeding Scripts

This directory contains scripts to generate and seed 1000 realistic furniture products from real retailers (IKEA, West Elm, Wayfair) into your database.

## 📁 Files Overview

### 1. `generateProducts.js`
Generates 1000 furniture products with realistic data from major retailers:
- **IKEA**: 10 base products (KIVIK Sofa, EKTORP Sofa, HEMNES Dresser, MALM Bed, etc.)
- **West Elm**: 4 base products (Mid-Century Coffee Table, Andes Sectional, etc.)
- **Wayfair**: 3 base products (Corduroy Sectional, Velvet Accent Chair, etc.)

Each base product includes:
- Multiple color variations
- Multiple size options
- Realistic pricing ($49.99 - $2,499)
- Detailed specifications (materials, dimensions, warranty)
- Features and tags
- Ratings and review counts
- Image URLs

### 2. `imageDownloader.js`
Utility class for downloading product images from URLs:
- Downloads images from retailer websites
- Organizes images by product ID
- Handles multiple images per product
- Includes error handling and retry logic
- Creates local image directories automatically

### 3. `seedFurniture1000.js`
Main seeder that orchestrates the entire process:
- Generates 1000 products
- Downloads images (optional)
- Saves to JSON file
- Seeds MongoDB (optional)
- Seeds PostgreSQL (optional)
- Displays comprehensive statistics

## 🚀 Quick Start

### Option 1: Generate Products Only (No Database)

```bash
cd back-end/scripts
node generateProducts.js
```

This will:
- ✅ Generate 1000 products
- 💾 Save to `furniture-products-1000.json`
- 📊 Display category statistics

### Option 2: Generate + Save to JSON

```bash
node seedFurniture1000.js
```

Default behavior:
- ✅ Generate 1000 products
- 💾 Save to `products-final.json`
- ⚠️ Images NOT downloaded (placeholder paths used)
- ⚠️ Database NOT seeded

### Option 3: Full Setup (with Images)

Edit `seedFurniture1000.js` and modify the options:

```javascript
seeder.runComplete({
  downloadImages: true,   // ⚠️ Set to true to download real images
  saveJSON: true,
  seedMongo: false,
  seedPostgres: false,
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

Then run:
```bash
node seedFurniture1000.js
```

### Option 4: Seed MongoDB

```javascript
seeder.runComplete({
  downloadImages: false,
  saveJSON: true,
  seedMongo: true,                                          // Enable MongoDB
  mongoConnection: 'mongodb://localhost:27017/shopply',     // Your connection string
  seedPostgres: false,
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

### Option 5: Seed PostgreSQL

First, install `pg` package:
```bash
npm install pg
```

Then configure and run:
```javascript
seeder.runComplete({
  downloadImages: false,
  saveJSON: true,
  seedMongo: false,
  seedPostgres: true,
  postgresConfig: {
    user: 'your_username',
    host: 'localhost',
    database: 'shopply',
    password: 'your_password',
    port: 5432
  }
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
```

## 📊 Product Statistics

When you run the seeder, you'll see statistics like:

```
📊 STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Products: 1000
In Stock: 898 (89.8%)

Price Range:
  Min: $24.99
  Max: $2549.99
  Avg: $457.23

Average Rating: 4.3 / 5.0

By Category:
  Living Room: 387
  Bedroom: 245
  Office: 198
  Dining Room: 170

By Brand:
  IKEA: 542
  West Elm: 289
  Wayfair: 169
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🗂️ Product Schema

Each generated product includes:

```javascript
{
  id: 1,
  name: "KIVIK Sofa",
  sku: "IKEA-1-ABC123",
  category: "Living Room",
  subcategory: "Sofas",
  brand: "IKEA",
  price: 949.00,
  description: "Comfortable sofa with generous size...",
  material: "Polyester fabric, pocket springs...",
  dimensions: '89 3/4"W x 37 3/8"D x 32 5/8"H',
  color: "Gunnared Medium Gray",
  weight: "67 lbs",
  inStock: true,
  imageUrl: "/images/products/1/main.jpg",
  images: ["/images/products/1/main.jpg", "/images/products/1/image-1.jpg"],
  warranty: "10 year limited warranty",
  features: ["Removable cover", "Machine washable", "Pocket springs"],
  tags: ["living room", "sofas", "gunnared", "ikea"],
  rating: 4.5,
  reviewCount: 1234,
  retailerUrl: "https://ikea.com/products/kivik-sofa"
}
```

## 🖼️ Image Handling

### Without Image Download (Default)
- Products use placeholder paths: `/images/products/{id}/main.jpg`
- You'll need to provide your own images or use placeholders
- Fast generation (< 10 seconds)

### With Image Download
- Downloads actual images from retailer websites
- Saves to `./public/images/products/{productId}/`
- Slower (5-10 minutes depending on network)
- May fail for some images due to:
  - CORS restrictions
  - Rate limiting
  - Image URL changes

**Note**: Image downloading is disabled by default because retailer image URLs may not work due to CDN protections.

## 🗄️ Database Options

### MongoDB Schema
The seeder creates a MongoDB schema with:
- Indexes on: category, subcategory, brand, price, tags
- Full-text search index on: name, description
- Automatic timestamps (createdAt, updatedAt)

### PostgreSQL Schema
The seeder creates a PostgreSQL table with:
- Indexes on: category, subcategory, brand, price
- GIN index on tags array
- Automatic timestamps

## 🎯 Use Cases

### 1. Development/Testing
```bash
node generateProducts.js
```
Quick generation for testing the app with realistic data.

### 2. Production Seeding
```javascript
seeder.runComplete({
  downloadImages: false,  // Use your own images
  saveJSON: true,
  seedMongo: true,
  mongoConnection: process.env.MONGODB_URI
});
```

### 3. Data Export
```javascript
seeder.runComplete({
  downloadImages: false,
  saveJSON: true,
  seedMongo: false,
  seedPostgres: false
});
```
Generates `products-final.json` for import into any system.

## 🔧 Customization

### Change Product Count
Edit `generateProducts.js`:
```javascript
// Fill remaining slots up to 1000
while (products.length < 1000) {  // Change 1000 to your desired count
  // ...
}
```

### Add More Base Products
Edit `generateProducts.js` and add to `baseProducts` object:
```javascript
const baseProducts = {
  ikea: [...],
  westElm: [...],
  wayfair: [...],
  yourRetailer: [  // Add new retailer
    {
      name: "Your Product",
      category: "Living Room",
      // ... other fields
    }
  ]
};
```

### Change Image Output Directory
Edit `seedFurniture1000.js`:
```javascript
constructor() {
  this.imageDownloader = new ImageDownloader('./your/custom/path');
  this.products = [];
}
```

## 📝 Notes

1. **Image URLs**: The generated image URLs are examples. Real retailer CDNs may block downloads.
2. **Price Variations**: Each product variant has ±$50 random price variation for realism.
3. **Stock Status**: 85-90% of products are marked as "in stock".
4. **Ratings**: Random ratings between 3.5 and 5.0 stars.
5. **Review Counts**: Random between 50 and 3000 reviews.

## 🚨 Troubleshooting

### "Module not found: mongoose"
```bash
npm install mongoose
```

### "Module not found: pg"
```bash
npm install pg
```

### Image download fails
- Set `downloadImages: false` in options
- Use placeholder images instead
- Provide your own product images

### Database connection fails
- Check your connection string
- Ensure database is running
- Verify credentials

## 📦 Dependencies

Required:
- Node.js (built-in modules: `fs`, `path`, `http`, `https`)

Optional:
- `mongoose` (for MongoDB seeding)
- `pg` (for PostgreSQL seeding)

## 📄 Output Files

After running, you'll have:
- `furniture-products-1000.json` (from generateProducts.js)
- `products-final.json` (from seedFurniture1000.js)
- `./public/images/products/` (if downloadImages is enabled)

## ✅ Next Steps

After seeding:
1. Verify products in your database
2. Test product endpoints in your API
3. Update frontend to display products
4. Add your own high-quality product images
5. Configure search and filtering

## 🤝 Integration

To use these products in your existing Shopply app:

1. Update your Product model to match the schema
2. Modify `seedFurniture1000.js` to use your existing database connection
3. Run the seeder
4. Update your controllers to serve the new products

Example:
```javascript
// In your existing server setup
const FurnitureDatabaseSeeder = require('./scripts/seedFurniture1000');
const seeder = new FurnitureDatabaseSeeder();

seeder.runComplete({
  downloadImages: false,
  saveJSON: false,
  seedMongo: true,
  mongoConnection: process.env.MONGODB_URI
}).then(() => {
  console.log('✅ Database seeded!');
}).catch(err => {
  console.error('❌ Seeding failed:', err);
});
```

## 📚 Additional Resources

- IKEA Product Data: https://www.ikea.com
- West Elm Products: https://www.westelm.com
- Wayfair Products: https://www.wayfair.com

---

**Happy Seeding! 🌱**

