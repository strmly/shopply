import { ProductService } from './ProductService.js';

// Words that don't count as meaningful search terms
const STOP_WORDS = new Set(['and', 'the', 'a', 'an', 'in', 'of', 'for', 'to', 'with', 'on', 'at', 'by', 'from', 'room', 'style']);

// Strip common plural/verb suffixes to find the stem
function stem(word) {
  if (word.length < 4) return word;
  if (word.endsWith('ies') && word.length > 5) return word.slice(0, -3) + 'y';
  if (word.endsWith('ves') && word.length > 5) return word.slice(0, -3) + 'f';
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) return word.slice(0, -2);
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && word.length > 3 && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

// Levenshtein distance — used to tolerate 1-character typos
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let cur = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = cur;
      cur = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], cur);
      prev[j - 1] = temp;
    }
    prev[b.length] = cur;
  }
  return prev[b.length];
}

// Returns match type. allowFuzzy restricts fuzzy to name/subcategory/brand only.
function textMatch(text, term, stemmedTerm, allowFuzzy = false) {
  if (text.includes(term)) return 'exact';
  if (stemmedTerm !== term && text.includes(stemmedTerm)) return 'stem';
  // Fuzzy: only on trusted fields, only for terms ≥ 5 chars (prevents "soft"→"sofa" etc.)
  if (allowFuzzy && term.length >= 5) {
    const words = text.split(/\W+/).filter(w => w.length >= 5);
    for (const w of words) {
      if (editDistance(w, term) === 1) return 'fuzzy';
      if (stemmedTerm !== term && editDistance(w, stemmedTerm) === 1) return 'fuzzy';
    }
  }
  return null;
}

// Score a single field match by type
function matchScore(matchType, baseScore) {
  if (matchType === 'exact') return baseScore;
  if (matchType === 'stem') return Math.round(baseScore * 0.85);
  if (matchType === 'fuzzy') return Math.round(baseScore * 0.55);
  return 0;
}

class SearchServiceClass {
  constructor() {
    this.recentSearches = [];
    this.trendingSearches = [
      { query: 'Sectional sofa', count: 94, location: 'Sandton', today: true },
      { query: 'Standing desk', count: 78, location: 'Sandton', today: true },
      { query: 'King bed frame', count: 61, location: 'Sandton', today: true },
      { query: 'Dining table set', count: 49, location: 'Sandton', today: true },
      { query: 'Ergonomic chair', count: 44, location: 'Sandton', today: true },
    ];
  }

  async getRepeatPurchases(userId = null) {
    const products = await ProductService.getAll();
    const popular = ['sofa', 'chair', 'desk', 'bed', 'table', 'bookcase', 'dresser'];
    return products
      .filter(p => popular.some(kw => p.name.toLowerCase().includes(kw)))
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 6)
      .map(p => ({ ...p, isRepeatPurchase: true }));
  }

  getSmartShortcuts() {
    return [
      { label: 'Under R2 000', icon: '💰', filter: { maxPrice: 2000 } },
      { label: 'Flash deals', icon: '🔥', filter: { onSale: true } },
      { label: 'In stock now', icon: '✅', filter: { inStock: true } },
      { label: 'Fast delivery', icon: '⚡', filter: { fastDelivery: true } },
      { label: 'Highly rated', icon: '⭐', filter: { sortBy: 'rating' } },
    ];
  }

  // Maps search terms to related furniture concepts
  synonyms(query) {
    const map = {
      'sofa': ['sofa', 'couch', 'sectional', 'loveseat', 'settee'],
      'couch': ['couch', 'sofa', 'sectional', 'loveseat'],
      'chair': ['chair', 'armchair', 'accent chair', 'office chair', 'dining chair'],
      'armchair': ['armchair', 'accent chair', 'chair'],
      'desk': ['desk', 'workstation', 'writing table', 'standing desk'],
      'bed': ['bed', 'bed frame', 'bedframe', 'platform bed'],
      'table': ['table', 'coffee table', 'side table', 'dining table', 'end table'],
      'wardrobe': ['wardrobe', 'closet', 'armoire'],
      'dresser': ['dresser', 'chest of drawers', 'drawer unit'],
      'bookcase': ['bookcase', 'bookshelf', 'shelving'],
      'shelf': ['shelf', 'bookcase', 'shelving', 'bookshelf'],
      'rug': ['rug', 'carpet', 'area rug'],
      'lamp': ['lamp', 'floor lamp', 'table lamp'],
      'storage': ['storage', 'cabinet', 'organiser', 'shelving'],
      'outdoor': ['outdoor', 'garden', 'patio'],
      'kids': ['kids', 'children', 'junior', 'bunk'],
      'bundle': ['bundle', 'set', 'collection', 'package'],
    };

    const lower = query.toLowerCase();
    const terms = new Set([lower]);
    for (const [key, values] of Object.entries(map)) {
      if (lower.includes(key)) values.forEach(v => terms.add(v));
    }
    return [...terms];
  }

  async searchProducts(query, filters = {}, location = null) {
    if (!query || query.trim().length === 0) return { results: [], total: 0 };

    const normalizedQuery = query.toLowerCase().trim();
    const expandedTerms = this.synonyms(normalizedQuery);

    const allWords = normalizedQuery.split(/\s+/).filter(w => w.length > 1);
    const keyWords = allWords.filter(w => !STOP_WORDS.has(w) && w.length > 2);
    const stemmedKeyWords = keyWords.map(stem);

    // Use the inverted index to narrow candidates before full scoring.
    // This turns an O(n) scan into O(candidates), which is much smaller for specific queries.
    const candidateIds = ProductService.getCandidateIds(normalizedQuery);
    const allProducts = await ProductService.getAll();
    const products = candidateIds ? allProducts.filter(p => candidateIds.has(p.id)) : allProducts;

    const scoredProducts = products.map(product => {
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const subcategory = (product.subcategory || product.furnitureCategory || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      const room = (product.room || '').toLowerCase();
      const style = (product.style || '').toLowerCase();
      const material = (product.materialPrimary || product.material || '').toLowerCase();
      const tags = (product.tags || []).join(' ').toLowerCase();
      const features = (product.features || []).join(' ').toLowerCase();
      const subtitle = (product.subtitle || '').toLowerCase();

      // Description is excluded from scoring — too noisy, causes unrelated results.
      // fuzzy:true restricts fuzzy matching to these fields only (name/subcategory/brand).
      const fields = [
        { text: name,        weight: 5,   fuzzy: true },
        { text: subcategory, weight: 4,   fuzzy: true },
        { text: tags,        weight: 3.5, fuzzy: false },
        { text: brand,       weight: 3,   fuzzy: true },
        { text: subtitle,    weight: 2,   fuzzy: false },
        { text: style,       weight: 2,   fuzzy: false },
        { text: material,    weight: 2,   fuzzy: false },
        { text: room,        weight: 1.5, fuzzy: false },
        { text: category,    weight: 1.5, fuzzy: false },
        { text: features,    weight: 1,   fuzzy: false },
      ];

      let textScore = 0;

      // 1. Whole-phrase match in name (fuzzy allowed)
      const phraseMatchType = textMatch(name, normalizedQuery, stem(normalizedQuery), true);
      if (phraseMatchType) textScore += matchScore(phraseMatchType, 300);

      // 2. Synonym expansion — scored against all fields (respects per-field fuzzy flag)
      expandedTerms.forEach(term => {
        const stemmedTerm = stem(term);
        fields.forEach(({ text, weight, fuzzy }) => {
          const m = textMatch(text, term, stemmedTerm, fuzzy);
          if (m) textScore += matchScore(m, 40 * weight);
        });
      });

      // 3. Per-keyword scoring + count matched keywords
      let keyWordsMatched = 0;
      keyWords.forEach((word, i) => {
        const stemmedWord = stemmedKeyWords[i];
        let wordMatched = false;
        fields.forEach(({ text, weight, fuzzy }) => {
          const m = textMatch(text, word, stemmedWord, fuzzy);
          if (m) {
            textScore += matchScore(m, 20 * weight);
            wordMatched = true;
          }
        });
        if (wordMatched) keyWordsMatched++;
      });

      // 4. All-keywords-matched bonus (precision signal)
      if (keyWords.length > 0 && keyWordsMatched === keyWords.length) {
        textScore += 80 * keyWords.length;
      }

      // 5. Multi-word penalty: require 75% of keywords to match, not just 50%
      if (keyWords.length >= 2 && keyWordsMatched < Math.ceil(keyWords.length * 0.75)) {
        textScore = Math.round(textScore * 0.1);
      }

      // 6. Quality signals only apply if there's a text match
      let score = textScore;
      if (textScore > 0) {
        if (product.stock === 'in') score += 15;
        else if (product.stock === 'low') score += 5;
        if (product.isTrending) score += 10;
        if ((product.reviewCount || 0) > 100) score += 8;
        else if ((product.reviewCount || 0) > 20) score += 4;
        if (product.isFlashDeal || product.discount) score += 8;
        if (product.isNew) score += 6;
      }

      return { ...product, relevanceScore: score };
    });

    // Raise thresholds: single-word needs ≥50, multi-word needs ≥80
    const minScore = keyWords.length >= 2 ? 80 : 50;
    let results = scoredProducts.filter(p => p.relevanceScore >= minScore);

    // Apply filters
    if (filters.inStock) results = results.filter(p => p.stock === 'in' || p.stock === 'low');
    if (filters.lowStock) results = results.filter(p => p.stock === 'low');
    if (filters.onSale) results = results.filter(p => p.discount || p.isFlashDeal);
    if (filters.freeDelivery) results = results.filter(p => p.deliveryEligible && (p.leadTimeDaysMin || 0) === 0);
    if (filters.fastDelivery) results = results.filter(p => p.deliveryEligible && (p.leadTimeDaysMin || 0) <= 2);
    if (filters.category) results = results.filter(p => p.category === filters.category);
    if (filters.room) results = results.filter(p => p.room === filters.room);
    if (filters.minPrice) results = results.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) results = results.filter(p => p.price <= Number(filters.maxPrice));

    // Sort
    const sortBy = filters.sortBy || 'relevance';
    switch (sortBy) {
      case 'price_asc':  results.sort((a, b) => a.price - b.price); break;
      case 'price_desc': results.sort((a, b) => b.price - a.price); break;
      case 'popular':    results.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)); break;
      case 'rating':     results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'newest':     results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
      default:           results.sort((a, b) => b.relevanceScore - a.relevanceScore); break;
    }

    this.addRecentSearch(query);
    return { results, total: results.length };
  }

  async getSuggestions(query, location = null) {
    if (!query || query.trim().length < 2) {
      return { directMatches: [], semanticMatches: [], storeMatches: [], contextualMatches: [] };
    }

    const normalizedQuery = query.toLowerCase().trim();
    const stemmedQuery = stem(normalizedQuery);
    const products = await ProductService.getAll();

    // Layer 1: Direct product name matches (exact + stemmed + fuzzy)
    const directMatches = products
      .filter(p => {
        const name = p.name.toLowerCase();
        if (name.includes(normalizedQuery)) return true;
        if (stemmedQuery !== normalizedQuery && name.includes(stemmedQuery)) return true;
        return name.split(/\s+/).some(w => w.startsWith(normalizedQuery) || (normalizedQuery.length >= 4 && editDistance(w, normalizedQuery) <= 1));
      })
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 5)
      .map(p => ({
        type: 'product',
        label: p.name,
        secondary: p.storeName || 'Shopply Home Furniture',
        icon: '🛍️',
        data: p,
      }));

    // Layer 2: Semantic / category matches
    const semanticMatches = [];
    const semanticMap = {
      'sofa': ['sectional', 'loveseat', 'armchair', 'couch'],
      'chair': ['armchair', 'accent chair', 'dining chair', 'office chair'],
      'desk': ['standing desk', 'workstation', 'study desk', 'writing desk'],
      'bed': ['bed frame', 'platform bed', 'bunk bed', 'king bed'],
      'table': ['coffee table', 'dining table', 'side table', 'console table'],
      'storage': ['bookcase', 'wardrobe', 'dresser', 'cabinet'],
      'office': ['desk', 'office chair', 'bookcase'],
      'bedroom': ['bed', 'dresser', 'wardrobe', 'bedside table'],
      'living': ['sofa', 'coffee table', 'armchair', 'bookcase'],
      'dining': ['dining table', 'dining chairs', 'sideboard', 'bar stool'],
      'bundle': ['living room bundle', 'bedroom bundle', 'office bundle'],
    };

    for (const [key, values] of Object.entries(semanticMap)) {
      if (normalizedQuery.includes(key) || editDistance(normalizedQuery, key) <= 1) {
        values.forEach(term => {
          const count = products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.subcategory || '').toLowerCase().includes(term) ||
            (p.tags || []).join(' ').toLowerCase().includes(term)
          ).length;
          if (count > 0) {
            semanticMatches.push({ type: 'semantic', label: term, secondary: `${count} items`, icon: '💡', data: { searchTerm: term } });
          }
        });
        break;
      }
    }

    // Subcategory name matches
    const subcategories = [...new Set(products.map(p => p.subcategory || p.furnitureCategory).filter(Boolean))];
    subcategories.forEach(sub => {
      const subLower = sub.toLowerCase();
      if ((subLower.includes(normalizedQuery) || subLower.includes(stemmedQuery)) && !semanticMatches.some(m => m.label === sub)) {
        const count = products.filter(p => (p.subcategory || p.furnitureCategory) === sub).length;
        semanticMatches.push({ type: 'category', label: sub, secondary: `Browse (${count})`, icon: '📂', data: { category: sub } });
      }
    });

    // Layer 3: Store matches
    const storeMap = new Map();
    products.forEach(p => { if (p.storeName && p.storeId !== 0) storeMap.set(p.storeName, p.storeId); });
    const storeMatches = [...storeMap.entries()]
      .filter(([name]) => name.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .map(([name]) => {
        const count = products.filter(p => p.storeName === name).length;
        return { type: 'store', label: name, secondary: `${count} products`, icon: '🏪', data: { storeName: name } };
      });

    // Layer 4: Trending products matching the query
    const contextualMatches = products
      .filter(p => (p.isTrending || (p.reviewCount || 0) > 100) &&
        textMatch(p.name.toLowerCase(), normalizedQuery, stemmedQuery))
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 2)
      .map(p => ({
        type: 'contextual',
        label: `Trending: ${p.name}`,
        secondary: `${p.reviewCount || 0} reviews`,
        icon: '⭐',
        data: p,
      }));

    return {
      directMatches: directMatches.slice(0, 5),
      semanticMatches: semanticMatches.slice(0, 4),
      storeMatches: storeMatches.slice(0, 3),
      contextualMatches: contextualMatches.slice(0, 3),
    };
  }

  addRecentSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) return;
    this.recentSearches = this.recentSearches.filter(s => s !== trimmed);
    this.recentSearches.unshift(trimmed);
    this.recentSearches = this.recentSearches.slice(0, 10);
  }

  getRecentSearches() { return this.recentSearches.slice(0, 5); }

  removeRecentSearch(query) {
    this.recentSearches = this.recentSearches.filter(s => s !== query);
  }

  getTrendingSearches(location = null) {
    if (location) {
      return this.trendingSearches
        .filter(t => !t.location || t.location === location.suburb || t.location === location.city)
        .slice(0, 5);
    }
    return this.trendingSearches.slice(0, 5);
  }

  async searchStores(query, filters = {}) {
    const products = await ProductService.getAll();
    const storeMap = new Map();

    products.forEach(product => {
      if (product.storeId === 0) return;
      if (!storeMap.has(product.storeName)) {
        storeMap.set(product.storeName, { name: product.storeName, storeId: product.storeId, products: [], totalRating: 0, totalReviews: 0 });
      }
      const store = storeMap.get(product.storeName);
      store.products.push(product);
      if (product.rating && product.reviewCount) {
        store.totalRating += product.rating * product.reviewCount;
        store.totalReviews += product.reviewCount;
      }
    });

    let stores = Array.from(storeMap.values()).map(s => ({
      ...s,
      rating: s.totalReviews > 0 ? s.totalRating / s.totalReviews : 0,
      reviewCount: s.totalReviews,
    }));

    if (query) {
      const q = query.toLowerCase();
      stores = stores.filter(s => s.name.toLowerCase().includes(q));
    }

    if (filters.sortBy === 'rating') stores.sort((a, b) => b.rating - a.rating);
    return stores;
  }
}

export const SearchService = new SearchServiceClass();
