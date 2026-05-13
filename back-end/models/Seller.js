import { BaseModel } from './BaseModel.js';

/**
 * Seller Model
 * Represents a seller account and its onboarding state.
 */
export class Seller extends BaseModel {
  constructor(data = {}) {
    super(data);

    this.id = data.id || null;

    // Account / identity
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.password = data.password || ''; // Demo-only. In production, never store raw passwords.
    this.legalBusinessName = data.legalBusinessName || '';

    // Onboarding progress
    this.onboardingStep = data.onboardingStep || 1;
    this.onboardingStatus = data.onboardingStatus || 'draft'; // 'draft' | 'in_review' | 'approved' | 'rejected'

    // Store info and configuration
    this.storeBasicInfo = data.storeBasicInfo || {
      storeType: '',
      storePhone: '',
      contactEmail: '',
    };

    this.storeSetup = data.storeSetup || {
      name: '',
      description: '',
      logo: null, // base64 string for demo
      hours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '08:00', close: '18:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: false },
      },
    };

    this.address = data.address || null; // { street, suburb, city, entranceInstructions, lat, lng }
    this.categories = data.categories || []; // array of category ids/keys

    // KYC + bank details
    this.kycDocuments = data.kycDocuments || {
      idDocument: null,
      businessRegistration: null,
      selfie: null,
      status: 'pending', // 'pending' | 'verified' | 'failed'
      lastCheckedAt: null,
    };

    this.bankAccount = data.bankAccount || {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      branchCode: '',
      payoutMethod: 'weekly',
    };

    this.policies = data.policies || {
      returnPolicy: '',
      deliveryEstimateMinutes: null,
      pickupAvailable: false,
      orderPrepTimeMinutes: null,
    };

    this.applicationProfile = data.applicationProfile || {
      inventoryCount: '',
      sellingTimeline: '',
      monthlyGoal: '',
      notes: '',
      source: '',
      submittedAt: null,
    };

    // Quality and performance metrics
    this.rating = data.rating || 0;
    this.reviewCount = data.reviewCount || 0;
    this.fulfillmentStats = data.fulfillmentStats || {
      onTimeRate: 0.95,
      cancellationRate: 0.05,
    };
    this.responseStats = data.responseStats || {
      avgResponseMinutes: 30,
    };
    this.kycVerified = data.kycVerified || false;
    this.disputeRate = data.disputeRate || 0.02;
    this.qualityScore = data.qualityScore || 0; // Computed seller quality score

    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validateForOnboarding() {
    const errors = [];

    // Phone validation (basic - can be enhanced with country codes)
    if (!this.phone || this.phone.trim().length < 8) {
      errors.push('Valid phone number is required (minimum 8 digits)');
    } else if (!/^[\d\s\+\-\(\)]+$/.test(this.phone)) {
      errors.push('Phone number contains invalid characters');
    }

    // Email validation
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Email format is invalid');
    }

    // Store setup validation
    if (!this.storeSetup.name || this.storeSetup.name.trim().length < 2) {
      errors.push('Store name must be at least 2 characters');
    } else if (this.storeSetup.name.trim().length > 100) {
      errors.push('Store name must be less than 100 characters');
    }

    // Address validation
    if (!this.address) {
      errors.push('Store address is required');
    } else {
      if (!this.address.street || this.address.street.trim().length < 3) {
        errors.push('Street address is required');
      }
      if (!this.address.suburb || this.address.suburb.trim().length < 2) {
        errors.push('Suburb is required');
      }
      if (!this.address.city || this.address.city.trim().length < 2) {
        errors.push('City is required');
      }
      if (!this.address.lat || !this.address.lng) {
        errors.push('Store location coordinates are required');
      } else {
        // Validate coordinates are reasonable (rough bounds for South Africa)
        if (this.address.lat < -35 || this.address.lat > -22 || 
            this.address.lng < 16 || this.address.lng > 33) {
          errors.push('Store location appears to be outside service area');
        }
      }
    }

    // Categories validation
    if (!Array.isArray(this.categories) || this.categories.length === 0) {
      errors.push('At least one store category is required');
    } else if (this.categories.length > 10) {
      errors.push('Maximum 10 categories allowed');
    }

    // KYC validation
    if (!this.kycDocuments.idDocument) {
      errors.push('ID document is required for verification');
    }
    if (!this.kycDocuments.selfie) {
      errors.push('Selfie verification is required');
    }

    // Bank account validation
    if (!this.bankAccount.accountHolderName || this.bankAccount.accountHolderName.trim().length < 2) {
      errors.push('Account holder name is required');
    }
    if (!this.bankAccount.bankName || this.bankAccount.bankName.trim().length < 2) {
      errors.push('Bank name is required');
    }
    if (!this.bankAccount.accountNumber || this.bankAccount.accountNumber.trim().length < 8) {
      errors.push('Valid account number is required (minimum 8 digits)');
    } else if (!/^\d+$/.test(this.bankAccount.accountNumber)) {
      errors.push('Account number must contain only digits');
    }
    if (!this.bankAccount.branchCode || this.bankAccount.branchCode.trim().length < 4) {
      errors.push('Valid branch code is required (minimum 4 digits)');
    } else if (!/^\d+$/.test(this.bankAccount.branchCode)) {
      errors.push('Branch code must contain only digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toJSON() {
    return {
      id: this.id,
      phone: this.phone,
      email: this.email,
      legalBusinessName: this.legalBusinessName,
      onboardingStep: this.onboardingStep,
      onboardingStatus: this.onboardingStatus,
      storeBasicInfo: this.storeBasicInfo,
      storeSetup: this.storeSetup,
      address: this.address,
      categories: this.categories,
      kycDocuments: this.kycDocuments,
      bankAccount: this.bankAccount,
      policies: this.policies,
      applicationProfile: this.applicationProfile,
      rating: this.rating,
      reviewCount: this.reviewCount,
      fulfillmentStats: this.fulfillmentStats,
      responseStats: this.responseStats,
      kycVerified: this.kycVerified,
      disputeRate: this.disputeRate,
      qualityScore: this.qualityScore,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}


