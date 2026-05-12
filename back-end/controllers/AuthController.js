import { AuthService } from '../services/AuthService.js';

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
}
