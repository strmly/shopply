import { BundleItem } from '../models/BundleItem.js';
import { ProductService } from './ProductService.js';

/**
 * Bundle Service
 * Handles bundle curation operations
 */
class BundleServiceClass {
  constructor() {
    this.bundleItems = []; // Store curated items
    this.nextId = 1;
  }

  /**
   * Add a product to a bundle (curate)
   */
  async addItemToBundle(bundleType, productId, userId, userName, location, reason = '') {
    // Check if item already exists
    const existing = this.bundleItems.find(
      item => item.bundleType === bundleType && 
              item.productId === parseInt(productId) && 
              item.userId === userId
    );

    if (existing) {
      // Update existing item
      existing.reason = reason || existing.reason;
      existing.updatedAt = new Date();
      return existing;
    }

    // Create new bundle item
    const bundleItem = new BundleItem({
      id: this.nextId++,
      bundleType,
      productId: parseInt(productId),
      userId,
      userName,
      location,
      reason,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = bundleItem.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    this.bundleItems.push(bundleItem);
    return bundleItem;
  }

  /**
   * Remove a product from a bundle
   */
  async removeItemFromBundle(bundleType, productId, userId) {
    const index = this.bundleItems.findIndex(
      item => item.bundleType === bundleType && 
              item.productId === parseInt(productId) && 
              item.userId === userId
    );

    if (index === -1) {
      return false;
    }

    this.bundleItems.splice(index, 1);
    return true;
  }

  /**
   * Get all curated items for a bundle type
   */
  async getBundleItems(bundleType, location = null) {
    let items = this.bundleItems.filter(item => item.bundleType === bundleType);

    // Filter by location if provided
    if (location && location.suburb) {
      items = items.filter(item => 
        !item.location || 
        item.location.suburb === location.suburb
      );
    }

    // Get product details for each item
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        try {
          const product = await ProductService.getProductById(item.productId);
          if (!product) return null;

          return {
            ...item.toJSON(),
            product: product.toJSON(),
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls (products that don't exist)
    return itemsWithProducts.filter(item => item !== null);
  }

  /**
   * Get curated products for a bundle (returns just products)
   */
  async getCuratedProducts(bundleType, location = null, limit = 50) {
    try {
      const items = await this.getBundleItems(bundleType, location);
      
      if (!items || items.length === 0) {
        return [];
      }
      
      // Sort by number of curators (popularity)
      const productCounts = {};
      items.forEach(item => {
        if (!item || !item.productId || !item.product) {
          return; // Skip invalid items
        }
        const productId = item.productId;
        if (!productCounts[productId]) {
          productCounts[productId] = { 
            product: item.product, 
            curatorCount: 0, 
            curators: [] 
          };
        }
        productCounts[productId].curatorCount++;
        if (item.userName) {
          productCounts[productId].curators.push({
            userName: item.userName,
            reason: item.reason || '',
          });
        }
      });

      // Convert to array and sort by curator count
      const sortedProducts = Object.values(productCounts)
        .sort((a, b) => b.curatorCount - a.curatorCount)
        .slice(0, limit)
        .map(item => ({
          ...item.product,
          curatorCount: item.curatorCount,
          curators: item.curators,
        }));

      return sortedProducts;
    } catch (error) {
      console.error('Error in getCuratedProducts:', error);
      return [];
    }
  }

  /**
   * Check if a user has curated a specific product
   */
  async hasUserCurated(bundleType, productId, userId) {
    return this.bundleItems.some(
      item => item.bundleType === bundleType && 
              item.productId === parseInt(productId) && 
              item.userId === userId
    );
  }

  /**
   * Get curator count for a bundle
   */
  async getCuratorCount(bundleType, location = null) {
    let items = this.bundleItems.filter(item => item.bundleType === bundleType);

    if (location && location.suburb) {
      items = items.filter(item => 
        !item.location || 
        item.location.suburb === location.suburb
      );
    }

    // Get unique user count
    const uniqueUsers = new Set(items.map(item => item.userId));
    return uniqueUsers.size;
  }
}

// Export singleton instance
export const BundleService = new BundleServiceClass();
