/**
 * Seller Products Skill
 * Handles seller product management
 */

import BaseSkill from './BaseSkill.js';
import { ProductService } from '../ProductService.js';
import { SellerService } from '../SellerService.js';

class SellerProductsSkill extends BaseSkill {
  constructor() {
    super('SellerProductsSkill');
  }

  async handle(channelEvent, session) {
    const { step } = session;

    switch (step) {
      case 'LIST':
        return this.listProducts(channelEvent, session);
      
      case 'ADD':
        return this.addProduct(channelEvent, session);
      
      case 'EDIT':
        return this.editProduct(channelEvent, session);
      
      case 'UPDATE_STOCK':
        return this.updateStock(channelEvent, session);
      
      default:
        return this.listProducts(channelEvent, session);
    }
  }

  /**
   * List seller products
   */
  async listProducts(channelEvent, session) {
    const { userChannelId } = channelEvent;
    
    try {
      const seller = await SellerService.getByPhone(userChannelId);
      if (!seller) {
        return this.textResponse('You\'re not registered as a seller.');
      }

      const result = await ProductService.getSellerProducts(seller.id);
      const products = result.products || [];

      if (!products || products.length === 0) {
        return this.buttonsResponse(
          '📦 You don\'t have any products yet.\n\nStart adding products to sell!',
          [
            { id: 'add_product', title: '➕ Add Product' },
            { id: 'seller_home', title: '🏪 Dashboard' },
          ]
        );
      }

      const sections = [{
        title: `${products.length} Products`,
        rows: products.slice(0, 10).map(product => ({
          id: `seller_product_${product.id}`,
          title: product.name,
          description: `R${product.price.toFixed(2)} • Stock: ${product.stock}`,
        })),
      }];

      return this.listResponse(
        '📦 *Your Products*\n\nSelect a product to manage or add new:',
        'Manage Products',
        sections
      );
    } catch (error) {
      console.error('Seller products list error:', error);
      return this.textResponse('Sorry, couldn\'t load products. Please try again.');
    }
  }

  /**
   * Add product (simplified flow)
   */
  async addProduct(channelEvent, session) {
    const { userChannelId } = channelEvent;
    const { step: subStep } = session.context;

    // Multi-step product creation
    if (!subStep || subStep === 'initial') {
      await this.updateContext(userChannelId, { step: 'name' });
      return this.textResponse(
        '📦 *Add New Product*\n\nLet\'s start with the product name.\n\nWhat\'s the name of your product?'
      );
    }

    const text = this.getText(channelEvent);

    if (subStep === 'name') {
      await this.updateContext(userChannelId, { 
        step: 'price',
        productDraft: { name: text }
      });
      return this.textResponse(
        `✅ Product name: ${text}\n\nNow, what\'s the price? (e.g., 99.99)`
      );
    }

    if (subStep === 'price') {
      const price = parseFloat(text);
      if (isNaN(price) || price <= 0) {
        return this.textResponse('Please enter a valid price (e.g., 99.99)');
      }

      const draft = session.context.productDraft;
      draft.price = price;

      await this.updateContext(userChannelId, { 
        step: 'stock',
        productDraft: draft
      });
      return this.textResponse(
        `💰 Price: R${price.toFixed(2)}\n\nHow many do you have in stock?`
      );
    }

    if (subStep === 'stock') {
      const stock = parseInt(text);
      if (isNaN(stock) || stock < 0) {
        return this.textResponse('Please enter a valid stock quantity (e.g., 10)');
      }

      const draft = session.context.productDraft;
      draft.stock = stock;

      // Save product
      try {
        const seller = await SellerService.getByPhone(userChannelId);
        const product = await ProductService.createProduct({ ...draft, storeId: seller.id });

        await this.changeFlow(userChannelId, 'SELLER_PRODUCTS', 'LIST');

        return [
          this.textResponse(`✅ Product "${product.name}" added successfully!`),
          await this.listProducts(channelEvent, session),
        ];
      } catch (error) {
        console.error('Add product error:', error);
        return this.textResponse('Sorry, couldn\'t add product. Please try again.');
      }
    }

    return this.textResponse('Something went wrong. Please try again.');
  }

  /**
   * Edit product
   */
  async editProduct(channelEvent, session) {
    const id = this.getId(channelEvent);
    const { userChannelId } = channelEvent;

    if (id.startsWith('seller_product_')) {
      const productId = this.parseProductId(id);
      
      await this.updateContext(userChannelId, { editingProductId: productId });
      
      return this.buttonsResponse(
        'What would you like to update?',
        [
          { id: 'update_stock', title: '📦 Update Stock' },
          { id: 'update_price', title: '💰 Update Price' },
          { id: 'delete_product', title: '🗑️ Delete' },
        ]
      );
    }

    return this.textResponse('Invalid product selection.');
  }

  /**
   * Update stock
   */
  async updateStock(channelEvent, session) {
    const { userChannelId } = channelEvent;
    const { editingProductId } = session.context;
    const text = this.getText(channelEvent);

    if (!editingProductId) {
      return this.textResponse('No product selected.');
    }

    const stock = parseInt(text);
    if (isNaN(stock) || stock < 0) {
      return this.textResponse('Please enter a valid stock quantity (e.g., 10)');
    }

    try {
      await ProductService.updateProductStock(editingProductId, stock);
      
      await this.changeFlow(userChannelId, 'SELLER_PRODUCTS', 'LIST');
      
      return [
        this.textResponse('✅ Stock updated!'),
        await this.listProducts(channelEvent, session),
      ];
    } catch (error) {
      console.error('Update stock error:', error);
      return this.textResponse('Sorry, couldn\'t update stock. Please try again.');
    }
  }
}

export default new SellerProductsSkill();

