import { Promotion } from '../models/Promotion.js';
import { PromotionService } from '../services/PromotionService.js';
import { ProductService } from '../services/ProductService.js';

const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

// Keyword groups for matching products dynamically
const DEAL_TEMPLATES = [
  { title: 'Sectional Sofa Blowout',         keywords: ['sectional', 'corner sofa', 'l-shape'],   discount: 40, hours: 4,    maxInv: 8,  curInv: 2 },
  { title: 'King Bed Frame Flash',            keywords: ['king bed', 'king frame', 'bed frame'],   discount: 35, hours: 6,    maxInv: 12, curInv: 3 },
  { title: 'Dining Table Lightning Deal',     keywords: ['dining table', 'extendable table'],      discount: 30, hours: 8,    maxInv: 15, curInv: 4 },
  { title: 'Ergonomic Chair Rush',            keywords: ['ergonomic', 'office chair', 'mesh'],     discount: 45, hours: 3,    maxInv: 20, curInv: 7 },
  { title: 'Bookcase Bundle Flash',           keywords: ['bookcase', 'bookshelf', 'shelving'],     discount: 25, hours: 10,   maxInv: 10, curInv: 1 },
  { title: 'Accent Chair Steal',              keywords: ['accent chair', 'armchair', 'velvet'],    discount: 50, hours: 2,    maxInv: 5,  curInv: 2 },
  { title: 'Standing Desk Flash',             keywords: ['standing desk', 'height-adjustable'],    discount: 38, hours: 5,    maxInv: 18, curInv: 5 },
  { title: 'Coffee Table Clear-Out',          keywords: ['coffee table', 'marble', 'centre table'],discount: 32, hours: 7,    maxInv: 6,  curInv: 0 },
  { title: 'Wardrobe Flash Event',            keywords: ['wardrobe', 'armoire', 'sliding door'],   discount: 28, hours: 12,   maxInv: 25, curInv: 8 },
  { title: 'TV Console Lightning Drop',       keywords: ['tv console', 'media unit', 'tv stand'],  discount: 42, hours: 3.5,  maxInv: 14, curInv: 3 },
  { title: 'Queen Bed Flash Sale',            keywords: ['queen bed', 'queen frame', 'upholster'], discount: 33, hours: 9,    maxInv: 10, curInv: 4 },
  { title: 'Dresser Drawer Blowout',          keywords: ['dresser', 'chest of drawers', 'drawer'], discount: 27, hours: 11,   maxInv: 16, curInv: 6 },
  { title: 'Side Table Flash',                keywords: ['side table', 'end table', 'nightstand'], discount: 35, hours: 4.5,  maxInv: 22, curInv: 9 },
  { title: 'Dining Chair Set Steal',          keywords: ['dining chair', 'upholstered chair'],     discount: 40, hours: 6.5,  maxInv: 30, curInv: 10},
  { title: 'Sofa Bed Lightning Deal',         keywords: ['sofa bed', 'futon', 'sleeper sofa'],     discount: 38, hours: 5.5,  maxInv: 7,  curInv: 1 },
  { title: 'Console Table Rush',              keywords: ['console table', 'hallway table'],        discount: 30, hours: 8.5,  maxInv: 12, curInv: 3 },
  { title: 'Shoe Cabinet Flash',             keywords: ['shoe cabinet', 'shoe rack', 'entryway'],  discount: 44, hours: 2.5,  maxInv: 18, curInv: 7 },
  { title: 'Recliner Chair Deal',             keywords: ['recliner', 'lounge chair', 'reclining'], discount: 48, hours: 3.5,  maxInv: 9,  curInv: 3 },
  { title: 'Desk Chair Blowout',              keywords: ['desk chair', 'task chair', 'swivel'],    discount: 42, hours: 4,    maxInv: 24, curInv: 8 },
  { title: 'Storage Ottoman Flash',           keywords: ['ottoman', 'footstool', 'storage bench'], discount: 36, hours: 6,    maxInv: 20, curInv: 5 },
];

function findProduct(products, keywords, usedIds) {
  // Try keyword match first
  for (const kw of keywords) {
    const match = products.find(p =>
      !usedIds.has(p.id) &&
      p.stock !== 'out' &&
      (
        p.name?.toLowerCase().includes(kw.toLowerCase()) ||
        p.subcategory?.toLowerCase().includes(kw.toLowerCase()) ||
        p.tags?.some(t => t?.toLowerCase().includes(kw.toLowerCase()))
      )
    );
    if (match) return match;
  }
  // Fall back to any unused in-stock product
  return products.find(p => !usedIds.has(p.id) && p.stock !== 'out') || null;
}

export async function seedFlashDeals() {
  if (PromotionService.promotions.some(p => p.type === 'flash')) {
    return;
  }

  const products = ProductService.products;
  if (products.length === 0) {
    console.warn('⚠️  No products found — skipping flash deal seeding');
    return;
  }

  const usedIds = new Set();
  let seeded = 0;

  for (const template of DEAL_TEMPLATES) {
    const product = findProduct(products, template.keywords, usedIds);
    if (!product) continue;

    usedIds.add(product.id);

    const promotion = new Promotion({
      id: PromotionService.nextId++,
      storeId: product.storeId || 1,
      sellerId: 1,
      type: 'flash',
      title: template.title,
      description: `${product.name} — limited stock at this price.`,
      productIds: [product.id],
      discountValue: template.discount,
      discountType: 'percentage',
      minPurchase: 0,
      startDate: new Date(),
      endDate: hoursFromNow(template.hours),
      isActive: true,
      isPaused: false,
      maxInventory: template.maxInv,
      currentInventory: template.curInv,
      showAsDeal: true,
      showOnHomePage: true,
      showOnCategoryPage: true,
      boostInSearch: true,
    });

    PromotionService.promotions.push(promotion);
    seeded++;
  }

  console.log(`✅ Seeded ${seeded} flash deals`);
}
