import { verifyToken } from '../utils/jwt.js';
import { UserService } from '../services/UserService.js';
import { ROLES } from '../config/roles.js';

export const authenticate = async (req, res, next) => {
  try {
    // 1. JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.slice(7));
      if (payload?.userId) {
        req.user = { userId: payload.userId, role: payload.role || ROLES.BUYER };
        return next();
      }
    }

    // 2. Backward-compat: userId from body/query (existing frontend code)
    const rawId = req.body?.userId || req.query?.userId;
    if (rawId) {
      const numId = rawId === 'default' ? 1 : parseInt(rawId);
      const user = await UserService.getUserById(numId).catch(() => null);
      req.user = { userId: numId, role: user?.role || ROLES.BUYER };
      return next();
    }

    // 3. Guest
    req.user = { userId: null, role: ROLES.GUEST };
    next();
  } catch {
    req.user = { userId: null, role: ROLES.GUEST };
    next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user || req.user.role === ROLES.GUEST || !req.user.userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};
