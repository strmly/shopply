# 🪑 Str3mly Furniture Marketplace - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Backend

```bash
cd back-end
npm start
```

**Expected Output:**
```
🪑 ========================================
   FURNITURE MARKETPLACE SEEDING START
========================================
✅ Generated 65 seed stores
✅ Generated 1024 seed products
✅ Furniture marketplace seeded successfully!

Server is running on http://localhost:5000
```

### Step 2: Start the Frontend

```bash
cd front-end
npm run dev
```

Access: `http://localhost:5173`

### Step 3: Explore the Furniture Marketplace

1. **Navigate to Furniture Home**: Go to `/furniture` route
2. **Browse by Room**: Click any room card (Living, Bedroom, Office, etc.)
3. **View Product Details**: Click any furniture item
4. **Test Search**: Search for "sofa", "bed", or "desk"
5. **Try Filters**: Apply price, condition, or material filters

---

## 📍 Key Routes

| Route | Description |
|-------|-------------|
| `/furniture` | Furniture marketplace home |
| `/furniture/room/living` | Living room furniture |
| `/furniture/room/bedroom` | Bedroom furniture |
| `/furniture/room/office` | Office furniture |
| `/furniture/product/:id` | Product detail page |
| `/furniture/seller/:id` | Seller profile |

---

## 🔧 API Endpoints to Test

### Get Home Feed
```bash
curl "http://localhost:5000/api/furniture/home?lat=-26.2041&lng=28.0473"
```

### Search Furniture
```bash
curl "http://localhost:5000/api/furniture/search?lat=-26.2041&lng=28.0473&q=sofa"
```

### Browse Living Room
```bash
curl "http://localhost:5000/api/furniture/room/living?lat=-26.2041&lng=28.0473"
```

### Get Product Details
```bash
curl "http://localhost:5000/api/furniture/product/seed-product-20001?lat=-26.2041&lng=28.0473"
```

### Test Filters
```bash
curl "http://localhost:5000/api/furniture/search?lat=-26.2041&lng=28.0473&condition=used&priceMax=5000"
```

---

## 🧪 Quick Tests

### Test 1: H3 Hyperlocal Search
Change the `tier` parameter to see expansion:
- `tier=T0` - Within 1km
- `tier=T1` - Within 5km
- `tier=T2` - Within 10km
- `tier=auto` - Auto-expand until minResults reached

```bash
curl "http://localhost:5000/api/furniture/search?lat=-26.2041&lng=28.0473&tier=T0"
```

### Test 2: Room-Led Browsing
Each room should have different furniture:
```bash
curl "http://localhost:5000/api/furniture/room/living?lat=-26.2041&lng=28.0473"
curl "http://localhost:5000/api/furniture/room/bedroom?lat=-26.2041&lng=28.0473"
curl "http://localhost:5000/api/furniture/room/office?lat=-26.2041&lng=28.0473"
```

### Test 3: Condition Filtering
Filter by furniture condition:
```bash
curl "http://localhost:5000/api/furniture/search?lat=-26.2041&lng=28.0473&condition=new"
curl "http://localhost:5000/api/furniture/search?lat=-26.2041&lng=28.0473&condition=used"
```

### Test 4: Price Filtering
Filter by price range:
```bash
curl "http://localhost:5000/api/furniture/search?lat=-26.2041&lng=28.0473&priceMin=1000&priceMax=5000"
```

---

## 📊 What You Should See

### Home Feed Modules
1. **Best Near You** - Top-ranked furniture within your tier
2. **Shop by Room** - 6 room categories with icons
3. **Top-Rated Sellers** - Best local furniture stores
4. **New Arrivals** - Recently added items
5. **Pre-Loved Furniture** - Used and refurbished items

### Product Cards Display
- Furniture image
- Price (with discount if applicable)
- Condition badge (New, Used, Like-New)
- Distance from you
- Dimensions (W×D×H)
- Store name
- Delivery ETA

### Product Detail Page Shows
- Image gallery
- Price and discount
- Dimensions, material, color
- Assembly requirements
- Delivery estimate (distance, date, fee)
- Pickup options
- Seller information
- Return policy

---

## 🎯 Demo Locations (SA)

Test with different locations to see hyperlocal results:

### Johannesburg Locations
```bash
# Sandton
lat=-26.1076&lng=28.0567

# Rosebank
lat=-26.1478&lng=28.0406

# Parkhurst
lat=-26.1454&lng=28.0203
```

### Cape Town Locations
```bash
# CBD
lat=-33.9249&lng=18.4241

# Sea Point
lat=-33.9115&lng=18.3890

# Claremont
lat=-33.9818&lng=18.4638
```

---

## 🔍 Search Examples

Try these searches:
- `sofa` (includes synonyms: couch, settee)
- `bed` (king, queen, single)
- `desk` (office desks)
- `dining table` (various sizes)
- `vintage` (vintage furniture)
- `modern sofa` (style + category)

---

## 🛠️ Troubleshooting

### Issue: No products returned
**Solution**: Check if seeding completed successfully. Look for seeding output in server console.

### Issue: Distance shows as null
**Solution**: Ensure you're passing `lat` and `lng` query parameters.

### Issue: Images not loading
**Solution**: Placeholder image URLs are used. Replace with real furniture images in production.

### Issue: Location not detected
**Solution**: Allow location permissions in browser, or manually set location in localStorage:
```javascript
localStorage.setItem('userLocation', JSON.stringify({
  lat: -26.2041,
  lng: 28.0473,
  suburb: 'Sandton',
  city: 'Johannesburg'
}));
```

---

## 📱 Mobile Testing

1. Open browser dev tools
2. Toggle device toolbar (responsive mode)
3. Test on:
   - iPhone 12/13 Pro (390x844)
   - Samsung Galaxy S21 (360x800)
   - iPad Pro (1024x1366)

All components are responsive and mobile-first.

---

## 🎨 Customization

### Change Seeded Data
Edit `/back-end/services/FurnitureSeedingService.js`:
- Adjust product count: `seedFurnitureMarketplace(2000)`
- Modify price ranges: Update `getBasePriceForCategory()`
- Add more regions: Update `SA_REGIONS` in taxonomy

### Modify H3 Tiers
Edit `/back-end/utils/h3Utils.js`:
- Change tier radiuses in `RADIUS_TIERS`
- Adjust penalties for local results
- Modify `minResults` per tier

### Customize UI Theme
Edit styled-components in furniture components:
- Colors, fonts, spacing
- Card layouts
- Responsive breakpoints

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Seeding completes (1000+ products)
- [ ] Frontend builds and runs
- [ ] `/furniture` route loads home feed
- [ ] Products display with images, prices, distances
- [ ] Room browsing works (click room card)
- [ ] Product detail page shows delivery estimates
- [ ] Search returns relevant results
- [ ] Filters apply correctly
- [ ] Mobile responsive (check on phone)

---

## 🎉 You're Ready!

The furniture marketplace is now running. You have:
- ✅ 1000+ furniture products across SA
- ✅ 60+ stores in major cities
- ✅ H3 hyperlocal search
- ✅ Furniture-first UX
- ✅ Room-led navigation
- ✅ Delivery estimates
- ✅ Complete API

**Next Steps:**
1. Replace placeholder images with real furniture photos
2. Integrate with real delivery pricing APIs
3. Add user authentication for cart/checkout
4. Enable seller onboarding for real stores
5. Add reviews and ratings system

---

## 📚 Further Reading

- `FURNITURE_MARKETPLACE_IMPLEMENTATION.md` - Complete technical documentation
- `/back-end/constants/furnitureTaxonomy.js` - Full taxonomy reference
- `/back-end/services/FurnitureSearchService.js` - Ranking algorithm details
- `/front-end/src/components/furniture/` - All UI components

---

**Happy Building! 🪑✨**

