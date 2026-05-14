import { AuthService, safeUser } from '../services/AuthService.js';
import { UserService } from '../services/UserService.js';

export class AuthController {
  async startPhoneAuth(req, res, next) {
    try {
      const data = await AuthService.startPhoneAuth(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async verifyPhone(req, res, next) {
    try {
      const data = await AuthService.verifyPhone(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async startEmailAuth(req, res, next) {
    try {
      const data = await AuthService.startEmailAuth(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const data = await AuthService.verifyEmail(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async startProfileEmailVerification(req, res, next) {
    try {
      const data = await AuthService.startProfileEmailVerification(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async verifyProfileEmail(req, res, next) {
    try {
      const data = await AuthService.verifyProfileEmail(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async setPassword(req, res, next) {
    try {
      const data = await AuthService.setPassword(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async signIn(req, res, next) {
    try {
      const data = await AuthService.signIn(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const data = await AuthService.forgotPassword(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const data = await AuthService.resetPassword(req.body || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: { user: safeUser(user) } });
    } catch (error) {
      next(error);
    }
  }

  async signOut(req, res) {
    res.json({ success: true, message: 'Signed out' });
  }
}
