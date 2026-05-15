import express from 'express';
import { ProfileController } from '../controllers/ProfileController.js';

const router = express.Router();
const profileController = new ProfileController();

/**
 * Profile Routes
 */
router.get('/:userId/summary', (req, res, next) => profileController.getProfileSummary(req, res, next));
router.get('/:userId/quick-actions', (req, res, next) => profileController.getQuickActions(req, res, next));
router.get('/:userId', (req, res, next) => profileController.getProfile(req, res, next));
router.put('/:userId', (req, res, next) => profileController.updateProfile(req, res, next));
router.post('/:userId/change-password', (req, res, next) => profileController.changePassword(req, res, next));
router.delete('/:userId', (req, res, next) => profileController.deleteAccount(req, res, next));

// Preferences (language, theme, notifications)
router.get('/:userId/preferences', (req, res, next) => profileController.getPreferences(req, res, next));
router.put('/:userId/preferences', (req, res, next) => profileController.updatePreferences(req, res, next));

export default router;
