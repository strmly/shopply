import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { appConfig } from './config/app.js';
import { logger, errorHandler, notFound } from './middleware/index.js';
import apiRoutes from './routes/index.js';
import { seedFurnitureMarketplace } from './scripts/seedFurnitureMarketplace.js';
import CommunityService from './services/CommunityService.js';
import { SellerService } from './services/SellerService.js';
import { ProductService } from './services/ProductService.js';
import redisClient from './config/redis.js';

// Get root directory (two levels up from back-end/server.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env from root directory
dotenv.config({ path: path.join(rootDir, '.env') });

const app = express();
const PORT = appConfig.port;

// Middleware
app.use(cors(appConfig.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Seed new furniture products on startup (1000 furniture items from IKEA, West Elm, Wayfair)
import { seedNewFurniture } from './scripts/seedNewFurniture.js';
import { seedFlashDeals } from './scripts/seedFlashDeals.js';
import { seedBundles } from './scripts/seedBundles.js';
seedNewFurniture()
  .then(() => Promise.all([seedFlashDeals(), seedBundles()]))
  .catch(err => {
    console.error('Failed to seed products:', err);
  });

// OLD SEED: Commented out - using new furniture seeder instead
// seedFurnitureMarketplace().catch(err => {
//   console.error('Failed to seed furniture marketplace:', err);
// });

// OLD SEED: Commented out to use furniture products only
// seedProducts().catch(err => {
//   console.error('Failed to seed products:', err);
// });

// Seed default seller on startup
SellerService.seedDefaultSeller().catch(err => {
  console.error('Failed to seed default seller:', err);
});

// Seed community data on startup
CommunityService.seedInitialData();

// Initialize Redis for WhatsApp sessions
redisClient.connect().then(() => {
  console.log('✅ WhatsApp session store ready');
}).catch(err => {
  console.warn('⚠️ Redis unavailable, using in-memory session store');
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Shopply API',
    version: appConfig.apiVersion,
    environment: appConfig.env,
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to check ProductService status
app.get('/api/debug/products', (req, res) => {
  res.json({
    success: true,
    productCount: ProductService.products.length,
    nextId: ProductService.nextId,
    sampleProducts: ProductService.products.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      room: p.room,
      category: p.category,
    })),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${appConfig.env}`);
});
