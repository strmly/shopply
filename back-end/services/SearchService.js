import { ProductService } from './ProductService.js';

/**
 * Search Service
 * Handles semantic search, autocomplete, and intelligent ranking
 */
class SearchServiceClass {
  constructor() {
    this.recentSearches = []; // In production, store per user
    this.trendingSearches = [
      { query: 'Coke 2L', count: 87, location: 'Sandton', today: true },
      { query: 'Charcoal 5kg', count: 65, location: 'Sandton', today: true },
      { query: 'Fresh chicken', count: 52, location: 'Sandton', today: true },
      { query: 'Extension cables', count: 43, location: 'Sandton', today: true },
      { query: 'Milk special', count: 38, location: 'Sandton', today: true },
    ];
    this.repeatPurchases = []; // AI-predicted repeat purchases
  }

  /**
   * Get repeat purchases (AI-predicted)
   */
  async getRepeatPurchases(userId = null, location = null) {
    // In production, use ML model based on purchase history
    // For now, return common repeat purchase items
    const { products = [] } = await ProductService.getAllProducts();
    const commonRepeats = ['Milk', 'Eggs', 'Bread', 'Sugar', 'Rice', 'Tomato', 'Detergent'];
    
    return products
      .filter(p => commonRepeats.some(repeat => p.name.toLowerCase().includes(repeat.toLowerCase())))
      .slice(0, 6)
      .map(p => ({
        ...p,
        isRepeatPurchase: true,
      }));
  }

  /**
   * Get smart shortcuts (dynamic based on context)
   */
  getSmartShortcuts(location = null, timeOfDay = null) {
    const hour = timeOfDay || new Date().getHours();
    const shortcuts = [];

    // Time-based shortcuts
    if (hour >= 6 && hour <= 10) {
      shortcuts.push({ label: 'Breakfast essentials', icon: '🍳', filter: { category: 'Groceries' } });
    }
    if (hour >= 17 && hour <= 20) {
      shortcuts.push({ label: 'Braai essentials', icon: '🍗', filter: { category: 'Braai' } });
    }

    // Always available shortcuts
    shortcuts.push(
      { label: 'Under R50', icon: '💰', filter: { maxPrice: 50 } },
      { label: 'Fast delivery', icon: '⚡', filter: { fastDelivery: true } },
      { label: 'In Stock Now', icon: '✅', filter: { inStock: true } },
      { label: 'Deals only', icon: '🔥', filter: { onSale: true } },
      { label: 'Essentials near you', icon: '🏠', filter: { category: 'Groceries', maxDistance: 2 } }
    );

    return shortcuts.slice(0, 5);
  }

  /**
   * Semantic query expansion
   * Maps natural language to product categories and terms
   */
  expandQuery(query) {
    const lowerQuery = query.toLowerCase();
    const expansions = {
      'braai': ['braai', 'bbq', 'grill', 'barbecue'],
      'tong': ['tongs', 'braai tongs', 'grill tongs'],
      'pot': ['pot', 'potjie', 'cooking pot', 'saucepan'],
      'pap': ['pap', 'maize meal', 'mealie meal'],
      'milk': ['milk', 'dairy', 'fresh milk'],
      'chicken': ['chicken', 'poultry', 'fresh chicken'],
      'sugar': ['sugar', 'white sugar', 'brown sugar'],
      'cable': ['cable', 'charging cable', 'usb cable', 'extension cable'],
    };

    const expanded = [query];
    for (const [key, values] of Object.entries(expansions)) {
      if (lowerQuery.includes(key)) {
        expanded.push(...values);
      }
    }

    return [...new Set(expanded)];
  }

  /**
   * Search products with semantic matching
   */
  async searchProducts(query, filters = {}, location = null) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const expandedTerms = this.expandQuery(normalizedQuery);
    
    // Get all products
    const { products = [] } = await ProductService.getAllProducts();

    // Apply semantic search
    const scoredProducts = products.map(product => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDesc = (product.description || '').toLowerCase();
      const productCategory = (product.category || '').toLowerCase();

      // Exact match in name (highest score)
      if (productName.includes(normalizedQuery)) {
        score += 100;
      }

      // Expanded term matches
      expandedTerms.forEach(term => {
        if (productName.includes(term)) score += 50;
        if (productDesc.includes(term)) score += 30;
        if (productCategory.includes(term)) score += 20;
      });

      // Partial word matches
      const queryWords = normalizedQuery.split(' ');
      queryWords.forEach(word => {
        if (word.length > 2) {
          if (productName.includes(word)) score += 25;
          if (productDesc.includes(word)) score += 15;
        }
      });

      // Distance bonus (closer = higher score)
      if (location && product.storeLocation) {
        const distance = product.distance || 999;
        if (distance < 1) score += 30;
        else if (distance < 3) score += 20;
        else if (distance < 5) score += 10;
      }

      // Availability bonus
      if (product.stock === 'in') score += 15;
      else if (product.stock === 'low') score += 5;

      // Popularity bonus
      if (product.isTrending) score += 10;
      if (product.reviewCount > 20) score += 5;
      if (product.socialProof) score += 5; // "Bought X times today"

      // Discount bonus
      if (product.isFlashDeal || product.discount) score += 10;

      // Recency bonus (newly added items)
      if (product.isNew) score += 8;

      return { ...product, relevanceScore: score };
    });

    // Filter out zero-score results
    let results = scoredProducts.filter(p => p.relevanceScore > 0);

    // Apply filters
    if (filters.inStock) {
      results = results.filter(p => p.stock === 'in');
    }

    if (filters.lowStock) {
      results = results.filter(p => p.stock === 'low');
    }

    if (filters.onSale) {
      results = results.filter(p => p.discount || p.isFlashDeal);
    }

    if (filters.freeDelivery) {
      // In production, check delivery options
      results = results.filter(p => p.distance < 3);
    }

    if (filters.fastDelivery) {
      results = results.filter(p => p.distance < 2);
    }

    if (filters.maxDistance) {
      results = results.filter(p => !p.distance || p.distance <= filters.maxDistance);
    }

    if (filters.category) {
      results = results.filter(p => p.category === filters.category);
    }

    if (filters.minPrice) {
      results = results.filter(p => p.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      results = results.filter(p => p.price <= filters.maxPrice);
    }

    // Sort by relevance score, then by distance
    results.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      const distA = a.distance || 999;
      const distB = b.distance || 999;
      return distA - distB;
    });

    // Apply sort option
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'nearest':
          results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
          break;
        case 'price_asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          results.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          break;
        case 'rating':
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          // Keep relevance sort
          break;
      }
    }

    // Save to recent searches
    this.addRecentSearch(query);

    return results;
  }

  /**
   * Get autocomplete suggestions (4-layer system)
   */
  async getSuggestions(query, location = null) {
    if (!query || query.trim().length < 2) {
      return {
        directMatches: [],
        semanticMatches: [],
        storeMatches: [],
        contextualMatches: [],
      };
    }

    const normalizedQuery = query.toLowerCase().trim();
    const { products = [] } = await ProductService.getAllProducts();

    // Layer 1: Direct matches (predictive expansion)
    const directMatches = products
      .filter(p => {
        const name = p.name.toLowerCase();
        const words = name.split(' ');
        return name.includes(normalizedQuery) || 
               words.some(word => word.startsWith(normalizedQuery)) ||
               normalizedQuery.includes(words[0]);
      })
      .slice(0, 5)
      .map(p => ({
        type: 'product',
        label: p.name,
        secondary: `${p.storeName} • ${p.distance || 'N/A'}km`,
        icon: '🛍️',
        data: p,
      }));

    // Layer 2: Semantic matches (AI intent understanding)
    const semanticMatches = [];
    const semanticMap = {
      'braai': ['braai tongs', 'BBQ tools', 'grill utensils', 'charcoal', 'boerewors'],
      'meat': ['chicken', 'beef', 'lamb', 'pork', 'sausages'],
      'pizza': ['cheese', 'tomato sauce', 'dough', 'oregano', 'pepperoni'],
      'sugar': ['white sugar', 'brown sugar', 'sweetener'],
      'milk': ['dairy', 'fresh milk', 'long life milk'],
      'bread': ['loaf', 'rolls', 'buns'],
    };

    // Check for semantic matches
    for (const [key, values] of Object.entries(semanticMap)) {
      if (normalizedQuery.includes(key)) {
        values.forEach(term => {
          const matchingProducts = products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term)
          );
          if (matchingProducts.length > 0) {
            semanticMatches.push({
              type: 'semantic',
              label: term,
              secondary: `${matchingProducts.length} items available`,
              icon: '💡',
              data: { searchTerm: term },
            });
          }
        });
      }
    }

    // Also check categories
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(normalizedQuery)) {
        semanticMatches.push({
          type: 'category',
          label: cat,
          secondary: `Browse ${cat.toLowerCase()}`,
          icon: '📂',
          data: { category: cat },
        });
      }
    });

    // Layer 3: Store relevance
    const stores = [...new Set(products.map(p => p.storeName))];
    const storeMatches = stores
      .filter(store => store.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .map(store => {
        const storeProducts = products.filter(p => p.storeName === store);
        const avgDistance = storeProducts.reduce((sum, p) => sum + (p.distance || 0), 0) / storeProducts.length;
        const relevantProducts = storeProducts.filter(p => 
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.category.toLowerCase().includes(normalizedQuery)
        );
        return {
          type: 'store',
          label: store,
          secondary: `${relevantProducts.length} products • ${avgDistance.toFixed(1)}km away`,
          icon: '🏪',
          data: { storeName: store },
        };
      });

    // Layer 4: Contextual discovery
    const contextualMatches = [];
    
    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 17 && hour <= 20) {
      if (normalizedQuery.includes('meat') || normalizedQuery.includes('braai')) {
        contextualMatches.push({
          type: 'contextual',
          label: 'Specials on chicken today',
          secondary: 'Popular meat near you',
          icon: '🔥',
          data: { searchTerm: 'chicken specials' },
        });
      }
    }

    // Bundle suggestions
    if (normalizedQuery.includes('braai') || normalizedQuery.includes('meat')) {
      contextualMatches.push({
        type: 'contextual',
        label: 'Meat bundles',
        secondary: 'Save more with bundles',
        icon: '📦',
        data: { searchTerm: 'braai bundle' },
      });
    }

    // Popular near you
    const popularProducts = products
      .filter(p => p.isTrending || p.reviewCount > 20)
      .filter(p => 
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 2)
      .map(p => ({
        type: 'contextual',
        label: `Popular: ${p.name}`,
        secondary: `Trending in ${location?.suburb || 'your area'}`,
        icon: '⭐',
        data: p,
      }));

    contextualMatches.push(...popularProducts);

    return {
      directMatches: directMatches.slice(0, 5),
      semanticMatches: semanticMatches.slice(0, 4),
      storeMatches: storeMatches.slice(0, 3),
      contextualMatches: contextualMatches.slice(0, 3),
    };
  }

  /**
   * Add to recent searches
   */
  addRecentSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Remove if exists
    this.recentSearches = this.recentSearches.filter(s => s !== trimmed);
    // Add to front
    this.recentSearches.unshift(trimmed);
    // Keep only last 10
    this.recentSearches = this.recentSearches.slice(0, 10);
  }

  /**
   * Get recent searches
   */
  getRecentSearches() {
    return this.recentSearches.slice(0, 5);
  }

  /**
   * Clear a recent search by ID
   */
  clearRecentSearch(id) {
    this.recentSearches = this.recentSearches.filter(s => s.id !== parseInt(id));
  }

  /**
   * Remove recent search
   */
  removeRecentSearch(query) {
    this.recentSearches = this.recentSearches.filter(s => s !== query);
  }

  /**
   * Get trending searches
   */
  getTrendingSearches(location = null) {
    // Filter by location if provided
    if (location) {
      return this.trendingSearches
        .filter(t => !t.location || t.location === location.suburb || t.location === location.city)
        .slice(0, 5);
    }
    return this.trendingSearches.slice(0, 5);
  }

  /**
   * Search stores
   */
  async searchStores(query, filters = {}, location = null) {
    const { products = [] } = await ProductService.getAllProducts();
    const storeMap = new Map();

    products.forEach(product => {
      if (!storeMap.has(product.storeName)) {
        storeMap.set(product.storeName, {
          name: product.storeName,
          storeId: product.storeId,
          location: product.storeLocation,
          distance: product.distance,
          products: [],
          rating: 0,
          reviewCount: 0,
        });
      }

      const store = storeMap.get(product.storeName);
      store.products.push(product);
      if (product.rating) {
        store.rating = (store.rating * store.reviewCount + product.rating * product.reviewCount) / (store.reviewCount + product.reviewCount);
        store.reviewCount += product.reviewCount;
      }
    });

    let stores = Array.from(storeMap.values());

    // Filter by query
    if (query) {
      const normalizedQuery = query.toLowerCase();
      stores = stores.filter(store => 
        store.name.toLowerCase().includes(normalizedQuery)
      );
    }

    // Apply filters
    if (filters.maxDistance) {
      stores = stores.filter(s => !s.distance || s.distance <= filters.maxDistance);
    }

    // Sort
    if (filters.sortBy === 'nearest') {
      stores.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (filters.sortBy === 'rating') {
      stores.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return stores;
  }
}

// Export singleton instance
export const SearchService = new SearchServiceClass();

