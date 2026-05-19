import { UserService } from './UserService.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { signToken } from '../utils/jwt.js';
import { sendOtpEmail } from './EmailService.js';

const otpStore = new Map();
const OTP_TTL_MS     = 5  * 60 * 1000;
const VERIFIED_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const PHONE_HELP = 'Use a South African mobile number, e.g. 078 123 4567 or +27 78 123 4567.';

// Prune expired OTP records every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore) {
    if (record.expiresAt < now) otpStore.delete(key);
  }
}, 60 * 1000);

const normalizeMobile = (mobile) => {
  const raw = String(mobile || '').trim();
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('27') && digits.length >= 11) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+27${digits.slice(1)}`;
  if (digits.length === 9) return `+27${digits}`;
  return digits ? `+${digits}` : '';
};
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const buildOtpKey = (channel, value, purpose = 'auth') => `${purpose}:${channel}:${value}`;

const createError = (message, statusCode = 400, errors = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (errors) error.errors = errors;
  return error;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
const isValidMobile = (mobile) => /^\+27[6-8]\d{8}$/.test(normalizeMobile(mobile));
const isValidCode = (code) => /^\d{6}$/.test(String(code || '').trim());

const parseProviderError = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

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
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (sid && token && verifyServiceSid) {
      const body = new URLSearchParams({
        To: mobile,
        Channel: 'sms',
      });

      const response = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok) {
        const details = await parseProviderError(response);
        console.warn('[auth] Twilio Verify send failed', {
          status: response.status,
          code: details.code,
          message: details.message,
        });
        throw createError('We could not send a verification SMS right now. Check the number and try again.', 502);
      }

      return { sent: true, provider: 'twilio-verify' };
    }

    if (!sid || !token || !from) {
      console.log(`[auth] OTP for ${mobile}: ${otp}`);
      return { sent: true, provider: 'console' };
    }

    const body = new URLSearchParams({
      To: mobile,
      From: from,
      Body: `Your Shopply verification code is ${otp}. It expires in 5 minutes.`,
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
      const details = await parseProviderError(response);
      console.warn('[auth] Twilio SMS send failed', {
        status: response.status,
        code: details.code,
        message: details.message,
      });
      throw createError('We could not send a verification SMS right now. Check the number and try again.', 502);
    }

    return { sent: true, provider: 'twilio' };
  }

  async checkTwilioVerifyOtp(mobile, code) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!sid || !token || !verifyServiceSid) return null;

    const body = new URLSearchParams({
      To: mobile,
      Code: String(code || '').trim(),
    });

    const response = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) return false;
      console.warn('[auth] Twilio Verify check failed', {
        status: response.status,
        code: payload.code,
        message: payload.message || response.statusText,
      });
      throw createError('We could not verify the code right now. Please try again.', 502);
    }

    return payload.status === 'approved' || payload.valid === true;
  }

  async sendEmailOtp(email, otp, purpose = 'verify') {
    try {
      return await sendOtpEmail(email, otp, purpose);
    } catch (error) {
      console.warn('[auth] Email OTP send failed', {
        message: error.message,
        statusCode: error.statusCode,
      });
      throw createError('We could not send the email code right now. Check the email address and try again.', 502);
    }
  }

  async startPhoneAuth({ mobile, name }) {
    const normalizedMobile = normalizeMobile(mobile);
    if (!normalizedMobile) {
      throw createError('Enter your mobile number.');
    }
    if (!isValidMobile(normalizedMobile)) {
      throw createError(PHONE_HELP);
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
      throw createError('Please enter your full name to create an account.');
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

    const delivery = await this.sendOtp(normalizedMobile, otp);
    const record = otpStore.get(buildOtpKey('phone', normalizedMobile));
    if (record) record.provider = delivery.provider;

    return {
      requiresPassword: false,
      requiresOtp: true,
      isNewUser: !user,
      expiresInSeconds: OTP_TTL_MS / 1000,
      devCode: process.env.NODE_ENV === 'production' || delivery.provider === 'twilio-verify' ? undefined : otp,
    };
  }

  async verifyPhone({ mobile, code, name }) {
    const normalizedMobile = normalizeMobile(mobile);
    if (!isValidMobile(normalizedMobile)) {
      throw createError(PHONE_HELP);
    }
    if (!isValidCode(code)) {
      throw createError('Enter the 6-digit verification code.');
    }
    const record = otpStore.get(buildOtpKey('phone', normalizedMobile));

    if (!record || record.expiresAt < Date.now()) {
      throw createError('Verification code expired. Request a new code.');
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      throw createError('Too many attempts. Request a new code.', 429);
    }

    record.attempts += 1;
    const verifiedByProvider = record.provider === 'twilio-verify'
      ? await this.checkTwilioVerifyOtp(normalizedMobile, code)
      : null;

    if (record.provider === 'twilio-verify' ? !verifiedByProvider : record.otp !== String(code || '').trim()) {
      throw createError('Verification code is incorrect.');
    }

    let user = record.userId ? await UserService.getUserById(record.userId) : await UserService.getUserByMobile(normalizedMobile);

    if (!user) {
      user = await UserService.createUser({
        name: String(name || record.name || 'Shopply Shopper').trim(),
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
    if (!normalizedEmail) {
      throw createError('Enter your email address.');
    }
    if (!isValidEmail(normalizedEmail)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
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
      throw createError('Please enter your full name to create an account.');
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

    const delivery = await this.sendEmailOtp(normalizedEmail, otp, 'verification');

    return {
      requiresPassword: false,
      requiresOtp: true,
      isNewUser: !user,
      expiresInSeconds: OTP_TTL_MS / 1000,
      delivery,
      devCode: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyEmail({ email, code, name }) {
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
    }
    if (!isValidCode(code)) {
      throw createError('Enter the 6-digit verification code.');
    }
    const record = otpStore.get(buildOtpKey('email', normalizedEmail));

    if (!record || record.expiresAt < Date.now()) {
      throw createError('Verification code expired. Request a new code.');
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      throw createError('Too many attempts. Request a new code.', 429);
    }

    record.attempts += 1;
    if (record.otp !== String(code || '').trim()) {
      throw createError('Verification code is incorrect.');
    }

    let user = record.userId ? await UserService.getUserById(record.userId) : await UserService.getUserByEmail(normalizedEmail);

    if (!user) {
      user = await UserService.createUser({
        name: String(name || record.name || 'Shopply Shopper').trim(),
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
    if (!normalizedEmail) {
      throw createError('Enter your email address.');
    }
    if (!isValidEmail(normalizedEmail)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
    }

    let user = await UserService.getUserById(userId);
    if (!user) {
      user = await UserService.createUser({
        id: userId === 'default' ? 1 : undefined,
        name: 'Shopply Shopper',
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

    const delivery = await this.sendEmailOtp(normalizedEmail, otp, 'verification');

    return {
      sent: true,
      email: normalizedEmail,
      expiresInSeconds: OTP_TTL_MS / 1000,
      delivery,
      devCode: process.env.NODE_ENV === 'production' ? undefined : otp,
    };
  }

  async verifyProfileEmail({ userId = 'default', email, code }) {
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
    }
    if (!isValidCode(code)) {
      throw createError('Enter the 6-digit verification code.');
    }
    const user = await UserService.getUserById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const key = buildOtpKey('profile-email', `${user.id}:${normalizedEmail}`);
    const record = otpStore.get(key);
    if (!record || record.expiresAt < Date.now()) {
      throw createError('Verification code expired. Request a new code.');
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      throw createError('Too many attempts. Request a new code.', 429);
    }

    record.attempts += 1;
    if (record.otp !== String(code || '').trim()) {
      throw createError('Verification code is incorrect.');
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
    if (channel === 'phone' && !isValidMobile(identifier)) {
      throw createError(PHONE_HELP);
    }
    if (channel === 'email' && !isValidEmail(identifier)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
    }
    const record = otpStore.get(buildOtpKey(channel, identifier));

    if (!record?.verified || record.expiresAt < Date.now()) {
      throw createError(`Verify your ${channel === 'email' ? 'email' : 'phone'} before setting a password.`, 401);
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      throw createError('Create a stronger password.', 400, errors);
    }

    const user = await UserService.getUserById(record.userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const history = user.passwordHistory || [];
    if (user.passwordHash) history.push(user.passwordHash);
    if (history.some(h => verifyPassword({ passwordHash: h }, password))) {
      throw createError("Choose a password you haven't used before.");
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
    if (!normalizedEmail && !normalizedMobile) {
      throw createError('Enter your email address or mobile number.');
    }
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
    }
    if (!normalizedEmail && !isValidMobile(normalizedMobile)) {
      throw createError(PHONE_HELP);
    }
    if (!password) {
      throw createError('Enter your password.');
    }
    const user = normalizedEmail
      ? await UserService.getUserByEmail(normalizedEmail)
      : await UserService.getUserByMobile(normalizedMobile);

    if (!user || !user.passwordHash || !verifyPassword(user, password)) {
      throw createError('Account or password is incorrect.', 401);
    }

    return { user: safeUser(user), token: signToken({ userId: user.id, role: user.role || 'buyer' }) };
  }

  async forgotPassword({ mobile, email }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedMobile = normalizeMobile(mobile);
    const channel = normalizedEmail ? 'email' : 'phone';
    const identifier = normalizedEmail || normalizedMobile;
    if (!identifier) {
      throw createError('Enter your email address or mobile number.');
    }
    if (channel === 'email' && !isValidEmail(identifier)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
    }
    if (channel === 'phone' && !isValidMobile(identifier)) {
      throw createError(PHONE_HELP);
    }
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
      const delivery = await this.sendEmailOtp(identifier, otp, 'password reset');
      const record = otpStore.get(buildOtpKey(channel, identifier, 'reset'));
      if (record) record.provider = delivery.provider;
    } else {
      const delivery = await this.sendOtp(identifier, otp);
      const record = otpStore.get(buildOtpKey(channel, identifier, 'reset'));
      if (record) record.provider = delivery.provider;
    }

    return {
      sent: true,
      channel,
      expiresInSeconds: OTP_TTL_MS / 1000,
      devCode: process.env.NODE_ENV === 'production' || otpStore.get(buildOtpKey(channel, identifier, 'reset'))?.provider === 'twilio-verify'
        ? undefined
        : otp,
    };
  }

  async resetPassword({ mobile, email, code, password }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedMobile = normalizeMobile(mobile);
    const channel = normalizedEmail ? 'email' : 'phone';
    const identifier = normalizedEmail || normalizedMobile;
    if (!identifier) {
      throw createError('Enter your email address or mobile number.');
    }
    if (channel === 'email' && !isValidEmail(identifier)) {
      throw createError('Enter a valid email address, e.g. you@example.com.');
    }
    if (channel === 'phone' && !isValidMobile(identifier)) {
      throw createError(PHONE_HELP);
    }
    if (!isValidCode(code)) {
      throw createError('Enter the 6-digit reset code.');
    }
    const record = otpStore.get(buildOtpKey(channel, identifier, 'reset'));

    if (!record || record.expiresAt < Date.now()) {
      throw createError('Reset code expired. Request a new code.');
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      throw createError('Too many attempts. Request a new code.', 429);
    }

    record.attempts += 1;
    const verifiedByProvider = record.provider === 'twilio-verify'
      ? await this.checkTwilioVerifyOtp(identifier, code)
      : null;

    if (record.provider === 'twilio-verify' ? !verifiedByProvider : record.otp !== String(code || '').trim()) {
      throw createError('Reset code is incorrect.');
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      throw createError('Create a stronger password.', 400, errors);
    }

    const user = await UserService.getUserById(record.userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const passwordHistory = user.passwordHistory || [];
    if (user.passwordHash) passwordHistory.push(user.passwordHash);
    if (passwordHistory.some(h => verifyPassword({ passwordHash: h }, password))) {
      throw createError("Choose a password you haven't used before.");
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
