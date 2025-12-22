/**
 * Seller Promos Skill
 * Handles seller promotion management
 */

import BaseSkill from './BaseSkill.js';
import { PromotionService } from '../PromotionService.js';
import { SellerService } from '../SellerService.js';

class SellerPromosSkill extends BaseSkill {
  constructor() {
    super('SellerPromosSkill');
  }

  async handle(channelEvent, session) {
    const { userChannelId } = channelEvent;
    
    return this.buttonsResponse(
      '🎉 *Promotions*\n\nCreate and manage promotions for your products.\n\nComing soon!',
      [
        { id: 'seller_home', title: '🏪 Dashboard' },
        { id: 'seller_products', title: '📦 Products' },
      ]
    );
  }
}

export default new SellerPromosSkill();

