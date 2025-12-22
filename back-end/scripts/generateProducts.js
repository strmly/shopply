// Generate 1000 Real Furniture Products
// Creates variations of real products with realistic data

const generateProducts = () => {
  const products = [];
  let id = 1;

  // Base product templates from real retailers
  const baseProducts = {
    // IKEA Products
    ikea: [
      {
        name: "KIVIK Sofa",
        category: "Living Room",
        subcategory: "Sofas",
        brand: "IKEA",
        basePrice: 949,
        description: "Comfortable sofa with generous size and low armrests. Pocket springs and foam cushions adapt to your body. Wide armrests provide extra seating space.",
        material: "Polyester fabric, pocket springs, high-resilience foam",
        dimensions: '89 3/4"W x 37 3/8"D x 32 5/8"H',
        warranty: "10 year limited warranty",
        features: ["Removable cover", "Machine washable", "Pocket springs"],
        imageBase: "https://www.ikea.com/us/en/images/products/kivik-sofa",
        colors: ["Gunnared Medium Gray", "Gunnared Beige", "Gunnared Blue", "Tallmyra Dark Green", "Kelinge Gray-Turquoise", "Tresund Anthracite"],
        variations: 6
      },
      {
        name: "EKTORP Sofa",
        category: "Living Room",
        subcategory: "Sofas",
        brand: "IKEA",
        basePrice: 649,
        description: "Classic sofa with timeless design and generous seating comfort. Removable, machine-washable cover. Pocket spring seat provides excellent support.",
        material: "Cotton/polyester blend, pocket springs, foam",
        dimensions: '85 3/8"W x 34 5/8"D x 34 5/8"H',
        warranty: "10 year limited warranty",
        features: ["Removable cover", "Classic design", "Pocket springs"],
        imageBase: "https://www.ikea.com/us/en/images/products/ektorp-sofa",
        colors: ["Lofallet Beige", "Vellinge White", "Blekinge White", "Nordvalla Dark Gray"],
        variations: 4
      },
      {
        name: "HEMNES Dresser",
        category: "Bedroom",
        subcategory: "Dressers",
        brand: "IKEA",
        basePrice: 329,
        description: "Traditional style dresser made of solid pine. Eight spacious drawers with smooth-running slides and soft-closing dampers.",
        material: "Solid pine, stain, clear acrylic lacquer",
        dimensions: '63"W x 19 5/8"D x 37"H',
        warranty: "10 year limited warranty",
        features: ["Solid pine", "Soft-closing drawers", "8 drawers"],
        imageBase: "https://www.ikea.com/us/en/images/products/hemnes-8-drawer-dresser",
        colors: ["White Stain", "Black-Brown", "Gray"],
        variations: 3
      },
      {
        name: "MALM Bed Frame",
        category: "Bedroom",
        subcategory: "Beds",
        brand: "IKEA",
        basePrice: 279,
        description: "Simple and clean-lined bed frame with adjustable bed sides. Low profile design. Features storage boxes that roll smoothly under the bed.",
        material: "Particleboard, fiberboard, ABS plastic",
        dimensions: 'Queen: 83 1/8"L x 64 1/8"W',
        warranty: "10 year limited warranty",
        features: ["Adjustable sides", "Under-bed storage", "Low profile"],
        imageBase: "https://www.ikea.com/us/en/images/products/malm-bed-frame",
        colors: ["White", "Black-Brown", "Oak Veneer"],
        sizes: ["Full", "Queen", "King"],
        variations: 9
      },
      {
        name: "LACK Coffee Table",
        category: "Living Room",
        subcategory: "Coffee Tables",
        brand: "IKEA",
        basePrice: 49.99,
        description: "Simple and functional coffee table with modern design. Lightweight yet stable with separate shelf for storage.",
        material: "Particleboard, acrylic paint",
        dimensions: '46 1/2"W x 30 3/4"D x 17 3/4"H',
        warranty: "1 year limited warranty",
        features: ["Storage shelf", "Lightweight", "Easy assembly"],
        imageBase: "https://www.ikea.com/us/en/images/products/lack-coffee-table",
        colors: ["Black-Brown", "White", "Gray", "Oak Effect"],
        variations: 4
      },
      {
        name: "BILLY Bookcase",
        category: "Office",
        subcategory: "Bookcases",
        brand: "IKEA",
        basePrice: 79.99,
        description: "Classic bookcase with adjustable shelves. Narrow design takes minimal floor space. Can be combined with other BILLY units.",
        material: "Particleboard, fiberboard, paper foil",
        dimensions: '31 1/2"W x 11"D x 79 1/2"H',
        warranty: "10 year limited warranty",
        features: ["Adjustable shelves", "Expandable system"],
        imageBase: "https://www.ikea.com/us/en/images/products/billy-bookcase",
        colors: ["White", "Black-Brown", "Birch Veneer", "Oak Veneer"],
        variations: 4
      },
      {
        name: "MICKE Desk",
        category: "Office",
        subcategory: "Desks",
        brand: "IKEA",
        basePrice: 99.99,
        description: "Compact desk with built-in cable management. Features drawer with smooth-running slides and hidden compartment for cords.",
        material: "Particleboard, fiberboard, ABS plastic",
        dimensions: '55 7/8"W x 19 5/8"D x 29 1/2"H',
        warranty: "10 year limited warranty",
        features: ["Cable management", "Compact", "Drawer storage"],
        imageBase: "https://www.ikea.com/us/en/images/products/micke-desk",
        colors: ["White", "Black-Brown", "Oak Effect"],
        variations: 3
      },
      {
        name: "MARKUS Office Chair",
        category: "Office",
        subcategory: "Office Chairs",
        brand: "IKEA",
        basePrice: 229,
        description: "Ergonomic office chair with built-in lumbar support and high backrest. Adjustable tilt tension. Mesh back keeps you cool.",
        material: "Mesh back, foam seat, aluminum base",
        dimensions: '24 3/8"W x 23 5/8"D x 53 1/8"H',
        warranty: "10 year limited warranty",
        features: ["Lumbar support", "Adjustable tilt", "Mesh back"],
        imageBase: "https://www.ikea.com/us/en/images/products/markus-office-chair",
        colors: ["Vissle Dark Gray", "Vissle Light Gray", "Glose Black"],
        variations: 3
      },
      {
        name: "INGATORP Dining Table",
        category: "Dining Room",
        subcategory: "Dining Tables",
        brand: "IKEA",
        basePrice: 349,
        description: "Versatile drop-leaf table that extends to seat up to 6. Traditional design with durable finish. Perfect for small spaces.",
        material: "Particleboard, fiberboard, acrylic paint",
        dimensions: '61-84 1/2"L x 34 1/4"W',
        warranty: "10 year limited warranty",
        features: ["Extendable", "Drop-leaf", "Seats up to 6"],
        imageBase: "https://www.ikea.com/us/en/images/products/ingatorp-extendable-table",
        colors: ["White", "Black", "Antique Stain"],
        variations: 3
      },
      {
        name: "TOBIAS Chair",
        category: "Dining Room",
        subcategory: "Dining Chairs",
        brand: "IKEA",
        basePrice: 79.99,
        description: "Modern transparent chair that creates an open, airy feel. Made from durable polycarbonate plastic. Stackable design.",
        material: "Polycarbonate plastic, steel",
        dimensions: '21 1/4"W x 21 5/8"D x 31 1/2"H',
        warranty: "1 year limited warranty",
        features: ["Transparent", "Stackable", "Easy to clean"],
        imageBase: "https://www.ikea.com/us/en/images/products/tobias-chair",
        colors: ["Clear/Chrome", "Gray/Chrome"],
        variations: 2
      }
    ],
    
    // West Elm Products
    westElm: [
      {
        name: "Mid-Century Storage Coffee Table",
        category: "Living Room",
        subcategory: "Coffee Tables",
        brand: "West Elm",
        basePrice: 599,
        description: "Mid-century-inspired coffee table with storage drawer and open shelf. Made from kiln-dried wood with tapered legs.",
        material: "Kiln-dried wood, wood veneer",
        dimensions: '47.5"W x 21"D x 16"H',
        warranty: "1 year warranty",
        features: ["Storage drawer", "Open shelf", "Sustainably sourced"],
        imageBase: "https://assets.weimgs.com/weimgs/ab/images/wcm/products/mid-century-storage-coffee-table",
        colors: ["Acorn", "Walnut", "Pecan"],
        sizes: ["42\"", "47.5\""],
        variations: 6
      },
      {
        name: "Mid-Century Upholstered Bed",
        category: "Bedroom",
        subcategory: "Beds",
        brand: "West Elm",
        basePrice: 1299,
        description: "Upholstered bed with sleek mid-century lines. Button-tufted headboard adds sophisticated detail. Solid wood legs.",
        material: "Polyester upholstery, solid wood, engineered wood",
        dimensions: 'Queen: 86"L x 64"W x 47"H',
        warranty: "1 year warranty",
        features: ["Button-tufted", "Mid-century design", "Solid wood"],
        imageBase: "https://assets.weimgs.com/weimgs/ab/images/wcm/products/mid-century-upholstered-bed",
        colors: ["Dove Gray", "Charcoal", "Blush Velvet"],
        sizes: ["Full", "Queen", "King"],
        variations: 9
      },
      {
        name: "Andes Sectional Sofa",
        category: "Living Room",
        subcategory: "Sofas",
        brand: "West Elm",
        basePrice: 2499,
        description: "Deep, plush sectional with low profile. Generous cushions provide sink-right-in comfort. Solid wood legs.",
        material: "Performance velvet, solid wood legs, foam",
        dimensions: '96"W x 61"D x 30"H',
        warranty: "1 year warranty",
        features: ["Deep seats", "Performance fabric", "Modern design"],
        imageBase: "https://assets.weimgs.com/weimgs/ab/images/wcm/products/andes-sectional",
        colors: ["Stone Gray", "Dusty Blush", "Asphalt"],
        configurations: ["2-Piece L", "3-Piece L", "U-Shaped"],
        variations: 9
      },
      {
        name: "Industrial Storage Desk",
        category: "Office",
        subcategory: "Desks",
        brand: "West Elm",
        basePrice: 699,
        description: "Industrial-inspired desk with metal base and wood top. Features drawers for storage. Clean, modern lines.",
        material: "Solid wood, metal",
        dimensions: '60"W x 24"D x 30"H',
        warranty: "1 year warranty",
        features: ["Storage drawers", "Industrial design", "Metal base"],
        imageBase: "https://assets.weimgs.com/weimgs/ab/images/wcm/products/industrial-desk",
        colors: ["Natural/Iron", "White/Bronze"],
        sizes: ["48\"", "60\""],
        variations: 4
      }
    ],
    
    // Wayfair-style products
    wayfair: [
      {
        name: "Corduroy Modular Sectional",
        category: "Living Room",
        subcategory: "Sofas",
        brand: "Wayfair",
        basePrice: 899,
        description: "Comfortable modular sectional with soft corduroy fabric. Configurable design allows custom arrangements. Deep seats for lounging.",
        material: "Corduroy upholstery, solid wood frame, foam",
        dimensions: '115"W x 82"D x 33"H',
        warranty: "1 year warranty",
        features: ["Modular", "Corduroy fabric", "Deep seats"],
        imageBase: "https://assets.wfcdn.com/im/products/sectional-corduroy",
        colors: ["Beige", "Gray", "Navy Blue", "Sage Green"],
        variations: 4
      },
      {
        name: "Velvet Accent Chair",
        category: "Living Room",
        subcategory: "Accent Chairs",
        brand: "Wayfair",
        basePrice: 349,
        description: "Elegant velvet accent chair with button tufting. Gold metal legs add glamorous touch. Perfect for living rooms or bedrooms.",
        material: "Velvet upholstery, metal legs, foam",
        dimensions: '29"W x 31"D x 32"H',
        warranty: "1 year warranty",
        features: ["Velvet fabric", "Button tufted", "Gold legs"],
        imageBase: "https://assets.wfcdn.com/im/products/velvet-accent-chair",
        colors: ["Emerald Green", "Navy Blue", "Blush Pink", "Gray"],
        variations: 4
      },
      {
        name: "Farmhouse Dining Table",
        category: "Dining Room",
        subcategory: "Dining Tables",
        brand: "Wayfair",
        basePrice: 599,
        description: "Rustic farmhouse table with solid wood construction. Seats 6-8 comfortably. Distressed finish adds character.",
        material: "Solid wood",
        dimensions: '72"L x 36"W x 30"H',
        warranty: "1 year warranty",
        features: ["Solid wood", "Farmhouse style", "Seats 6-8"],
        imageBase: "https://assets.wfcdn.com/im/products/farmhouse-dining-table",
        colors: ["Natural", "White", "Gray", "Espresso"],
        sizes: ["60\"", "72\"", "84\""],
        variations: 12
      }
    ]
  };

  // Generate variations for each base product
  Object.entries(baseProducts).forEach(([retailer, items]) => {
    items.forEach(base => {
      const colors = base.colors || ["Standard"];
      const sizes = base.sizes || ["Standard"];
      
      colors.forEach(color => {
        sizes.forEach(size => {
          const priceVariation = Math.random() * 100 - 50; // ±$50 variation
          const product = {
            id: id++,
            name: size !== "Standard" ? `${base.name} (${size})` : base.name,
            sku: `${retailer.toUpperCase()}-${id}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            category: base.category,
            subcategory: base.subcategory,
            brand: base.brand,
            price: parseFloat((base.basePrice + priceVariation).toFixed(2)),
            description: base.description,
            material: base.material,
            dimensions: size !== "Standard" ? base.dimensions.replace(/Queen:|Full:|King:/, `${size}:`) : base.dimensions,
            color: color,
            weight: `${Math.floor(Math.random() * 100 + 20)} lbs`,
            inStock: Math.random() > 0.1, // 90% in stock
            imageUrl: `${base.imageBase}-${color.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            images: [
              `${base.imageBase}-${color.toLowerCase().replace(/\s+/g, '-')}.jpg`,
              `${base.imageBase}-${color.toLowerCase().replace(/\s+/g, '-')}-angle.jpg`
            ],
            warranty: base.warranty,
            features: base.features,
            tags: [
              base.category.toLowerCase(),
              base.subcategory.toLowerCase(),
              color.toLowerCase().split(' ')[0],
              base.brand.toLowerCase()
            ],
            rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0
            reviewCount: Math.floor(Math.random() * 3000 + 100),
            retailerUrl: `https://${retailer}.com/products/${base.name.toLowerCase().replace(/\s+/g, '-')}`
          };
          
          products.push(product);
        });
      });
    });
  });

  // Fill remaining slots up to 1000 with additional variations
  while (products.length < 1000) {
    const randomBase = baseProducts[Object.keys(baseProducts)[Math.floor(Math.random() * 3)]];
    const item = randomBase[Math.floor(Math.random() * randomBase.length)];
    
    const priceVariation = Math.random() * 150 - 75;
    const colorVariation = Math.floor(Math.random() * 999);
    
    products.push({
      id: id++,
      name: `${item.name} ${colorVariation}`,
      sku: `GEN-${id}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      category: item.category,
      subcategory: item.subcategory,
      brand: item.brand,
      price: parseFloat((item.basePrice + priceVariation).toFixed(2)),
      description: item.description,
      material: item.material,
      dimensions: item.dimensions,
      color: `Variant ${colorVariation}`,
      weight: `${Math.floor(Math.random() * 100 + 20)} lbs`,
      inStock: Math.random() > 0.15,
      imageUrl: `${item.imageBase}-variant-${colorVariation}.jpg`,
      images: [`${item.imageBase}-variant-${colorVariation}.jpg`],
      warranty: item.warranty,
      features: item.features,
      tags: [item.category.toLowerCase(), item.subcategory.toLowerCase(), item.brand.toLowerCase()],
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 2000 + 50),
      retailerUrl: `https://${item.brand.toLowerCase()}.com/products/item-${id}`
    });
  }

  return products;
};

export { generateProducts };

// Export for use
if (import.meta.url === `file://${process.argv[1]}`) {
  const products = generateProducts();
  const fs = await import('fs');
  fs.writeFileSync('furniture-products-1000.json', JSON.stringify(products, null, 2));
  console.log(`✅ Generated ${products.length} products`);
  console.log(`💾 Saved to: furniture-products-1000.json`);
  
  // Statistics
  const stats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 By Category:');
  Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
}

