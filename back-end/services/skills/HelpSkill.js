/**
 * Help Skill
 * Provides help and support
 */

import BaseSkill from './BaseSkill.js';

class HelpSkill extends BaseSkill {
  constructor() {
    super('HelpSkill');
  }

  async handle(channelEvent, session) {
    return this.buttonsResponse(
      '🆘 *Help & Support*\n\n' +
      '*Quick Commands:*\n' +
      '• Type "search" to find products\n' +
      '• Type "cart" to view your cart\n' +
      '• Type "orders" to track orders\n' +
      '• Type "seller" for seller tools\n' +
      '• Type "home" to go home\n\n' +
      '*Need human help?*',
      [
        { id: 'contact_support', title: '💬 Contact Support' },
        { id: 'home', title: '🏠 Home' },
      ]
    );
  }
}

export default new HelpSkill();

