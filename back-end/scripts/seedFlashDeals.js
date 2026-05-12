import { Promotion } from '../models/Promotion.js';
import { PromotionService } from '../services/PromotionService.js';

const now = () => new Date();
const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

const DEALS = [
  {
    title: 'Sectional Sofa Blowout',
    description: 'Premium corner sectional — only 8 left at this price.',
    productIds: [1],
    discountValue: 40,
    endDate: hoursFromNow(4),
    maxInventory: 8,
    currentInventory: 2,
  },
  {
    title: 'King Bed Frame Flash',
    description: 'Solid wood king frame, white-glove delivery included.',
    productIds: [2],
    discountValue: 35,
    endDate: hoursFromNow(6),
    maxInventory: 12,
    currentInventory: 3,
  },
  {
    title: 'Dining Table Lightning Deal',
    description: 'Extendable 6-seater oak dining table. Weekend deal.',
    productIds: [3],
    discountValue: 30,
    endDate: hoursFromNow(8),
    maxInventory: 15,
    currentInventory: 4,
  },
  {
    title: 'Ergonomic Office Chair Rush',
    description: 'Lumbar support mesh chair. Work-from-home essential.',
    productIds: [4],
    discountValue: 45,
    endDate: hoursFromNow(3),
    maxInventory: 20,
    currentInventory: 7,
  },
  {
    title: 'Bookcase Bundle Flash',
    description: 'Floor-to-ceiling solid bookcase, walnut finish.',
    productIds: [5],
    discountValue: 25,
    endDate: hoursFromNow(10),
    maxInventory: 10,
    currentInventory: 1,
  },
  {
    title: 'Accent Chair Steal',
    description: 'Velvet accent chair in sage — the one everyone wants.',
    productIds: [6],
    discountValue: 50,
    endDate: hoursFromNow(2),
    maxInventory: 5,
    currentInventory: 2,
  },
  {
    title: 'Standing Desk Flash',
    description: 'Electric height-adjustable desk, dual-motor lift.',
    productIds: [7],
    discountValue: 38,
    endDate: hoursFromNow(5),
    maxInventory: 18,
    currentInventory: 5,
  },
  {
    title: 'Coffee Table Clear-Out',
    description: 'Marble-top coffee table — only 6 units in stock.',
    productIds: [8],
    discountValue: 32,
    endDate: hoursFromNow(7),
    maxInventory: 6,
    currentInventory: 0,
  },
  {
    title: 'Wardrobe Flash Event',
    description: 'Sliding door wardrobe, 3-panel mirror finish.',
    productIds: [9],
    discountValue: 28,
    endDate: hoursFromNow(12),
    maxInventory: 25,
    currentInventory: 8,
  },
  {
    title: 'TV Console Lightning Drop',
    description: 'Floating media console with cable management.',
    productIds: [10],
    discountValue: 42,
    endDate: hoursFromNow(3.5),
    maxInventory: 14,
    currentInventory: 3,
  },
];

export async function seedFlashDeals() {
  if (PromotionService.promotions.some(p => p.type === 'flash')) {
    return; // already seeded
  }

  for (const deal of DEALS) {
    const promotion = new Promotion({
      id: PromotionService.nextId++,
      storeId: 1,
      sellerId: 1,
      type: 'flash',
      title: deal.title,
      description: deal.description,
      productIds: deal.productIds,
      discountValue: deal.discountValue,
      discountType: 'percentage',
      minPurchase: 0,
      startDate: now(),
      endDate: deal.endDate,
      isActive: true,
      isPaused: false,
      maxInventory: deal.maxInventory,
      currentInventory: deal.currentInventory,
      showAsDeal: true,
      showOnHomePage: true,
      showOnCategoryPage: true,
      boostInSearch: true,
    });

    PromotionService.promotions.push(promotion);
  }

  console.log(`✅ Seeded ${DEALS.length} flash deals`);
}
