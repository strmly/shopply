import { UserService } from '../services/UserService.js';

/**
 * User Controller
 * Handles HTTP requests and responses for user operations
 */
export class UserController {
  /**
   * Get all users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   */
  async createUser(req, res, next) {
    try {
      // role and passwordHash must not be set through this endpoint;
      // role assignment is handled exclusively via /api/admin/users
      const { role, passwordHash, ...safeBody } = req.body;
      const user = await userService.createUser(safeBody);
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { role, passwordHash, ...safeBody } = req.body;
      const user = await userService.updateUser(id, safeBody);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}











