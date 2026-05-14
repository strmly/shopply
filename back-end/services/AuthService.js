import { UserService } from './UserService.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { signToken } from '../utils/jwt.js';
import { sendOtpEmail } from './EmailService.js';

const otpStore = new Map();
const OTP_TTL_MS     = 5  * 60 * 1000;
const VERIFIED_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// Prune expired OTP records every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore) {
    if (record.expiresAt < now) otpStore.delete(key);
  }
}, 60 * 1000);

const normalizeMobile = (mobile) => String(mobile || '').replace(/[^\d+]/g, '');
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const buildOtpKey = (channel, value, purpose = 'auth') => `${purpose}:${channel}:${value}`;

export const safeUser = (user) => {
  if (!user) return null;
  const json = user.toJSON ? user.toJSON() : { ...user };
  delete json.passwordHash;
  delete json.passwordUpdatedAt;
  delete json.passwordHistory;
  return json;
};

const validatePassword = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Add at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Add at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Add at least one number');
  return errors;
};

class AuthServiceClass {
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(mobile, otp) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !token || !from) {
      console.log(`[auth] OTP for ${mobile}: ${otp}`);
      return { sent: true, provider: 'console' };
    }

    const body = new URLSearchParams({
      To: mobile,
      From: from,
      Body: `Your Tsenga verification code is ${otp}. It expires in 5 minutes.`,
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Twilio failed to send OTP: ${message}`);
    }

    return { sent: true, provider: 'twilio' };
  }

  async sendEmailOtp(email, otp, purpose = 'verify') {
    return sendOtpEmail(email, otp, purpose);
  }

  async startPhoneAuth({ mobile, name }) {
    const normalizedMobile = normalizeMobile(mobile);
    if (normalizedMobile.replace(/\D/g, '').length < 10) {
      const error = new Error('Enter a valid mobile number');
      error.statusCode = 400;
      throw error;
    }

    const user = await UserService.getUserByMobile(normalizedMobile);
    if (user?.passwordHash) {
      return {
        requiresPassword: true,
        requiresOtp: false,
        isNewUser: false,
        user: safeUser(user),
      };
    }

    if (!user && String(name || '').trim().length < 2) {
      const error = new Error('Please enter your full name to create an account.');
      error.statusCode = 400;
      throw error;
    }

    const otp = this.generateOtp();
    otpStore.set(buildOtpKey('phone', normalizedMobile), {
      otp,
      channel: 'phone',
      identifier: normalizedMobile,
      name: String(name || '').trim(),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      verified: false,
      userId: user?.id || null,
    });

    await this.sendOtp(normalizedMobile, otp);

    return {
      requiresPassword: false,
      requiresOtp: true,
      isNewUser: !user,
      expiresInSeconds: OTP_TTL_MS / 1000,
      devCode: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyPhone({ mobile, code, name }) {
    const normalizedMobile = normalizeMobile(mobile);
    const record = otpStore.get(buildOtpKey('phone', normalizedMobile));

    if (!record || record.expiresAt < Date.now()) {
      const error = new Error('Verification code expired. Request a new code.');
      error.statusCode = 400;
      throw error;
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      const error = new Error('Too many attempts. Request a new code.');
      error.statusCode = 429;
      throw error;
    }

    record.attempts += 1;
    if (record.otp !== String(code || '').trim()) {
      const error = new Error('Verification code is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    let user = record.userId ? await UserService.getUserById(record.userId) : await UserService.getUserByMobile(normalizedMobile);

    if (!user) {
      user = await UserService.createUser({
        name: String(name || record.name || 'Tsenga Shopper').trim(),
        mobile: normalizedMobile,
        email: '',
        avatarUrl: '',
      });
    } else if (name && !user.name) {
      user = await UserService.updateUser(user.id, { name: String(name).trim() });
    }

    otpStore.set(buildOtpKey('phone', normalizedMobile), {
      ...record,
      verified: true,
      userId: user.id,
      verifiedAt: Date.now(),
      expiresAt: Date.now() + VERIFIED_TTL_MS,
    });

    return {
      requiresPasswordSetup: !user.passwordHash,
      user: safeUser(user),
    };
  }

  async startEmailAuth({ email, name }) {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      const error = new Error('Enter a valid email address');
      error.statusCode = 400;
      throw error;
    }

    const user = await UserService.getUserByEmail(normalizedEmail);
    if (user?.passwordHash) {
      return {
        requiresPassword: true,
        requiresOtp: false,
        isNewUser: false,
        user: safeUser(user),
      };
    }

    if (!user && String(name || '').trim().length < 2) {
      const error = new Error('Please enter your full name to create an account.');
      error.statusCode = 400;
      throw error;
    }

    const otp = this.generateOtp();
    otpStore.set(buildOtpKey('email', normalizedEmail), {
      otp,
      channel: 'email',
      identifier: normalizedEmail,
      name: String(name || '').trim(),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      verified: false,
      userId: user?.id || null,
    });

    await this.sendEmailOtp(normalizedEmail, otp, 'verification');

    return {
      requiresPassword: false,
      requiresOtp: true,
      isNewUser: !user,
      expiresInSeconds: OTP_TTL_MS / 1000,
      devCode: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyEmail({ email, code, name }) {
    const normalizedEmail = normalizeEmail(email);
    const record = otpStore.get(buildOtpKey('email', normalizedEmail));

    if (!record || record.expiresAt < Date.now()) {
      const error = new Error('Verification code expired. Request a new code.');
      error.statusCode = 400;
      throw error;
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      const error = new Error('Too many attempts. Request a new code.');
      error.statusCode = 429;
      throw error;
    }

    record.attempts += 1;
    if (record.otp !== String(code || '').trim()) {
      const error = new Error('Verification code is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    let user = record.userId ? await UserService.getUserById(record.userId) : await UserService.getUserByEmail(normalizedEmail);

    if (!user) {
      user = await UserService.createUser({
        name: String(name || record.name || 'Tsenga Shopper').trim(),
        mobile: '',
        email: normalizedEmail,
        avatarUrl: '',
      });
    } else if (name && !user.name) {
      user = await UserService.updateUser(user.id, { name: String(name).trim() });
    }

    otpStore.set(buildOtpKey('email', normalizedEmail), {
      ...record,
      verified: true,
      userId: user.id,
      verifiedAt: Date.now(),
      expiresAt: Date.now() + VERIFIED_TTL_MS,
    });

    return {
      requiresPasswordSetup: !user.passwordHash,
      user: safeUser(user),
    };
  }

  async startProfileEmailVerification({ userId = 'default', email }) {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      const error = new Error('Enter a valid email address');
      error.statusCode = 400;
      throw error;
    }

    let user = await UserService.getUserById(userId);
    if (!user) {
      user = await UserService.createUser({
        id: userId === 'default' ? 1 : undefined,
        name: 'Tsenga Shopper',
        email: normalizedEmail,
        emailVerified: false,
        avatarUrl: '',
        mobile: '',
      });
    } else if (normalizeEmail(user.email) !== normalizedEmail) {
      user = await UserService.updateUser(user.id, {
        email: normalizedEmail,
        emailVerified: false,
        emailVerifiedAt: null,
      });
    }

    if (user.emailVerified && normalizeEmail(user.email) === normalizedEmail) {
      return {
        alreadyVerified: true,
        email: normalizedEmail,
        user: safeUser(user),
      };
    }

    const otp = this.generateOtp();
    otpStore.set(buildOtpKey('profile-email', `${user.id}:${normalizedEmail}`), {
      otp,
      channel: 'email',
      identifier: normalizedEmail,
      userId: user.id,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      verified: false,
    });

    await this.sendEmailOtp(normalizedEmail, otp, 'verification');

    return {
      sent: true,
      email: normalizedEmail,
      expiresInSeconds: OTP_TTL_MS / 1000,
      devCode: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyProfileEmail({ userId = 'default', email, code }) {
    const normalizedEmail = normalizeEmail(email);
    const user = await UserService.getUserById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const key = buildOtpKey('profile-email', `${user.id}:${normalizedEmail}`);
    const record = otpStore.get(key);
    if (!record || record.expiresAt < Date.now()) {
      const error = new Error('Verification code expired. Request a new code.');
      error.statusCode = 400;
      throw error;
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      const error = new Error('Too many attempts. Request a new code.');
      error.statusCode = 429;
      throw error;
    }

    record.attempts += 1;
    if (record.otp !== String(code || '').trim()) {
      const error = new Error('Verification code is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await UserService.updateUser(user.id, {
      email: normalizedEmail,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    otpStore.delete(key);

    return {
      verified: true,
      user: safeUser(updatedUser),
    };
  }

  async setPassword({ mobile, email, password }) {
    const normalizedMobile = normalizeMobile(mobile);
    const normalizedEmail = normalizeEmail(email);
    const channel = normalizedEmail ? 'email' : 'phone';
    const identifier = normalizedEmail || normalizedMobile;
    const record = otpStore.get(buildOtpKey(channel, identifier));

    if (!record?.verified || record.expiresAt < Date.now()) {
      const error = new Error(`Verify your ${channel === 'email' ? 'email' : 'phone'} before setting a password.`);
      error.statusCode = 401;
      throw error;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      const error = new Error('Weak password');
      error.statusCode = 400;
      error.errors = errors;
      throw error;
    }

    const user = await UserService.getUserById(record.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const history = user.passwordHistory || [];
    if (user.passwordHash) history.push(user.passwordHash);
    if (history.some(h => verifyPassword({ passwordHash: h }, password))) {
      const error = new Error("Choose a password you haven't used before.");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await UserService.updateUser(user.id, {
      passwordHash: hashPassword(password),
      passwordUpdatedAt: new Date(),
      passwordHistory: history.slice(-3),
    });

    otpStore.delete(buildOtpKey(channel, identifier));
    return { user: safeUser(updatedUser), token: signToken({ userId: updatedUser.id, role: updatedUser.role || 'buyer' }) };
  }

  async signIn({ mobile, email, password }) {
    const normalizedMobile = normalizeMobile(mobile);
    const normalizedEmail = normalizeEmail(email);
    const user = normalizedEmail
      ? await UserService.getUserByEmail(normalizedEmail)
      : await UserService.getUserByMobile(normalizedMobile);

    if (!user || !user.passwordHash || !verifyPassword(user, password)) {
      const error = new Error('Account or password is incorrect.');
      error.statusCode = 401;
      throw error;
    }

    return { user: safeUser(user), token: signToken({ userId: user.id, role: user.role || 'buyer' }) };
  }

  async forgotPassword({ mobile, email }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedMobile = normalizeMobile(mobile);
    const channel = normalizedEmail ? 'email' : 'phone';
    const identifier = normalizedEmail || normalizedMobile;
    const user = normalizedEmail
      ? await UserService.getUserByEmail(normalizedEmail)
      : await UserService.getUserByMobile(normalizedMobile);

    if (!identifier || !user) {
      return {
        sent: true,
        channel,
        message: 'If an account exists, a reset code has been sent.',
      };
    }

    const otp = this.generateOtp();
    otpStore.set(buildOtpKey(channel, identifier, 'reset'), {
      otp,
      channel,
      identifier,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      verified: false,
      userId: user.id,
    });

    if (channel === 'email') {
      await this.sendEmailOtp(identifier, otp, 'password reset');
    } else {
      await this.sendOtp(identifier, otp);
    }

    return {
      sent: true,
      channel,
      expiresInSeconds: OTP_TTL_MS / 1000,
      devCode: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async resetPassword({ mobile, email, code, password }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedMobile = normalizeMobile(mobile);
    const channel = normalizedEmail ? 'email' : 'phone';
    const identifier = normalizedEmail || normalizedMobile;
    const record = otpStore.get(buildOtpKey(channel, identifier, 'reset'));

    if (!record || record.expiresAt < Date.now()) {
      const error = new Error('Reset code expired. Request a new code.');
      error.statusCode = 400;
      throw error;
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      const error = new Error('Too many attempts. Request a new code.');
      error.statusCode = 429;
      throw error;
    }

    record.attempts += 1;
    if (record.otp !== String(code || '').trim()) {
      const error = new Error('Reset code is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      const error = new Error('Weak password');
      error.statusCode = 400;
      error.errors = errors;
      throw error;
    }

    const user = await UserService.getUserById(record.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const passwordHistory = user.passwordHistory || [];
    if (user.passwordHash) passwordHistory.push(user.passwordHash);
    if (passwordHistory.some(h => verifyPassword({ passwordHash: h }, password))) {
      const error = new Error("Choose a password you haven't used before.");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await UserService.updateUser(user.id, {
      passwordHash: hashPassword(password),
      passwordUpdatedAt: new Date(),
      passwordHistory: passwordHistory.slice(-3),
    });

    otpStore.delete(buildOtpKey(channel, identifier, 'reset'));
    return { user: safeUser(updatedUser), token: signToken({ userId: updatedUser.id, role: updatedUser.role || 'buyer' }) };
  }
}

export const AuthService = new AuthServiceClass();
