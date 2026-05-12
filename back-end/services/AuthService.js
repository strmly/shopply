import crypto from 'crypto';
import { UserService } from './UserService.js';

const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const normalizeMobile = (mobile) => String(mobile || '').replace(/[^\d+]/g, '');
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const buildOtpKey = (channel, value, purpose = 'auth') => `${purpose}:${channel}:${value}`;

const safeUser = (user) => {
  if (!user) return null;
  const json = user.toJSON ? user.toJSON() : { ...user };
  delete json.passwordHash;
  delete json.passwordUpdatedAt;
  delete json.passwordHistory;
  return json;
};

const hashPassword = (plainPassword, salt = null) => {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(
    plainPassword,
    actualSalt,
    iterations,
    64,
    'sha512'
  ).toString('hex');

  return `${actualSalt}:${hash}:${iterations}`;
};

const verifyPassword = (user, plainPassword) => {
  if (!user?.passwordHash) return false;

  const parts = user.passwordHash.split(':');
  if (parts.length !== 3) {
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
    // Wire a production email provider here, for example SendGrid, SES, or Postmark.
    console.log(`[auth] Email ${purpose} code for ${email}: ${otp}`);
    return { sent: true, provider: 'console' };
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
    });

    return {
      requiresPasswordSetup: !user.passwordHash,
      user: safeUser(user),
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

    const updatedUser = await UserService.updateUser(user.id, {
      passwordHash: hashPassword(password),
      passwordUpdatedAt: new Date(),
      passwordHistory: user.passwordHash ? [user.passwordHash].slice(-3) : [],
    });

    otpStore.delete(buildOtpKey(channel, identifier));
    return { user: safeUser(updatedUser), token: `demo-token-${updatedUser.id}-${Date.now()}` };
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

    return { user: safeUser(user), token: `demo-token-${user.id}-${Date.now()}` };
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

    const updatedUser = await UserService.updateUser(user.id, {
      passwordHash: hashPassword(password),
      passwordUpdatedAt: new Date(),
      passwordHistory: passwordHistory.slice(-3),
    });

    otpStore.delete(buildOtpKey(channel, identifier, 'reset'));
    return { user: safeUser(updatedUser), token: `demo-token-${updatedUser.id}-${Date.now()}` };
  }
}

export const AuthService = new AuthServiceClass();
