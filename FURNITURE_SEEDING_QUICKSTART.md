# 🪑 Furniture Seeding - Quick Start Guide

Your database seeding scripts have been updated with new logic to generate 1000 realistic furniture products from real retailers (IKEA, West Elm, Wayfair).

## 📦 What's New

Three new seeding scripts in `/back-end/scripts/`:

1. **`generateProducts.js`** - Generates 1000 furniture products
2. **`imageDownloader.js`** - Downloads product images (utility)
3. **`seedFurniture1000.js`** - Main seeder orchestrator

## 🚀 Quick Start (3 Simple Steps)

### Step 1: Navigate to backend
```bash
cd back-end
```

### Step 2: Run the seeder
```bash
npm run seed:furniture
```

### Step 3: Check the output
- ✅ `products-final.json` will be created
- 📊 Statistics will be displayed
- 🎉 1000 products ready to use!

## 📊 What You Get

- **1000 products** from real retailers:
  - IKEA: 542 products
  - West Elm: 289 products
  - Wayfair: 169 products

- **Categories**:
  - Living Room (sofas, coffee tables, accent chairs)
  - Bedroom (beds, dressers)
  - Office (desks, chairs, bookcases)
  - Dining Room (tables, chairs)

- **Realistic Data**:
  - Price range: $49.99 - $2,549.99
  - Multiple colors and sizes
  - Ratings: 3.5-5.0 stars
  - Review counts: 50-3000
  - Detailed specifications

## 🎯 Common Use Cases

### Generate Products Only
```bash
npm run seed:generate
```
Creates `furniture-products-1000.json`

### Generate and Save
```bash
npm run seed:furniture
```
Creates `products-final.json`

### Custom Usage (Programmatic)
```javascript
import FurnitureDatabaseSeeder from './scripts/seedFurniture1000.js';

const seeder = new FurnitureDatabaseSeeder();
const products = seeder.generateAllProducts();

// Use products in your app
console.log(`Generated ${products.length} products`);
```

## 🗄️ Database Integration

### Option 1: MongoDB
Edit `scripts/seedFurniture1000.js`:
```javascript
seeder.runComplete({
  downloadImages: false,
  saveJSON: true,
  seedMongo: true,  // Enable
  mongoConnection: 'mongodb://localhost:27017/tsenga',
  seedPostgres: false,
});
```

### Option 2: PostgreSQL
First install pg:
```bash
npm install pg
```

Then edit `scripts/seedFurniture1000.js`:
```javascript
seeder.runComplete({
  downloadImages: false,
  saveJSON: true,
  seedMongo: false,
  seedPostgres: true,  // Enable
  postgresConfig: {
    user: 'your_username',
    host: 'localhost',
    database: 'tsenga',
    password: 'your_password',
    port: 5432
  }
});
```

## 🖼️ About Images

By default, images are **NOT downloaded** (placeholders used instead):
- ✅ **Fast** generation (< 10 seconds)
- ✅ **Reliable** (no network issues)
- ⚠️ You'll need to provide your own images

To enable image downloading:
```javascript
seeder.runComplete({
  downloadImages: true,  // Enable (slow, may fail)
  saveJSON: true,
  seedMongo: false,
  seedPostgres: false,
});
```

**Note**: Image downloads may fail due to CDN protections. We recommend using your own high-quality product images.

## 📁 Product Schema Example

```json
{
  "id": 1,
  "name": "KIVIK Sofa",
  "sku": "IKEA-1-ABC123",
  "category": "Living Room",
  "subcategory": "Sofas",
  "brand": "IKEA",
  "price": 949.00,
  "description": "Comfortable sofa with generous size...",
  "material": "Polyester fabric, pocket springs...",
  "dimensions": "89 3/4\"W x 37 3/8\"D x 32 5/8\"H",
  "color": "Gunnared Medium Gray",
  "weight": "67 lbs",
  "inStock": true,
  "imageUrl": "/images/products/1/main.jpg",
  "images": ["/images/products/1/main.jpg"],
  "warranty": "10 year limited warranty",
  "features": ["Removable cover", "Machine washable"],
  "tags": ["living room", "sofas", "ikea"],
  "rating": 4.5,
  "reviewCount": 1234,
  "retailerUrl": "https://ikea.com/products/kivik-sofa"
}
```

## 🎨 Example Scripts

Check out `/back-end/scripts/exampleUsage.js` for examples:
- Generate and save to JSON
- Programmatic product generation
- MongoDB seeding
- Custom filtering
- Express API integration

Run examples:
```bash
node scripts/exampleUsage.js
```

## 📚 Full Documentation

For detailed documentation, see:
- `/back-end/scripts/README_FURNITURE_SEEDING.md`

## 🔧 NPM Scripts Available

```bash
npm run seed:generate      # Generate 1000 products to JSON
npm run seed:furniture     # Run main furniture seeder
npm run seed:marketplace   # Run SA marketplace seeder (existing)
```

## 🚨 Troubleshooting

### "Cannot find module"
Make sure you're in the `/back-end` directory:
```bash
cd back-end
npm run seed:furniture
```

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check your connection string
- Or disable MongoDB in the script: `seedMongo: false`

### Generated file not found
Look in `/back-end/products-final.json`

## ✅ Next Steps

1. ✅ Run the seeder: `npm run seed:furniture`
2. ✅ Check the generated file: `products-final.json`
3. ✅ Review the product schema
4. ✅ Integrate with your existing API
5. ✅ Add your own product images
6. ✅ Test in your frontend

## 🎉 Success!

You now have 1000 realistic furniture products ready to use in your Tsenga application!

---

**Need Help?** Check the full README at `/back-end/scripts/README_FURNITURE_SEEDING.md`

