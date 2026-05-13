import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';

const router = express.Router();
const dashboardController = new DashboardController();

/**
 * Dashboard Routes
 */
router.get('/:sellerId/messages', (req, res, next) => dashboardController.getMessages(req, res, next));
router.post('/:sellerId/messages/read-all', (req, res, next) => dashboardController.markAllMessagesRead(req, res, next));
router.post('/:sellerId/messages/:messageId/read', (req, res, next) => dashboardController.markMessageRead(req, res, next));
router.post('/:sellerId/messages/:messageId/reply', (req, res, next) => dashboardController.replyToMessage(req, res, next));
router.get('/:sellerId', (req, res, next) => dashboardController.getDashboard(req, res, next));

export default router;


