/**
 * Base Model class
 * Extend this class for your models
 */
export class BaseModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  /**
   * Validate model data
   * Override this method in child classes
   */
  validate() {
    return { isValid: true, errors: [] };
  }

  /**
   * Convert model to plain object
   */
  toJSON() {
    return { ...this };
  }
}











