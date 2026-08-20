import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updatePushToken,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  pushTokenSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/push-token', requireAuth, validate(pushTokenSchema), updatePushToken);

export default router;
