import { Notification } from '../models/Notification.js';
import { emitToUser } from '../socket.js';
import { UserService } from './UserService.js';

// Map notification type → user preference key
const PREF_KEY = {
  order: 'orderUpdates',
  promotion: 'deals',
  info: 'deals',
  system: null, // system notifications are always sent
};

export class NotificationService {
  constructor() {
    this.notifications = [];
    this.nextId = 1;
    this._seedInitial();
  }

  _seedInitial() {
    const now = Date.now();
    const seeds = [
      {
        userId: 'default',
        type: 'order',
        title: 'Order Confirmed',
        message: 'Your Living Room Starter Bundle order #1001 has been confirmed and is being prepared by the seller.',
        actionUrl: '/orders/1001',
        metadata: { orderId: '1001' },
        createdAt: new Date(now - 12 * 60 * 1000), // 12 min ago
      },
      {
        userId: 'default',
        type: 'promotion',
        title: 'Flash Deal — 35% Off Standing Desks',
        message: 'Hurry! Our Home Office Setup Bundle is 35% off for the next 3 hours. Limited stock available.',
        actionUrl: '/category/flash-deals',
        metadata: { category: 'office' },
        createdAt: new Date(now - 2 * 60 * 60 * 1000), // 2h ago
      },
      {
        userId: 'default',
        type: 'order',
        title: 'Courier On The Way',
        message: 'A courier has been assigned to your order #1000 and is heading your way. Estimated arrival: 45 min.',
        actionUrl: '/orders/1000',
        metadata: { orderId: '1000' },
        createdAt: new Date(now - 5 * 60 * 60 * 1000), // 5h ago
      },
      {
        userId: 'default',
        type: 'info',
        title: 'New Arrivals — Bedroom Collection',
        message: 'Fresh walnut-finish bedroom furniture just landed. Bed frames, dressers and more — now in stock.',
        actionUrl: '/category/new-arrivals',
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000), // 1d ago
      },
      {
        userId: 'default',
        type: 'order',
        title: 'Order Delivered',
        message: 'Your EKTORP Sofa (order #999) was delivered successfully. We hope you love it!',
        actionUrl: '/orders/999',
        metadata: { orderId: '999' },
        read: true,
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3d ago
      },
      {
        userId: 'default',
        type: 'system',
        title: 'Your Profile Is Complete',
        message: 'Great — your delivery address and payment method are saved. Checkout will be faster from now on.',
        actionUrl: '/profile',
        read: true,
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7d ago
      },
    ];

    seeds.forEach(s => {
      this.notifications.push(new Notification({
        ...s,
        id: this.nextId++,
        updatedAt: s.createdAt,
      }));
    });
  }

  // ─── Queries ──────────────────────────────────────────────────────────────────

  async getNotificationsByUserId(userId, options = {}) {
    const { unreadOnly = false, limit = null } = options;
    let list = this.notifications.filter(n => n.userId === userId);
    if (unreadOnly) list = list.filter(n => !n.read);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return limit ? list.slice(0, limit) : list;
  }

  async getNotificationById(id) {
    return this.notifications.find(n => n.id === parseInt(id)) || null;
  }

  async getUnreadCount(userId) {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  async createNotification(data) {
    const notif = new Notification({
      ...data,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const v = notif.validate();
    if (!v.isValid) throw new Error(v.errors.join(', '));
    this.notifications.push(notif);
    emitToUser(notif.userId, 'notification:new', notif);
    return notif;
  }

  async markAsRead(id) {
    const n = this.notifications.find(n => n.id === parseInt(id));
    if (!n) return null;
    n.markAsRead();
    return n;
  }

  async markAllAsRead(userId) {
    const unread = this.notifications.filter(n => n.userId === userId && !n.read);
    unread.forEach(n => n.markAsRead());
    return unread.length;
  }

  async deleteNotification(id) {
    const idx = this.notifications.findIndex(n => n.id === parseInt(id));
    if (idx === -1) return false;
    this.notifications.splice(idx, 1);
    return true;
  }

  // ─── Convenience helper used by other controllers ─────────────────────────────

  notify(userId, type, title, message, { actionUrl = null, metadata = {} } = {}) {
    (async () => {
      try {
        // Check user notification preferences before sending
        const prefKey = PREF_KEY[type];
        if (prefKey !== null) {
          const user = await UserService.getUserById(userId).catch(() => null);
          const prefs = user?.preferences?.notifications;
          if (prefs && prefs[prefKey] === false) return;
        }
        await this.createNotification({ userId, type, title, message, actionUrl, metadata });
      } catch {}
    })();
  }
}

// Singleton shared across the whole app
export const notificationService = new NotificationService();
