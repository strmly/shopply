/**
 * Buyer Home Skill
 * Handles the buyer home screen/menu
 */

import BaseSkill from './BaseSkill.js';
import whatsappSessionService from '../WhatsAppSessionService.js';
import { ProductService } from '../../services/ProductService.js';
import { PromotionService } from '../../services/PromotionService.js';

class BuyerHomeSkill extends BaseSkill {
  constructor() {
    super('BuyerHomeSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;
    const { type, payload, userChannelId } = channelEvent;
    const id = this.getId(channelEvent);

    switch (step) {
      case 'INITIAL':
        return this.showHome(userChannelId, session);
      
      case 'BROWSE_CATEGORIES':
        return this.showCategories(userChannelId, session);
      
      case 'VIEW_DEALS':
        return this.showDeals(userChannelId, session);
      
      default:
        return this.showHome(userChannelId, session);
    }
  }

  /**
   * Show home menu
   */
  async showHome(phoneNumber, session) {
    const user = await whatsappSessionService.getLinkedUser(phoneNumber);
    
    // Get curated content
    const featuredProducts = await this.getFeaturedProducts(session);
    
    let text = '🏠 *Welcome to Str3mly ShopLocal*\n\n';
    
    if (featuredProducts && featuredProducts.length > 0) {
      text += '🔥 *Hot near you:*\n';
      featuredProducts.slice(0, 3).forEach(product => {
        text += `• ${product.name} - R${product.price.toFixed(2)}\n`;
      });
      text += '\n';
    }
    
    text += 'What would you like to do?';

    return this.buttonsResponse(text, [
      { id: 'search', title: '🔍 Search' },
      { id: 'browse_categories', title: '📂 Categories' },
      { id: 'deals', title: '🔥 Deals' },
    ]);
  }

  /**
   * Show categories
   */
  async showCategories(phoneNumber, session) {
    const categories = await this.getCategories();
    
    const sections = [{
      title: 'Browse by Category',
      rows: categories.map(cat => ({
        id: `category_${cat.id}`,
        title: cat.name,
        description: cat.count ? `${cat.count} products` : '',
      })),
    }];

    return this.listResponse(
      '📂 *Categories*\n\nBrowse products by category:',
      'Select Category',
      sections
    );
  }

  /**
   * Show deals
   */
  async showDeals(phoneNumber, session) {
    try {
      const deals = await PromotionService.getActivePromotions({
        limit: 10,
      });

      if (!deals || deals.length === 0) {
        return this.buttonsResponse(
          '😔 No active deals right now.\n\nCheck back soon for amazing offers!',
          [
            { id: 'search', title: '🔍 Search' },
            { id: 'home', title: '🏠 Home' },
          ]
        );
      }

      const sections = [{
        title: '🔥 Hot Deals',
        rows: deals.slice(0, 10).map(deal => ({
          id: `deal_${deal.id}`,
          title: `${deal.name} - ${deal.discount}% off`,
          description: deal.description?.substring(0, 72) || '',
        })),
      }];

      return this.listResponse(
        '🔥 *Hot Deals Near You*\n\nLimited time offers from local sellers!',
        'View Deals',
        sections
      );
    } catch (error) {
      console.error('Error fetching deals:', error);
      return this.textResponse('Sorry, couldn\'t load deals right now. Try searching instead!');
    }
  }

  /**
   * Get featured products (curated for location)
   */
  async getFeaturedProducts(session) {
    try {
      // Get user's location from context
      const user = await whatsappSessionService.getLinkedUser(session.phoneNumber);
      
      const result = await ProductService.getAllProducts({
        limit: 5,
      });
      const products = result.products || [];

      return products || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  /**
   * Get categories
   */
  async getCategories() {
    // Mock categories - in production, fetch from database
    return [
      { id: 'electronics', name: '📱 Electronics', count: 124 },
      { id: 'fashion', name: '👕 Fashion', count: 89 },
      { id: 'home', name: '🏠 Home & Garden', count: 156 },
      { id: 'food', name: '🍔 Food & Drinks', count: 234 },
      { id: 'beauty', name: '💄 Beauty', count: 67 },
      { id: 'sports', name: '⚽ Sports', count: 45 },
      { id: 'books', name: '📚 Books', count: 78 },
      { id: 'toys', name: '🧸 Toys', count: 56 },
    ];
  }
}

export default new BuyerHomeSkill();

