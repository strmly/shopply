import express from 'express';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();
const userController = new UserController();

/**
 * User Routes
 * GET    /api/users       - Get all users
 * GET    /api/users/:id   - Get user by ID
 * POST   /api/users       - Create new user
 * PUT    /api/users/:id   - Update user
 * DELETE /api/users/:id   - Delete user
 */

router.get('/', (req, res, next) => userController.getAllUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
router.post('/', (req, res, next) => userController.createUser(req, res, next));
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;











