/**
 * Search Skill
 * Handles product search with H3 hyperlocal integration
 */

import BaseSkill from './BaseSkill.js';
import whatsappSessionService from '../WhatsAppSessionService.js';
import { searchWithExpansion } from '../HyperlocalSearchService.js';
import { ProductService } from '../ProductService.js';
import { SellerService } from '../SellerService.js';
import { getAllInventories } from '../InventoryService.js';
import { getAllStores } from '../StoreService.js';
import { AddressService } from '../AddressService.js';

class SearchSkill extends BaseSkill {
  constructor() {
    super('SearchSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;
    const { type, payload, userChannelId } = channelEvent;

    switch (step) {
      case 'INITIAL':
      case 'QUERY':
        return this.handleQuery(channelEvent, session);
      
      case 'RESULTS':
        return this.handleResultSelection(channelEvent, session);
      
      case 'PRODUCT_DETAIL':
        return this.handleProductDetail(channelEvent, session);
      
      case 'CHANGE_RADIUS':
        return this.handleRadiusChange(channelEvent, session);
      
      default:
        return this.handleQuery(channelEvent, session);
    }
  }

  /**
   * Handle search query
   */
  async handleQuery(channelEvent, session) {
    const { userChannelId } = channelEvent;
    const text = this.getText(channelEvent);
    const query = session.context.query || text;

    if (!query || query.trim() === '') {
      return this.buttonsResponse(
        '🔍 *Search Products*\n\nWhat are you looking for?\n\nType your search or browse by category:',
        [
          { id: 'browse_categories', title: '📂 Categories' },
          { id: 'popular_searches', title: '🔥 Popular' },
        ]
      );
    }

    // Get user location
    const user = await whatsappSessionService.getLinkedUser(userChannelId);
    const address = await this.getUserAddress(userChannelId, user);

    if (!address || !address.latitude || !address.longitude) {
      return this.buttonsResponse(
        '📍 We need your location to search.\n\nPlease set your delivery address first:',
        [
          { id: 'set_location', title: '📍 Set Location' },
          { id: 'home', title: '🏠 Home' },
        ]
      );
    }

    // Perform hyperlocal search with expansion
    try {
      await this.updateContext(userChannelId, { 
        query, 
        searchInProgress: true 
      });

      // Send "searching" message
      await this.changeFlow(userChannelId, 'SEARCH', 'RESULTS', { query });

      const searchResults = await searchWithExpansion({
        query,
        userLat: address.latitude,
        userLng: address.longitude,
        minResults: 10,
        maxTier: 4,
        filters: {},
        getAllProducts: () => ProductService.getAll(),
        getAllStores: () => getAllStores(),
        getAllSellers: () => SellerService.getAll(),
        getAllInventories: () => getAllInventories(),
      });

      const { results, expansionSteps, tierUsed, expanded } = searchResults;

      // Store results in context
      await this.updateContext(userChannelId, {
        searchResults: results,
        searchQuery: query,
        tierUsed,
        expanded,
        expansionSteps,
      });

      // Format tier information
      const tier = {
        radius: tierUsed?.maxDistance || 1000,
        expanded,
        resultsCount: results.length,
      };

      // Send results
      return this.productsListResponse(
        results.map(r => ({
          ...r.product,
          distance: r.distance,
          seller: r.seller,
          store: r.store,
        })),
        tier
      );

    } catch (error) {
      console.error('Search error:', error);
      return this.buttonsResponse(
        '😔 Sorry, something went wrong with your search.\n\nPlease try again:',
        [
          { id: 'try_again', title: '🔄 Try Again' },
          { id: 'home', title: '🏠 Home' },
        ]
      );
    }
  }

  /**
   * Handle result selection
   */
  async handleResultSelection(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    // Handle product selection
    if (id.startsWith('product_')) {
      const productId = this.parseProductId(id);
      
      if (!productId) {
        return this.textResponse('Invalid product selection. Please try again.');
      }

      // Get product from search results
      const { searchResults } = session.context;
      const result = searchResults?.find(r => r.product.id === productId);

      if (!result) {
        return this.textResponse('Product not found. Please search again.');
      }

      await this.updateContext(userChannelId, { selectedProduct: result });
      await this.changeFlow(userChannelId, 'SEARCH', 'PRODUCT_DETAIL');

      return this.showProductDetail(result, userChannelId);
    }

    // Handle other buttons
    if (id === 'change_radius') {
      await this.changeFlow(userChannelId, 'SEARCH', 'CHANGE_RADIUS');
      return this.handleRadiusChange(channelEvent, session);
    }

    if (id === 'new_search') {
      await this.changeFlow(userChannelId, 'SEARCH', 'QUERY', { query: '' });
      return this.handleQuery(channelEvent, session);
    }

    return this.textResponse('Please select a product from the list.');
  }

  /**
   * Show product detail
   */
  async showProductDetail(result, phoneNumber) {
    const { product, distance, seller, store, ranking } = result;

    const productDetail = {
      ...product,
      distance,
      eta: this.calculateETA(distance),
      seller: {
        name: seller?.businessName || store?.name || 'Store',
        rating: seller?.rating || 4.5,
        topRated: seller?.topRated || false,
      },
      stock: product.stock || 0,
      rating: product.rating || 4.0,
    };

    return this.productCardResponse(productDetail);
  }

  /**
   * Handle product detail actions
   */
  async handleProductDetail(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;
    const { selectedProduct } = session.context;

    if (!selectedProduct) {
      return this.textResponse('Product not found. Please search again.');
    }

    const productId = selectedProduct.product.id;

    // Add to cart
    if (id === `add_to_cart_${productId}` || id.startsWith('add_to_cart_')) {
      await this.changeFlow(userChannelId, 'CART', 'ADD_ITEM', { 
        productId,
        quantity: 1 
      });
      
      const CartSkill = (await import('./CartSkill.js')).default;
      return CartSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Buy now (checkout directly)
    if (id === `buy_now_${productId}` || id.startsWith('buy_now_')) {
      // Add to cart and go straight to checkout
      await this.changeFlow(userChannelId, 'CHECKOUT', 'PREPARE', {
        directBuy: true,
        productId,
        quantity: 1,
      });
      
      const CheckoutSkill = (await import('./CheckoutSkill.js')).default;
      return CheckoutSkill.handle(channelEvent, await whatsappSessionService.getSession(userChannelId));
    }

    // Similar products
    if (id === `similar_${productId}` || id.startsWith('similar_')) {
      const category = selectedProduct.product.category;
      await this.changeFlow(userChannelId, 'SEARCH', 'QUERY', { 
        query: category || 'similar products' 
      });
      return this.handleQuery(channelEvent, session);
    }

    // Notify when in stock
    if (id === `notify_${productId}`) {
      // TODO: Implement stock notification
      return this.textResponse('✅ We\'ll notify you when this product is back in stock!');
    }

    return this.textResponse('Invalid action. Please try again.');
  }

  /**
   * Handle radius change
   */
  async handleRadiusChange(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id === 'change_radius') {
      return this.listResponse(
        '📏 *Change Search Radius*\n\nSelect how far you want to search:',
        'Select Radius',
        [{
          title: 'Search Radius',
          rows: [
            { id: 'radius_auto', title: '🎯 Auto (Smart)', description: 'Automatically expand if needed' },
            { id: 'radius_1km', title: '1 km', description: 'Very local' },
            { id: 'radius_5km', title: '5 km', description: 'Balanced' },
            { id: 'radius_10km', title: '10 km', description: 'More options' },
            { id: 'radius_20km', title: '20 km', description: 'Maximum reach' },
          ],
        }]
      );
    }

    // Handle radius selection
    if (id.startsWith('radius_')) {
      const radius = id.replace('radius_', '');
      
      await this.updateContext(userChannelId, { 
        radiusMode: radius === 'auto' ? 'auto' : 'fixed',
        customRadius: radius !== 'auto' ? parseInt(radius) * 1000 : null,
      });

      // Re-run search with new radius
      await this.changeFlow(userChannelId, 'SEARCH', 'QUERY');
      return this.handleQuery(channelEvent, session);
    }

    return this.textResponse('Please select a radius option.');
  }

  /**
   * Get user address
   */
  async getUserAddress(phoneNumber, user) {
    try {
      // Try to get saved address
      const addresses = await AddressService.getUserAddresses(phoneNumber);
      if (addresses && addresses.length > 0) {
        return addresses[0]; // Return default address
      }

      // Fall back to context location
      const session = await whatsappSessionService.getSession(phoneNumber);
      return session?.context?.location || null;
    } catch (error) {
      console.error('Error getting user address:', error);
      return null;
    }
  }

  /**
   * Calculate ETA based on distance
   */
  calculateETA(distance) {
    // Simple ETA calculation: ~30 km/h average speed
    const hours = distance / 30000;
    const minutes = Math.ceil(hours * 60);
    return Math.max(15, minutes); // Minimum 15 minutes
  }
}

export default new SearchSkill();

