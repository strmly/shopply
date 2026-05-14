import crypto from 'crypto';

export const hashPassword = (plainPassword, salt = null) => {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const hash = crypto
    .pbkdf2Sync(plainPassword, actualSalt, iterations, 64, 'sha512')
    .toString('hex');
  return `${actualSalt}:${hash}:${iterations}`;
};

export const verifyPassword = (user, plainPassword) => {
  if (!user?.passwordHash) return false;
  const parts = user.passwordHash.split(':');
  if (parts.length !== 3) {
    const legacyHash = crypto.createHash('sha256').update(plainPassword).digest('hex');
    return user.passwordHash === legacyHash;
  }
  const [salt, storedHash, iterations] = parts;
  const hash = crypto
    .pbkdf2Sync(plainPassword, salt, parseInt(iterations, 10), 64, 'sha512')
    .toString('hex');
  return hash === storedHash;
};
