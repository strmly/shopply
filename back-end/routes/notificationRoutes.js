import express from 'express';
import { NotificationController } from '../controllers/NotificationController.js';

const router = express.Router();
const notificationController = new NotificationController();

/**
 * Notification Routes
 * GET    /api/notifications/user/:userId       - Get all notifications for user
 * GET    /api/notifications/user/:userId/count - Get unread count
 * GET    /api/notifications/user/:userId/read-all - Mark all notifications as read
 * GET    /api/notifications/:id                - Get notification by ID
 * POST   /api/notifications                    - Create new notification
 * PUT    /api/notifications/:id/read           - Mark notification as read
 * DELETE /api/notifications/:id                - Delete notification
 */

// User-specific routes (must come before generic :id routes)
router.get('/user/:userId/count', (req, res, next) => notificationController.getUnreadCount(req, res, next));
router.put('/user/:userId/read-all', (req, res, next) => notificationController.markAllAsRead(req, res, next));
router.get('/user/:userId', (req, res, next) => notificationController.getNotifications(req, res, next));

// Generic routes
router.post('/', (req, res, next) => notificationController.createNotification(req, res, next));
router.get('/:id', (req, res, next) => notificationController.getNotificationById(req, res, next));
router.put('/:id/read', (req, res, next) => notificationController.markAsRead(req, res, next));
router.delete('/:id', (req, res, next) => notificationController.deleteNotification(req, res, next));

export default router;

