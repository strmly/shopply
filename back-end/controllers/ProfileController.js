import crypto from 'crypto';
import { UserService } from '../services/UserService.js';
import OrdersService from '../services/OrdersService.js';
import ReviewService from '../services/ReviewService.js';
import { VoucherService } from '../services/VoucherService.js';
import { SellerService } from '../services/SellerService.js';
import { addressService } from '../services/AddressService.js';
import { paymentMethodService } from '../services/PaymentMethodService.js';

// In-memory password attempt tracking (per userId)
const passwordAttemptTracker = new Map();

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// Whitelisted preference values
const ALLOWED_LANGUAGES = ['en', 'af', 'zu', 'xh', 'st'];
const ALLOWED_THEMES = ['system', 'light', 'dark'];

const buildDefaultPreferences = () => ({
  language: 'en',
  theme: 'system',
  notifications: {
    orderUpdates: true,
    deals: true,
    reminders: true,
  },
});

const toPlain = (value) => (value && typeof value.toJSON === 'function' ? value.toJSON() : value);

const removePrivateProfileFields = (user = {}) => {
  const plainUser = toPlain(user);
  const safeUser = { ...plainUser, hasPassword: Boolean(plainUser.passwordHash) };
  delete safeUser.passwordHash;
  delete safeUser.passwordUpdatedAt;
  delete safeUser.passwordHistory;
  return safeUser;
};

// Improved password hashing with salt and iterations (more secure than SHA-256)
const hashPassword = (plainPassword, salt = null) => {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const iterations = 100000; // PBKDF2 iterations
  const keyLength = 64; // 512 bits
  
  const hash = crypto.pbkdf2Sync(
    plainPassword,
    actualSalt,
    iterations,
    keyLength,
    'sha512'
  ).toString('hex');
  
  // Store as: salt:hash
  return `${actualSalt}:${hash}:${iterations}`;
};

const verifyPassword = (user, plainPassword) => {
  if (!user || !user.passwordHash) return false;
  
  // Parse stored hash format: salt:hash:iterations
  const parts = user.passwordHash.split(':');
  if (parts.length !== 3) {
    // Legacy SHA-256 fallback for backwards compatibility
    const legacyHash = crypto.createHash('sha256').update(plainPassword).digest('hex');
    return user.passwordHash === legacyHash;
  }
  
  const [salt, storedHash, iterations] = parts;
  const hash = crypto.pbkdf2Sync(
    plainPassword,
    salt,
    parseInt(iterations, 10),
    64,
    'sha512'
  ).toString('hex');
  
  return hash === storedHash;
};

const recordFailedAttempt = (userKey) => {
  const now = Date.now();
  const record = passwordAttemptTracker.get(userKey) || { attempts: [] };
  const recent = record.attempts.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  passwordAttemptTracker.set(userKey, { attempts: recent });
};

const isRateLimited = (userKey) => {
  const now = Date.now();
  const record = passwordAttemptTracker.get(userKey);
  if (!record) return false;
  const recent = record.attempts.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  passwordAttemptTracker.set(userKey, { attempts: recent });
  return recent.length >= MAX_FAILED_ATTEMPTS;
};

const resetAttempts = (userKey) => {
  passwordAttemptTracker.delete(userKey);
};

const getRemainingAttempts = (userKey) => {
  const now = Date.now();
  const record = passwordAttemptTracker.get(userKey);
  if (!record) return MAX_FAILED_ATTEMPTS;
  const recent = record.attempts.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  return Math.max(0, MAX_FAILED_ATTEMPTS - recent.length);
};

/**
 * Profile Controller
 * Handles HTTP requests and responses for profile operations
 */
export class ProfileController {
  async ensureUser(userId) {
    let user = await UserService.getUserById(userId);

    if (!user) {
      const userData = {
        name: 'Guest User',
        email: 'guest@example.com',
        mobile: '',
        avatarUrl: '',
        preferences: buildDefaultPreferences(),
      };

      if (userId === 'default') {
        userData.id = 1;
      }

      user = await UserService.createUser(userData);
    }

    return user;
  }

  async buildProfileDashboard(userId) {
    const user = await this.ensureUser(userId);
    const safeUser = removePrivateProfileFields(user);
    const resolvedUserId = String(userId);

    const [
      orderResult,
      orderSummary,
      addresses,
      paymentMethods,
      reviews,
      pendingReviews,
      seller,
    ] = await Promise.all([
      OrdersService.getUserOrders(resolvedUserId, 'all', { limit: 6 }),
      OrdersService.getOrderSummary(resolvedUserId),
      addressService.getUserAddresses(resolvedUserId),
      paymentMethodService.getUserPaymentMethods(resolvedUserId),
      ReviewService.getUserReviews(resolvedUserId),
      ReviewService.getPendingReviews(resolvedUserId),
      SellerService.getSellerById(1).then(found => found || SellerService.seedDefaultSeller()),
    ]);

    const vouchers = VoucherService.getUserVouchers(resolvedUserId);
    const voucherSummary = VoucherService.getVoucherSummary(resolvedUserId);
    const preferences = user.preferences || buildDefaultPreferences();
    const normalizedAddresses = (addresses || []).map(toPlain);
    const normalizedPaymentMethods = (paymentMethods || []).map(toPlain);
    const normalizedReviews = reviews || [];
    const activeVouchers = (vouchers || []).filter(voucher => voucher.status === 'active');
    const defaultAddress = normalizedAddresses.find(address => address.isDefault) || normalizedAddresses[0] || null;
    const defaultPaymentMethod = normalizedPaymentMethods.find(method => method.isDefault) || normalizedPaymentMethods[0] || null;
    const stats = {
      orders: orderSummary.totalOrders || 0,
      activeOrders: orderSummary.activeCount || 0,
      savedAddresses: normalizedAddresses.length,
      paymentMethods: normalizedPaymentMethods.length,
      activeVouchers: activeVouchers.length,
      reviews: normalizedReviews.length,
      pendingReviews: (pendingReviews || []).length,
    };
    const sellerName = seller?.storeSetup?.name || seller?.legalBusinessName || 'Tsenga Seller';
    const quickActions = [
      {
        key: 'shop-nearby',
        icon: 'T',
        title: 'Shop nearby',
        text: 'Search refined finds nearby',
        metric: 'Nearby',
        route: '/search',
        tone: 'primary',
      },
      {
        key: 'orders',
        icon: 'O',
        title: 'My orders',
        text: orderSummary.subtext || 'Track and reorder faster',
        metric: `${stats.activeOrders} active`,
        route: '/orders?filter=active',
        tone: 'info',
      },
      {
        key: 'addresses',
        icon: 'A',
        title: 'Addresses',
        text: defaultAddress
          ? `${defaultAddress.label || 'Default'} in ${defaultAddress.suburb || defaultAddress.city || 'your area'}`
          : 'Add a delivery address',
        metric: `${stats.savedAddresses} saved`,
        route: stats.savedAddresses > 0 ? '/addresses' : '/addresses/new',
        tone: 'success',
      },
      {
        key: 'payments',
        icon: 'P',
        title: 'Payments',
        text: defaultPaymentMethod
          ? `Default ${defaultPaymentMethod.brand || 'card'} ending ${defaultPaymentMethod.last4 || 'saved'}`
          : 'Add or update payment methods',
        metric: `${stats.paymentMethods} saved`,
        route: stats.paymentMethods > 0 ? '/payment-methods' : '/payment-methods/new',
        tone: 'primary',
      },
      {
        key: 'vouchers',
        icon: 'V',
        title: 'Vouchers',
        text: `${stats.activeVouchers} active rewards`,
        metric: voucherSummary?.totalAvailableValue
          ? `R${Number(voucherSummary.totalAvailableValue).toFixed(0)} value`
          : 'Rewards',
        route: '/vouchers?tab=active',
        tone: 'warning',
      },
      {
        key: 'reviews',
        icon: 'R',
        title: 'Reviews',
        text: `${stats.pendingReviews} waiting for feedback`,
        metric: `${stats.reviews} written`,
        route: '/reviews?tab=to-review',
        tone: 'secondary',
      },
      {
        key: 'seller-tools',
        icon: 'S',
        title: 'Seller tools',
        text: sellerName,
        metric: seller?.onboardingStatus || 'ready',
        route: '/seller/dashboard',
        tone: 'dark',
      },
    ];
      const accountActions = [
        {
          key: 'edit-profile',
          title: 'Edit profile',
          text: 'Name, phone, email, and avatar',
          route: '/account/edit-profile',
          status: safeUser.email && safeUser.email !== 'guest@example.com' ? 'Ready' : 'Add details',
        },
        {
          key: 'verify-email',
          title: 'Verify email',
          text: safeUser.emailVerified ? 'Email verified for receipts and resets' : 'Confirm your email for account safety',
          route: '/account/verify-email',
          status: safeUser.emailVerified ? 'Verified' : 'Verify',
        },
        {
          key: 'password',
          title: 'Password',
        text: safeUser.hasPassword ? 'Update your sign-in password' : 'Set your sign-in password',
        route: '/account/change-password',
        status: safeUser.hasPassword ? 'Protected' : 'Not set',
      },
      {
        key: 'notifications',
        title: 'Notifications',
        text: 'Order updates, deals, and reminders',
        route: '/account/notifications',
        status: preferences.notifications?.orderUpdates ? 'On' : 'Limited',
      },
    ];
    const preferenceActions = [
      {
        key: 'language',
        title: 'Language',
        text: preferences.language || 'en',
        route: '/account/language',
        status: (preferences.language || 'en').toUpperCase(),
      },
      {
        key: 'theme',
        title: 'Theme',
        text: preferences.theme || 'system',
        route: '/account/theme',
        status: preferences.theme || 'system',
      },
      {
        key: 'help',
        title: 'Help and support',
        text: 'Get help with orders, returns, and sellers',
        route: '/support/help',
        status: 'Open',
      },
    ];

    return {
      user: safeUser,
      preferences: {
        language: preferences.language || 'en',
        theme: preferences.theme || 'system',
        notifications: preferences.notifications || buildDefaultPreferences().notifications,
      },
      orders: orderResult.orders || [],
      orderSummary,
      addresses: normalizedAddresses,
      defaultAddress,
      paymentMethods: normalizedPaymentMethods,
      defaultPaymentMethod,
      reviews: normalizedReviews,
      pendingReviews: pendingReviews || [],
      vouchers: (vouchers || []).map(toPlain),
      voucherSummary,
      seller: {
        id: seller?.id || 1,
        storeName: sellerName,
        status: seller?.onboardingStatus || 'ready',
        suburb: seller?.address?.suburb || 'Sandton',
      },
      quickActions,
      accountActions,
      preferenceActions,
      stats,
    };
  }

  async getQuickActions(req, res, next) {
    try {
      const { userId } = req.params;
      const dashboard = await this.buildProfileDashboard(userId);

      return res.json({
        success: true,
        data: dashboard.quickActions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get the full profile dashboard payload.
   */
  async getProfileSummary(req, res, next) {
    try {
      const { userId } = req.params;
      const dashboard = await this.buildProfileDashboard(userId);

      return res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await this.ensureUser(userId);
      const safeUser = removePrivateProfileFields(user);

      res.json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user preferences (language, theme, notifications, etc.)
   */
  async getPreferences(req, res, next) {
    try {
      const { userId } = req.params;
      let user = await UserService.getUserById(userId);

      if (!user) {
        const userData = {
          name: 'Guest User',
          email: 'guest@example.com',
          mobile: '',
          avatarUrl: '',
        };

        if (userId === 'default') {
          userData.id = 1;
        }

        user = await UserService.createUser({
          ...userData,
          preferences: buildDefaultPreferences(),
        });
      }

      const prefs = (user && user.preferences) || buildDefaultPreferences();

      return res.json({
        success: true,
        data: {
          language: prefs.language || 'en',
          theme: prefs.theme || 'system',
          notifications: {
            orderUpdates:
              prefs.notifications && typeof prefs.notifications.orderUpdates === 'boolean'
                ? prefs.notifications.orderUpdates
                : true,
            deals:
              prefs.notifications && typeof prefs.notifications.deals === 'boolean'
                ? prefs.notifications.deals
                : true,
            reminders:
              prefs.notifications && typeof prefs.notifications.reminders === 'boolean'
                ? prefs.notifications.reminders
                : true,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const { name, email, mobile, avatarUrl } = req.body || {};

      // Reject base64 blobs — avatar must now be a file path (/uploads/...)
      if (typeof avatarUrl === 'string' && avatarUrl.startsWith('data:')) {
        return res.status(400).json({
          success: false,
          message: 'Upload the image via /api/uploads/image and pass the returned URL.',
        });
      }

      // Only allow explicit profile fields to be updated
      const updates = {};
      if (typeof name === 'string') updates.name = name;
      if (typeof email === 'string' || email === null) updates.email = email || '';
      if (typeof mobile === 'string' || mobile === null) updates.mobile = mobile || '';
      if (typeof avatarUrl === 'string' || avatarUrl === null) updates.avatarUrl = avatarUrl || '';

      const existingUser = await this.ensureUser(userId);
      const user = await UserService.updateUser(existingUser.id, updates);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const safeUser = user.toJSON ? user.toJSON() : user;
      delete safeUser.passwordHash;
      delete safeUser.passwordUpdatedAt;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: safeUser,
      });
    } catch (error) {
      // Surface validation errors as safe, friendly responses
      if (error && typeof error.message === 'string') {
        if (
          error.message.includes('Valid email is required') ||
          error.message.includes('Valid mobile number is required') ||
          error.message.includes('Name cannot be empty')
        ) {
          return res.status(400).json({
            success: false,
            message: 'Invalid profile details',
            errors: error.message.split(',').map(e => e.trim()),
          });
        }
      }
      next(error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(req, res, next) {
    try {
      const { userId } = req.params;
      const { language, theme, notifications } = req.body || {};

      let user = await UserService.getUserById(userId);

      if (!user) {
        const userData = {
          name: 'Guest User',
          email: 'guest@example.com',
          mobile: '',
          avatarUrl: '',
        };

        if (userId === 'default') {
          userData.id = 1;
        }

        user = await UserService.createUser({
          ...userData,
          preferences: buildDefaultPreferences(),
        });
      }

      const currentPrefs = user.preferences || buildDefaultPreferences();
      const currentNotifs = currentPrefs.notifications || {};

      // Validate language if provided
      if (typeof language === 'string' && language.trim()) {
        const langCode = language.trim().toLowerCase();
        if (!ALLOWED_LANGUAGES.includes(langCode)) {
          return res.status(400).json({
            success: false,
            message: 'Unsupported language selection.',
          });
        }
      }

      // Validate theme if provided
      if (typeof theme === 'string' && theme.trim()) {
        const themeValue = theme.trim().toLowerCase();
        if (!ALLOWED_THEMES.includes(themeValue)) {
          return res.status(400).json({
            success: false,
            message: 'Unsupported theme selection.',
          });
        }
      }

      const nextPrefs = {
        ...currentPrefs,
        ...(typeof language === 'string' && language.trim()
          ? { language: language.trim().toLowerCase() }
          : {}),
        ...(typeof theme === 'string' && theme.trim()
          ? { theme: theme.trim().toLowerCase() }
          : {}),
        ...(notifications && typeof notifications === 'object'
          ? {
              notifications: {
                orderUpdates:
                  typeof notifications.orderUpdates === 'boolean'
                    ? notifications.orderUpdates
                    : typeof currentNotifs.orderUpdates === 'boolean'
                      ? currentNotifs.orderUpdates
                      : true,
                deals:
                  typeof notifications.deals === 'boolean'
                    ? notifications.deals
                    : typeof currentNotifs.deals === 'boolean'
                      ? currentNotifs.deals
                      : true,
                reminders:
                  typeof notifications.reminders === 'boolean'
                    ? notifications.reminders
                    : typeof currentNotifs.reminders === 'boolean'
                      ? currentNotifs.reminders
                      : true,
              },
            }
          : {}),
      };

      const updatedUser = await UserService.updateUser(user.id, {
        preferences: nextPrefs,
      });

      const prefs = updatedUser.preferences || nextPrefs;

      return res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          language: prefs.language || 'en',
          theme: prefs.theme || 'system',
          notifications: prefs.notifications || currentNotifs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(req, res, next) {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword, confirmNewPassword } = req.body || {};

      const userKey = String(userId);

      if (isRateLimited(userKey)) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please try again in a few minutes.',
        });
      }

      const user = await this.ensureUser(userId);

      // Basic presence checks. First-time password setup does not require a current password.
      if (!newPassword || !confirmNewPassword || (user.passwordHash && !currentPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Please fill in all password fields.',
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords don\'t match',
        });
      }

      // Password strength rules with better validation
      const errors = [];
      if (newPassword.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      if (newPassword.length > 128) {
        errors.push('Password must be less than 128 characters');
      }
      if (!/[0-9]/.test(newPassword)) {
        errors.push('Password must include at least 1 number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=\\[\];'/`~]/.test(newPassword)) {
        errors.push('Password must include at least 1 special character');
      }
      if (!/[a-zA-Z]/.test(newPassword)) {
        errors.push('Password must include at least 1 letter');
      }

      // Check if new password is too similar to current (if exists)
      if (user.passwordHash && verifyPassword(user, newPassword)) {
        errors.push('New password must be different from your current password');
      }

      // Check password history (prevent reusing recent passwords)
      if (user.passwordHistory && Array.isArray(user.passwordHistory)) {
        for (const oldHash of user.passwordHistory.slice(-3)) { // Check last 3 passwords
          const parts = oldHash.split(':');
          if (parts.length === 3) {
            const [salt, storedHash, iterations] = parts;
            const hash = crypto.pbkdf2Sync(
              newPassword,
              salt,
              parseInt(iterations, 10),
              64,
              'sha512'
            ).toString('hex');
            if (hash === storedHash) {
              errors.push('You cannot reuse a recently used password');
              break;
            }
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Weak password',
          errors,
        });
      }

      // If a password is already set, verify current password
      if (user.passwordHash) {
        if (!verifyPassword(user, currentPassword)) {
          recordFailedAttempt(userKey);
          const remaining = getRemainingAttempts(userKey);
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect',
            ...(remaining < MAX_FAILED_ATTEMPTS && {
              remainingAttempts: remaining,
              warning: remaining === 0 
                ? 'Too many failed attempts. Please try again in a few minutes.'
                : `${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
            }),
          });
        }
      } else {
        // First-time password set: require an empty currentPassword to avoid surprises
        if ((currentPassword || '').trim() !== '') {
          recordFailedAttempt(userKey);
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect',
          });
        }
      }

      // Update password with history tracking
      const newPasswordHash = hashPassword(newPassword);
      const passwordHistory = user.passwordHistory || [];
      
      // Add current password to history (keep last 3)
      if (user.passwordHash) {
        passwordHistory.push(user.passwordHash);
        if (passwordHistory.length > 3) {
          passwordHistory.shift(); // Remove oldest
        }
      }

      const updatedUser = await UserService.updateUser(user.id, {
        passwordHash: newPasswordHash,
        passwordUpdatedAt: new Date(),
        passwordHistory: passwordHistory,
      });

      resetAttempts(userKey);

      const safeUser = updatedUser.toJSON ? updatedUser.toJSON() : updatedUser;
      delete safeUser.passwordHash;
      delete safeUser.passwordUpdatedAt;

      return res.json({
        success: true,
        message: 'Password updated successfully',
        data: safeUser,
      });
    } catch (error) {
      next(error);
    }
  }
}
