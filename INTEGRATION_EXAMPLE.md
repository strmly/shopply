# Hyperlocal System Integration Example

This guide shows exactly how to integrate the hyperlocal system into your existing Shopply app.

---

## 🎯 Integration Approach

You have **3 options** for integrating the hyperlocal system:

1. **Full Replacement** - Replace existing home/search with hyperlocal versions (recommended)
2. **Gradual Migration** - Add hyperlocal features alongside existing features
3. **Component Enhancement** - Add hyperlocal badges to existing components

---

## Option 1: Full Replacement (Recommended)

### Step 1: Update App.jsx Routes

Replace your existing routes with hyperlocal versions:

```jsx
// front-end/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HyperlocalHomePage from './components/hyperlocal/HyperlocalHomePage';
import HyperlocalSearchPage from './components/hyperlocal/HyperlocalSearchPage';
import SellerProductUploadHyperlocal from './components/seller/SellerProductUploadHyperlocal';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Hyperlocal routes */}
        <Route path="/" element={<HyperlocalHomePage />} />
        <Route path="/search" element={<HyperlocalSearchPage />} />
        
        {/* Seller routes */}
        <Route path="/seller/products/new" element={<SellerProductUploadHyperlocal storeData={yourStoreData} />} />
        
        {/* Keep existing routes */}
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 2: That's It!

The hyperlocal pages are **complete standalone pages** that handle:
- Location detection
- Radius selection
- Feed loading
- Search with expansion
- Product display

Just navigate to `/` and it works!

---

## Option 2: Gradual Migration

### Step 2a: Add Hyperlocal Toggle to Existing Home

```jsx
// front-end/src/components/home/HomePage.jsx
import React, { useState } from 'react';
import HyperlocalHomePage from '../hyperlocal/HyperlocalHomePage';
import OldHomePage from './OldHomePage';

function HomePage() {
  const [useHyperlocal, setUseHyperlocal] = useState(true);

  return (
    <div>
      <ToggleButton onClick={() => setUseHyperlocal(!useHyperlocal)}>
        {useHyperlocal ? 'Switch to Classic View' : 'Switch to Hyperlocal View'}
      </ToggleButton>

      {useHyperlocal ? <HyperlocalHomePage /> : <OldHomePage />}
    </div>
  );
}
```

### Step 2b: Add "Near Me" Tab

```jsx
// front-end/src/components/home/HomePage.jsx
import React, { useState } from 'react';
import { Tabs, Tab } from './ui/Tabs';
import HyperlocalHomePage from '../hyperlocal/HyperlocalHomePage';
import RegularHomePage from './RegularHomePage';

function HomePage() {
  const [activeTab, setActiveTab] = useState('nearme');

  return (
    <div>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="nearme">📍 Near Me</Tab>
        <Tab value="all">All Products</Tab>
        <Tab value="deals">Deals</Tab>
      </Tabs>

      {activeTab === 'nearme' && <HyperlocalHomePage />}
      {activeTab === 'all' && <RegularHomePage />}
      {activeTab === 'deals' && <DealsPage />}
    </div>
  );
}
```

---

## Option 3: Component Enhancement

### Step 3a: Add Distance Badge to Existing Product Cards

```jsx
// front-end/src/components/product/ProductCard.jsx
import React from 'react';
import { DistanceBadge } from '../hyperlocal';

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      
      {/* Add distance badge if distance data exists */}
      {product.distanceKm && (
        <DistanceBadge 
          distanceKm={product.distanceKm}
          distanceDisplay={product.distanceDisplay}
        />
      )}

      <h3>{product.name}</h3>
      <p>R{product.price}</p>
      
      {/* Add why-this badges if available */}
      {product.whyThis && product.whyThis.length > 0 && (
        <WhyThisBadges reasons={product.whyThis} />
      )}
    </div>
  );
}
```

### Step 3b: Add Location Selector to Existing Header

```jsx
// front-end/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { LocationSelector } from '../hyperlocal';

function Header() {
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(0);

  // Pass location to child components via Context or props
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    // Update your product lists with new location
    fetchProductsNearLocation(newLocation);
  };

  return (
    <header>
      <Logo />
      <LocationSelector
        onLocationChange={handleLocationChange}
        onRadiusChange={setRadius}
        address="Johannesburg"
      />
      <SearchBar />
      <CartIcon />
    </header>
  );
}
```

### Step 3c: Enhance Existing Search with Hyperlocal API

```jsx
// front-end/src/components/search/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import hyperlocalApi from '../../utils/hyperlocalApi';
import { ExpansionBanner, HyperlocalProductCard } from '../hyperlocal';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user location on mount
    hyperlocalApi.getUserLocation().then(setLocation);
  }, []);

  const handleSearch = async () => {
    if (!location || !query) return;

    setLoading(true);
    try {
      const searchResults = await hyperlocalApi.searchHyperlocal({
        query,
        lat: location.lat,
        lng: location.lng,
        filters: { inStockOnly: true }
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SearchInput 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onSubmit={handleSearch}
      />

      {loading && <ExpansionBanner isSearching={true} />}

      {results && (
        <>
          <ExpansionBanner
            expanded={results.expanded}
            effectiveRadius={results.effectiveRadiusKm}
            effectiveLabel={results.tierLabel}
            expansionSteps={results.expansionSteps}
            query={query}
          />

          <div className="results-grid">
            {results.results.map(product => (
              <HyperlocalProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 🔌 Backend Integration

### Step 1: Ensure Backend is Running

```bash
cd back-end
npm install h3-js
npm run dev
```

Backend should be running on `http://localhost:3001`

### Step 2: Test Endpoints

```bash
# Test home feed
curl "http://localhost:3001/api/hyperlocal/feed/home?lat=-26.107418&lng=28.056602&tier_index=0"

# Test search
curl "http://localhost:3001/api/hyperlocal/search?q=tomatoes&lat=-26.107418&lng=28.056602"

# Test tiers
curl "http://localhost:3001/api/hyperlocal/tiers"
```

### Step 3: Create Test Data

Create a script to seed test stores and products:

```javascript
// back-end/scripts/seedHyperlocalData.js
import StoreService from '../services/StoreService.js';
import { getAllProducts, createProduct } from '../services/ProductService.js';
import InventoryService from '../services/InventoryService.js';

// Sandton test store
const store1 = StoreService.createStore({
  id: 'store_sandton_1',
  name: 'Sandton Fresh Market',
  type: 'grocery',
  address: {
    street: '123 Maude Street',
    suburb: 'Sandton',
    city: 'Johannesburg',
    lat: -26.107418,
    lng: 28.056602
  },
  sellerId: 'seller_1',
  rating: 4.5,
  reviewCount: 120,
  isActive: true
});

// Add products
const product1 = createProduct({
  id: 'prod_1',
  name: 'Fresh Organic Tomatoes',
  description: 'Locally grown organic tomatoes',
  price: 25.99,
  category: 'produce',
  storeId: store1.id,
  rating: 4.7,
  reviewCount: 45,
  image: 'https://via.placeholder.com/300x300?text=Tomatoes'
});

// Add inventory
InventoryService.upsertInventory({
  storeId: store1.id,
  productId: product1.id,
  stockOnHand: 100,
  lowStockThreshold: 10,
  availableNow: true
});

console.log('Test data created!');
console.log('Store:', store1.name);
console.log('H3 Cells:', {
  r7: store1.h3_r7,
  r6: store1.h3_r6
});
```

Run it:
```bash
node back-end/scripts/seedHyperlocalData.js
```

---

## 🎨 Styling Integration

### Using Your Existing Theme

All hyperlocal components use theme props. Wrap your app:

```jsx
// front-end/src/App.jsx
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    primary: '#007AFF',
    primaryDark: '#0056b3',
    primaryLight: '#E3F2FD',
    background: '#fff',
    backgroundSecondary: '#f5f5f5',
    text: '#000',
    textSecondary: '#666',
    border: '#e0e0e0',
    success: '#4CAF50',
  }
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {/* Your routes */}
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

### Customizing Component Styles

Override styles by wrapping components:

```jsx
import styled from 'styled-components';
import { HyperlocalProductCard as BaseCard } from './components/hyperlocal';

const CustomProductCard = styled(BaseCard)`
  /* Your custom styles */
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

// Use CustomProductCard instead
```

---

## 📱 Mobile Responsiveness

All components are **mobile-first** and responsive. Test on:

- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPad (768px)
- Desktop (1024px+)

Components automatically adjust:
- Grid layouts (1 column → 2 → 3 → 4)
- Font sizes
- Touch targets (min 44x44px)
- Scroll behavior

---

## 🚀 Quick Start Checklist

- [ ] Backend is running with H3 library installed
- [ ] Test endpoints return data
- [ ] Frontend components are imported
- [ ] Routes are configured
- [ ] Theme provider is set up
- [ ] Test data is seeded
- [ ] Location permissions are granted in browser
- [ ] Navigate to `/` and see home feed
- [ ] Search works with expansion
- [ ] Distance badges appear on products

---

## 🐛 Common Issues

### "Cannot find module '@/components/hyperlocal'"

**Solution:** Check import paths. Use relative imports:
```jsx
import { LocationSelector } from './components/hyperlocal';
// or
import { LocationSelector } from '../hyperlocal';
```

### "Network error" when loading feed

**Solution:** Check:
1. Backend is running on port 3001
2. CORS is enabled (already configured)
3. Browser console for actual error

### Location permission denied

**Solution:**
1. Browser settings → Site settings → Location → Allow
2. Or use mock location for testing:
```jsx
const mockLocation = { lat: -26.107418, lng: 28.056602 };
setLocation(mockLocation);
```

### Products not showing

**Solution:**
1. Check stores have H3 cells (run indexing)
2. Check inventory is available
3. Lower `min_results` to 5 for testing
4. Check console for API errors

---

## 📊 Testing Scenarios

### Scenario 1: Urban User (Sandton)
```javascript
const location = { lat: -26.107418, lng: 28.056602 };
```
**Expected:** Many nearby stores, T0/T1 results

### Scenario 2: Suburban User
```javascript
const location = { lat: -26.0, lng: 28.1 };
```
**Expected:** Fewer stores, expansion to T2/T3

### Scenario 3: Rural User
```javascript
const location = { lat: -27.5, lng: 29.5 };
```
**Expected:** Expansion to T4, sparse results

### Scenario 4: Search for Specific Item
```
Query: "braai tongs"
Location: Sandton
```
**Expected:** 
- Automatic expansion if item rare
- Banner shows expansion steps
- Results ranked by distance + availability

---

## 🎓 Understanding the Flow

### Home Feed Flow

```
User opens app
    ↓
Get user location (GPS)
    ↓
LocationSelector shows address + "Auto" radius
    ↓
Call /api/hyperlocal/feed/home
    ↓
Backend determines user's H3 cell (R7)
    ↓
Query products in nearby H3 cells
    ↓
Rank by locality + quality
    ↓
Return 6 feed modules
    ↓
Display with distance badges
```

### Search Flow

```
User types "tomatoes"
    ↓
Submit search
    ↓
Show "Searching nearby..." banner
    ↓
Call /api/hyperlocal/search
    ↓
Backend starts at T0 (1km)
    ↓
Found 12 results (< min 50)
    ↓
Expand to T1 (5km)
    ↓
Found 53 results (>= min 50)
    ↓
Stop expansion
    ↓
Rank all 53 by score
    ↓
Return with expansion metadata
    ↓
Show "Expanded to 5km" banner
    ↓
Display results with distance + why-this
```

---

## 🎯 Success Metrics

After integration, monitor:

1. **Location Permission Rate** - Target: >80%
2. **Search Expansion Rate** - Typical: 30-40% searches expand
3. **Conversion by Distance** 
   - 0-1km: 5-8% conversion
   - 1-5km: 3-5% conversion
   - 5-10km: 1-3% conversion
4. **Feed Engagement** - Products clicked by distance tier
5. **Seller Inventory Update Frequency** - Target: Daily

---

## 📈 Next Enhancements

Once basic integration works:

1. **A/B Test Ranking Weights**
   - Test 40% locality vs 30% locality
   - Measure conversion impact

2. **Add Personalization**
   - User order history
   - Favorite categories
   - Reorder likelihood

3. **Delivery Time Estimates**
   - Calculate based on distance
   - Factor in store prep time
   - Show "Delivered in 45 min"

4. **Multi-Store Cart Optimization**
   - Suggest grouping by store
   - Show delivery fee by store
   - Optimize for distance

5. **Seller Analytics Dashboard**
   - Show visibility by radius
   - Track expansion rate for products
   - Suggest inventory updates

---

## 💡 Pro Tips

1. **Start with Auto radius** - Let system handle expansion
2. **Keep inventory fresh** - Updates boost ranking significantly
3. **Test with real locations** - Use actual SA coordinates
4. **Monitor expansion rates** - Adjust min_results if needed
5. **Collect user feedback** - "Was this near you?" prompt

---

## 🎉 You're Ready!

Your hyperlocal system is fully functional. Users can now:

✅ See products from nearest sellers first
✅ Automatically expand search until products found  
✅ Understand why products are shown (locality + quality)
✅ Filter by distance, stock, rating
✅ Enjoy Uber-style hyperlocal discovery

**Happy building!** 🚀📍

