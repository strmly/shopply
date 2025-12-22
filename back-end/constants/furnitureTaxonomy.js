/**
 * Furniture Marketplace Taxonomy
 * Comprehensive categories, attributes, and constants for furniture domain
 */

// Room categories (primary navigation)
export const ROOMS = {
  LIVING: {
    id: 'living',
    label: 'Living Room',
    icon: '🛋️',
    description: 'Sofas, coffee tables, TV stands, and more',
  },
  BEDROOM: {
    id: 'bedroom',
    label: 'Bedroom',
    icon: '🛏️',
    description: 'Beds, mattresses, wardrobes, nightstands',
  },
  OFFICE: {
    id: 'office',
    label: 'Office',
    icon: '💼',
    description: 'Desks, chairs, shelving, and storage',
  },
  DINING: {
    id: 'dining',
    label: 'Dining',
    icon: '🍽️',
    description: 'Dining tables, chairs, and storage',
  },
  OUTDOOR: {
    id: 'outdoor',
    label: 'Outdoor',
    icon: '🌳',
    description: 'Patio furniture, garden sets, outdoor decor',
  },
  KIDS: {
    id: 'kids',
    label: 'Kids',
    icon: '🧸',
    description: 'Kids beds, storage, desks, and play furniture',
  },
};

// Furniture categories by room
export const FURNITURE_CATEGORIES = {
  // Living Room
  sofa: { id: 'sofa', label: 'Sofa', room: 'living', requiresDimensions: true },
  'sectional-sofa': { id: 'sectional-sofa', label: 'Sectional Sofa', room: 'living', requiresDimensions: true },
  armchair: { id: 'armchair', label: 'Armchair', room: 'living', requiresDimensions: true },
  'coffee-table': { id: 'coffee-table', label: 'Coffee Table', room: 'living', requiresDimensions: true },
  'side-table': { id: 'side-table', label: 'Side Table', room: 'living', requiresDimensions: true },
  'tv-stand': { id: 'tv-stand', label: 'TV Stand', room: 'living', requiresDimensions: true },
  'entertainment-unit': { id: 'entertainment-unit', label: 'Entertainment Unit', room: 'living', requiresDimensions: true },
  bookshelf: { id: 'bookshelf', label: 'Bookshelf', room: 'living', requiresDimensions: true },
  ottoman: { id: 'ottoman', label: 'Ottoman', room: 'living', requiresDimensions: false },
  
  // Bedroom
  bed: { id: 'bed', label: 'Bed', room: 'bedroom', requiresDimensions: true },
  mattress: { id: 'mattress', label: 'Mattress', room: 'bedroom', requiresDimensions: true },
  wardrobe: { id: 'wardrobe', label: 'Wardrobe', room: 'bedroom', requiresDimensions: true },
  dresser: { id: 'dresser', label: 'Dresser', room: 'bedroom', requiresDimensions: true },
  nightstand: { id: 'nightstand', label: 'Nightstand', room: 'bedroom', requiresDimensions: true },
  'chest-of-drawers': { id: 'chest-of-drawers', label: 'Chest of Drawers', room: 'bedroom', requiresDimensions: true },
  'bedside-table': { id: 'bedside-table', label: 'Bedside Table', room: 'bedroom', requiresDimensions: true },
  
  // Office
  desk: { id: 'desk', label: 'Desk', room: 'office', requiresDimensions: true },
  'office-chair': { id: 'office-chair', label: 'Office Chair', room: 'office', requiresDimensions: true },
  'filing-cabinet': { id: 'filing-cabinet', label: 'Filing Cabinet', room: 'office', requiresDimensions: true },
  shelving: { id: 'shelving', label: 'Shelving', room: 'office', requiresDimensions: true },
  'storage-unit': { id: 'storage-unit', label: 'Storage Unit', room: 'office', requiresDimensions: true },
  
  // Dining
  'dining-table': { id: 'dining-table', label: 'Dining Table', room: 'dining', requiresDimensions: true },
  'dining-chair': { id: 'dining-chair', label: 'Dining Chair', room: 'dining', requiresDimensions: false },
  'bar-stool': { id: 'bar-stool', label: 'Bar Stool', room: 'dining', requiresDimensions: false },
  'kitchen-island': { id: 'kitchen-island', label: 'Kitchen Island', room: 'dining', requiresDimensions: true },
  sideboard: { id: 'sideboard', label: 'Sideboard', room: 'dining', requiresDimensions: true },
  
  // Outdoor
  'patio-set': { id: 'patio-set', label: 'Patio Set', room: 'outdoor', requiresDimensions: true },
  'outdoor-sofa': { id: 'outdoor-sofa', label: 'Outdoor Sofa', room: 'outdoor', requiresDimensions: true },
  'outdoor-table': { id: 'outdoor-table', label: 'Outdoor Table', room: 'outdoor', requiresDimensions: true },
  'garden-bench': { id: 'garden-bench', label: 'Garden Bench', room: 'outdoor', requiresDimensions: true },
  'sun-lounger': { id: 'sun-lounger', label: 'Sun Lounger', room: 'outdoor', requiresDimensions: true },
  
  // Kids
  'kids-bed': { id: 'kids-bed', label: 'Kids Bed', room: 'kids', requiresDimensions: true },
  'bunk-bed': { id: 'bunk-bed', label: 'Bunk Bed', room: 'kids', requiresDimensions: true },
  'kids-desk': { id: 'kids-desk', label: 'Kids Desk', room: 'kids', requiresDimensions: true },
  'toy-storage': { id: 'toy-storage', label: 'Toy Storage', room: 'kids', requiresDimensions: true },
  'kids-chair': { id: 'kids-chair', label: 'Kids Chair', room: 'kids', requiresDimensions: false },
};

// Furniture styles
export const STYLES = [
  { id: 'modern', label: 'Modern' },
  { id: 'scandi', label: 'Scandinavian' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'mid-century', label: 'Mid-Century' },
  { id: 'contemporary', label: 'Contemporary' },
  { id: 'rustic', label: 'Rustic' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'bohemian', label: 'Bohemian' },
];

// Material types
export const MATERIALS = [
  { id: 'wood', label: 'Wood' },
  { id: 'metal', label: 'Metal' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'leather', label: 'Leather' },
  { id: 'glass', label: 'Glass' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'rattan', label: 'Rattan' },
  { id: 'wicker', label: 'Wicker' },
  { id: 'marble', label: 'Marble' },
  { id: 'composite', label: 'Composite' },
];

// Condition types
export const CONDITIONS = [
  { id: 'new', label: 'New', description: 'Brand new, never used' },
  { id: 'like-new', label: 'Like New', description: 'Gently used, excellent condition' },
  { id: 'used', label: 'Used', description: 'Previously used, good condition' },
  { id: 'refurbished', label: 'Refurbished', description: 'Restored to good condition' },
];

// Colors
export const COLORS = [
  { id: 'white', label: 'White', hex: '#FFFFFF' },
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'gray', label: 'Gray', hex: '#808080' },
  { id: 'brown', label: 'Brown', hex: '#8B4513' },
  { id: 'beige', label: 'Beige', hex: '#F5F5DC' },
  { id: 'blue', label: 'Blue', hex: '#0000FF' },
  { id: 'green', label: 'Green', hex: '#008000' },
  { id: 'navy', label: 'Navy', hex: '#000080' },
  { id: 'cream', label: 'Cream', hex: '#FFFDD0' },
  { id: 'charcoal', label: 'Charcoal', hex: '#36454F' },
  { id: 'natural', label: 'Natural Wood', hex: '#D2691E' },
];

// Stock types
export const STOCK_TYPES = [
  { id: 'in_stock', label: 'In Stock', badge: 'In Stock' },
  { id: 'limited', label: 'Limited Stock', badge: 'Only Few Left' },
  { id: 'made_to_order', label: 'Made to Order', badge: 'Made to Order' },
  { id: 'preorder', label: 'Pre-order', badge: 'Pre-order' },
];

// Delivery modes
export const DELIVERY_MODES = [
  { id: 'pickup', label: 'Pickup', icon: '🏪' },
  { id: 'local_delivery', label: 'Local Delivery', icon: '🚚' },
  { id: 'courier_freight', label: 'Courier/Freight', icon: '📦' },
];

// Store types
export const STORE_TYPES = [
  { id: 'retailer', label: 'Retailer', description: 'Furniture store or showroom' },
  { id: 'maker', label: 'Maker', description: 'Custom furniture maker' },
  { id: 'reseller', label: 'Reseller', description: 'Second-hand furniture dealer' },
  { id: 'showroom', label: 'Showroom', description: 'Display and order showroom' },
];

// Lead time profiles
export const LEAD_TIME_PROFILES = [
  { id: 'same_day', label: 'Same Day', daysMin: 0, daysMax: 0 },
  { id: 'next_day', label: 'Next Day', daysMin: 1, daysMax: 1 },
  { id: '2-3_days', label: '2-3 Days', daysMin: 2, daysMax: 3 },
  { id: '3-7_days', label: '3-7 Days', daysMin: 3, daysMax: 7 },
  { id: '1-2_weeks', label: '1-2 Weeks', daysMin: 7, daysMax: 14 },
  { id: 'custom', label: 'Custom', daysMin: null, daysMax: null },
];

// Furniture-specific badges
export const FURNITURE_BADGES = {
  TOP_RATED_SELLER: { type: 'seller', text: 'Top Rated Seller', color: 'gold' },
  FAST_DELIVERY: { type: 'delivery', text: 'Fast Local Delivery', color: 'blue' },
  VERIFIED_PICKUP: { type: 'pickup', text: 'Verified Pickup', color: 'green' },
  ASSEMBLY_AVAILABLE: { type: 'service', text: 'Assembly Available', color: 'purple' },
  NEW_ARRIVAL: { type: 'product', text: 'New Arrival', color: 'orange' },
  VINTAGE: { type: 'style', text: 'Vintage', color: 'brown' },
  ECO_FRIENDLY: { type: 'product', text: 'Eco-Friendly', color: 'green' },
  CUSTOM_MADE: { type: 'product', text: 'Custom Made', color: 'indigo' },
};

// Bed sizes (for beds and mattresses)
export const BED_SIZES = [
  { id: 'single', label: 'Single', width: 90, length: 188 },
  { id: 'three-quarter', label: 'Three Quarter', width: 107, length: 188 },
  { id: 'double', label: 'Double', width: 137, length: 188 },
  { id: 'queen', label: 'Queen', width: 152, length: 188 },
  { id: 'king', label: 'King', width: 183, length: 188 },
  { id: 'super-king', label: 'Super King', width: 203, length: 203 },
];

// Seating capacity (for sofas, dining tables)
export const SEATING_CAPACITY = [
  { id: '1', label: '1 Seater' },
  { id: '2', label: '2 Seater' },
  { id: '3', label: '3 Seater' },
  { id: '4', label: '4 Seater' },
  { id: '5-6', label: '5-6 Seater' },
  { id: '7+', label: '7+ Seater' },
];

// Price ranges (for filtering)
export const PRICE_RANGES = [
  { id: 'under-1000', label: 'Under R1,000', min: 0, max: 1000 },
  { id: '1000-2500', label: 'R1,000 - R2,500', min: 1000, max: 2500 },
  { id: '2500-5000', label: 'R2,500 - R5,000', min: 2500, max: 5000 },
  { id: '5000-10000', label: 'R5,000 - R10,000', min: 5000, max: 10000 },
  { id: '10000-20000', label: 'R10,000 - R20,000', min: 10000, max: 20000 },
  { id: 'over-20000', label: 'Over R20,000', min: 20000, max: null },
];

// Synonym dictionary for search
export const SEARCH_SYNONYMS = {
  sofa: ['couch', 'settee', 'lounge suite'],
  wardrobe: ['closet', 'armoire', 'cupboard'],
  dresser: ['chest of drawers', 'bureau'],
  nightstand: ['bedside table', 'night table'],
  'coffee-table': ['cocktail table', 'center table'],
  ottoman: ['footstool', 'pouf', 'pouffe'],
  bookshelf: ['bookcase', 'shelving unit'],
};

// Template requirements by category (for seller product upload)
export const CATEGORY_TEMPLATES = {
  sofa: {
    requiredFields: ['dimensions', 'materialPrimary', 'seatingCapacity', 'condition'],
    optionalFields: ['color', 'style', 'assemblyRequired'],
    minPhotos: 4,
    dimensionsRequired: true,
  },
  bed: {
    requiredFields: ['dimensions', 'materialPrimary', 'bedSize', 'condition'],
    optionalFields: ['color', 'style', 'assemblyRequired', 'includesMattress'],
    minPhotos: 4,
    dimensionsRequired: true,
  },
  desk: {
    requiredFields: ['dimensions', 'materialPrimary', 'condition'],
    optionalFields: ['color', 'style', 'assemblyRequired', 'cableManagement', 'drawers'],
    minPhotos: 4,
    dimensionsRequired: true,
  },
  'dining-table': {
    requiredFields: ['dimensions', 'materialPrimary', 'seatingCapacity', 'condition'],
    optionalFields: ['color', 'style', 'assemblyRequired', 'extendable'],
    minPhotos: 4,
    dimensionsRequired: true,
  },
};

// South African regions for seeding
export const SA_REGIONS = {
  johannesburg: {
    name: 'Johannesburg',
    center: { lat: -26.2041, lng: 28.0473 },
    suburbs: [
      { name: 'Sandton', lat: -26.1076, lng: 28.0567 },
      { name: 'Rosebank', lat: -26.1478, lng: 28.0406 },
      { name: 'Randburg', lat: -26.0939, lng: 27.9814 },
      { name: 'Fourways', lat: -26.0124, lng: 28.0081 },
      { name: 'Bryanston', lat: -26.0617, lng: 28.0188 },
      { name: 'Parkhurst', lat: -26.1454, lng: 28.0203 },
      { name: 'Melville', lat: -26.1788, lng: 28.0067 },
      { name: 'Greenside', lat: -26.1642, lng: 28.0354 },
    ],
  },
  pretoria: {
    name: 'Pretoria',
    center: { lat: -25.7479, lng: 28.2293 },
    suburbs: [
      { name: 'Centurion', lat: -25.8601, lng: 28.1888 },
      { name: 'Hatfield', lat: -25.7479, lng: 28.2368 },
      { name: 'Menlyn', lat: -25.7846, lng: 28.2774 },
      { name: 'Brooklyn', lat: -25.7624, lng: 28.2358 },
    ],
  },
  capeTown: {
    name: 'Cape Town',
    center: { lat: -33.9249, lng: 18.4241 },
    suburbs: [
      { name: 'CBD', lat: -33.9249, lng: 18.4241 },
      { name: 'Sea Point', lat: -33.9115, lng: 18.3890 },
      { name: 'Claremont', lat: -33.9818, lng: 18.4638 },
      { name: 'Camps Bay', lat: -33.9530, lng: 18.3773 },
      { name: 'Constantia', lat: -34.0243, lng: 18.4272 },
      { name: 'Observatory', lat: -33.9373, lng: 18.4767 },
    ],
  },
  durban: {
    name: 'Durban',
    center: { lat: -29.8587, lng: 31.0218 },
    suburbs: [
      { name: 'Umhlanga', lat: -29.7289, lng: 31.0820 },
      { name: 'Morningside', lat: -29.8238, lng: 31.0047 },
      { name: 'Berea', lat: -29.8478, lng: 31.0096 },
      { name: 'Glenwood', lat: -29.8667, lng: 30.9833 },
    ],
  },
  gqeberha: {
    name: 'Gqeberha (Port Elizabeth)',
    center: { lat: -33.9608, lng: 25.6022 },
    suburbs: [
      { name: 'Summerstrand', lat: -33.9833, lng: 25.6500 },
      { name: 'Walmer', lat: -33.9667, lng: 25.5833 },
      { name: 'Newton Park', lat: -33.9667, lng: 25.5667 },
    ],
  },
};

export default {
  ROOMS,
  FURNITURE_CATEGORIES,
  STYLES,
  MATERIALS,
  CONDITIONS,
  COLORS,
  STOCK_TYPES,
  DELIVERY_MODES,
  STORE_TYPES,
  LEAD_TIME_PROFILES,
  FURNITURE_BADGES,
  BED_SIZES,
  SEATING_CAPACITY,
  PRICE_RANGES,
  SEARCH_SYNONYMS,
  CATEGORY_TEMPLATES,
  SA_REGIONS,
};

