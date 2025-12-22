import { SearchService } from '../services/SearchService.js';

/**
 * Search Controller
 */
export class SearchController {
  /**
   * Search products
   */
  async searchProducts(req, res, next) {
    try {
      const { q, ...filters } = req.query;
      const location = req.query.lat && req.query.lng 
        ? { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng), suburb: req.query.suburb, city: req.query.city }
        : null;

      if (!q || q.trim().length === 0) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'Please provide a search query',
        });
      }

      const products = await SearchService.searchProducts(q, filters, location);

      res.json({
        success: true,
        data: products.map(p => p.toJSON ? p.toJSON() : p),
        count: products.length,
        query: q,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getSuggestions(req, res, next) {
    try {
      const { q } = req.query;
      const location = req.query.lat && req.query.lng 
        ? { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng), suburb: req.query.suburb, city: req.query.city }
        : null;

      if (!q || q.trim().length < 2) {
        return res.json({
          success: true,
          data: {
            directMatches: [],
            semanticMatches: [],
            storeMatches: [],
          },
        });
      }

      const suggestions = await SearchService.getSuggestions(q, location);

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent searches
   */
  async getRecentSearches(req, res, next) {
    try {
      const recent = SearchService.getRecentSearches();
      res.json({
        success: true,
        data: recent,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove recent search
   */
  async removeRecentSearch(req, res, next) {
    try {
      const { query } = req.body;
      SearchService.removeRecentSearch(query);
      res.json({
        success: true,
        message: 'Recent search removed',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(req, res, next) {
    try {
      const location = req.query.suburb || req.query.city 
        ? { suburb: req.query.suburb, city: req.query.city }
        : null;
      
      const trending = SearchService.getTrendingSearches(location);
      res.json({
        success: true,
        data: trending,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get repeat purchases
   */
  async getRepeatPurchases(req, res, next) {
    try {
      const { userId } = req.query;
      const location = req.query.lat && req.query.lng 
        ? { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng), suburb: req.query.suburb, city: req.query.city }
        : null;
      
      const products = await SearchService.getRepeatPurchases(userId, location);
      res.json({
        success: true,
        data: products.map(p => p.toJSON ? p.toJSON() : p),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get smart shortcuts
   */
  async getSmartShortcuts(req, res, next) {
    try {
      const location = req.query.suburb || req.query.city 
        ? { suburb: req.query.suburb, city: req.query.city }
        : null;
      
      const shortcuts = SearchService.getSmartShortcuts(location);
      res.json({
        success: true,
        data: shortcuts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search stores
   */
  async searchStores(req, res, next) {
    try {
      const { q, ...filters } = req.query;
      const location = req.query.lat && req.query.lng 
        ? { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng), suburb: req.query.suburb, city: req.query.city }
        : null;

      const stores = await SearchService.searchStores(q, filters, location);

      res.json({
        success: true,
        data: stores,
        count: stores.length,
        query: q || '',
      });
    } catch (error) {
      next(error);
    }
  }
}

