/**
 * Enhanced Search Skill
 * Progressive expansion messaging + elite UX patterns
 */

import BaseSkill from './BaseSkill.js';
import whatsappSessionService from '../WhatsAppSessionService.js';
import whatsappGateway from '../WhatsAppGateway.js';
import whatsappAdvancedConfig from '../../config/whatsappAdvanced.js';
import { searchWithExpansion } from '../HyperlocalSearchService.js';
import { ProductService } from '../ProductService.js';
import { SellerService } from '../SellerService.js';
import { getAllInventories } from '../InventoryService.js';
import { getAllStores } from '../StoreService.js';
import { AddressService } from '../AddressService.js';

class EnhancedSearchSkill extends BaseSkill {
  constructor() {
    super('EnhancedSearchSkill');
    this.config = whatsappAdvancedConfig;
  }

  async handle(channelEvent, session) {
    const { step } = session;

    switch (step) {
      case 'INITIAL':
      case 'QUERY':
        return this.handleQueryWithProgressiveExpansion(channelEvent, session);
      
      case 'RESULTS':
        return this.handleResultSelection(channelEvent, session);
      
      case 'PRODUCT_DETAIL':
        return this.handleProductDetail(channelEvent, session);
      
      case 'CHANGE_RADIUS':
        return this.handleRadiusChange(channelEvent, session);
      
      default:
        return this.handleQueryWithProgressiveExpansion(channelEvent, session);
    }
  }

  /**
   * Handle search with progressive expansion messaging
   */
  async handleQueryWithProgressiveExpansion(channelEvent, session) {
    const { userChannelId } = channelEvent;
    const text = this.getText(channelEvent);
    const query = session.context.query || text;

    // Validate query
    if (!query || query.trim() === '') {
      return this.showSearchPrompt();
    }

    // Get user location
    const user = await whatsappSessionService.getLinkedUser(userChannelId);
    const address = await this.getUserAddress(userChannelId, user);

    if (!address || !address.latitude || !address.longitude) {
      return this.requestLocationSetup();
    }

    // Store query in context
    await this.updateContext(userChannelId, { 
      query, 
      searchInProgress: true 
    });

    // Send initial search message
    const messages = this.config.expansionMessaging.messages;
    await whatsappGateway.sendTextMessage(
      userChannelId,
      messages.searching('1km')
    );

    try {
      // Perform search with progressive updates
      const searchResults = await this.searchWithProgressiveUpdates(
        query,
        address,
        userChannelId
      );

      const { results, expansionSteps, tierUsed, expanded } = searchResults;

      // Handle no results
      if (!results || results.length === 0) {
        return this.handleNoResults(userChannelId, query);
      }

      // Store results in context
      await this.updateContext(userChannelId, {
        searchResults: results,
        searchQuery: query,
        tierUsed,
        expanded,
        expansionSteps,
      });

      await this.changeFlow(userChannelId, 'SEARCH', 'RESULTS');

      // Format and send results with tier information
      return this.sendEnhancedResults(results, tierUsed, expanded);

    } catch (error) {
      console.error('Enhanced search error:', error);
      return this.handleSearchError();
    }
  }

  /**
   * Search with progressive expansion updates
   */
  async searchWithProgressiveUpdates(query, address, phoneNumber) {
    const messages = this.config.expansionMessaging.messages;
    const tiers = [
      { distance: 1000, label: '1km' },
      { distance: 5000, label: '5km' },
      { distance: 10000, label: '10km' },
      { distance: 20000, label: '20km' },
    ];

    let allResults = [];
    let currentTier = null;
    let expanded = false;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      
      // Search at this tier
      const results = await searchWithExpansion({
        query,
        userLat: address.latitude,
        userLng: address.longitude,
        minResults: 5,
        maxTier: i,
        filters: {},
        getAllProducts: () => ProductService.getAll(),
        getAllStores: () => getAllStores(),
        getAllSellers: () => SellerService.getAll(),
        getAllInventories: () => getAllInventories(),
      });

      allResults = results.results;
      currentTier = tier;

      // If we have enough results, stop
      if (allResults.length >= 5) {
        break;
      }

      // If not last tier, send expansion message
      if (i < tiers.length - 1 && this.config.expansionMessaging.showProgress) {
        await whatsappGateway.sendTextMessage(
          phoneNumber,
          messages.expanding(tiers[i + 1].label)
        );
        expanded = true;
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Send final found message
    if (this.config.expansionMessaging.enabled) {
      await whatsappGateway.sendTextMessage(
        phoneNumber,
        messages.found(allResults.length, currentTier.label)
      );
    }

    return {
      results: allResults,
      tierUsed: currentTier,
      expanded,
      expansionSteps: tiers.slice(0, tiers.findIndex(t => t.distance === currentTier.distance) + 1),
    };
  }

  /**
   * Send enhanced results with quality indicators
   */
  sendEnhancedResults(results, tierUsed, expanded) {
    const hyperlocalConfig = this.config.hyperlocalQuality;
    
    // Format products with all quality indicators
    const formattedProducts = results.map(r => ({
      ...r.product,
      distance: hyperlocalConfig.alwaysShowDistance ? r.distance : undefined,
      eta: hyperlocalConfig.showETA ? this.calculateETA(r.distance) : undefined,
      seller: {
        name: r.seller?.businessName || r.store?.name || 'Store',
        rating: hyperlocalConfig.alwaysShowSellerRating ? (r.seller?.rating || 4.5) : undefined,
        topRated: hyperlocalConfig.showTopRatedBadge ? (r.seller?.topRated || false) : undefined,
      },
      stock: hyperlocalConfig.showInStock ? (r.product.stock || 0) : undefined,
      rating: r.product.rating || 4.0,
    }));

    // Build tier info
    const tier = {
      radius: tierUsed.distance,
      label: tierUsed.label,
      expanded,
      resultsCount: results.length,
    };

    return this.productsListResponse(formattedProducts, tier);
  }

  /**
   * Handle no results with helpful recovery
   */
  async handleNoResults(phoneNumber, query) {
    const emptyState = this.config.emptyStates.noResults;
    
    return this.buttonsResponse(
      `${emptyState.message}\n\nSearched for: "${query}"`,
      [
        { id: 'expand_radius_max', title: '🌍 Search Wider' },
        { id: 'browse_categories', title: '📂 Categories' },
        { id: 'new_search', title: '🔍 New Search' },
      ]
    );
  }

  /**
   * Handle search error
   */
  handleSearchError() {
    return this.buttonsResponse(
      '😔 Sorry, something went wrong with your search.\n\nPlease try again:',
      [
        { id: 'try_again', title: '🔄 Try Again' },
        { id: 'browse_categories', title: '📂 Categories' },
        { id: 'home', title: '🏠 Home' },
      ]
    );
  }

  /**
   * Show search prompt
   */
  showSearchPrompt() {
    return this.buttonsResponse(
      '🔍 *Search Products*\n\nWhat are you looking for?\n\nType your search or browse by category:',
      [
        { id: 'browse_categories', title: '📂 Categories' },
        { id: 'popular_searches', title: '🔥 Popular' },
        { id: 'home', title: '🏠 Home' },
      ]
    );
  }

  /**
   * Request location setup
   */
  requestLocationSetup() {
    return this.buttonsResponse(
      '📍 We need your location to search nearby products.\n\nPlease set your delivery address first:',
      [
        { id: 'set_location', title: '📍 Set Location' },
        { id: 'home', title: '🏠 Home' },
      ]
    );
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

      const { searchResults } = session.context;
      const result = searchResults?.find(r => r.product.id === productId);

      if (!result) {
        return this.textResponse('Product not found. Please search again.');
      }

      await this.updateContext(userChannelId, { selectedProduct: result });
      await this.changeFlow(userChannelId, 'SEARCH', 'PRODUCT_DETAIL');

      return this.showEnhancedProductDetail(result, userChannelId);
    }

    // Handle filter/sort actions
    if (id === 'change_radius') {
      await this.changeFlow(userChannelId, 'SEARCH', 'CHANGE_RADIUS');
      return this.handleRadiusChange(channelEvent, session);
    }

    if (id === 'new_search') {
      await this.changeFlow(userChannelId, 'SEARCH', 'QUERY', { query: '' });
      return this.showSearchPrompt();
    }

    return this.textResponse('Please select a product from the list.');
  }

  /**
   * Show enhanced product detail with all quality indicators
   */
  async showEnhancedProductDetail(result, phoneNumber) {
    const { product, distance, seller, store } = result;
    const hyperlocalConfig = this.config.hyperlocalQuality;

    const productDetail = {
      ...product,
      distance: hyperlocalConfig.alwaysShowDistance ? distance : undefined,
      eta: hyperlocalConfig.showETA ? this.calculateETA(distance) : undefined,
      seller: {
        name: seller?.businessName || store?.name || 'Store',
        rating: hyperlocalConfig.alwaysShowSellerRating ? (seller?.rating || 4.5) : undefined,
        topRated: hyperlocalConfig.showTopRatedBadge ? (seller?.topRated || false) : undefined,
      },
      stock: hyperlocalConfig.showInStock ? (product.stock || 0) : undefined,
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

    // Buy now
    if (id === `buy_now_${productId}` || id.startsWith('buy_now_')) {
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
      return this.handleQueryWithProgressiveExpansion(channelEvent, session);
    }

    // Notify when in stock
    if (id === `notify_${productId}`) {
      await this.updateContext(userChannelId, {
        stockNotifications: [...(session.context.stockNotifications || []), productId]
      });
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
            { id: 'radius_auto', title: '🎯 Auto (Smart)', description: 'Automatically expand if needed (Recommended)' },
            { id: 'radius_1km', title: '1 km', description: 'Very local, may have fewer results' },
            { id: 'radius_5km', title: '5 km', description: 'Balanced results and locality' },
            { id: 'radius_10km', title: '10 km', description: 'More product options' },
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
      return this.handleQueryWithProgressiveExpansion(channelEvent, session);
    }

    return this.textResponse('Please select a radius option.');
  }

  /**
   * Get user address
   */
  async getUserAddress(phoneNumber, user) {
    try {
      const addresses = await AddressService.getUserAddresses(phoneNumber);
      if (addresses && addresses.length > 0) {
        return addresses[0];
      }

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
    const hours = distance / 30000; // 30 km/h average
    const minutes = Math.ceil(hours * 60);
    return Math.max(15, minutes); // Minimum 15 minutes
  }
}

export default new EnhancedSearchSkill();

