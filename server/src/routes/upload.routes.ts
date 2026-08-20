import { Router } from 'express';
import { getPresignedUrl } from '../controllers/upload.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/presign', requireAuth, requireRole('owner'), getPresignedUrl);

// Mock S3 endpoint for development mode
router.all('/mock-s3-upload', (req, res) => {
  res.json({
    success: true,
    message: 'Mock S3 upload successful',
    key: req.query.key,
  });
});

export default router;
