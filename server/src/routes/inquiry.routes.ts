import { Router } from 'express';
import {
  createInquiry,
  getSentInquiries,
  getReceivedInquiries,
  respondToInquiry,
} from '../controllers/inquiry.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createInquirySchema,
  respondInquirySchema,
} from '../validators/inquiry.validator.js';

const router = Router();

// Advertiser routes
router.post(
  '/',
  requireAuth,
  requireRole('advertiser'),
  validate(createInquirySchema),
  createInquiry
);
router.get('/sent', requireAuth, requireRole('advertiser'), getSentInquiries);

// Owner routes
router.get('/received', requireAuth, requireRole('owner'), getReceivedInquiries);
router.patch(
  '/:id/respond',
  requireAuth,
  requireRole('owner'),
  validate(respondInquirySchema),
  respondToInquiry
);

export default router;
