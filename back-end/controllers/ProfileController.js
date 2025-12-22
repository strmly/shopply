import crypto from 'crypto';
import { UserService } from '../services/UserService.js';

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

  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
    try {
      const { userId } = req.params;
      let user = await UserService.getUserById(userId);

      if (!user) {
        // If user doesn't exist, create a default user
        // For 'default' userId, create with id: 1
        const userData = {
          name: 'Guest User',
          email: 'guest@example.com',
          mobile: '',
          avatarUrl: '',
        };
        
        // If userId is 'default', set id to 1
        if (userId === 'default') {
          userData.id = 1;
        }
        
        user = await UserService.createUser(userData);
      }

      const safeUser = user.toJSON ? user.toJSON() : user;
      // Never expose password hash fields
      delete safeUser.passwordHash;
      delete safeUser.passwordUpdatedAt;
      delete safeUser.passwordHistory;

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

      // Basic guardrail for avatar size when using base64 data URLs
      if (typeof avatarUrl === 'string' && avatarUrl.length > 500000) {
        return res.status(400).json({
          success: false,
          message: 'Profile photo is too large. Please choose a smaller image.',
        });
      }

      // Only allow explicit profile fields to be updated
      const updates = {};
      if (typeof name === 'string') updates.name = name;
      if (typeof email === 'string' || email === null) updates.email = email || '';
      if (typeof mobile === 'string' || mobile === null) updates.mobile = mobile || '';
      if (typeof avatarUrl === 'string' || avatarUrl === null) updates.avatarUrl = avatarUrl || '';

      const user = await UserService.updateUser(userId, updates);

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

      // Basic presence checks
      if (!currentPassword || !newPassword || !confirmNewPassword) {
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

      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
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
        if (currentPassword.trim() !== '') {
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

      const updatedUser = await UserService.updateUser(userId, {
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
