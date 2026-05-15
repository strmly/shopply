import { UserService } from '../services/UserService.js';
import { SellerService } from '../services/SellerService.js';
import CheckoutService from '../services/CheckoutService.js';
import { ProductService } from '../services/ProductService.js';
import { VoucherService } from '../services/VoucherService.js';
import reviewService from '../services/ReviewService.js';
import { notificationService } from '../services/NotificationService.js';
import { AdminActivityService } from '../services/AdminActivityService.js';
import { AdminNotesService } from '../services/AdminNotesService.js';
import { AdminIssueService } from '../services/AdminIssueService.js';
import { AdminDeliveryMonitorService } from '../services/AdminDeliveryMonitorService.js';

const orderTotal = (order = {}) => Number(order.totals?.total ?? order.total ?? 0);
const orderToPlain = (order = {}) => (typeof order.toJSON === 'function' ? order.toJSON() : order);
const productToPlain = (product = {}) => {
  const plain = typeof product.toJSON === 'function' ? product.toJSON() : product;
  const result = { ...plain };
  delete result.subCategory;
  return result;
};
const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const safeUser = (user = {}) => {
  const plain = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const result = { ...plain };
  delete result.passwordHash;
  delete result.passwordHistory;
  delete result.passwordUpdatedAt;
  return result;
};

const csvEscape = (value) => {
  const text = value === undefined || value === null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = (rows = [], columns = []) => [
  columns.map(col => csvEscape(col.label)).join(','),
  ...rows.map(row => columns.map(col => csvEscape(col.value(row))).join(',')),
].join('\n');

const adminName = (req) => req.user?.name || req.user?.email || 'Admin';

const adminPermissions = {
  admin: [
    'dashboard:view',
    'users:read',
    'users:update',
    'users:delete',
    'sellers:read',
    'sellers:update',
    'sellers:delete',
    'orders:read',
    'orders:update',
    'reports:export',
    'activity:read',
    'alerts:read',
    'products:read',
    'products:moderate',
    'issues:read',
    'issues:update',
    'finance:read',
    'delivery:read',
    'notes:create',
    'bulk:update',
  ],
  support: ['dashboard:view', 'users:read', 'sellers:read', 'orders:read', 'orders:update', 'activity:read', 'alerts:read', 'issues:read', 'issues:update', 'delivery:read', 'notes:create'],
  seller_reviewer: ['dashboard:view', 'sellers:read', 'sellers:update', 'products:read', 'products:moderate', 'activity:read', 'alerts:read', 'notes:create'],
  orders_manager: ['dashboard:view', 'orders:read', 'orders:update', 'reports:export', 'activity:read', 'alerts:read', 'issues:read', 'issues:update', 'finance:read', 'bulk:update'],
};

export class AdminController {
  async getStats(req, res, next) {
    try {
      const users = (await UserService.getAllUsers()).map(safeUser);
      const sellers = await SellerService.getAllSellers();
      const products = (await ProductService.getAll()).map(productToPlain);
      const orders = CheckoutService.getAllOrders().map(orderToPlain);
      const notifications = await notificationService.getNotificationsByUserId('default');
      const issues = AdminIssueService.list();
      const deliveryEvents = AdminDeliveryMonitorService.list();
      const reviews = await Promise.all(users.map(user => reviewService.getUserReviews(String(user.id))));
      const flatReviews = reviews.flat();
      const activeVouchers = users.reduce((sum, user) => sum + VoucherService.getActiveVouchers(String(user.id)).length, 0);
      const start = todayStart();
      const todaysOrders = orders.filter(order => new Date(order.createdAt) >= start);
      const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0);
      const revenueToday = todaysOrders.reduce((sum, order) => sum + orderTotal(order), 0);
      const byStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const byRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      const dailyOrders = Array.from({ length: 7 }, (_, index) => {
        const day = new Date();
        day.setDate(day.getDate() - (6 - index));
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        const list = orders.filter(order => {
          const created = new Date(order.createdAt);
          return created >= day && created < nextDay;
        });
        return {
          date: day.toISOString().slice(0, 10),
          orders: list.length,
          revenue: list.reduce((sum, order) => sum + orderTotal(order), 0),
        };
      });

      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const topStores = sellers.slice(0, 6).map(seller => {
        const storeOrders = orders.filter(order => (
          order.storeGroups?.some(group => String(group.storeId) === String(seller.id) || String(group.sellerId) === String(seller.id))
          || order.items?.some(item => String(item.storeId) === String(seller.id))
        ));
        return {
          id: seller.id,
          name: seller.storeSetup?.name || seller.legalBusinessName || 'Seller store',
          orders: storeOrders.length,
          revenue: storeOrders.reduce((sum, order) => sum + orderTotal(order), 0),
          status: seller.onboardingStatus,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      res.json({
        success: true,
        data: {
          totalUsers: users.length,
          totalSellers: sellers.length,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalRevenue: revenue,
          revenueToday,
          todaysOrders: todaysOrders.length,
          activeVouchers,
          totalReviews: flatReviews.length,
          averageRating: flatReviews.length
            ? Number((flatReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / flatReviews.length).toFixed(1))
            : 0,
          ordersByStatus: byStatus,
          usersByRole: byRole,
          pendingSellerApplications: sellers.filter(s => ['draft', 'in_review'].includes(s.onboardingStatus)).length,
          unreadNotifications: notifications.filter(n => !n.read).length,
          lowStockProducts: products.filter(p => Number(p.stockQuantity ?? p.inventory?.quantity ?? 0) <= 3).length,
          openIssues: issues.filter(issue => !['resolved', 'closed'].includes(issue.status)).length,
          failedMessages: deliveryEvents.filter(event => event.status === 'failed' || event.status === 'rejected').length,
          hiddenProducts: products.filter(p => p.isVisible === false || p.moderationStatus === 'hidden').length,
          featuredProducts: products.filter(p => p.isFeatured || p.moderationStatus === 'featured').length,
          recentOrders: sortedOrders.slice(0, 6).map(order => ({
            id: order.id,
            status: order.status,
            total: orderTotal(order),
            userId: order.userId,
            itemCount: (order.items || []).length,
            createdAt: order.createdAt,
          })),
          recentUsers: sortedUsers.slice(0, 6).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
          })),
          dailyOrders,
          topStores,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getAlerts(req, res, next) {
    try {
      const sellers = await SellerService.getAllSellers();
      const orders = CheckoutService.getAllOrders().map(orderToPlain);
      const products = (await ProductService.getAll()).map(productToPlain);
      const notifications = await notificationService.getNotificationsByUserId('default');
      const alerts = [];

      sellers.filter(s => ['draft', 'in_review'].includes(s.onboardingStatus)).forEach(seller => alerts.push({
        id: `seller-${seller.id}`,
        tone: 'warning',
        title: 'Seller application needs review',
        message: `${seller.storeSetup?.name || seller.legalBusinessName || 'Seller store'} is waiting for an admin decision.`,
        action: 'Review seller',
        targetType: 'seller',
        targetId: seller.id,
      }));

      orders.filter(order => ['pending', 'pending_seller_confirmation', 'delayed'].includes(order.status)).slice(0, 8).forEach(order => alerts.push({
        id: `order-${order.id}`,
        tone: order.status === 'delayed' ? 'danger' : 'warning',
        title: 'Order needs attention',
        message: `Order #${order.id} is ${String(order.status).replace(/_/g, ' ')}.`,
        action: 'Open order',
        targetType: 'order',
        targetId: order.id,
      }));

      products.filter(p => Number(p.stockQuantity ?? p.inventory?.quantity ?? 0) <= 3).slice(0, 8).forEach(product => alerts.push({
        id: `stock-${product.id}`,
        tone: 'info',
        title: 'Low stock product',
        message: `${product.name || 'Product'} has low or missing stock.`,
        action: 'View product',
        targetType: 'product',
        targetId: product.id,
      }));

      AdminIssueService.list().filter(issue => !['resolved', 'closed'].includes(issue.status)).slice(0, 8).forEach(issue => alerts.push({
        id: `issue-${issue.id}`,
        tone: issue.priority === 'high' || issue.priority === 'urgent' ? 'danger' : 'warning',
        title: issue.title,
        message: issue.description || `Issue is ${issue.status}.`,
        action: 'Open issue',
        targetType: 'issue',
        targetId: issue.id,
      }));

      AdminDeliveryMonitorService.list().filter(event => ['failed', 'rejected'].includes(event.status)).slice(0, 5).forEach(event => alerts.push({
        id: `delivery-${event.id}`,
        tone: 'danger',
        title: `${event.channel.toUpperCase()} delivery failed`,
        message: `${event.subject} to ${event.recipient} needs retry.`,
        action: 'Review delivery',
        targetType: 'delivery',
        targetId: event.id,
      }));

      if (notifications.some(n => !n.read)) {
        alerts.push({
          id: 'notifications-unread',
          tone: 'info',
          title: 'Unread customer notifications',
          message: `${notifications.filter(n => !n.read).length} unread notifications are waiting.`,
          action: 'Review notifications',
          targetType: 'notification',
          targetId: null,
        });
      }

      res.json({ success: true, data: alerts.slice(0, 24) });
    } catch (err) {
      next(err);
    }
  }

  async getActivity(req, res, next) {
    try {
      res.json({ success: true, data: AdminActivityService.list(req.query) });
    } catch (err) {
      next(err);
    }
  }

  async getPermissions(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.userId);
      const adminRole = user?.adminRole || 'admin';
      res.json({
        success: true,
        data: {
          role: adminRole,
          permissions: adminPermissions[adminRole] || adminPermissions.admin,
          roles: Object.keys(adminPermissions),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      if (!q) return res.json({ success: true, data: [] });
      const users = (await UserService.getAllUsers()).map(safeUser);
      const sellers = await SellerService.getAllSellers();
      const orders = CheckoutService.getAllOrders().map(orderToPlain);
      const products = (await ProductService.getAll()).map(productToPlain);

      const matches = [
        ...users.filter(user => [user.name, user.email, user.mobile, user.role, user.status].some(v => String(v || '').toLowerCase().includes(q))).map(user => ({
          type: 'user',
          id: user.id,
          title: user.name || user.email || `User ${user.id}`,
          subtitle: `${user.email || 'No email'} - ${user.role || 'buyer'}`,
        })),
        ...sellers.filter(seller => [seller.storeSetup?.name, seller.legalBusinessName, seller.email, seller.phone, seller.onboardingStatus].some(v => String(v || '').toLowerCase().includes(q))).map(seller => ({
          type: 'seller',
          id: seller.id,
          title: seller.storeSetup?.name || seller.legalBusinessName || `Seller ${seller.id}`,
          subtitle: `${seller.email || 'No email'} - ${seller.onboardingStatus}`,
        })),
        ...orders.filter(order => [order.id, order.userId, order.status, order.contactInfo?.phone, order.contactInfo?.email].some(v => String(v || '').toLowerCase().includes(q))).map(order => ({
          type: 'order',
          id: order.id,
          title: `Order #${order.id}`,
          subtitle: `${order.status} - R${orderTotal(order)}`,
        })),
        ...products.filter(product => [product.name, product.category, product.room, product.storeName].some(v => String(v || '').toLowerCase().includes(q))).slice(0, 20).map(product => ({
          type: 'product',
          id: product.id,
          title: product.name || `Product ${product.id}`,
          subtitle: `${product.category || product.room || 'Product'} - R${product.price || 0}`,
        })),
        ...AdminIssueService.list().filter(issue => [issue.title, issue.description, issue.status, issue.priority].some(v => String(v || '').toLowerCase().includes(q))).map(issue => ({
          type: 'issue',
          id: issue.id,
          title: issue.title,
          subtitle: `${issue.priority} - ${issue.status}`,
        })),
      ];

      res.json({ success: true, data: matches.slice(0, 30) });
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers();
      res.json({ success: true, data: users.map(safeUser) });
    } catch (err) {
      next(err);
    }
  }

  async getUserDetail(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const userId = String(user.id);
      const orders = CheckoutService.getUserOrders(userId).map(orderToPlain);
      const reviews = await reviewService.getUserReviews(userId);
      const vouchers = VoucherService.getUserVouchers(userId).map(v => v.toJSON ? v.toJSON() : v);
      const seller = (await SellerService.getAllSellers()).find(s => String(s.email).toLowerCase() === String(user.email).toLowerCase() || String(s.phone) === String(user.mobile));
      res.json({
        success: true,
        data: {
          user: safeUser(user),
          orders: orders.map(order => ({ ...order, total: orderTotal(order), itemCount: (order.items || []).length })),
          reviews,
          vouchers,
          seller,
          notes: AdminNotesService.list('user', user.id),
          summary: {
            orderCount: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + orderTotal(order), 0),
            reviewCount: reviews.length,
            activeVoucherCount: vouchers.filter(v => v.status === 'active' || v.getStatus?.() === 'active').length,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const targetId = parseInt(req.params.userId, 10);
      if (req.body.role !== undefined && targetId === req.user.userId) {
        return res.status(400).json({ success: false, message: 'You cannot change your own role' });
      }
      const updates = { ...req.body };
      delete updates.passwordHash;
      delete updates.passwordHistory;
      delete updates.id;
      const user = await UserService.updateUser(targetId, updates);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'user.updated',
        targetType: 'user',
        targetId,
        summary: `Updated ${user.name || user.email || `user ${targetId}`}`,
        metadata: updates,
      });
      res.json({ success: true, data: safeUser(user) });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (userId === req.user.userId) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      }
      const deleted = await UserService.deleteUser(userId);
      if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'user.deleted',
        targetType: 'user',
        targetId: userId,
        summary: `Deleted user ${userId}`,
      });
      res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getSellers(req, res, next) {
    try {
      res.json({ success: true, data: await SellerService.getAllSellers() });
    } catch (err) {
      next(err);
    }
  }

  async getSellerDetail(req, res, next) {
    try {
      const seller = await SellerService.getSellerById(req.params.sellerId);
      if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
      const products = (await ProductService.getProductsByStoreId(seller.id)).map(productToPlain);
      const orders = CheckoutService.getOrdersByStoreId(seller.id).map(orderToPlain);
      res.json({
        success: true,
        data: {
          seller,
          products,
          orders: orders.map(order => ({ ...order, total: orderTotal(order), itemCount: (order.items || []).length })),
          summary: {
            productCount: products.length,
            orderCount: orders.length,
            revenue: orders.reduce((sum, order) => sum + orderTotal(order), 0),
            lowStockCount: products.filter(p => Number(p.stockQuantity ?? p.inventory?.quantity ?? 0) <= 3).length,
          },
          notes: AdminNotesService.list('seller', seller.id),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSeller(req, res, next) {
    try {
      const seller = await SellerService.updateSeller(req.params.sellerId, req.body);
      if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'seller.updated',
        targetType: 'seller',
        targetId: req.params.sellerId,
        summary: `Updated ${seller.storeSetup?.name || seller.legalBusinessName || `seller ${req.params.sellerId}`}`,
        metadata: req.body,
      });
      res.json({ success: true, data: seller });
    } catch (err) {
      next(err);
    }
  }

  async updateSellerStatus(req, res, next) {
    try {
      const { status, note = '' } = req.body;
      const allowed = ['draft', 'in_review', 'approved', 'rejected', 'suspended'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      const seller = await SellerService.updateSellerStatus(req.params.sellerId, status);
      if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'seller.status_changed',
        targetType: 'seller',
        targetId: req.params.sellerId,
        summary: `Set seller to ${status.replace(/_/g, ' ')}`,
        metadata: { status, note },
      });
      res.json({ success: true, data: seller });
    } catch (err) {
      next(err);
    }
  }

  async deleteSeller(req, res, next) {
    try {
      const deleted = await SellerService.deleteSeller(req.params.sellerId);
      if (!deleted) return res.status(404).json({ success: false, message: 'Seller not found' });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'seller.deleted',
        targetType: 'seller',
        targetId: req.params.sellerId,
        summary: `Deleted seller ${req.params.sellerId}`,
      });
      res.json({ success: true, message: 'Seller deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = CheckoutService.getAllOrders().map(order => {
        const plain = orderToPlain(order);
        return { ...plain, total: orderTotal(plain), itemCount: (plain.items || []).length };
      });
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async getOrderDetail(req, res, next) {
    try {
      const order = CheckoutService.getOrder(req.params.orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      const plain = orderToPlain(order);
      const user = await UserService.getUserById(plain.userId).catch(() => null);
      const sellerIds = new Set([
        ...(plain.storeGroups || []).map(group => group.sellerId || group.storeId),
        ...(plain.items || []).map(item => item.sellerId || item.storeId),
      ].filter(Boolean).map(String));
      const sellers = (await SellerService.getAllSellers()).filter(seller => sellerIds.has(String(seller.id)));
      res.json({
        success: true,
        data: {
          order: { ...plain, total: orderTotal(plain), itemCount: (plain.items || []).length },
          user: user ? safeUser(user) : null,
          sellers,
          notes: AdminNotesService.list('order', plain.id),
          timeline: [
            { label: 'Placed', at: plain.createdAt, done: true },
            { label: 'Confirmed', at: plain.confirmedAt, done: Boolean(plain.confirmedAt) },
            { label: 'Updated', at: plain.updatedAt, done: Boolean(plain.updatedAt) },
            { label: 'Delivered', at: plain.deliveredAt, done: Boolean(plain.deliveredAt) },
          ],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { status, note = '' } = req.body;
      const allowed = ['pending', 'pending_seller_confirmation', 'confirmed', 'processing', 'preparing', 'out_for_delivery', 'ready', 'ready_for_pickup', 'delayed', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      const order = CheckoutService.updateOrderStatus(req.params.orderId, status);
      const plain = orderToPlain(order);
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'order.status_changed',
        targetType: 'order',
        targetId: req.params.orderId,
        summary: `Set order #${req.params.orderId} to ${status.replace(/_/g, ' ')}`,
        metadata: { status, note },
      });
      res.json({ success: true, data: { ...plain, total: orderTotal(plain), itemCount: (plain.items || []).length } });
    } catch (err) {
      if (err.message === 'Order not found') {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      next(err);
    }
  }

  async exportReport(req, res, next) {
    try {
      const type = req.params.type;
      let csv;
      if (type === 'users') {
        csv = toCsv((await UserService.getAllUsers()).map(safeUser), [
          { label: 'ID', value: row => row.id },
          { label: 'Name', value: row => row.name },
          { label: 'Email', value: row => row.email },
          { label: 'Mobile', value: row => row.mobile },
          { label: 'Role', value: row => row.role },
          { label: 'Status', value: row => row.status },
          { label: 'Created', value: row => row.createdAt },
        ]);
      } else if (type === 'sellers') {
        csv = toCsv(await SellerService.getAllSellers(), [
          { label: 'ID', value: row => row.id },
          { label: 'Store', value: row => row.storeSetup?.name || row.legalBusinessName },
          { label: 'Email', value: row => row.email },
          { label: 'Phone', value: row => row.phone },
          { label: 'City', value: row => row.address?.city },
          { label: 'Status', value: row => row.onboardingStatus },
        ]);
      } else if (type === 'orders') {
        csv = toCsv(CheckoutService.getAllOrders().map(orderToPlain), [
          { label: 'ID', value: row => row.id },
          { label: 'User ID', value: row => row.userId },
          { label: 'Status', value: row => row.status },
          { label: 'Items', value: row => (row.items || []).length },
          { label: 'Total', value: row => orderTotal(row) },
          { label: 'Created', value: row => row.createdAt },
        ]);
      } else {
        return res.status(404).json({ success: false, message: 'Unknown report type' });
      }

      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'report.exported',
        targetType: 'report',
        targetId: type,
        summary: `Exported ${type} report`,
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="tsenga-${type}.csv"`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }

  async getProducts(req, res, next) {
    try {
      const products = (await ProductService.getAll()).map(productToPlain).map(product => ({
        ...product,
        moderationStatus: product.moderationStatus || (product.isVisible === false ? 'hidden' : 'approved'),
      }));
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  async updateProductModeration(req, res, next) {
    try {
      const { status, reason = '' } = req.body;
      const allowed = ['pending', 'approved', 'hidden', 'suspended', 'featured'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid product moderation status' });
      }
      const patch = {
        moderationStatus: status,
        moderationReason: reason,
        moderatedAt: new Date(),
        isVisible: !['hidden', 'suspended'].includes(status),
        isFeatured: status === 'featured',
      };
      const product = await ProductService.getProductById(req.params.productId);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      Object.assign(product, patch, { updatedAt: new Date() });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'product.moderated',
        targetType: 'product',
        targetId: req.params.productId,
        summary: `Set product ${req.params.productId} to ${status}`,
        metadata: { status, reason },
      });
      res.json({ success: true, data: productToPlain(product) });
    } catch (err) {
      next(err);
    }
  }

  async getIssues(req, res, next) {
    try {
      res.json({ success: true, data: AdminIssueService.list(req.query) });
    } catch (err) {
      next(err);
    }
  }

  async updateIssue(req, res, next) {
    try {
      const issue = AdminIssueService.update(req.params.issueId, req.body);
      if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'issue.updated',
        targetType: 'issue',
        targetId: req.params.issueId,
        summary: `Updated issue ${issue.title}`,
        metadata: req.body,
      });
      res.json({ success: true, data: issue });
    } catch (err) {
      next(err);
    }
  }

  async createNote(req, res, next) {
    try {
      const note = AdminNotesService.create({
        targetType: req.params.targetType,
        targetId: req.params.targetId,
        body: req.body.body,
        actorId: req.user.userId,
        actorName: adminName(req),
      });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'note.created',
        targetType: req.params.targetType,
        targetId: req.params.targetId,
        summary: `Added note to ${req.params.targetType} ${req.params.targetId}`,
      });
      res.status(201).json({ success: true, data: note });
    } catch (err) {
      next(err);
    }
  }

  async getFinance(req, res, next) {
    try {
      const sellers = await SellerService.getAllSellers();
      const orders = CheckoutService.getAllOrders().map(orderToPlain);
      const commissionRate = 0.08;
      const rows = sellers.map(seller => {
        const sellerOrders = orders.filter(order => (
          order.storeGroups?.some(group => String(group.storeId) === String(seller.id) || String(group.sellerId) === String(seller.id))
          || order.items?.some(item => String(item.storeId) === String(seller.id))
        ));
        const gross = sellerOrders.reduce((sum, order) => sum + orderTotal(order), 0);
        const commission = gross * commissionRate;
        return {
          sellerId: seller.id,
          storeName: seller.storeSetup?.name || seller.legalBusinessName || 'Seller store',
          orderCount: sellerOrders.length,
          grossRevenue: gross,
          commission,
          estimatedPayout: Math.max(0, gross - commission),
          status: gross > 0 ? 'payable' : 'no_activity',
        };
      });
      res.json({
        success: true,
        data: {
          commissionRate,
          grossRevenue: rows.reduce((sum, row) => sum + row.grossRevenue, 0),
          platformFees: rows.reduce((sum, row) => sum + row.commission, 0),
          estimatedPayouts: rows.reduce((sum, row) => sum + row.estimatedPayout, 0),
          rows,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getDeliveryMonitor(req, res, next) {
    try {
      res.json({ success: true, data: AdminDeliveryMonitorService.list() });
    } catch (err) {
      next(err);
    }
  }

  async retryDelivery(req, res, next) {
    try {
      const event = AdminDeliveryMonitorService.retry(req.params.eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Delivery event not found' });
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'delivery.retry',
        targetType: 'delivery',
        targetId: req.params.eventId,
        summary: `Retried ${event.channel} message to ${event.recipient}`,
      });
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }

  async bulkAction(req, res, next) {
    try {
      const { target, action, ids = [], value } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Select at least one item' });
      }
      const results = [];
      for (const id of ids) {
        if (target === 'users' && action === 'status') {
          results.push(await UserService.updateUser(id, { status: value }));
        } else if (target === 'sellers' && action === 'status') {
          results.push(await SellerService.updateSellerStatus(id, value));
        } else if (target === 'orders' && action === 'status') {
          results.push(orderToPlain(CheckoutService.updateOrderStatus(String(id), value)));
        } else if (target === 'products' && action === 'moderation') {
          const product = await ProductService.getProductById(id);
          if (product) Object.assign(product, {
            moderationStatus: value,
            isVisible: !['hidden', 'suspended'].includes(value),
            isFeatured: value === 'featured',
            moderatedAt: new Date(),
            updatedAt: new Date(),
          });
          results.push(product ? productToPlain(product) : null);
        } else {
          return res.status(400).json({ success: false, message: 'Unsupported bulk action' });
        }
      }
      AdminActivityService.record({
        actorId: req.user.userId,
        actorName: adminName(req),
        action: 'bulk.updated',
        targetType: target,
        targetId: ids.join(','),
        summary: `Bulk updated ${ids.length} ${target}`,
        metadata: { target, action, value, ids },
      });
      res.json({ success: true, data: { count: results.filter(Boolean).length, results } });
    } catch (err) {
      next(err);
    }
  }
}
