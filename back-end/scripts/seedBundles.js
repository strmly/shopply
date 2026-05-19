import { Product } from '../models/Product.js';
import { ProductService } from '../services/ProductService.js';
import { getAllStores } from '../services/StoreService.js';

const BUNDLE_PRODUCTS = [
  {
    name: 'Living Room Starter Bundle',
    description: 'Complete your living room in one go. Includes a 3-seater sofa, a solid wood coffee table, and a floor lamp — curated to work together.',
    price: 4299,
    originalPrice: 5890,
    discount: 27,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop',
    ],
    room: 'living',
    tags: ['bundle', 'living room', 'sofa', 'coffee table'],
    rating: 4.8,
    reviewCount: 312,
  },
  {
    name: 'Home Office Setup Bundle',
    description: 'Everything you need to work from home in style. Standing desk, ergonomic chair, and cable-managed monitor stand included.',
    price: 5199,
    originalPrice: 7100,
    discount: 27,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=600&fit=crop',
    ],
    room: 'office',
    tags: ['bundle', 'office', 'desk', 'chair', 'work from home'],
    rating: 4.9,
    reviewCount: 528,
  },
  {
    name: 'Bedroom Refresh Bundle',
    description: 'King bed frame, matching bedside tables, and a 5-drawer dresser in coordinated walnut finish.',
    price: 6799,
    originalPrice: 9450,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop',
    ],
    room: 'bedroom',
    tags: ['bundle', 'bedroom', 'bed', 'dresser'],
    rating: 4.7,
    reviewCount: 204,
  },
  {
    name: 'Dining Room Set Bundle',
    description: '6-seater extendable dining table with matching upholstered chairs. Seats your whole family and folds away when you need space.',
    price: 7499,
    originalPrice: 10200,
    discount: 26,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop',
    ],
    room: 'dining',
    tags: ['bundle', 'dining', 'table', 'chairs'],
    rating: 4.6,
    reviewCount: 178,
  },
  {
    name: 'Study Corner Bundle',
    description: 'Compact student desk, bookcase, and task chair — fits in any corner. Perfect for kids rooms or studio apartments.',
    price: 2899,
    originalPrice: 3999,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&h=600&fit=crop',
    ],
    room: 'office',
    tags: ['bundle', 'study', 'desk', 'bookcase', 'kids'],
    rating: 4.5,
    reviewCount: 389,
  },
  {
    name: 'Guest Room Essentials Bundle',
    description: 'Queen bed frame, a compact wardrobe, and a bedside table — everything a guest needs, nothing they don\'t.',
    price: 4899,
    originalPrice: 6600,
    discount: 26,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
    ],
    room: 'bedroom',
    tags: ['bundle', 'guest room', 'bed', 'wardrobe'],
    rating: 4.7,
    reviewCount: 93,
  },
  {
    name: 'Reading Nook Bundle',
    description: 'Armchair, floor lamp, and side table — your perfect quiet corner. Curated in three colour palettes.',
    price: 3199,
    originalPrice: 4350,
    discount: 26,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    ],
    room: 'living',
    tags: ['bundle', 'reading', 'armchair', 'lamp'],
    rating: 4.8,
    reviewCount: 261,
  },
  {
    name: 'Open-Plan Bundle',
    description: 'Bookcase divider, modular sofa, and a statement rug to zone your open-plan space into distinct areas.',
    price: 8999,
    originalPrice: 12400,
    discount: 27,
    image: 'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=800&h=600&fit=crop',
    ],
    room: 'living',
    tags: ['bundle', 'open plan', 'sofa', 'bookcase', 'rug'],
    rating: 4.6,
    reviewCount: 147,
  },
];

export async function seedBundles() {
  const alreadySeeded = ProductService.products.some(p => p.tags?.includes('bundle'));
  if (alreadySeeded) return;

  // Distribute bundles across the real stores so they appear in GeoIndex and search
  const stores = getAllStores().filter(s => s.id !== 0);
  let nextId = Math.max(...ProductService.products.map(p => p.id), 1000) + 1;

  const plainObjects = BUNDLE_PRODUCTS.map((data, i) => {
    const store = stores.length ? stores[i % stores.length] : null;
    return {
      id: nextId++,
      ...data,
      category: 'furniture',
      storeId: store?.id ?? 'shopply-jhb-sandton',
      storeName: store?.name ?? 'Shopply Home Furniture',
      storeLocation: store?.address
        ? { lat: store.address.lat, lng: store.address.lng, suburb: store.address.suburb, city: store.address.city }
        : undefined,
      stock: 'in',
      stockQuantity: 20,
      isTrending: true,
      isNew: false,
      isFlashDeal: false,
      variants: [],
      condition: 'new',
      deliveryEligible: true,
      leadTimeDaysMin: 2,
      leadTimeDaysMax: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Use addProducts so they're picked up by the inverted index
  ProductService.addProducts(plainObjects);
  console.log(`✅ Seeded ${BUNDLE_PRODUCTS.length} bundle products`);
}
