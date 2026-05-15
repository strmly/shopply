import express from 'express';
import { requireAuth, authorize } from '../middleware/auth.js';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();
const userController = new UserController();

// All /api/users routes are admin-only — use /api/admin/users from the dashboard
router.use(requireAuth, authorize('admin'));

router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
router.post('/', (req, res, next) => userController.createUser(req, res, next));
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;











