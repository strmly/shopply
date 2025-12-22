# Shopply Hyperlocal System Implementation

## Overview

This document describes the complete hyperlocal system implementation for Shopply, using Uber H3 geospatial indexing to provide truly local product discovery with automatic radius expansion.

---

## 🎯 Core Features Implemented

### Backend Features

1. **H3 Geospatial Indexing** - Multi-resolution H3 cells (R3-R10) for all stores
2. **Uber-Style Radius Expansion** - Automatic expansion from 1km → 5km → 10km → 35km → 110km
3. **Quality Scoring System** - Seller, product, and store quality scores for ranking
4. **Hyperlocal Search** - Distance-aware search with automatic expansion
5. **Inventory Tracking** - Real-time stock management with locality awareness
6. **Ranking Algorithm** - Combines locality, quality, availability, and freshness
7. **API Endpoints** - RESTful APIs for feed, search, inventory, and tiers

### Frontend Features

1. **Location Selector** - User location with manual/auto radius control
2. **Distance Badges** - Visual distance indicators on all products
3. **Why This** Badges - Explanation for why products are shown
4. **Expansion Banner** - Uber-style "searching → expanding" messaging
5. **Hyperlocal Product Cards** - Enhanced cards with locality data
6. **Hyperlocal Home Feed** - Multiple discovery modules (Top Near You, Best Sellers, etc.)
7. **Hyperlocal Search** - Auto-expanding search with filters
8. **Seller Product Upload** - Locality-aware product creation with visibility tips

---

## 📁 File Structure

### Backend (`/back-end`)

```
├── utils/
│   └── h3Utils.js                 # H3 utility functions, tier definitions
├── models/
│   ├── Store.js                   # Updated with H3 fields
│   ├── Product.js                 # Updated with quality scores
│   ├── Seller.js                  # Updated with quality metrics
│   └── Inventory.js               # NEW: Inventory tracking model
├── services/
│   ├── QualityService.js          # NEW: Quality scoring calculations
│   ├── H3IndexingService.js       # NEW: H3 indexing for stores/products
│   ├── HyperlocalSearchService.js # NEW: Search with radius expansion
│   ├── InventoryService.js        # NEW: Inventory management
│   └── StoreService.js            # NEW: Store CRUD with H3
├── controllers/
│   ├── HyperlocalController.js    # NEW: Hyperlocal endpoints
│   └── InventoryController.js     # NEW: Inventory endpoints
└── routes/
    ├── hyperlocalRoutes.js        # NEW: /api/hyperlocal routes
    ├── inventoryRoutes.js         # NEW: /api/inventory routes
    └── index.js                   # Updated to include new routes
```

### Frontend (`/front-end/src`)

```
├── components/hyperlocal/         # NEW: Hyperlocal components
│   ├── LocationSelector.jsx       # Location + radius control
│   ├── DistanceBadge.jsx         # Distance indicator
│   ├── WhyThisBadges.jsx         # Reason badges
│   ├── ExpansionBanner.jsx       # Search expansion messaging
│   ├── HyperlocalProductCard.jsx # Enhanced product card
│   ├── HyperlocalHomePage.jsx    # Hyperlocal home screen
│   ├── HyperlocalSearchPage.jsx  # Hyperlocal search screen
│   └── index.js                  # Exports
├── components/seller/
│   └── SellerProductUploadHyperlocal.jsx  # NEW: Enhanced product upload
└── utils/
    └── hyperlocalApi.js          # NEW: API client functions
```

---

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
```bash
cd back-end
npm install h3-js
```

2. **Start Backend Server**
```bash
npm run dev
```

The backend will be available at `http://localhost:3001`

### Frontend Setup

1. **No Additional Dependencies Needed**
   All frontend components use existing dependencies (React, styled-components)

2. **Environment Variables** (optional)
Create `.env` in `front-end/`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

3. **Start Frontend**
```bash
cd front-end
npm run dev
```

---

## 📡 API Endpoints

### Hyperlocal Endpoints

#### GET `/api/hyperlocal/feed/home`
Get hyperlocal home feed with discovery modules

**Query Parameters:**
- `lat` (required) - User latitude
- `lng` (required) - User longitude
- `tier_index` (optional, default: 0) - Radius tier (0=Auto, 1-4=specific)

**Response:**
```json
{
  "success": true,
  "data": {
    "modules": {
      "topNearYou": [...],
      "bestSellersNearby": [...],
      "topRatedSellers": [...],
      "freshRestocks": [...],
      "flashDeals": [...],
      "newArrivals": [...]
    },
    "tier": "T0",
    "tierLabel": "Within 1km",
    "radiusKm": 1,
    "totalProducts": 42
  }
}
```

#### GET `/api/hyperlocal/search`
Search with automatic radius expansion

**Query Parameters:**
- `q` - Search query
- `lat` (required) - User latitude
- `lng` (required) - User longitude
- `category` (optional) - Filter by category
- `min_results` (optional, default: 50) - Minimum results before stopping expansion
- `max_tier` (optional, default: 4) - Maximum tier to expand to
- `in_stock_only` (optional) - Only show in-stock products
- `min_rating` (optional) - Minimum product rating
- `min_price` (optional) - Minimum price
- `max_price` (optional) - Maximum price
- `open_now` (optional) - Only show open stores

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [...],
    "effectiveTier": "T1",
    "effectiveRadiusKm": 5,
    "tierLabel": "Within 5km",
    "expanded": true,
    "expansionSteps": [
      { "tier": "T0", "label": "Within 1km", "radiusKm": 1, "resultsFound": 12 },
      { "tier": "T1", "label": "Within 5km", "radiusKm": 5, "resultsFound": 53 }
    ],
    "totalResults": 53,
    "query": "braai tongs"
  }
}
```

#### GET `/api/hyperlocal/category/:category`
Search products by category

**Query Parameters:**
- `lat` (required) - User latitude
- `lng` (required) - User longitude
- `tier_index` (optional, default: 1) - Radius tier

#### GET `/api/hyperlocal/tiers`
Get available radius tiers

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "T0", "label": "Auto", "radiusKm": null, "index": 0 },
    { "id": "T0", "label": "Within 1km", "radiusKm": 1, "index": 0 },
    { "id": "T1", "label": "Within 5km", "radiusKm": 5, "index": 1 },
    { "id": "T2", "label": "Within 10km", "radiusKm": 10, "index": 2 },
    { "id": "T3", "label": "Within 35km", "radiusKm": 35, "index": 3 },
    { "id": "T4", "label": "Within 110km", "radiusKm": 110, "index": 4 }
  ]
}
```

### Inventory Endpoints

#### GET `/api/inventory/:storeId/:productId`
Get inventory for a specific product at a store

#### GET `/api/inventory/store/:storeId`
Get all inventories for a store

#### POST `/api/inventory`
Create or update inventory

**Body:**
```json
{
  "storeId": "store_123",
  "productId": "prod_456",
  "stockOnHand": 50,
  "lowStockThreshold": 5,
  "availableNow": true
}
```

#### PUT `/api/inventory/:storeId/:productId/stock`
Update stock quantity

**Body:**
```json
{
  "quantity": 45,
  "reason": "sale"
}
```

#### POST `/api/inventory/bulk`
Bulk update inventories

---

## 🎨 Frontend Component Usage

### LocationSelector

```jsx
import { LocationSelector } from '@/components/hyperlocal';

function MyComponent() {
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(0);

  return (
    <LocationSelector
      onLocationChange={setLocation}
      onRadiusChange={setRadius}
      initialRadius={radius}
      address="Sandton Central"
    />
  );
}
```

### HyperlocalProductCard

```jsx
import { HyperlocalProductCard } from '@/components/hyperlocal';

function ProductList({ products }) {
  return (
    <div>
      {products.map(product => (
        <HyperlocalProductCard
          key={product.id}
          product={product}
          onClick={(p) => navigate(`/products/${p.id}`)}
        />
      ))}
    </div>
  );
}
```

### ExpansionBanner

```jsx
import { ExpansionBanner } from '@/components/hyperlocal';

function SearchResults({ results, isSearching }) {
  return (
    <>
      <ExpansionBanner
        expanded={results.expanded}
        effectiveRadius={results.effectiveRadiusKm}
        effectiveLabel={results.tierLabel}
        expansionSteps={results.expansionSteps}
        isSearching={isSearching}
        query={searchQuery}
      />
      {/* Results */}
    </>
  );
}
```

### Using Hyperlocal API

```jsx
import hyperlocalApi from '@/utils/hyperlocalApi';

async function loadHomeFeed() {
  const location = await hyperlocalApi.getUserLocation();
  const feed = await hyperlocalApi.getHyperlocalHomeFeed(
    location.lat,
    location.lng,
    0 // Auto radius
  );
  setFeed(feed);
}

async function search(query) {
  const location = await hyperlocalApi.getUserLocation();
  const results = await hyperlocalApi.searchHyperlocal({
    query,
    lat: location.lat,
    lng: location.lng,
    filters: { inStockOnly: true, minRating: 4 }
  });
  setResults(results);
}
```

---

## 🔧 Integration with Existing App

### Option 1: Replace Home Screen

In your `App.jsx` or routing file:

```jsx
import HyperlocalHomePage from './components/hyperlocal/HyperlocalHomePage';

// Replace existing home route
<Route path="/" element={<HyperlocalHomePage />} />
```

### Option 2: Replace Search

```jsx
import HyperlocalSearchPage from './components/hyperlocal/HyperlocalSearchPage';

<Route path="/search" element={<HyperlocalSearchPage />} />
```

### Option 3: Enhance Existing Components

Add hyperlocal badges to existing product cards:

```jsx
import { DistanceBadge, WhyThisBadges } from './components/hyperlocal';

function ExistingProductCard({ product }) {
  return (
    <div className="product-card">
      {/* Existing card content */}
      <DistanceBadge 
        distanceKm={product.distanceKm} 
        distanceDisplay={product.distanceDisplay} 
      />
      <WhyThisBadges reasons={product.whyThis} />
    </div>
  );
}
```

---

## 🎯 H3 Resolution Strategy

| Resolution | Diameter | Use Case | Tier |
|------------|----------|----------|------|
| R3 | ~110km | Province-level | T4 |
| R4 | ~35km | Metro-to-metro | T3 |
| R5 | ~10km | City/outer region | T2 |
| R6 | ~3.5km | 3-5km zone | T1 |
| R7 | ~1.2km | 1km neighborhood | T0 |
| R8 | ~460m | Block level | - |
| R9 | ~170m | Street level | - |
| R10 | ~60m | Building cluster | - |

---

## 📊 Ranking Formula

### Final Ranking Score
```
score = 
  locality_score * 0.30 +
  product_quality * 0.25 +
  seller_quality * 0.20 +
  store_service * 0.15 +
  price_competitiveness * 0.05 +
  personalization * 0.05
```

### Locality Score
```
base_score = 1 - (distance / max_tier_distance)
locality_score = max(0, base_score - tier_penalty)
```

Tier penalties:
- T0 (1km): 0.00
- T1 (5km): 0.05
- T2 (10km): 0.10
- T3 (35km): 0.20
- T4 (110km): 0.35

### Quality Scores

**Seller Quality:**
```
rating_score * 0.35 +
fulfillment_score * 0.30 +
response_score * 0.15 +
trust_score * 0.20
```

**Product Quality:**
```
rating_score * 0.40 +
return_rate_score * 0.25 +
availability_score * 0.20 +
freshness_score * 0.15
```

**Store Service:**
```
rating_score * 0.50 +
open_now_score * 0.30 +
capacity_score * 0.20
```

---

## 🚦 Testing the System

### 1. Create a Test Store with Location

```javascript
// Backend console or API
const StoreService = require('./services/StoreService');

const store = StoreService.createStore({
  name: 'Test Store Sandton',
  address: {
    street: '123 Maude St',
    suburb: 'Sandton',
    city: 'Johannesburg',
    lat: -26.107418,
    lng: 28.056602
  },
  sellerId: 'seller_1',
  type: 'grocery'
});

console.log('Store H3 cells:', {
  r7: store.h3_r7,
  r6: store.h3_r6,
  r5: store.h3_r5
});
```

### 2. Add Products with Inventory

```javascript
const ProductService = require('./services/ProductService');
const InventoryService = require('./services/InventoryService');

const product = ProductService.createProduct({
  name: 'Fresh Tomatoes',
  price: 25.99,
  storeId: store.id,
  category: 'produce'
});

InventoryService.upsertInventory({
  storeId: store.id,
  productId: product.id,
  stockOnHand: 100,
  availableNow: true
});
```

### 3. Test Home Feed

Open browser to:
```
http://localhost:5173/
```

The home page will:
1. Request user location
2. Show LocationSelector with current address
3. Load hyperlocal feed
4. Display products with distance badges

### 4. Test Search

Search for "tomatoes" - observe:
1. "Searching nearby..." animation
2. Expansion banner showing radius used
3. Products ranked by distance + quality
4. "Why this" badges explaining selections

### 5. Test Manual Radius Override

1. Click on "Auto" chip in LocationSelector
2. Select "Within 5km"
3. Observe feed reloading with larger radius
4. Note: more products but farther away

---

## 🎨 Customization

### Adjust Tier Radiuses

Edit `/back-end/utils/h3Utils.js`:

```javascript
export const RADIUS_TIERS = [
  { id: 'T0', label: 'Within 2km', radiusKm: 2, ... }, // Changed from 1km
  // ...
];
```

### Adjust Ranking Weights

Edit `/back-end/services/QualityService.js`:

```javascript
export function calculateRankingScore({...}) {
  const weights = {
    locality: 0.40,        // Increased locality importance
    productQuality: 0.20,
    // ...
  };
}
```

### Customize UI Theme

All components use `props.theme` for colors:

```jsx
// In your theme provider
const theme = {
  colors: {
    primary: '#007AFF',
    primaryLight: '#E3F2FD',
    text: '#000',
    textSecondary: '#666',
    // ...
  }
};
```

---

## 🐛 Troubleshooting

### Products Not Showing in Feed

1. **Check store has H3 cells**
   ```javascript
   const store = StoreService.getStoreById('store_id');
   console.log(store.h3_r7); // Should not be null
   ```

2. **Check inventory is available**
   ```javascript
   const inventory = InventoryService.getInventory('store_id', 'product_id');
   console.log(inventory.availableNow); // Should be true
   ```

3. **Check user location is accurate**
   - Ensure browser has location permission
   - Check lat/lng values in API requests

### Expansion Not Working

1. **Verify tier configuration**
   ```javascript
   import { RADIUS_TIERS } from './utils/h3Utils';
   console.log(RADIUS_TIERS);
   ```

2. **Check min_results threshold**
   - Default is 50 products
   - Lower it for testing: `min_results=5`

### Distance Calculation Issues

1. **Verify coordinates are correct**
   - Latitude: -35 to -22 (South Africa)
   - Longitude: 16 to 33 (South Africa)

2. **Check H3 cell resolution**
   - Use correct resolution for tier
   - R7 for 1km, R6 for 5km, etc.

---

## 📈 Performance Optimization

### Backend

1. **Cache H3 cells** on store update (already implemented)
2. **Index H3 fields** in database for fast lookups
3. **Cache feed results** per H3 cell (30-60s TTL)
4. **Use Redis** for inventory updates
5. **Batch product updates** when possible

### Frontend

1. **Debounce search input** (300ms)
2. **Lazy load product images**
3. **Virtualize long lists**
4. **Cache user location** in localStorage
5. **Prefetch next tier** results

---

## 🎓 Key Concepts

### H3 Hierarchical Grid

H3 creates a global hexagonal grid system:
- Each cell has a unique ID
- Parent-child relationships between resolutions
- Efficient spatial indexing and queries

### Uber-Style Expansion

Progressive search expansion:
1. Start at smallest radius (T0)
2. Check if enough results exist
3. If not, expand to next tier (T1)
4. Repeat until min_results met or max_tier reached
5. Return results with expansion metadata

### Quality-First Ranking

Even with locality priority:
- High-quality sellers nearby rank above low-quality
- Fresh inventory boosts ranking
- Open stores rank higher than closed
- But distance is still primary factor

---

## 📝 Next Steps

### Production Enhancements

1. **Database Integration**
   - Replace in-memory stores with PostgreSQL/MongoDB
   - Add H3 indexes to database tables
   - Implement proper transactions

2. **Search Engine**
   - Integrate Elasticsearch/OpenSearch
   - Index products with H3 cells as fields
   - Enable full-text search with geo filters

3. **Real-time Updates**
   - WebSocket connections for inventory changes
   - Server-sent events for feed updates
   - Redis Pub/Sub for distributed updates

4. **Analytics**
   - Track expansion rates by category
   - Monitor conversion by distance tier
   - A/B test ranking weights

5. **Advanced Features**
   - Personalized ranking (order history)
   - Delivery time estimation
   - Dynamic pricing by distance
   - Multi-store cart optimization

---

## 📄 License

This implementation is part of the Shopply platform.

---

## 🙋‍♂️ Support

For questions or issues with the hyperlocal system:
1. Check this README
2. Review code comments
3. Test with provided examples
4. Check browser console for errors

---

**Happy Hyperlocal Shopping! 🛍️📍**

