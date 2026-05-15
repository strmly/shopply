import { User } from '../models/User.js';
import { hashPassword } from '../utils/crypto.js';

class UserServiceClass {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async seedDefaultUsers() {
    if (this.users.length > 0) return;
    const seeds = [
      { id: 1, name: 'Admin', email: 'admin@shopply.co.za', role: 'admin', password: 'Admin@123' },
      { id: 2, name: 'Demo Seller', email: 'seller@shopply.co.za', role: 'seller', password: 'Seller@123' },
      { id: 3, name: 'Demo Buyer', email: 'buyer@shopply.co.za', role: 'buyer', password: 'Buyer@123' },
    ];
    for (const s of seeds) {
      await this.createUser({
        id: s.id,
        name: s.name,
        email: s.email,
        mobile: '',
        role: s.role,
        status: 'active',
        passwordHash: hashPassword(s.password),
        onboardingCompleted: true,
      });
    }
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    return this.users;
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    // Handle both string and numeric IDs
    const userId = typeof id === 'string' && id === 'default' ? 1 : parseInt(id);
    return this.users.find(user => user.id === userId);
  }

  /**
   * Get user by mobile number
   */
  async getUserByMobile(mobile) {
    const normalizedMobile = String(mobile || '').replace(/[^\d+]/g, '');
    return this.users.find(user => (
      String(user.mobile || '').replace(/[^\d+]/g, '') === normalizedMobile
    ));
  }

  /**
   * Get user by email address
   */
  async getUserByEmail(email) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    return this.users.find(user => String(user.email || '').trim().toLowerCase() === normalizedEmail);
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    // If id is provided, use it; otherwise auto-increment
    const userId = userData.id || this.nextId++;
    
    // If using provided id, make sure nextId is at least that value
    if (userData.id && userData.id >= this.nextId) {
      this.nextId = userData.id + 1;
    }
    
    const user = new User({
      ...userData,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = user.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    this.users.push(user);
    return user;
  }

  /**
   * Update user
   */
  async updateUser(id, userData) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      return null;
    }

    const updatedUser = new User({
      ...this.users[userIndex],
      ...userData,
      id: parseInt(id),
      updatedAt: new Date(),
    });

    const validation = updatedUser.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(id, userData) {
    const user = await this.updateUser(id, {
      ...userData,
      onboardingCompleted: true,
    });
    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}

// Export singleton instance
export const UserService = new UserServiceClass();

