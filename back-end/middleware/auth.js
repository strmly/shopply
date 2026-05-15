import { verifyToken, signToken } from '../utils/jwt.js';
import { UserService } from '../services/UserService.js';
import { ROLES } from '../config/roles.js';

export { signToken };

export const authenticate = async (req, res, next) => {
  try {
    // 1. JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      if (payload?.userId) {
        req.user = { userId: payload.userId, role: payload.role || ROLES.BUYER };
        return next();
      }
      // Token present but invalid/expired — still fall through to other methods
    }

    // 2. Backward-compat: x-user-id header (existing frontend mock auth)
    const xUserId = req.headers['x-user-id'];
    if (xUserId) {
      const xUserRole = req.headers['x-user-role'] || ROLES.BUYER;
      req.user = { userId: xUserId, role: xUserRole };
      return next();
    }

    // 3. Backward-compat: userId from body/query (existing frontend code)
    const rawId = req.body?.userId || req.query?.userId;
    if (rawId) {
      const numId = rawId === 'default' ? 1 : parseInt(rawId);
      const user = await UserService.getUserById(numId).catch(() => null);
      req.user = { userId: numId, role: user?.role || ROLES.BUYER };
      return next();
    }

    // 4. Guest
    req.user = { userId: null, role: ROLES.GUEST };
    next();
  } catch {
    req.user = { userId: null, role: ROLES.GUEST };
    next();
  }
};

export const requireAuth = (req, res, next) => {
  // If authenticate middleware already set a valid user, allow through
  if (req.user && req.user.userId && req.user.role !== ROLES.GUEST) {
    return next();
  }

  // If a Bearer token was provided but authenticate rejected it, give a specific error
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // Decode without verifying signature to detect expiry vs corruption
    try {
      const parts = String(token).split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return res.status(401).json({ success: false, message: 'Token expired' });
        }
      }
    } catch { /* fall through */ }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  return res.status(401).json({ success: false, message: 'Authentication required' });
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};
