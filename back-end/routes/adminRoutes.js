import express from 'express';
import { requireAuth, authorize } from '../middleware/auth.js';
import { AdminController } from '../controllers/AdminController.js';

const router = express.Router();
const admin = new AdminController();

router.use(requireAuth, authorize('admin'));

router.get('/stats', (req, res, next) => admin.getStats(req, res, next));
router.get('/alerts', (req, res, next) => admin.getAlerts(req, res, next));
router.get('/activity', (req, res, next) => admin.getActivity(req, res, next));
router.get('/permissions', (req, res, next) => admin.getPermissions(req, res, next));
router.get('/search', (req, res, next) => admin.search(req, res, next));
router.get('/reports/:type', (req, res, next) => admin.exportReport(req, res, next));
router.post('/bulk', (req, res, next) => admin.bulkAction(req, res, next));
router.post('/notes/:targetType/:targetId', (req, res, next) => admin.createNote(req, res, next));
router.get('/finance', (req, res, next) => admin.getFinance(req, res, next));
router.get('/delivery-monitor', (req, res, next) => admin.getDeliveryMonitor(req, res, next));
router.post('/delivery-monitor/:eventId/retry', (req, res, next) => admin.retryDelivery(req, res, next));

router.get('/products', (req, res, next) => admin.getProducts(req, res, next));
router.patch('/products/:productId/moderation', (req, res, next) => admin.updateProductModeration(req, res, next));

router.get('/issues', (req, res, next) => admin.getIssues(req, res, next));
router.patch('/issues/:issueId', (req, res, next) => admin.updateIssue(req, res, next));

router.get('/users', (req, res, next) => admin.getUsers(req, res, next));
router.get('/users/:userId/detail', (req, res, next) => admin.getUserDetail(req, res, next));
router.put('/users/:userId', (req, res, next) => admin.updateUser(req, res, next));
router.delete('/users/:userId', (req, res, next) => admin.deleteUser(req, res, next));

router.get('/sellers', (req, res, next) => admin.getSellers(req, res, next));
router.get('/sellers/:sellerId/detail', (req, res, next) => admin.getSellerDetail(req, res, next));
router.put('/sellers/:sellerId', (req, res, next) => admin.updateSeller(req, res, next));
router.patch('/sellers/:sellerId/status', (req, res, next) => admin.updateSellerStatus(req, res, next));
router.delete('/sellers/:sellerId', (req, res, next) => admin.deleteSeller(req, res, next));

router.get('/orders', (req, res, next) => admin.getOrders(req, res, next));
router.get('/orders/:orderId/detail', (req, res, next) => admin.getOrderDetail(req, res, next));
router.patch('/orders/:orderId/status', (req, res, next) => admin.updateOrderStatus(req, res, next));

export default router;
