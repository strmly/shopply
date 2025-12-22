/**
 * Seller Home Skill
 * Handles seller dashboard and home screen
 */

import BaseSkill from './BaseSkill.js';
import { SellerService } from '../SellerService.js';
import { AnalyticsService } from '../AnalyticsService.js';

class SellerHomeSkill extends BaseSkill {
  constructor() {
    super('SellerHomeSkill');
  }

  async handle(channelEvent, session) {
    const { userChannelId } = channelEvent;
    
    try {
      // Get seller data
      const seller = await SellerService.getByPhone(userChannelId);
      
      if (!seller) {
        return this.buttonsResponse(
          '🏪 *Become a Seller*\n\nYou\'re not registered as a seller yet.\n\nWould you like to start selling?',
          [
            { id: 'register_seller', title: '📝 Register' },
            { id: 'buyer', title: '🛍️ Shop Instead' },
          ]
        );
      }

      // Get dashboard summary
      const summary = await this.getDashboardSummary(seller.id);

      const text = `🏪 *Seller Dashboard*\n\n` +
        `*Today's Sales:* R${summary.todayRevenue.toFixed(2)}\n` +
        `*Pending Orders:* ${summary.pendingOrders}\n` +
        `*Low Stock Items:* ${summary.lowStockCount}\n\n` +
        `What would you like to do?`;

      return this.buttonsResponse(text, [
        { id: 'seller_orders', title: '📦 Orders' },
        { id: 'seller_products', title: '📦 Products' },
        { id: 'seller_analytics', title: '📊 Analytics' },
      ]);
    } catch (error) {
      console.error('Seller home error:', error);
      return this.textResponse('Sorry, couldn\'t load seller dashboard. Please try again.');
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(sellerId) {
    try {
      const analytics = await AnalyticsService.getSellerDashboard(sellerId);
      
      return {
        todayRevenue: analytics?.todayRevenue || 0,
        pendingOrders: analytics?.pendingOrders || 0,
        lowStockCount: analytics?.lowStockCount || 0,
      };
    } catch (error) {
      return {
        todayRevenue: 0,
        pendingOrders: 0,
        lowStockCount: 0,
      };
    }
  }
}

export default new SellerHomeSkill();

