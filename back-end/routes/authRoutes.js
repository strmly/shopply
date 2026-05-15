import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const otpStartLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many verification requests. Try again in 15 minutes.' });
const signInLimit   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many sign-in attempts. Try again in 15 minutes.' });

const router = express.Router();
const authController = new AuthController();

router.post('/phone/start',    otpStartLimit, (req, res, next) => authController.startPhoneAuth(req, res, next));
router.post('/phone/verify',   (req, res, next) => authController.verifyPhone(req, res, next));
router.post('/email/start',    otpStartLimit, (req, res, next) => authController.startEmailAuth(req, res, next));
router.post('/email/verify',   (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/email/profile/start', otpStartLimit, (req, res, next) => authController.startProfileEmailVerification(req, res, next));
router.post('/email/profile/verify', (req, res, next) => authController.verifyProfileEmail(req, res, next));
router.post('/password/set',   (req, res, next) => authController.setPassword(req, res, next));
router.post('/password/sign-in', signInLimit, (req, res, next) => authController.signIn(req, res, next));
router.post('/password/forgot', otpStartLimit, (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/password/reset', (req, res, next) => authController.resetPassword(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));
router.post('/sign-out', (req, res) => authController.signOut(req, res));

// Simple email+password login — returns a JWT (1-hour expiry) for use in Authorization: Bearer headers.
// Keeps x-user-id header support in middleware for backwards compatibility with existing frontend.
router.post('/login', signInLimit, (req, res) => {
  const { email, password } = req.body;
  // Mock user lookup — in production this would query a DB
  const mockUsers = [
    { id: 'user-1', email: 'buyer@shopply.co.za', role: 'buyer', password: 'buyer123' },
    { id: 'seller-1', email: 'seller@shopply.co.za', role: 'seller', password: 'seller123' },
    { id: 'admin-1', email: 'admin@shopply.co.za', role: 'admin', password: 'admin123' },
  ];
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const { password: _, ...safeUser } = user;
  const token = signToken({ userId: safeUser.id, email: safeUser.email, role: safeUser.role });
  res.json({ success: true, data: { token, user: safeUser, expiresIn: 3600 } });
});

export default router;
