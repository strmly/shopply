import { BaseModel } from './BaseModel.js';

/**
 * Address Model
 */
export class Address extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.label = data.label || 'Home'; // Home, Work, or custom label
    this.street = data.street || '';
    this.suburb = data.suburb || '';
    this.city = data.city || '';
    this.postalCode = data.postalCode || '';
    this.unit = data.unit || '';
    this.floor = data.floor || '';
    this.deliveryInstructions = data.deliveryInstructions || '';
    this.latitude = data.latitude || null;
    this.longitude = data.longitude || null;
    this.isDefault = data.isDefault || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = [];

    if (!this.street || this.street.trim().length === 0) {
      errors.push('Street address is required');
    }

    if (!this.suburb || this.suburb.trim().length === 0) {
      errors.push('Suburb is required');
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.push('City is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      label: this.label,
      street: this.street,
      suburb: this.suburb,
      city: this.city,
      postalCode: this.postalCode,
      unit: this.unit,
      floor: this.floor,
      deliveryInstructions: this.deliveryInstructions,
      latitude: this.latitude,
      longitude: this.longitude,
      isDefault: this.isDefault,
      location: this.latitude && this.longitude ? {
        lat: this.latitude,
        lng: this.longitude,
      } : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}











