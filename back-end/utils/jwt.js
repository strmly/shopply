import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'shopply-dev-secret-change-in-production';
const EXPIRY_SECONDS = 60 * 60; // 1 hour

const b64url = (buf) => buf.toString('base64url');
const encode = (obj) => b64url(Buffer.from(JSON.stringify(obj)));

export const signToken = (payload) => {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const body = encode({ ...payload, iat: now, exp: now + EXPIRY_SECONDS });
  const sig = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
};

export const verifyToken = (token) => {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};
