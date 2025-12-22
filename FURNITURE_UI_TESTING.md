# 🪑 Furniture Marketplace UI - Testing Guide

## Problem Fixed ✅

**Issue**: UI was showing old general products instead of furniture
**Solution**: 
1. ✅ Main home route (`/`) now automatically redirects to `/furniture`
2. ✅ Fixed furnitureApi.js to properly use fetch API
3. ✅ Backend is seeding 60 stores with 1000+ furniture products
4. ✅ All furniture routes are properly wired up

---

## 🚀 Start the Application

### Step 1: Start Backend (Must Be Running!)

```bash
cd back-end
npm start
```

**Wait for this output:**
```
🪑 ENHANCED FURNITURE MARKETPLACE SEEDING
✅ Generated 60 credible furniture stores
✅ Generated 1000+ furniture products

📊 H3 DENSITY ANALYSIS
T0 (R7) - 45 cells: Avg 22.2 products/cell
✅ Furniture marketplace seeded successfully!

Server is running on http://localhost:5000
```

### Step 2: Start Frontend (In New Terminal)

```bash
cd front-end
npm run dev
```

**You should see:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## 📱 Test the Furniture UI

### 1. Open the App

Navigate to: `http://localhost:3000/`

**Expected behavior:**
- Home page will automatically redirect to `/furniture`
- You should see the **Furniture Home Screen** with:
  - Location chip showing "Delivering to Your Location"
  - Tier chip showing "Auto · Within 5km"
  - Search bar with "Search sofas, beds, desks..."
  - Multiple modules with furniture products

### 2. What You Should See

#### **Module 1: Best Near You**
- Furniture product cards with images
- Prices (e.g., R3,500 - R15,000)
- Distance labels (e.g., "1.2km")
- Condition badges ("New", "Used", "Like-New")
- Dimensions (e.g., "W180×D90×H85cm")

#### **Module 2: Shop by Room**
- 6 room cards with icons:
  - 🛋️ Living Room
  - 🛏️ Bedroom
  - 💼 Office
  - 🍽️ Dining
  - 🌳 Outdoor
  - 🧸 Kids

#### **Module 3: Top-Rated Sellers Nearby**
- Seller cards with:
  - Store logos/placeholders
  - Store names (e.g., "Urban Living Furniture - Sandton")
  - Ratings (e.g., ⭐ 4.5)
  - Distance (e.g., "2.3km")

#### **Module 4: New Arrivals Near You**
- Recent furniture products
- "NEW" badges on products

#### **Module 5: Pre-Loved Near You**
- Used/refurbished furniture
- "Used" / "Refurbished" condition badges
- Lower prices

---

## 🔍 Test Navigation

### Test 1: Browse by Room

1. Click on **"Living Room"** card
2. Should navigate to `/furniture/room/living`
3. Should see:
   - Living room header with 🛋️ icon
   - Filter button
   - Grid of sofas, coffee tables, TV stands, etc.
   - All products showing "Living" room type

### Test 2: View Product Details

1. Click on any furniture product card
2. Should navigate to `/furniture/product/[product-id]`
3. Should see:
   - Large product images with gallery
   - Price with discount badge (if applicable)
   - Dimensions section with "📏 W×D×H"
   - Material info "🔨 Wood"
   - Color "🎨 Brown"
   - Delivery information:
     - Distance from you
     - Earliest delivery date
     - Estimated delivery fee
   - Seller information panel
   - Bottom CTA buttons:
     - 💬 Message
     - 🛒 Add to Cart
     - Buy Now

### Test 3: Search Furniture

1. In the search bar, type "sofa"
2. Press Enter
3. Should see search results with sofas, couches, sectionals

### Test 4: Apply Filters

1. On any product listing page, click "🎛️ Filters"
2. Filter panel should slide up from bottom
3. Try filtering by:
   - Price range
   - Condition (New, Used, etc.)
   - Delivery options

---

## 🧪 Verify Furniture-Specific Features

### Check #1: Product Cards Show Furniture Data

Each product card should display:
- ✅ **Condition badge**: "New" / "Used" / "Like-New" / "Refurbished"
- ✅ **Price**: R amount (e.g., R3,500)
- ✅ **Discount badge**: "-20%" if on sale
- ✅ **Distance**: "1.2km" or similar
- ✅ **Dimensions snippet**: "W180×D90×H85cm"
- ✅ **Store name**: Below the price
- ✅ **Delivery ETA**: "🚚 Delivers in 2 days" (if fast)

### Check #2: Room Categories Work

Click each room and verify:
- ✅ **Living Room**: Sofas, Coffee Tables, TV Stands, Armchairs
- ✅ **Bedroom**: Beds, Wardrobes, Dressers, Nightstands
- ✅ **Office**: Desks, Office Chairs, Shelving, Filing Cabinets
- ✅ **Dining**: Dining Tables, Dining Chairs, Sideboards
- ✅ **Outdoor**: Patio Sets, Outdoor Tables, Garden Benches
- ✅ **Kids**: Kids Beds, Toy Storage, Kids Desks

### Check #3: Seller Information Shows

On product detail page, verify:
- ✅ Seller name (e.g., "Urban Living Furniture - Sandton")
- ✅ Store rating (e.g., "⭐ 4.5 (150 reviews)")
- ✅ Verification badge (if applicable)
- ✅ Store location (suburb, city)
- ✅ Return policy (e.g., "7-day return policy")

### Check #4: Delivery Information Shows

On product detail page, verify:
- ✅ **Distance**: "Delivery from 3.2km away"
- ✅ **Earliest delivery**: Date or "Tomorrow"
- ✅ **Delivery fee estimate**: "R50 - R100" or amount
- ✅ **Delivery modes**: 🏪 Pickup, 🚚 Local Delivery icons

---

## 🐛 Troubleshooting

### Issue: "Unable to load furniture"

**Check:**
1. ✅ Is backend running? (`http://localhost:5000/api/health` should return OK)
2. ✅ Did seeding complete? Check backend console for success message
3. ✅ Is frontend using correct port? (Should be 3000)
4. ✅ Check browser console for errors (F12 → Console tab)

**Solution:**
```bash
# Stop both servers (Ctrl+C)
# Restart backend first
cd back-end && npm start

# Wait for seeding to complete
# Then start frontend
cd front-end && npm run dev
```

### Issue: "Products not showing" or "Empty modules"

**Check:**
1. ✅ Backend seeded successfully? Look for "✅ Generated 1000+ furniture products"
2. ✅ API endpoint returning data?

**Test API directly:**
```bash
curl "http://localhost:5000/api/furniture/home?lat=-26.2041&lng=28.0473"
```

Should return JSON with `success: true` and furniture data.

### Issue: "Still seeing old/general products"

**Solution:**
1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check you're on `/furniture` route, not `/`
4. The home route (`/`) now automatically redirects to `/furniture`

### Issue: "Images not loading"

**Expected**: Placeholder image URLs are used for MVP
**Solution**: This is normal. Replace with real furniture images in production.

---

## 📍 Test Different Locations

Change your location to see different results:

### Option 1: Update localStorage

Open browser console (F12) and run:

```javascript
// Johannesburg - Sandton
localStorage.setItem('userLocation', JSON.stringify({
  lat: -26.1076,
  lng: 28.0567,
  suburb: 'Sandton',
  city: 'Johannesburg'
}));
location.reload();

// Cape Town - Sea Point
localStorage.setItem('userLocation', JSON.stringify({
  lat: -33.9115,
  lng: 18.3890,
  suburb: 'Sea Point',
  city: 'Cape Town'
}));
location.reload();

// Pretoria - Centurion
localStorage.setItem('userLocation', JSON.stringify({
  lat: -25.8601,
  lng: 28.1888,
  suburb: 'Centurion',
  city: 'Pretoria'
}));
location.reload();
```

### Option 2: Click Location Chip

Click the location chip at the top ("📍 Delivering to...") to change location (if feature is implemented).

---

## ✅ Success Checklist

After testing, you should have verified:

- ✅ Home page redirects to `/furniture` automatically
- ✅ Furniture home screen loads with 5 modules
- ✅ Product cards show furniture-specific data (dimensions, condition, etc.)
- ✅ Room cards (6) are visible and clickable
- ✅ Clicking a room shows filtered products
- ✅ Clicking a product shows detailed furniture page
- ✅ Delivery information displays (distance, ETA, fee)
- ✅ Seller information displays correctly
- ✅ Search functionality works
- ✅ Filter panel opens and closes
- ✅ All furniture categories represented
- ✅ No old/general products visible
- ✅ UI is responsive on mobile view (F12 → Toggle device toolbar)

---

## 🎨 What's Furniture-Specific in the UI?

### 1. **Room-First Navigation**
- Not generic "Categories"
- Living Room, Bedroom, Office, etc. with icons

### 2. **Furniture Attributes Visible**
- **Dimensions**: Always shown (W×D×H)
- **Condition**: New, Used, Like-New, Refurbished badges
- **Material**: Wood, Metal, Fabric, Leather
- **Assembly**: "Assembly required" indicator

### 3. **Delivery Reality**
- Distance from you
- Delivery time estimate
- Fee estimate or "Quote required"
- Multiple delivery modes (Pickup, Delivery, Freight)

### 4. **Trust Signals**
- Verified seller badges
- Store ratings with review counts
- Return policy days
- On-time delivery metrics (in store data)

### 5. **Local Context**
- "Near you", "Nearby", "In your city"
- Tier indicators (T0, T1, T2)
- Distance on every card
- Expansion messaging when search radius increases

---

## 📸 Expected Screenshots

### Home Screen
```
┌─────────────────────────────────────┐
│ 📍 Sandton    Auto · Within 5km     │
├─────────────────────────────────────┤
│ 🔍 Search sofas, beds, desks...     │
├─────────────────────────────────────┤
│ Best Near You                       │
│ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │Sofa  │ │Bed   │ │Desk  │          │
│ │R3,500│ │R7,200│ │R2,800│          │
│ └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────┤
│ Shop by Room                        │
│ 🛋️Living 🛏️Bedroom 💼Office         │
│ 🍽️Dining 🌳Outdoor 🧸Kids           │
└─────────────────────────────────────┘
```

### Product Detail
```
┌─────────────────────────────────────┐
│ ← Back              🔗 ♡             │
├─────────────────────────────────────┤
│                                     │
│        [Product Image]              │
│         -20% NEW                    │
│                                     │
├─────────────────────────────────────┤
│ Modern Leather Sofa                 │
│ R12,000  ̶R̶1̶5̶,̶0̶0̶0̶                 │
│ ────────────────────────────        │
│ 📏 Dimensions: W210×D95×H80cm       │
│ 🔨 Material: Leather                │
│ 🎨 Color: Brown                     │
│ 🔧 Assembly required (R150)         │
│ ────────────────────────────        │
│ 📦 Delivery Information             │
│ 📍 Distance: 2.3km away             │
│ 📅 Earliest: Tomorrow               │
│ 💰 Fee: R80                         │
│ 🚚 Local Delivery  🏪 Pickup        │
│ ────────────────────────────        │
│ 💬 Message | 🛒 Add to Cart | Buy   │
└─────────────────────────────────────┘
```

---

## 🎯 Next Steps After Testing

Once UI is working:

1. ✅ Verify all modules load
2. ✅ Test navigation between pages
3. ✅ Verify furniture-specific data displays
4. 🔄 Replace placeholder images with real photos
5. 🔄 Implement "why-this" labels on cards
6. 🔄 Add delivery slot scheduling to checkout
7. 🔄 Implement expansion messaging
8. 🔄 Add verification badges to seller cards

---

**Everything should now show FURNITURE products, not general products!** 🪑✨

If you still see issues, check:
1. Browser cache cleared (hard refresh)
2. Backend fully seeded and running
3. Frontend on correct route (`/furniture`)
4. Browser console for API errors

**Happy Testing!** 🚀

