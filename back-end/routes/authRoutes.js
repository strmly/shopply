import express from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = express.Router();
const authController = new AuthController();

router.post('/phone/start', (req, res, next) => authController.startPhoneAuth(req, res, next));
router.post('/phone/verify', (req, res, next) => authController.verifyPhone(req, res, next));
router.post('/email/start', (req, res, next) => authController.startEmailAuth(req, res, next));
router.post('/email/verify', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/password/set', (req, res, next) => authController.setPassword(req, res, next));
router.post('/password/sign-in', (req, res, next) => authController.signIn(req, res, next));
router.post('/password/forgot', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/password/reset', (req, res, next) => authController.resetPassword(req, res, next));

export default router;
