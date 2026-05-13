import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

const TYPE_TO_DIR = { avatar: 'avatars', product: 'products', general: 'general' };

// Ensure subdirectories exist at startup
Object.values(TYPE_TO_DIR).forEach(subdir => {
  fs.mkdirSync(path.join(UPLOADS_ROOT, subdir), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || 'general';
    const subdir = TYPE_TO_DIR[type] || 'general';
    cb(null, path.join(UPLOADS_ROOT, subdir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp, gif, avif)'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12 MB
});
