import express from 'express';
import path from 'path';
import { uploadMiddleware, UPLOADS_ROOT } from '../middleware/upload.js';

const router = express.Router();

// POST /api/uploads/image?type=avatar|product|general
router.post('/image', uploadMiddleware.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Build the public URL path (served statically at /uploads/...)
  const relativePath = path.relative(UPLOADS_ROOT, req.file.path).replace(/\\/g, '/');
  const url = `/uploads/${relativePath}`;

  res.json({ success: true, url, filename: req.file.filename });
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 12 MB.' });
  }
  if (err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;
