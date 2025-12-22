/**
 * Real Furniture Product Templates
 * Contains actual furniture names, descriptions, and attributes
 * Used for seeding the database with realistic products
 */

export const FURNITURE_PRODUCT_TEMPLATES = {
  // ========== LIVING ROOM ==========
  'sofas': {
    products: [
      {
        names: [
          'Modern L-Shaped Sectional Sofa',
          'Contemporary Corner Sofa',
          'Large Family Sectional',
          'Modular L-Shape Couch',
          'Spacious Corner Sectional'
        ],
        descriptions: [
          'Spacious L-shaped sectional sofa perfect for family gatherings. Features high-density foam cushioning, durable upholstery, and a sturdy hardwood frame. Comfortable seating for 6-7 people.',
          'Contemporary corner sofa with plush seating and modern design. Built with premium materials for long-lasting comfort. Ideal for large living rooms and entertaining guests.',
          'Large family sectional with reversible chaise lounge. Features removable cushion covers for easy cleaning. Solid wood frame construction ensures durability.'
        ],
        searchTerms: ['modern sectional sofa', 'l-shaped couch', 'corner sofa', 'family sectional'],
        dimensions: { w: [240, 280], d: [160, 200], h: [85, 95] },
        priceRange: [8000, 18000],
      },
      {
        names: [
          '3-Seater Fabric Sofa',
          'Classic Three Seater Couch',
          'Mid-Century 3-Seater Sofa',
          'Contemporary 3-Seat Sofa',
          'Modern Fabric Couch'
        ],
        descriptions: [
          'Elegant 3-seater sofa with premium fabric upholstery. Features button-tufted backrest, tapered wooden legs, and deep cushions for comfort. Perfect for medium-sized living rooms.',
          'Classic three-seater couch with timeless design. High-quality fabric covering and firm foam cushioning. Easy to maintain and built to last.',
          'Mid-century modern 3-seater sofa with clean lines. Comfortable seating with durable construction. Adds style and comfort to any living space.'
        ],
        searchTerms: ['3 seater sofa', 'fabric couch', 'living room sofa', 'three seater'],
        dimensions: { w: [180, 210], d: [80, 95], h: [85, 95] },
        priceRange: [5000, 12000],
      },
      {
        names: [
          'Leather Recliner Sofa',
          'Premium Leather Reclining Couch',
          'Electric Recliner Sofa Set',
          'Luxury Leather Recliner',
          'Power Reclining Sofa'
        ],
        descriptions: [
          'Premium leather recliner sofa with electric mechanism. Features USB charging ports, cup holders, and adjustable headrests. Top-grain leather upholstery with excellent comfort.',
          'Luxury leather reclining couch with manual or power recline options. Built-in storage console and reading lights. Perfect for movie nights and relaxation.',
          'Electric recliner sofa with memory foam cushioning. Genuine leather covering that ages beautifully. Contemporary design meets ultimate comfort.'
        ],
        searchTerms: ['leather recliner', 'reclining sofa', 'power recliner', 'luxury sofa'],
        dimensions: { w: [190, 220], d: [90, 105], h: [95, 105] },
        priceRange: [12000, 25000],
      },
      {
        names: [
          'Velvet Chesterfield Sofa',
          'Tufted Velvet Chesterfield',
          'Classic Chesterfield Couch',
          'Button-Tufted Velvet Sofa',
          'Elegant Chesterfield'
        ],
        descriptions: [
          'Elegant Chesterfield sofa with deep button tufting and luxurious velvet upholstery. Features scrolled arms and nailhead trim. A timeless piece that adds sophistication to any room.',
          'Classic Chesterfield design with plush velvet fabric. Hand-tufted buttons and solid wood frame. Available in various rich colors.',
          'Luxurious velvet Chesterfield with traditional English styling. Premium craftsmanship with attention to detail. Makes a stunning centerpiece.'
        ],
        searchTerms: ['chesterfield sofa', 'velvet sofa', 'tufted couch', 'elegant sofa'],
        dimensions: { w: [180, 210], d: [85, 95], h: [75, 85] },
        priceRange: [8000, 18000],
      },
      {
        names: [
          'Sleeper Sofa Bed',
          'Convertible Sofa Bed',
          'Pull-Out Couch',
          'Sofa Bed with Storage',
          'Guest Sleeper Sofa'
        ],
        descriptions: [
          'Versatile sleeper sofa that converts to a comfortable bed. Features easy pull-out mechanism and memory foam mattress. Perfect for guests and small spaces.',
          'Convertible sofa bed with hidden storage compartment. Transforms quickly from sofa to bed. Durable construction with comfortable cushioning.',
          'Space-saving pull-out couch ideal for apartments. Stylish design with practical functionality. Includes quality mattress for overnight guests.'
        ],
        searchTerms: ['sleeper sofa', 'sofa bed', 'convertible couch', 'guest bed'],
        dimensions: { w: [180, 200], d: [90, 100], h: [85, 95] },
        priceRange: [6000, 14000],
      }
    ]
  },

  'coffee-tables': {
    products: [
      {
        names: [
          'Modern Glass Coffee Table',
          'Contemporary Glass Table',
          'Glass Top Coffee Table',
          'Chrome & Glass Table',
          'Tempered Glass Coffee Table'
        ],
        descriptions: [
          'Sleek modern coffee table with tempered glass top and chrome legs. Easy to clean and maintain. Perfect for contemporary living rooms.',
          'Contemporary glass coffee table with metal frame. Spacious surface for drinks and decor. Adds elegance to any seating area.',
          'Stylish glass-top coffee table with lower shelf for storage. Sturdy construction with smooth edges. Complements modern furniture.'
        ],
        searchTerms: ['glass coffee table', 'modern table', 'living room table'],
        dimensions: { w: [100, 130], d: [50, 70], h: [40, 50] },
        priceRange: [1500, 4000],
      },
      {
        names: [
          'Solid Wood Coffee Table',
          'Rustic Wooden Coffee Table',
          'Oak Coffee Table',
          'Reclaimed Wood Table',
          'Farmhouse Coffee Table'
        ],
        descriptions: [
          'Solid wood coffee table with natural finish. Features lower shelf for books and magazines. Durable construction with rustic charm.',
          'Handcrafted wooden coffee table made from reclaimed timber. Each piece is unique with natural wood grain patterns. Built to last generations.',
          'Classic oak coffee table with drawer storage. Smooth finish and traditional design. Adds warmth to living spaces.'
        ],
        searchTerms: ['wood coffee table', 'rustic table', 'wooden furniture'],
        dimensions: { w: [110, 140], d: [55, 75], h: [40, 50] },
        priceRange: [2500, 7000],
      },
      {
        names: [
          'Lift-Top Coffee Table',
          'Storage Coffee Table',
          'Multi-Function Table',
          'Coffee Table with Hidden Storage',
          'Convertible Lift Table'
        ],
        descriptions: [
          'Innovative lift-top coffee table with hidden storage compartment. Top lifts smoothly for eating or working. Dual-function design perfect for small spaces.',
          'Multi-functional coffee table with storage underneath. Lift mechanism allows comfortable use while seated. Modern design with practical features.',
          'Convertible coffee table that adjusts to dining height. Ample hidden storage for blankets and items. Space-saving solution for apartments.'
        ],
        searchTerms: ['lift top table', 'storage coffee table', 'convertible table'],
        dimensions: { w: [100, 120], d: [50, 70], h: [40, 75] },
        priceRange: [3500, 8000],
      }
    ]
  },

  'tv-stands': {
    products: [
      {
        names: [
          'Modern TV Stand Entertainment Unit',
          'Media Console Table',
          'Contemporary TV Cabinet',
          'Entertainment Center',
          'TV Stand with Storage'
        ],
        descriptions: [
          'Modern TV stand with open shelving and closed cabinets. Cable management system keeps wires organized. Suitable for TVs up to 65 inches.',
          'Sleek media console with floating design. Multiple compartments for electronics and media. Contemporary style with clean lines.',
          'Entertainment center with ample storage for all your devices. Tempered glass doors and adjustable shelves. Accommodates large flat-screen TVs.'
        ],
        searchTerms: ['tv stand', 'media console', 'entertainment unit', 'tv cabinet'],
        dimensions: { w: [140, 180], d: [35, 45], h: [45, 60] },
        priceRange: [2500, 7000],
      }
    ]
  },

  'armchairs': {
    products: [
      {
        names: [
          'Accent Armchair',
          'Upholstered Reading Chair',
          'Modern Lounge Chair',
          'Velvet Accent Chair',
          'Contemporary Armchair'
        ],
        descriptions: [
          'Stylish accent armchair with plush cushioning. Perfect for reading nooks or living room corners. High-quality fabric upholstery with wooden legs.',
          'Comfortable upholstered chair with ergonomic design. Features wide armrests and supportive back. Adds personality to any room.',
          'Modern lounge chair with mid-century inspired design. Premium velvet covering and sturdy frame. Ideal for relaxation and style.'
        ],
        searchTerms: ['accent chair', 'armchair', 'lounge chair', 'reading chair'],
        dimensions: { w: [70, 85], d: [75, 90], h: [85, 95] },
        priceRange: [2000, 6000],
      }
    ]
  },

  // ========== BEDROOM ==========
  'beds': {
    products: [
      {
        names: [
          'King Size Upholstered Bed',
          'Luxury King Bed Frame',
          'Tufted King Size Bed',
          'King Platform Bed',
          'Designer King Bed'
        ],
        descriptions: [
          'Luxurious king size bed with upholstered headboard and footboard. Features button-tufted design and premium fabric. Includes sturdy slat support system.',
          'Elegant king bed frame with high headboard. Comfortable padding and neutral upholstery. Built with solid wood frame for durability.',
          'Modern king platform bed with clean lines. Low-profile design with padded headboard. No box spring required.'
        ],
        searchTerms: ['king bed', 'king size bed', 'upholstered bed', 'bedroom furniture'],
        dimensions: { w: [190, 200], d: [220, 230], h: [110, 130] },
        priceRange: [8000, 18000],
      },
      {
        names: [
          'Queen Size Bed Frame',
          'Queen Platform Bed',
          'Modern Queen Bed',
          'Upholstered Queen Bed',
          'Queen Sleigh Bed'
        ],
        descriptions: [
          'Queen size bed frame with upholstered headboard. Classic design with modern comfort. Solid construction with premium materials.',
          'Platform queen bed with built-in slats. No box spring needed. Contemporary style with padded headboard.',
          'Elegant queen sleigh bed with curved headboard and footboard. Traditional craftsmanship meets modern comfort. Available in multiple finishes.'
        ],
        searchTerms: ['queen bed', 'queen size bed', 'platform bed', 'bedroom set'],
        dimensions: { w: [160, 170], d: [210, 220], h: [100, 120] },
        priceRange: [6000, 14000],
      },
      {
        names: [
          'Storage Bed with Drawers',
          'Bed with Under-Bed Storage',
          'Captain\'s Storage Bed',
          'Hydraulic Storage Bed',
          'Platform Bed with Storage'
        ],
        descriptions: [
          'Smart storage bed with multiple drawers underneath. Maximizes bedroom space without sacrificing style. Smooth-gliding drawer mechanisms.',
          'Hydraulic lift storage bed with spacious compartment. Easy access to under-bed storage. Perfect for small bedrooms and apartments.',
          'Captain\'s bed with built-in storage drawers. Practical design with ample storage capacity. Solid construction with quality hardware.'
        ],
        searchTerms: ['storage bed', 'bed with drawers', 'space saving bed', 'ottoman bed'],
        dimensions: { w: [150, 190], d: [210, 230], h: [90, 110] },
        priceRange: [7000, 16000],
      },
      {
        names: [
          'Four Poster Canopy Bed',
          'Traditional Four Poster Bed',
          'Wooden Canopy Bed',
          'Classic Four Poster',
          'Statement Canopy Bed'
        ],
        descriptions: [
          'Majestic four poster bed with canopy frame. Solid wood construction with intricate details. Creates a luxurious bedroom centerpiece.',
          'Traditional four poster bed with timeless elegance. Hand-carved posts and quality craftsmanship. Available in dark wood or light finishes.',
          'Statement canopy bed that transforms your bedroom. Dramatic design with sturdy posts. Can be dressed with fabric drapes.'
        ],
        searchTerms: ['four poster bed', 'canopy bed', 'statement bed', 'luxury bed'],
        dimensions: { w: [170, 200], d: [220, 230], h: [200, 220] },
        priceRange: [12000, 28000],
      }
    ]
  },

  'wardrobes': {
    products: [
      {
        names: [
          '3-Door Sliding Wardrobe',
          'Triple Door Wardrobe with Mirror',
          'Sliding Door Closet',
          'Modern 3-Door Wardrobe',
          'Large Sliding Wardrobe'
        ],
        descriptions: [
          'Spacious 3-door sliding wardrobe with mirror panels. Features hanging rails, shelves, and drawers. Perfect for master bedrooms with ample storage needs.',
          'Modern sliding wardrobe with soft-close mechanism. Interior includes customizable shelving and hanging space. Mirror doors create illusion of space.',
          'Large wardrobe with three sliding doors. Efficient storage solution with contemporary design. Includes LED interior lighting.'
        ],
        searchTerms: ['wardrobe', 'sliding wardrobe', 'closet', 'bedroom storage'],
        dimensions: { w: [240, 280], d: [55, 65], h: [210, 240] },
        priceRange: [8000, 18000],
      },
      {
        names: [
          '2-Door Hinged Wardrobe',
          'Double Door Wardrobe',
          'Classic Two Door Closet',
          'Traditional Wardrobe',
          'Compact 2-Door Wardrobe'
        ],
        descriptions: [
          'Classic 2-door wardrobe with hanging space and shelves. Solid construction with smooth-opening doors. Ideal for smaller bedrooms.',
          'Double door wardrobe with internal drawers. Quality hinges and handles. Timeless design that fits any bedroom style.',
          'Compact wardrobe perfect for guest rooms. Features one hanging section and shelving. Affordable storage solution.'
        ],
        searchTerms: ['2 door wardrobe', 'double wardrobe', 'hinged wardrobe'],
        dimensions: { w: [100, 120], d: [55, 65], h: [190, 220] },
        priceRange: [4000, 9000],
      }
    ]
  },

  'dressers': {
    products: [
      {
        names: [
          '6-Drawer Dresser',
          'Wide Chest of Drawers',
          'Bedroom Dresser Cabinet',
          'Double Dresser',
          'Modern 6-Drawer Chest'
        ],
        descriptions: [
          'Spacious 6-drawer dresser with smooth-gliding drawers. Quality construction with dovetail joints. Provides ample storage for clothing and accessories.',
          'Wide double dresser perfect for couples. Features soft-close drawer mechanisms. Contemporary design with durable finish.',
          'Modern chest of drawers with clean lines. Six deep drawers with metal runners. Solid build quality and stylish appearance.'
        ],
        searchTerms: ['dresser', 'chest of drawers', 'bedroom storage', '6 drawer dresser'],
        dimensions: { w: [130, 160], d: [45, 55], h: [85, 100] },
        priceRange: [3500, 8000],
      }
    ]
  },

  'nightstands': {
    products: [
      {
        names: [
          'Bedside Table with Drawers',
          'Nightstand with Storage',
          '2-Drawer Nightstand',
          'Modern Bedside Cabinet',
          'Bedroom Side Table'
        ],
        descriptions: [
          'Practical nightstand with two drawers and lower shelf. Perfect height for bedside use. Matches most bedroom furniture styles.',
          'Modern bedside table with USB charging ports. Convenient storage for nighttime essentials. Solid construction with smooth finish.',
          'Elegant nightstand with soft-close drawers. Features metal handles and sturdy legs. Available in multiple finishes.'
        ],
        searchTerms: ['nightstand', 'bedside table', 'side table', 'bedroom furniture'],
        dimensions: { w: [45, 55], d: [40, 50], h: [50, 60] },
        priceRange: [1200, 3500],
      }
    ]
  },

  // ========== DINING ==========
  'dining-tables': {
    products: [
      {
        names: [
          '6-Seater Dining Table',
          'Family Dining Table',
          'Rectangular Dining Table',
          'Solid Wood Dining Table',
          'Modern 6-Seat Table'
        ],
        descriptions: [
          'Spacious 6-seater dining table perfect for family meals. Solid wood construction with smooth finish. Seats up to 6-8 people comfortably.',
          'Classic rectangular dining table with sturdy legs. Generous surface area for dining and entertaining. Durable hardwood that lasts for years.',
          'Modern dining table with clean lines. Accommodates 6 dining chairs. Easy to clean and maintain.'
        ],
        searchTerms: ['dining table', '6 seater table', 'family table', 'dining furniture'],
        dimensions: { w: [160, 180], d: [90, 100], h: [75, 78] },
        priceRange: [5000, 12000],
      },
      {
        names: [
          'Extendable Dining Table',
          'Expandable Table',
          'Extension Dining Table',
          'Butterfly Leaf Table',
          'Adjustable Dining Table'
        ],
        descriptions: [
          'Versatile extendable dining table that grows with your needs. Seats 6-10 people when extended. Easy extension mechanism with butterfly leaf.',
          'Space-saving expandable table for everyday use and entertaining. Extends smoothly with hidden leaf storage. Solid construction with quality hardware.',
          'Adjustable dining table with drop-in extension. Perfect for growing families and dinner parties. Beautiful wood grain and finish.'
        ],
        searchTerms: ['extendable table', 'expandable dining table', 'extension table'],
        dimensions: { w: [140, 200], d: [85, 100], h: [75, 78] },
        priceRange: [7000, 16000],
      },
      {
        names: [
          'Round Dining Table',
          'Circular Dining Table',
          'Round Pedestal Table',
          'Modern Round Table',
          '4-6 Seater Round Table'
        ],
        descriptions: [
          'Elegant round dining table with pedestal base. Creates intimate dining experience. Seats 4-6 people comfortably.',
          'Modern circular table with smooth surface. No sharp corners makes it family-friendly. Stable pedestal design.',
          'Classic round table perfect for small to medium dining rooms. Easy conversation flow. Quality craftsmanship with beautiful finish.'
        ],
        searchTerms: ['round table', 'circular table', 'pedestal table', 'dining table'],
        dimensions: { w: [110, 140], d: [110, 140], h: [75, 78] },
        priceRange: [4500, 10000],
      }
    ]
  },

  'dining-chairs': {
    products: [
      {
        names: [
          'Upholstered Dining Chairs Set',
          'Padded Dining Chairs',
          'Fabric Dining Chair',
          'Comfortable Dining Seat',
          'Modern Dining Chairs'
        ],
        descriptions: [
          'Set of comfortable upholstered dining chairs. Padded seats and backrests for extended comfort. Sturdy wooden legs with quality fabric covering.',
          'Modern dining chairs with ergonomic design. Easy-clean fabric upholstery. Stackable for convenient storage.',
          'Elegant dining chairs with high backrests. Comfortable padding and durable construction. Available in various colors.'
        ],
        searchTerms: ['dining chairs', 'upholstered chairs', 'dining room chairs', 'chair set'],
        dimensions: { w: [45, 52], d: [50, 60], h: [90, 100] },
        priceRange: [800, 2500],
      }
    ]
  },

  // ========== OFFICE ==========
  'desks': {
    products: [
      {
        names: [
          'Executive Office Desk',
          'Large Work Desk',
          'Manager\'s Desk',
          'Professional Office Desk',
          'Executive Writing Desk'
        ],
        descriptions: [
          'Spacious executive desk with multiple drawers and cable management. Solid construction for professional workspace. Generous surface area for computer and paperwork.',
          'Large office desk with pedestal drawers. Features lockable file drawer for security. Premium finish and quality hardware.',
          'Professional desk with built-in storage solutions. Ample legroom and working surface. Classic design suitable for any office.'
        ],
        searchTerms: ['office desk', 'executive desk', 'work desk', 'professional desk'],
        dimensions: { w: [140, 180], d: [70, 80], h: [73, 76] },
        priceRange: [5000, 12000],
      },
      {
        names: [
          'L-Shaped Corner Desk',
          'Corner Office Desk',
          'L-Shape Computer Desk',
          'Executive L-Desk',
          'Modern Corner Workstation'
        ],
        descriptions: [
          'Efficient L-shaped desk that maximizes corner space. Provides expansive work surface for multiple monitors. Built-in cable management and storage.',
          'Corner desk with reversible configuration. Perfect for home offices and professional spaces. Sturdy construction with modern aesthetics.',
          'Modern L-desk with keyboard tray and shelving. Optimizes workflow with dual work surfaces. Easy assembly with quality materials.'
        ],
        searchTerms: ['l shaped desk', 'corner desk', 'l desk', 'home office desk'],
        dimensions: { w: [140, 160], d: [140, 160], h: [73, 76] },
        priceRange: [6000, 14000],
      },
      {
        names: [
          'Standing Desk',
          'Height Adjustable Desk',
          'Sit-Stand Desk',
          'Electric Standing Desk',
          'Ergonomic Standing Desk'
        ],
        descriptions: [
          'Innovative standing desk with electric height adjustment. Promotes better posture and health. Memory presets for perfect heights.',
          'Sit-stand desk with smooth motorized lift mechanism. Wide range of height adjustments. Sturdy construction supports heavy equipment.',
          'Ergonomic standing desk with anti-collision feature. Easy-to-use controls and stable platform. Improves productivity and wellness.'
        ],
        searchTerms: ['standing desk', 'adjustable desk', 'sit stand desk', 'ergonomic desk'],
        dimensions: { w: [120, 160], d: [60, 75], h: [72, 125] },
        priceRange: [8000, 18000],
      },
      {
        names: [
          'Compact Study Desk',
          'Small Writing Desk',
          'Student Desk',
          'Home Office Desk',
          'Space-Saving Desk'
        ],
        descriptions: [
          'Compact desk perfect for small spaces and apartments. Features single drawer and shelf. Clean modern design with quality construction.',
          'Simple writing desk ideal for students and home use. Lightweight yet sturdy. Fits easily in bedrooms and study nooks.',
          'Space-saving desk with essential storage. Affordable and functional. Easy to assemble and move.'
        ],
        searchTerms: ['compact desk', 'small desk', 'study desk', 'writing desk'],
        dimensions: { w: [90, 120], d: [50, 60], h: [73, 76] },
        priceRange: [1500, 4500],
      }
    ]
  },

  'office-chairs': {
    products: [
      {
        names: [
          'Ergonomic Office Chair',
          'Executive Mesh Chair',
          'High-Back Office Chair',
          'Professional Desk Chair',
          'Adjustable Office Chair'
        ],
        descriptions: [
          'Premium ergonomic chair with lumbar support and adjustable features. Breathable mesh back and padded seat. Perfect for long work hours.',
          'Executive high-back chair with multiple adjustment options. Features headrest, armrests, and tilt mechanism. Professional appearance with comfort.',
          'Professional desk chair with ergonomic design. Supports healthy posture and reduces back pain. Durable construction with 5-year warranty.'
        ],
        searchTerms: ['office chair', 'desk chair', 'ergonomic chair', 'computer chair'],
        dimensions: { w: [60, 70], d: [60, 70], h: [110, 130] },
        priceRange: [2000, 6000],
      }
    ]
  },

  'bookcases': {
    products: [
      {
        names: [
          'Tall Bookshelf',
          '5-Tier Bookcase',
          'Open Shelving Unit',
          'Display Bookcase',
          'Modern Bookshelf'
        ],
        descriptions: [
          'Tall bookshelf with five adjustable shelves. Perfect for books, decor, and storage. Solid construction with anti-tip hardware.',
          'Open bookcase with ample display space. Modern design fits any room. Easy assembly with quality materials.',
          'Versatile shelving unit for home or office. Sturdy build supports heavy books. Available in multiple finishes.'
        ],
        searchTerms: ['bookshelf', 'bookcase', 'shelving unit', 'display shelf'],
        dimensions: { w: [80, 100], d: [30, 40], h: [170, 200] },
        priceRange: [2000, 5500],
      }
    ]
  },

  // ========== OUTDOOR ==========
  'patio-sets': {
    products: [
      {
        names: [
          'Outdoor Patio Dining Set',
          'Garden Furniture Set',
          '6-Seater Patio Set',
          'Outdoor Dining Furniture',
          'Weather-Resistant Patio Set'
        ],
        descriptions: [
          'Complete outdoor dining set with table and 6 chairs. Weather-resistant materials built for South African climate. Perfect for entertaining outdoors.',
          'Garden furniture set with UV-resistant finish. Comfortable seating with easy-clean surfaces. Durable construction for year-round use.',
          'Elegant patio set that transforms outdoor spaces. Includes cushions for comfort. Easy maintenance and long-lasting.'
        ],
        searchTerms: ['patio set', 'outdoor furniture', 'garden furniture', 'outdoor dining'],
        dimensions: { w: [150, 180], d: [90, 100], h: [75, 78] },
        priceRange: [6000, 15000],
      }
    ]
  },

  // ========== KIDS ==========
  'kids-beds': {
    products: [
      {
        names: [
          'Single Kids Bed',
          'Children\'s Bed Frame',
          'Junior Bed',
          'Toddler Bed',
          'Kids Platform Bed'
        ],
        descriptions: [
          'Safe and sturdy single bed designed for children. Low height for easy access. Colorful design kids will love.',
          'Junior bed frame with safety rails. Quality construction with rounded edges. Perfect transition from crib to big kid bed.',
          'Fun kids bed with character design. Durable materials and child-safe finish. Makes bedtime exciting.'
        ],
        searchTerms: ['kids bed', 'children bed', 'toddler bed', 'junior bed'],
        dimensions: { w: [90, 100], d: [190, 200], h: [60, 80] },
        priceRange: [2500, 6000],
      },
      {
        names: [
          'Bunk Bed',
          'Twin Bunk Bed',
          'Space-Saving Bunk Bed',
          'Kids Bunk Beds',
          'Wooden Bunk Bed'
        ],
        descriptions: [
          'Sturdy bunk bed perfect for siblings or sleepovers. Solid wood construction with safety rails. Includes ladder with anti-slip steps.',
          'Space-saving twin bunk bed ideal for small bedrooms. Quality build meets safety standards. Can separate into two single beds.',
          'Classic wooden bunk bed with timeless design. Extra support slats and reinforced frame. Fun and practical sleeping solution.'
        ],
        searchTerms: ['bunk bed', 'twin bed', 'kids bunk', 'space saving bed'],
        dimensions: { w: [90, 100], d: [190, 200], h: [150, 170] },
        priceRange: [5000, 11000],
      }
    ]
  },

  'toy-storage': {
    products: [
      {
        names: [
          'Toy Storage Unit',
          'Kids Storage Organizer',
          'Toy Box with Bins',
          'Children\'s Storage Cabinet',
          'Multi-Bin Toy Organizer'
        ],
        descriptions: [
          'Colorful toy storage unit with multiple bins. Makes cleanup easy and fun. Durable plastic bins in various sizes.',
          'Kids organizer with labeled compartments. Encourages organization skills. Sturdy frame with easy-access bins.',
          'Practical toy storage solution for playrooms. Lightweight bins children can handle. Bright colors and child-friendly design.'
        ],
        searchTerms: ['toy storage', 'kids storage', 'toy organizer', 'toy box'],
        dimensions: { w: [80, 100], d: [35, 45], h: [80, 100] },
        priceRange: [1500, 4000],
      }
    ]
  },
};

// Pexels search terms for finding real furniture images
export const PEXELS_SEARCH_TERMS = {
  'sofas': ['modern sofa', 'sectional couch', 'living room sofa', 'fabric sofa', 'leather sofa'],
  'coffee-tables': ['coffee table', 'living room table', 'modern table', 'glass coffee table'],
  'tv-stands': ['tv stand', 'media console', 'entertainment center', 'tv cabinet'],
  'armchairs': ['armchair', 'accent chair', 'lounge chair', 'reading chair'],
  'beds': ['bed frame', 'bedroom bed', 'upholstered bed', 'platform bed', 'king bed'],
  'wardrobes': ['wardrobe', 'closet', 'armoire', 'bedroom storage'],
  'dressers': ['dresser', 'chest of drawers', 'bedroom dresser'],
  'nightstands': ['nightstand', 'bedside table', 'side table'],
  'dining-tables': ['dining table', 'dinner table', 'kitchen table', 'wood dining table'],
  'dining-chairs': ['dining chairs', 'kitchen chairs', 'dining room chairs'],
  'desks': ['office desk', 'work desk', 'computer desk', 'home office desk'],
  'office-chairs': ['office chair', 'desk chair', 'ergonomic chair', 'computer chair'],
  'bookcases': ['bookshelf', 'bookcase', 'shelving unit'],
  'patio-sets': ['patio furniture', 'outdoor dining', 'garden furniture'],
  'kids-beds': ['kids bed', 'children bed', 'bunk bed'],
  'toy-storage': ['toy storage', 'kids storage', 'toy organizer'],
};
