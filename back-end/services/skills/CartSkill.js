/**
 * Cart Skill
 * Handles shopping cart operations
 */

import BaseSkill from './BaseSkill.js';
import whatsappSessionService from '../WhatsAppSessionService.js';
import { CartService } from '../CartService.js';

class CartSkill extends BaseSkill {
  constructor() {
    super('CartSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;

    switch (step) {
      case 'VIEW':
        return this.viewCart(channelEvent, session);
      
      case 'ADD_ITEM':
        return this.addToCart(channelEvent, session);
      
      case 'EDIT':
        return this.editCart(channelEvent, session);
      
      case 'UPDATE_QUANTITY':
        return this.updateQuantity(channelEvent, session);
      
      default:
        return this.viewCart(channelEvent, session);
    }
  }

  /**
   * View cart
   */
  async viewCart(channelEvent, session) {
    const { userChannelId } = channelEvent;
    
    try {
      const cart = await CartService.getCart(userChannelId);
      
      if (!cart || !cart.items || cart.items.length === 0) {
        return this.buttonsResponse(
          '🛒 Your cart is empty.\n\nStart shopping to add items!',
          [
            { id: 'search', title: '🔍 Search' },
            { id: 'home', title: '🏠 Home' },
          ]
        );
      }

      return this.cartSummaryResponse(cart);
    } catch (error) {
      console.error('Cart view error:', error);
      return this.textResponse('Sorry, couldn\'t load your cart. Please try again.');
    }
  }

  /**
   * Add to cart
   */
  async addToCart(channelEvent, session) {
    const { userChannelId } = channelEvent;
    const { productId, quantity } = session.context;

    try {
      await CartService.addItem(userChannelId, {
        productId,
        quantity: quantity || 1,
      });

      // Update context and show cart
      await this.changeFlow(userChannelId, 'CART', 'VIEW');
      
      return [
        this.textResponse('✅ Added to cart!'),
        await this.viewCart(channelEvent, await whatsappSessionService.getSession(userChannelId)),
      ];
    } catch (error) {
      console.error('Add to cart error:', error);
      return this.textResponse('Sorry, couldn\'t add item to cart. Please try again.');
    }
  }

  /**
   * Edit cart
   */
  async editCart(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id === 'edit_cart') {
      const cart = await CartService.getCart(userChannelId);
      
      if (!cart || !cart.items || cart.items.length === 0) {
        return this.textResponse('Your cart is empty.');
      }

      const sections = cart.items.map(item => ({
        title: item.store?.name || 'Store',
        rows: item.items?.map(i => ({
          id: `edit_item_${i.id}`,
          title: `${i.name} (${i.quantity})`,
          description: `R${i.price.toFixed(2)}`,
        })) || [],
      }));

      return this.listResponse(
        '✏️ *Edit Cart*\n\nSelect an item to modify:',
        'Select Item',
        sections
      );
    }

    // Handle item selection for edit
    if (id.startsWith('edit_item_')) {
      const itemId = id.replace('edit_item_', '');
      await this.updateContext(userChannelId, { editingItemId: itemId });
      await this.changeFlow(userChannelId, 'CART', 'UPDATE_QUANTITY');
      
      return this.buttonsResponse(
        'What would you like to do with this item?',
        [
          { id: `increase_${itemId}`, title: '➕ Add More' },
          { id: `decrease_${itemId}`, title: '➖ Reduce' },
          { id: `remove_${itemId}`, title: '🗑️ Remove' },
        ]
      );
    }

    return this.textResponse('Invalid action.');
  }

  /**
   * Update quantity
   */
  async updateQuantity(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    try {
      if (id.startsWith('increase_')) {
        const itemId = id.replace('increase_', '');
        await CartService.updateQuantity(userChannelId, itemId, 1, 'increase');
        return this.textResponse('✅ Quantity updated!');
      }

      if (id.startsWith('decrease_')) {
        const itemId = id.replace('decrease_', '');
        await CartService.updateQuantity(userChannelId, itemId, 1, 'decrease');
        return this.textResponse('✅ Quantity updated!');
      }

      if (id.startsWith('remove_')) {
        const itemId = id.replace('remove_', '');
        await CartService.removeItem(userChannelId, itemId);
        return this.textResponse('🗑️ Item removed from cart.');
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      return this.textResponse('Sorry, couldn\'t update item. Please try again.');
    }
  }
}

export default new CartSkill();

