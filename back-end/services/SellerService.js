import { Seller } from '../models/Seller.js';

/**
 * Seller Service
 * In-memory implementation to manage seller onboarding and basic seller data.
 */
class SellerServiceClass {
  constructor() {
    this.sellers = [];
    this.nextId = 1;
  }

  /**
   * Get all sellers
   */
  async getAllSellers() {
    return this.sellers.map(s => s.toJSON());
  }

  /**
   * Get a seller by ID
   */
  async getSellerById(id) {
    const numericId = parseInt(id, 10);
    const seller = this.sellers.find(s => s.id === numericId);
    return seller ? seller.toJSON() : null;
  }

  async getStoreHours(id) {
    let seller = await this.getSellerById(id);
    if (!seller && parseInt(id, 10) === 1) {
      seller = await this.seedDefaultSeller();
    }
    if (!seller) return null;

    return {
      sellerId: seller.id,
      storeName: seller.storeSetup?.name || seller.legalBusinessName || 'Tsenga Seller',
      hours: seller.storeSetup?.hours || this.getDefaultHours(),
      policies: {
        pickupAvailable: seller.policies?.pickupAvailable ?? true,
        orderPrepTimeMinutes: seller.policies?.orderPrepTimeMinutes ?? 45,
        deliveryEstimateMinutes: seller.policies?.deliveryEstimateMinutes ?? 90,
        returnPolicy: seller.policies?.returnPolicy || '',
      },
      timezone: 'Africa/Johannesburg',
      updatedAt: seller.updatedAt,
    };
  }

  async updateStoreHours(id, data = {}) {
    let seller = await this.getSellerById(id);
    if (!seller && parseInt(id, 10) === 1) {
      seller = await this.seedDefaultSeller();
    }
    if (!seller) return null;

    const hours = this.normalizeHours(data.hours || {});
    const policies = {
      pickupAvailable: data.policies?.pickupAvailable ?? seller.policies?.pickupAvailable ?? true,
      orderPrepTimeMinutes: Number(data.policies?.orderPrepTimeMinutes ?? seller.policies?.orderPrepTimeMinutes ?? 45),
      deliveryEstimateMinutes: Number(data.policies?.deliveryEstimateMinutes ?? seller.policies?.deliveryEstimateMinutes ?? 90),
      returnPolicy: data.policies?.returnPolicy ?? seller.policies?.returnPolicy ?? '',
    };

    const updated = await this.updateOnboarding(seller.id, {
      storeSetup: { hours },
      policies,
    });

    return this.getStoreHours(updated.id);
  }

  getDefaultHours() {
    return {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false },
    };
  }

  normalizeHours(hours) {
    const defaults = this.getDefaultHours();
    return Object.keys(defaults).reduce((result, day) => {
      const value = hours[day] || {};
      result[day] = {
        open: value.open || defaults[day].open,
        close: value.close || defaults[day].close,
        closed: Boolean(value.closed),
      };
      return result;
    }, {});
  }

  /**
   * Check if phone number is already in use
   */
  async isPhoneTaken(phone) {
    return this.sellers.some(s => s.phone === phone);
  }

  /**
   * Check if email is already in use
   */
  async isEmailTaken(email) {
    if (!email) return false;
    return this.sellers.some(s => s.email === email);
  }

  /**
   * Create a new seller onboarding draft
   */
  async createOnboarding(data = {}) {
    // Validate phone uniqueness
    if (data.phone) {
      const phoneTaken = await this.isPhoneTaken(data.phone);
      if (phoneTaken) {
        const error = new Error('Phone number is already registered');
        error.statusCode = 409;
        throw error;
      }
    }

    // Validate email uniqueness
    if (data.email) {
      const emailTaken = await this.isEmailTaken(data.email);
      if (emailTaken) {
        const error = new Error('Email address is already registered');
        error.statusCode = 409;
        throw error;
      }
    }

    const seller = new Seller({
      ...data,
      id: this.nextId++,
      onboardingStatus: 'draft',
      onboardingStep: data.onboardingStep || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.sellers.push(seller);
    return seller.toJSON();
  }

  /**
   * Get onboarding data for a seller
   */
  async getOnboarding(id) {
    const numericId = parseInt(id, 10);
    const seller = this.sellers.find(s => s.id === numericId);
    return seller ? seller.toJSON() : null;
  }

  /**
   * Partially update onboarding data for a seller
   */
  async updateOnboarding(id, updates = {}) {
    const numericId = parseInt(id, 10);
    const index = this.sellers.findIndex(s => s.id === numericId);

    if (index === -1) {
      return null;
    }

    const existing = this.sellers[index];

    // Validate phone uniqueness if phone is being updated
    if (updates.phone && updates.phone !== existing.phone) {
      const phoneTaken = await this.isPhoneTaken(updates.phone);
      if (phoneTaken) {
        const error = new Error('Phone number is already registered');
        error.statusCode = 409;
        throw error;
      }
    }

    // Validate email uniqueness if email is being updated
    if (updates.email && updates.email !== existing.email) {
      const emailTaken = await this.isEmailTaken(updates.email);
      if (emailTaken) {
        const error = new Error('Email address is already registered');
        error.statusCode = 409;
        throw error;
      }
    }

    // Deep merge for structured fields
    const merged = new Seller({
      ...existing,
      ...updates,
      storeBasicInfo: {
        ...existing.storeBasicInfo,
        ...(updates.storeBasicInfo || {}),
      },
      storeSetup: {
        ...existing.storeSetup,
        ...(updates.storeSetup || {}),
        hours: {
          ...existing.storeSetup.hours,
          ...(updates.storeSetup && updates.storeSetup.hours
            ? updates.storeSetup.hours
            : {}),
        },
      },
      address: {
        ...(existing.address || {}),
        ...(updates.address || {}),
      },
      categories: updates.categories !== undefined ? updates.categories : existing.categories,
      kycDocuments: {
        ...existing.kycDocuments,
        ...(updates.kycDocuments || {}),
      },
      bankAccount: {
        ...existing.bankAccount,
        ...(updates.bankAccount || {}),
      },
      policies: {
        ...existing.policies,
        ...(updates.policies || {}),
      },
      applicationProfile: {
        ...existing.applicationProfile,
        ...(updates.applicationProfile || {}),
      },
      onboardingStep: updates.onboardingStep !== undefined ? updates.onboardingStep : existing.onboardingStep,
      onboardingStatus: updates.onboardingStatus || existing.onboardingStatus,
      updatedAt: new Date(),
    });

    this.sellers[index] = merged;
    return merged.toJSON();
  }

  /**
   * Create a polished public "become a seller" lead and onboarding draft.
   */
  async createBecomeSellerApplication(data = {}) {
    const storeName = String(data.storeName || '').trim();
    const storeType = String(data.storeType || '').trim();
    const phone = String(data.phone || '').trim();
    const email = String(data.email || '').trim();
    const city = String(data.city || '').trim();

    const errors = [];
    if (storeName.length < 2) errors.push('Store name is required');
    if (!storeType) errors.push('Seller type is required');
    if (phone.length < 8) errors.push('Valid phone number is required');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email format is invalid');
    }
    if (!city) errors.push('City is required');

    if (errors.length > 0) {
      const error = new Error(errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    const categories = Array.isArray(data.categories) && data.categories.length > 0
      ? data.categories.slice(0, 10)
      : ['home'];

    const seller = await this.createOnboarding({
      phone,
      email,
      legalBusinessName: data.legalBusinessName || storeName,
      onboardingStep: 2,
      onboardingStatus: 'draft',
      storeBasicInfo: {
        storeType,
        storePhone: phone,
        contactEmail: email,
      },
      storeSetup: {
        name: storeName,
        description: data.description || `${storeName} is preparing to sell on Tsenga.`,
      },
      address: {
        street: data.street || '',
        suburb: data.suburb || '',
        city,
        entranceInstructions: '',
        lat: Number(data.lat) || -26.1076,
        lng: Number(data.lng) || 28.0567,
      },
      categories,
      applicationProfile: {
        inventoryCount: data.inventoryCount || '',
        sellingTimeline: data.sellingTimeline || 'this_week',
        monthlyGoal: data.monthlyGoal || '',
        notes: data.notes || '',
        source: data.source || 'become_seller_page',
        submittedAt: new Date(),
      },
    });

    return seller;
  }

  async getBecomeSellerStats() {
    const activeSellers = Math.max(this.sellers.length, 500);
    const drafts = this.sellers.filter(s => s.onboardingStatus === 'draft').length;
    const inReview = this.sellers.filter(s => s.onboardingStatus === 'in_review').length;

    return {
      activeSellers,
      pendingApplications: drafts + inReview,
      averageSetupMinutes: 7,
      monthlyPayouts: 2400000,
      feeLabel: 'Free to list',
      serviceAreas: ['Sandton', 'Johannesburg', 'Rosebank', 'Midrand'],
    };
  }

  async getSellerLearnMoreContent() {
    const stats = await this.getBecomeSellerStats();

    return {
      hero: {
        eyebrow: 'Sell on Tsenga',
        title: 'A beautiful way to sell furniture locally',
        subtitle: 'Tsenga helps furniture sellers launch a trusted local storefront, get discovered by nearby buyers, and manage orders from one calm dashboard.',
        primaryCta: 'Become a seller',
        secondaryCta: 'View onboarding steps',
      },
      stats,
      benefits: [
        {
          title: 'Local buyers, ready to furnish',
          description: 'Your products appear in room pages, search, bundles, recommendations, and location-aware discovery.',
        },
        {
          title: 'Tools for furniture selling',
          description: 'Show dimensions, condition, delivery windows, stock confidence, room fit, and bundle pricing without extra plugins.',
        },
        {
          title: 'Orders and payouts in one place',
          description: 'Track orders, update preparation status, manage promotions, and keep seller payout details connected to your store.',
        },
      ],
      steps: [
        { title: 'Apply', description: 'Share your store name, category, location, and contact details.' },
        { title: 'Verify', description: 'Complete identity, store address, and payout setup so buyers can trust your storefront.' },
        { title: 'List', description: 'Add furniture, images, pricing, room tags, delivery options, and bundles.' },
        { title: 'Sell', description: 'Receive orders from nearby shoppers and manage fulfillment from the seller dashboard.' },
      ],
      economics: {
        listingFee: 'R0',
        payoutCadence: 'Weekly payouts',
        setupTime: `${stats.averageSetupMinutes} minutes`,
        monthlyPayouts: stats.monthlyPayouts,
      },
      faqs: [
        {
          question: 'Can I sell as an individual?',
          answer: 'Yes. Individuals, studios, resellers, and registered furniture stores can apply. Verification requirements may differ by seller type.',
        },
        {
          question: 'Do I need my own delivery team?',
          answer: 'No. You can offer pickup, local delivery, or use Tsenga-supported fulfillment options where available.',
        },
        {
          question: 'What can I sell?',
          answer: 'Furniture, decor, storage, office pieces, outdoor furniture, room bundles, and related home items that match marketplace quality standards.',
        },
      ],
    };
  }

  /**
   * Mark onboarding as submitted / complete
   */
  async completeOnboarding(id) {
    const numericId = parseInt(id, 10);
    const index = this.sellers.findIndex(s => s.id === numericId);

    if (index === -1) {
      return null;
    }

    const seller = this.sellers[index];

    const validation = seller.validateForOnboarding();
    if (!validation.isValid) {
      const error = new Error(validation.errors.join(', '));
      error.statusCode = 400;
      throw error;
    }

    seller.onboardingStatus = 'in_review';
    seller.updatedAt = new Date();

    return seller.toJSON();
  }

  /**
   * Seed default seller for demo purposes
   */
  async seedDefaultSeller() {
    // Check if default seller already exists
    const existing = this.sellers.find(s => s.id === 1);
    if (existing) {
      console.log('ℹ️  Default seller (ID: 1) already exists');
      return existing.toJSON();
    }

    const defaultSeller = new Seller({
      id: 1,
      phone: '+27123456789',
      email: 'demo@seller.com',
      legalBusinessName: 'Demo Store',
      onboardingStatus: 'approved',
      onboardingStep: 7, // Completed
      storeBasicInfo: {
        storeType: 'retail',
        storePhone: '+27123456789',
        contactEmail: 'demo@seller.com',
      },
      storeSetup: {
        name: 'Demo Store',
        description: 'A demo store for testing the Tsenga platform',
        logo: null,
        hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '17:00', closed: false },
        },
      },
      address: {
        street: '123 Demo Street',
        suburb: 'Sandton',
        city: 'Johannesburg',
        entranceInstructions: '',
        lat: -26.1076,
        lng: 28.0567,
      },
      categories: ['Groceries', 'Braai', 'Electronics'],
      kycDocuments: {
        idDocument: null,
        businessRegistration: null,
        selfie: null,
        status: 'verified',
        lastCheckedAt: new Date(),
      },
      bankAccount: {
        accountHolder: 'Demo Store',
        bankName: 'Demo Bank',
        accountNumber: '1234567890',
        branchCode: '123456',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.sellers.push(defaultSeller);
    this.nextId = 2; // Set next ID to 2 since we manually set ID to 1
    console.log('✅ Seeded default seller (ID: 1) successfully');
    return defaultSeller.toJSON();
  }
}

export const SellerService = new SellerServiceClass();

