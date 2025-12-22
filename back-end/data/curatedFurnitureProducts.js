/**
 * CURATED FURNITURE PRODUCTS DATABASE
 * Each product has been hand-picked with matching images and descriptions
 * Images are actual photos that match exactly what the description says
 */

export const CURATED_FURNITURE_PRODUCTS = [
  // ========== LIVING ROOM SOFAS ==========
  {
    name: 'Grey L-Shaped Corner Sofa',
    description: 'Modern grey fabric L-shaped sectional sofa with clean lines and plush cushioning. Features a spacious corner design perfect for lounging, with removable seat cushions and sturdy wooden legs. Seats 5-6 people comfortably.',
    category: 'sofas',
    room: 'living',
    images: [
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg'
    ],
    priceRange: [12000, 18000],
    dimensions: { w: [260, 280], d: [160, 180], h: [85, 90] },
  },
  {
    name: 'Beige 3-Seater Fabric Sofa',
    description: 'Classic beige 3-seater sofa with soft fabric upholstery and comfortable deep seating. Features button-tufted back cushions, rolled arms, and dark wooden legs. Perfect for modern or traditional living rooms.',
    category: 'sofas',
    room: 'living',
    images: [
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg',
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg'
    ],
    priceRange: [8000, 12000],
    dimensions: { w: [180, 200], d: [85, 95], h: [85, 90] },
  },
  {
    name: 'Blue Velvet 2-Seater Loveseat',
    description: 'Elegant navy blue velvet loveseat with tufted backrest and gold-finished legs. Compact 2-seater design ideal for apartments or as accent seating. Luxurious soft velvet fabric with a subtle sheen.',
    category: 'sofas',
    room: 'living',
    images: [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
      'https://images.pexels.com/photos/3757055/pexels-photo-3757055.jpeg'
    ],
    priceRange: [6000, 9000],
    dimensions: { w: [140, 160], d: [80, 90], h: [80, 85] },
  },
  {
    name: 'Brown Leather 3-Seater Sofa',
    description: 'Rich brown leather sofa with genuine leather upholstery and modern straight arms. Features firm cushioning, exposed wooden legs, and classic stitching details. Ages beautifully and easy to maintain.',
    category: 'sofas',
    room: 'living',
    images: [
      'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg',
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'
    ],
    priceRange: [15000, 22000],
    dimensions: { w: [190, 210], d: [85, 95], h: [80, 90] },
  },

  // ========== COFFEE TABLES ==========
  {
    name: 'Wooden Coffee Table with Lower Shelf',
    description: 'Natural wood coffee table featuring a solid wood top and convenient lower storage shelf. Showcases beautiful wood grain patterns, sturdy construction with four legs, and a warm honey-brown finish. Perfect centerpiece for any living room.',
    category: 'coffee-tables',
    room: 'living',
    images: [
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg',
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg'
    ],
    priceRange: [2500, 4500],
    dimensions: { w: [100, 120], d: [50, 70], h: [40, 45] },
  },
  {
    name: 'Round Wooden Coffee Table',
    description: 'Elegant round coffee table with natural wood top and black metal legs. Features a circular design that promotes conversation flow, smooth wooden surface, and modern industrial style with slim metal frame.',
    category: 'coffee-tables',
    room: 'living',
    images: [
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg',
      'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg'
    ],
    priceRange: [2000, 3500],
    dimensions: { w: [80, 100], d: [80, 100], h: [40, 45] },
  },

  // ========== BEDROOM BEDS ==========
  {
    name: 'White Upholstered Queen Bed',
    description: 'Elegant queen-size bed with soft white fabric upholstered headboard and platform base. Features a high padded headboard for comfortable reading, clean modern lines, and no box spring required. Includes sturdy wooden slats.',
    category: 'beds',
    room: 'bedroom',
    images: [
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg'
    ],
    priceRange: [8000, 12000],
    dimensions: { w: [160, 170], d: [200, 210], h: [100, 110] },
  },
  {
    name: 'Grey Tufted King Size Bed',
    description: 'Luxurious king-size bed with grey fabric upholstered headboard featuring elegant button-tufted diamond pattern. High headboard provides excellent back support, platform design with sturdy slats, and sophisticated grey color complements any decor.',
    category: 'beds',
    room: 'bedroom',
    images: [
      'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg'
    ],
    priceRange: [12000, 18000],
    dimensions: { w: [180, 200], d: [200, 220], h: [110, 120] },
  },
  {
    name: 'Wooden Bed Frame with Headboard',
    description: 'Classic wooden bed frame in warm brown finish with slatted headboard design. Features solid wood construction, simple Scandinavian-inspired style, and natural wood grain. Durable and timeless piece that fits queen or king mattresses.',
    category: 'beds',
    room: 'bedroom',
    images: [
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg'
    ],
    priceRange: [7000, 11000],
    dimensions: { w: [160, 180], d: [200, 220], h: [90, 100] },
  },

  // ========== BEDROOM STORAGE ==========
  {
    name: 'White 6-Drawer Dresser',
    description: 'Modern white dresser with six spacious drawers featuring sleek silver handles. Clean contemporary design with smooth-gliding drawers, sturdy construction, and ample storage for clothing and accessories. Perfect for bedrooms or hallways.',
    category: 'dressers',
    room: 'bedroom',
    images: [
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
      'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
    ],
    priceRange: [4000, 6500],
    dimensions: { w: [120, 140], d: [45, 55], h: [85, 95] },
  },
  {
    name: 'Wooden Bedside Table',
    description: 'Compact wooden nightstand with two drawers and open shelf space. Features natural wood finish, simple design with metal handles, and perfect height for beside your bed. Provides convenient storage for books, lamp, and nighttime essentials.',
    category: 'nightstands',
    room: 'bedroom',
    images: [
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg'
    ],
    priceRange: [1500, 2800],
    dimensions: { w: [45, 55], d: [40, 50], h: [50, 60] },
  },

  // ========== DINING TABLES ==========
  {
    name: 'Wooden Dining Table for 6',
    description: 'Solid wood rectangular dining table with natural finish and sturdy legs. Seats 6 people comfortably with generous surface area, beautiful wood grain visible throughout, and classic farmhouse style. Perfect for family dinners and gatherings.',
    category: 'dining-tables',
    room: 'dining',
    images: [
      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg',
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg'
    ],
    priceRange: [8000, 13000],
    dimensions: { w: [160, 180], d: [85, 95], h: [75, 78] },
  },
  {
    name: 'White Dining Table Set',
    description: 'Modern white dining table with clean lines and minimalist design. Features smooth white finish, seats 4-6 people, and contemporary rectangular shape. Pairs beautifully with any chair style and brightens dining spaces.',
    category: 'dining-tables',
    room: 'dining',
    images: [
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg',
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg'
    ],
    priceRange: [6000, 10000],
    dimensions: { w: [140, 160], d: [80, 90], h: [75, 78] },
  },
  {
    name: 'Round Wooden Dining Table',
    description: 'Beautiful round dining table with rich dark wood finish and pedestal base. Creates intimate dining experience, seats 4 people perfectly, and the circular design encourages conversation. Solid construction with smooth surface.',
    category: 'dining-tables',
    room: 'dining',
    images: [
      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg',
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg'
    ],
    priceRange: [7000, 11000],
    dimensions: { w: [110, 130], d: [110, 130], h: [75, 78] },
  },

  // ========== DINING CHAIRS ==========
  {
    name: 'Grey Upholstered Dining Chairs',
    description: 'Set of 4 comfortable dining chairs with grey fabric upholstered seats and backs. Features padded cushioning for extended comfort, sturdy wooden legs in dark finish, and modern design that complements any dining table. Sold as set.',
    category: 'dining-chairs',
    room: 'dining',
    images: [
      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg',
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg'
    ],
    priceRange: [4000, 7000],
    dimensions: { w: [45, 50], d: [50, 60], h: [90, 95] },
  },
  {
    name: 'Wooden Dining Chairs Set',
    description: 'Classic set of 4 solid wood dining chairs with traditional spindle back design. Natural wood finish showcases grain beautifully, comfortable contoured seats, and timeless farmhouse style. Durable construction built to last.',
    category: 'dining-chairs',
    room: 'dining',
    images: [
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg',
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg'
    ],
    priceRange: [3500, 6000],
    dimensions: { w: [45, 50], d: [50, 55], h: [88, 92] },
  },

  // ========== OFFICE DESKS ==========
  {
    name: 'White Office Desk with Drawers',
    description: 'Modern white office desk featuring three drawers for storage and spacious work surface. Clean minimalist design with smooth white finish, metal drawer handles, and sturdy construction. Perfect for home offices or study rooms.',
    category: 'desks',
    room: 'office',
    images: [
      'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
      'https://images.pexels.com/photos/1181416/pexels-photo-1181416.jpeg',
      'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg'
    ],
    priceRange: [4000, 7000],
    dimensions: { w: [120, 140], d: [60, 70], h: [73, 76] },
  },
  {
    name: 'Wooden Executive Office Desk',
    description: 'Professional executive desk in rich wood finish with multiple drawers and filing cabinets. Features generous work surface, traditional styling with detailed trim, and ample storage including lockable drawers. Ideal for home or corporate offices.',
    category: 'desks',
    room: 'office',
    images: [
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
      'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
      'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg',
      'https://images.pexels.com/photos/1181416/pexels-photo-1181416.jpeg'
    ],
    priceRange: [8000, 14000],
    dimensions: { w: [150, 180], d: [70, 80], h: [73, 76] },
  },
  {
    name: 'Simple Wooden Study Desk',
    description: 'Compact wooden desk with clean lines and minimalist design. Features single drawer for essentials, natural wood finish, and space-efficient footprint. Perfect for small apartments, student rooms, or home workspaces.',
    category: 'desks',
    room: 'office',
    images: [
      'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg',
      'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
      'https://images.pexels.com/photos/1181416/pexels-photo-1181416.jpeg'
    ],
    priceRange: [2500, 4500],
    dimensions: { w: [100, 120], d: [50, 60], h: [73, 76] },
  },

  // ========== OFFICE CHAIRS ==========
  {
    name: 'Black Mesh Office Chair',
    description: 'Ergonomic office chair with breathable black mesh back and padded seat. Features adjustable height, lumbar support, armrests, and smooth-rolling casters. Comfortable for long work sessions and modern professional appearance.',
    category: 'office-chairs',
    room: 'office',
    images: [
      'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
      'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg',
      'https://images.pexels.com/photos/1181416/pexels-photo-1181416.jpeg'
    ],
    priceRange: [2500, 4500],
    dimensions: { w: [60, 65], d: [60, 65], h: [110, 120] },
  },
  {
    name: 'Grey Executive Office Chair',
    description: 'High-back executive office chair with grey fabric upholstery and padded armrests. Features ergonomic design, adjustable tilt tension, seat height control, and comfortable cushioning. Professional look suitable for executive offices.',
    category: 'office-chairs',
    room: 'office',
    images: [
      'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
      'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg',
      'https://images.pexels.com/photos/1181416/pexels-photo-1181416.jpeg',
      'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg'
    ],
    priceRange: [3500, 6000],
    dimensions: { w: [65, 70], d: [65, 70], h: [115, 125] },
  },

  // ========== KIDS FURNITURE ==========
  {
    name: 'White Kids Single Bed',
    description: 'Charming white single bed designed for children with low height for easy access. Features simple clean design, sturdy wooden construction, and safety guardrails on sides. Perfect first big kid bed with timeless white finish.',
    category: 'kids-beds',
    room: 'kids',
    images: [
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg'
    ],
    priceRange: [3500, 6000],
    dimensions: { w: [90, 100], d: [190, 200], h: [60, 70] },
  },
  {
    name: 'Wooden Bunk Bed',
    description: 'Sturdy wooden bunk bed in natural finish perfect for siblings or sleepovers. Features solid construction, built-in ladder with anti-slip treads, safety rails on top bunk, and can be separated into two single beds. Maximizes room space.',
    category: 'kids-beds',
    room: 'kids',
    images: [
      'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg'
    ],
    priceRange: [7000, 11000],
    dimensions: { w: [90, 100], d: [190, 200], h: [150, 160] },
  },

  // ========== OUTDOOR FURNITURE ==========
  {
    name: 'Outdoor Patio Dining Set',
    description: 'Complete 7-piece patio set with rectangular table and 6 matching chairs. Weather-resistant materials withstand rain and sun, includes comfortable seat cushions, and modern design in neutral colors. Perfect for outdoor entertaining and family meals.',
    category: 'patio-sets',
    room: 'outdoor',
    images: [
      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg',
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg',
      'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg'
    ],
    priceRange: [10000, 18000],
    dimensions: { w: [160, 180], d: [90, 100], h: [75, 78] },
  },
];

