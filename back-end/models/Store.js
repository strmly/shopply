class Store {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.sellerId = data.sellerId || null;
    this.name = data.name || '';
    this.type = data.type || ''; // 'grocery', 'bakery', 'meat', etc.
    this.logo = data.logo || null;
    this.description = data.description || '';
    this.address = data.address || null; // { street, suburb, city, lat, lng }
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.hours = data.hours || {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false },
    };
    this.categories = data.categories || [];
    this.rating = data.rating || 0;
    this.reviewCount = data.reviewCount || 0;
    this.isActive = data.isActive || true;
    
    // H3 geospatial indexing (tier resolutions only)
    this.h3_r3 = data.h3_r3 || null;
    this.h3_r4 = data.h3_r4 || null;
    this.h3_r5 = data.h3_r5 || null;
    this.h3_r6 = data.h3_r6 || null;
    this.h3_r7 = data.h3_r7 || null;
    this.h3_r8 = data.h3_r8 || null;
    this.h3_r9 = data.h3_r9 || null;
    
    // Pin verification (critical for anti-gaming)
    this.pinVerificationStatus = data.pinVerificationStatus || 'unverified'; // 'unverified' | 'verified' | 'flagged'
    this.pinLastUpdated = data.pinLastUpdated || null;
    this.pinChangeCount = data.pinChangeCount || 0;
    this.geocodeConfidence = data.geocodeConfidence || 0; // 0-1 from geocoding service
    
    // Service and quality metrics
    this.serviceMode = data.serviceMode || 'delivery'; // 'delivery' | 'pickup' | 'both'
    this.serviceRadiusKm = data.serviceRadiusKm || 10;
    this.isOpenNow = data.isOpenNow !== undefined ? data.isOpenNow : true;
    this.prepTimeProfile = data.prepTimeProfile || {
      p50: 15, // median minutes
      p95: 30,
    };
    this.reliabilityScore = data.reliabilityScore || 0.95; // Fulfillment SLA %
    this.stockMismatchRate = data.stockMismatchRate || 0.05; // Orders failing due to stock issues
    this.capacityScore = data.capacityScore || 0.8;
    this.serviceScore = data.serviceScore || 0;
    
    // Furniture-specific store attributes
    this.storeType = data.storeType || 'retailer'; // 'retailer', 'maker', 'reseller', 'warehouse', 'showroom'
    this.verificationStatus = data.verificationStatus || 'unverified'; // 'unverified', 'verified', 'verified_partner', 'demo_store', 'flagged'
    this.serviceAreaTiersAllowed = data.serviceAreaTiersAllowed || ['T0', 'T1', 'T2']; // H3 tiers this store can serve
    this.serviceTiersMax = data.serviceTiersMax || 'T2'; // Max tier this store can serve
    this.deliveryModes = data.deliveryModes || ['pickup', 'local_delivery']; // 'pickup', 'local_delivery', 'freight'
    this.deliveryPricingModel = data.deliveryPricingModel || 'flat_by_tier'; // 'flat_by_tier', 'per_km', 'quote_required'
    this.deliveryPricing = data.deliveryPricing || { T0: 50, T1: 100, T2: 150 }; // Pricing per tier (in Rands)
    this.assemblyAvailable = data.assemblyAvailable || false;
    this.assemblyFeeModel = data.assemblyFeeModel || 'per_item'; // 'per_item', 'percentage', 'flat'
    this.returnsPolicyDays = data.returnsPolicyDays || data.returnPolicyDays || 7; // Return policy in days
    this.returnsPolicyNotes = data.returnsPolicyNotes || null; // Additional return policy details
    this.leadTimeDaysMin = data.leadTimeDaysMin || 0;
    this.leadTimeDaysMax = data.leadTimeDaysMax || 3;
    this.leadTimeProfile = data.leadTimeProfile || 'same_day'; // 'same_day', 'next_day', '3-7_days', 'custom'
    
    // Fulfillment metrics (critical for ranking)
    this.fulfillmentMetrics = data.fulfillmentMetrics || {
      onTimeRate: data.onTimeRate || 0.95, // On-time delivery rate
      cancelRate: data.cancelRate || 0.02, // Order cancellation rate
      disputeRate: data.disputeRate || 0.01, // Dispute rate
      stockMismatchRate: data.stockMismatchRate || 0.05, // Stock availability mismatch rate
      responseTimeAvgHours: data.responseTimeAvgHours || 2, // Average response time
    };
    
    // Backward compatibility
    this.onTimeRate = data.onTimeRate || this.fulfillmentMetrics.onTimeRate;
    this.cancelRate = data.cancelRate || this.fulfillmentMetrics.cancelRate;
    this.disputeRate = data.disputeRate || this.fulfillmentMetrics.disputeRate;
    this.returnPolicyDays = this.returnsPolicyDays; // Backward compat
    
    this.storeQualityScore = data.storeQualityScore || 0.8; // Overall quality score (0-1)
    this.ratingAvgBayesian = data.ratingAvgBayesian || null; // Bayesian average rating
    this.pickupInstructions = data.pickupInstructions || null; // Special pickup instructions
    this.loadingAccessType = data.loadingAccessType || 'street'; // 'street', 'loading_dock', 'warehouse'
    this.isDemo = data.isDemo || false; // Is this a demo/seed store
    this.browseOnly = data.browseOnly || false; // If true, disable checkout
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toJSON() {
    return {
      id: this.id,
      sellerId: this.sellerId,
      name: this.name,
      type: this.type,
      logo: this.logo,
      description: this.description,
      address: this.address,
      phone: this.phone,
      email: this.email,
      hours: this.hours,
      categories: this.categories,
      rating: this.rating,
      reviewCount: this.reviewCount,
      isActive: this.isActive,
      h3_r3: this.h3_r3,
      h3_r4: this.h3_r4,
      h3_r5: this.h3_r5,
      h3_r6: this.h3_r6,
      h3_r7: this.h3_r7,
      h3_r8: this.h3_r8,
      h3_r9: this.h3_r9,
      pinVerificationStatus: this.pinVerificationStatus,
      pinLastUpdated: this.pinLastUpdated,
      pinChangeCount: this.pinChangeCount,
      geocodeConfidence: this.geocodeConfidence,
      serviceMode: this.serviceMode,
      serviceRadiusKm: this.serviceRadiusKm,
      isOpenNow: this.isOpenNow,
      prepTimeProfile: this.prepTimeProfile,
      reliabilityScore: this.reliabilityScore,
      stockMismatchRate: this.stockMismatchRate,
      capacityScore: this.capacityScore,
      serviceScore: this.serviceScore,
      storeType: this.storeType,
      verificationStatus: this.verificationStatus,
      serviceAreaTiersAllowed: this.serviceAreaTiersAllowed,
      serviceTiersMax: this.serviceTiersMax,
      deliveryModes: this.deliveryModes,
      deliveryPricingModel: this.deliveryPricingModel,
      deliveryPricing: this.deliveryPricing,
      assemblyAvailable: this.assemblyAvailable,
      assemblyFeeModel: this.assemblyFeeModel,
      returnPolicyDays: this.returnPolicyDays,
      returnsPolicyDays: this.returnsPolicyDays,
      returnsPolicyNotes: this.returnsPolicyNotes,
      leadTimeDaysMin: this.leadTimeDaysMin,
      leadTimeDaysMax: this.leadTimeDaysMax,
      leadTimeProfile: this.leadTimeProfile,
      fulfillmentMetrics: this.fulfillmentMetrics,
      onTimeRate: this.onTimeRate,
      cancelRate: this.cancelRate,
      disputeRate: this.disputeRate,
      storeQualityScore: this.storeQualityScore,
      ratingAvgBayesian: this.ratingAvgBayesian,
      pickupInstructions: this.pickupInstructions,
      loadingAccessType: this.loadingAccessType,
      isDemo: this.isDemo,
      browseOnly: this.browseOnly,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Store name is required');
    }

    if (!this.sellerId) {
      errors.push('Seller ID is required');
    }

    if (!this.address || !this.address.lat || !this.address.lng) {
      errors.push('Store address with coordinates is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Store;











