import { notificationService } from '../services/NotificationService.js';

/**
 * Notification Controller
 * Handles HTTP requests and responses for notification operations
 */
export class NotificationController {
  /**
   * Get all notifications for a user
   */
  async getNotifications(req, res, next) {
    try {
      const { userId } = req.params;
      const { unreadOnly, limit } = req.query;

      const notifications = await notificationService.getNotificationsByUserId(userId, {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit) : null,
      });

      res.json({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationService.getNotificationById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new notification
   */
  async createNotification(req, res, next) {
    try {
      const notification = await notificationService.createNotification(req.body);
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(req, res, next) {
    try {
      const { userId } = req.params;
      const count = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: `Marked ${count} notifications as read`,
        count,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await notificationService.deleteNotification(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(req, res, next) {
    try {
      const { userId } = req.params;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
}


