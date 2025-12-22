# 🔧 Troubleshooting: Products Not Showing

## Quick Diagnosis Steps

### Step 1: Check Backend Console

**Restart backend and look for these messages:**

```bash
cd back-end
npm start
```

**Expected Output:**
```
✅ Generated 60 credible furniture stores
✅ Generated 999 furniture products
✅ Added 999 furniture products to ProductService
   ProductService now has 999 total products
✅ Furniture marketplace seeded successfully!
```

**If you see errors:**
- Check the error message
- Common issues: Missing dependencies, database connection errors

---

### Step 2: Check Debug Endpoint

**Open in browser or use curl:**
```
http://localhost:5000/api/debug/products
```

**Expected Response:**
```json
{
  "success": true,
  "productCount": 999,
  "nextId": 30000,
  "sampleProducts": [
    {
      "id": 20001,
      "name": "Modern Sectional Sofa",
      "price": 12500,
      "room": "living",
      "category": "Sofas"
    },
    ...
  ]
}
```

**If productCount is 0:**
- Products weren't added to ProductService
- Check backend console for errors during seeding
- See Step 3 below

---

### Step 3: Check Product Endpoints

**Test the actual product endpoints:**

```bash
# Hot products
curl http://localhost:5000/api/products/hot?limit=5

# All products
curl http://localhost:5000/api/products?limit=5

# Products by room
curl http://localhost:5000/api/products?room=living&limit=5
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 20001,
      "name": "Modern Sectional Sofa",
      "price": 12500,
      "room": "living",
      ...
    },
    ...
  ],
  "count": 5
}
```

**If data is empty array `[]`:**
- Products are not in ProductService
- See Step 4 below

---

### Step 4: Check Frontend Network Tab

**Open browser DevTools (F12):**
1. Go to **Network** tab
2. Refresh the page
3. Look for requests to `/api/products/*`
4. Click on the request
5. Check **Response** tab

**Expected:**
- Status: `200 OK`
- Response contains product data

**If Status is 500 or error:**
- Check backend console for errors
- Check if backend is running

**If Response is empty `[]`:**
- Products not in ProductService
- Backend seeding might have failed

---

## Common Issues & Solutions

### Issue 1: Backend Not Running

**Symptoms:**
- Frontend shows "Failed to fetch" errors
- Network tab shows connection refused

**Solution:**
```bash
cd back-end
npm start
```

Wait for: `Server is running on http://localhost:5000`

---

### Issue 2: Seeding Failed Silently

**Symptoms:**
- Backend starts but no products
- Debug endpoint shows `productCount: 0`

**Check Backend Console:**
Look for error messages like:
- `❌ Error seeding furniture marketplace:`
- `❌ Error adding products to ProductService:`

**Solution:**
1. Check backend console for full error
2. Common causes:
   - Missing dependencies: `npm install`
   - Import errors: Check file paths
   - Product validation errors: Check Product model

---

### Issue 3: Products Added But Not Showing

**Symptoms:**
- Debug endpoint shows `productCount: 999`
- But frontend shows no products

**Possible Causes:**

#### a) Frontend Caching
**Solution:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Open in incognito/private window

#### b) Wrong API Endpoint
**Check:**
- Frontend is calling `/api/products/hot` not `/api/furniture/home`
- Network tab shows correct endpoint

#### c) Filtering Issues
**Check:**
- Products might be filtered out
- Check if filters are too restrictive
- Try `/api/products?limit=10` (no filters)

---

### Issue 4: Seeding Takes Too Long

**Symptoms:**
- Backend starts but products not ready
- First API call returns empty

**Solution:**
- Wait 10-30 seconds after backend starts
- Seeding is async and takes time
- Check console for "✅ Added 999 furniture products"

---

### Issue 5: ProductService Not Populated

**Symptoms:**
- Seeding completes but `productCount: 0`
- No errors in console

**Check:**
1. Open `/api/debug/products` endpoint
2. If `productCount: 0`, products weren't added

**Possible Causes:**
- `addProducts()` method not called
- Products array is empty
- Error in `addProducts()` method

**Solution:**
Check backend console for:
- `✅ Added X furniture products to ProductService`
- If missing, check `seedFurnitureMarketplace.js` for errors

---

## Manual Fix: Add Products Manually

If seeding isn't working, you can manually add products:

**Create a test script:**
```javascript
// test-add-products.js
import { ProductService } from './services/ProductService.js';
import { Product } from './models/Product.js';

const testProduct = new Product({
  id: 1,
  name: 'Test Sofa',
  price: 5000,
  room: 'living',
  category: 'Sofas',
  condition: 'new',
  storeId: 1,
  // ... other required fields
});

ProductService.addProducts([testProduct]);
console.log('Products:', ProductService.products.length);
```

---

## Verify Everything Works

### Checklist:

- [ ] Backend is running (`http://localhost:5000/api/health` returns OK)
- [ ] Backend console shows: "✅ Added 999 furniture products to ProductService"
- [ ] Debug endpoint shows: `productCount: 999`
- [ ] `/api/products/hot?limit=5` returns products
- [ ] Frontend Network tab shows 200 OK responses
- [ ] Frontend shows products on home page

---

## Still Not Working?

**Collect this information:**

1. **Backend Console Output:**
   - Copy all console messages from backend startup
   - Look for errors or warnings

2. **Debug Endpoint Response:**
   - Open: `http://localhost:5000/api/debug/products`
   - Copy the JSON response

3. **Product Endpoint Response:**
   - Open: `http://localhost:5000/api/products/hot?limit=5`
   - Copy the JSON response

4. **Frontend Network Tab:**
   - Screenshot of failed requests
   - Error messages

5. **Browser Console:**
   - Any JavaScript errors
   - Console warnings

---

## Quick Test Commands

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check product count
curl http://localhost:5000/api/debug/products

# Get hot products
curl http://localhost:5000/api/products/hot?limit=5

# Get all products (first 5)
curl http://localhost:5000/api/products?limit=5
```

---

**After fixing, restart backend and test again!**

