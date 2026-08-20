import { Router } from 'express';
import { getPresignedUrl } from '../controllers/upload.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/presign', requireAuth, requireRole('owner'), getPresignedUrl);
router.post('/auth', requireAuth, requireRole('owner'), getPresignedUrl);

// Mock ImageKit endpoint for development mode
router.all('/mock-imagekit-upload', (req, res) => {
  res.json({
    success: true,
    message: 'Mock ImageKit upload successful',
    key: req.query.key,
  });
});
router.all('/mock-s3-upload', (req, res) => {
  res.json({
    success: true,
    message: 'Mock ImageKit upload successful (legacy path)',
    key: req.query.key,
  });
});

export default router;
