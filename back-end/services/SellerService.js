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
      onboardingStep: updates.onboardingStep !== undefined ? updates.onboardingStep : existing.onboardingStep,
      onboardingStatus: updates.onboardingStatus || existing.onboardingStatus,
      updatedAt: new Date(),
    });

    this.sellers[index] = merged;
    return merged.toJSON();
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

