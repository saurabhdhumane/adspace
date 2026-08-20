import { Router } from 'express';
import {
  getBanners,
  getNearbyBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  addBookedSlot,
  deleteBookedSlot,
  getMyBanners,
} from '../controllers/banner.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createBannerSchema,
  updateBannerSchema,
  addSlotSchema,
} from '../validators/banner.validator.js';

const router = Router();

// Public routes
router.get('/', getBanners);
router.get('/nearby', getNearbyBanners);
router.get('/mine', requireAuth, requireRole('owner'), getMyBanners);
router.get('/:id', getBannerById);

// Owner protected routes
router.post('/', requireAuth, requireRole('owner'), validate(createBannerSchema), createBanner);
router.patch('/:id', requireAuth, requireRole('owner'), validate(updateBannerSchema), updateBanner);
router.delete('/:id', requireAuth, requireRole('owner'), deleteBanner);
router.post('/:id/slots', requireAuth, requireRole('owner'), validate(addSlotSchema), addBookedSlot);
router.delete('/:id/slots/:slotId', requireAuth, requireRole('owner'), deleteBookedSlot);

export default router;
