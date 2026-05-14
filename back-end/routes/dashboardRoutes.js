import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();
const dashboardController = new DashboardController();
const sellerAuth = authorize('seller', 'admin');

router.get('/:sellerId/messages', sellerAuth, (req, res, next) => dashboardController.getMessages(req, res, next));
router.post('/:sellerId/messages/read-all', sellerAuth, (req, res, next) => dashboardController.markAllMessagesRead(req, res, next));
router.post('/:sellerId/messages/:messageId/read', sellerAuth, (req, res, next) => dashboardController.markMessageRead(req, res, next));
router.post('/:sellerId/messages/:messageId/reply', sellerAuth, (req, res, next) => dashboardController.replyToMessage(req, res, next));
router.get('/:sellerId', sellerAuth, (req, res, next) => dashboardController.getDashboard(req, res, next));

export default router;
