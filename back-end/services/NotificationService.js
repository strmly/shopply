import { Notification } from '../models/Notification.js';

/**
 * Notification Service
 * Handles business logic for notifications
 */
export class NotificationService {
  // In-memory storage
  constructor() {
    this.notifications = [];
    this.nextId = 1;
    // Seed some sample notifications
    this.seedNotifications();
  }

  /**
   * Seed sample notifications
   */
  seedNotifications() {
    const sampleNotifications = [
      {
        userId: 'default',
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #12345 has been shipped and is on its way!',
        actionUrl: '/orders/12345',
        metadata: { orderId: '12345' },
      },
      {
        userId: 'default',
        type: 'promotion',
        title: 'Flash Deal Alert',
        message: '50% off on electronics - Limited time only!',
        actionUrl: '/products?category=electronics',
        metadata: { category: 'electronics' },
      },
      {
        userId: 'default',
        type: 'info',
        title: 'New Store Near You',
        message: 'Check out the new electronics store in your area',
        actionUrl: '/search?q=electronics',
      },
      {
        userId: 'default',
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #12340 has been delivered successfully',
        actionUrl: '/orders/12340',
        metadata: { orderId: '12340' },
        read: true,
      },
    ];

    sampleNotifications.forEach(notif => {
      this.notifications.push(new Notification({
        ...notif,
        id: this.nextId++,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        updatedAt: new Date(),
      }));
    });
  }

  /**
   * Get all notifications for a user
   */
  async getNotificationsByUserId(userId, options = {}) {
    const { unreadOnly = false, limit = null } = options;
    let filtered = this.notifications.filter(n => n.userId === userId);

    if (unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id) {
    return this.notifications.find(notif => notif.id === parseInt(id));
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData) {
    const notification = new Notification({
      ...notificationData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const validation = notification.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    this.notifications.push(notification);
    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    const notification = this.notifications.find(n => n.id === parseInt(id));
    if (!notification) {
      return null;
    }

    notification.markAsRead();
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const userNotifications = this.notifications.filter(n => n.userId === userId && !n.read);
    userNotifications.forEach(n => n.markAsRead());
    return userNotifications.length;
  }

  /**
   * Delete notification
   */
  async deleteNotification(id) {
    const index = this.notifications.findIndex(n => n.id === parseInt(id));
    if (index === -1) {
      return false;
    }

    this.notifications.splice(index, 1);
    return true;
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }
}


